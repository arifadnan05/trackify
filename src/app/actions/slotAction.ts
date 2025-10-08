"use server";

import { connectToDB } from "@/lib/db";
import { ObjectId } from "mongodb";
import { revalidatePath, revalidateTag } from "next/cache";
import { unstable_cache } from "next/cache";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function getCurrentUser(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    return payload.email as string | null;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

export const getSlots = unstable_cache(
  async () => {
    try {
      const { db } = await connectToDB();
      const slots = await db
        .collection("slots")
        .find({})
        .sort({ slotNumber: 1 })
        .toArray();

      return JSON.parse(JSON.stringify(slots));
    } catch (error) {
      console.error("Error fetching slots:", error);
      throw new Error("Failed to fetch slots");
    }
  },
  ["all-slots"],
  {
    tags: ["slots"],
    revalidate: 60,
  }
);

export const getSlotsByStatus = unstable_cache(
  async (status: "available" | "booked") => {
    try {
      const { db } = await connectToDB();
      const slots = await db
        .collection("slots")
        .find({ status })
        .sort({ slotNumber: 1 })
        .toArray();

      return JSON.parse(JSON.stringify(slots));
    } catch (error) {
      console.error(`Error fetching ${status} slots:`, error);
      throw new Error(`Failed to fetch ${status} slots`);
    }
  },
  ["slots-by-status"],
  {
    tags: ["slots"],
    revalidate: 30,
  }
);

export const getUserBookedSlots = unstable_cache(
  async (userEmail: string) => {
    try {
      const { db } = await connectToDB();
      const slots = await db
        .collection("slots")
        .find({ bookedBy: userEmail })
        .sort({ slotNumber: 1 })
        .toArray();

      return JSON.parse(JSON.stringify(slots));
    } catch (error) {
      console.error("Error fetching user slots:", error);
      throw new Error("Failed to fetch user slots");
    }
  },
  ["user-booked-slots"],
  {
    tags: ["slots", "user-slots"],
    revalidate: 30,
  }
);

export async function addSlot(formData: FormData) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, message: "Unauthorized" };
    }

    const { db } = await connectToDB();
    const slotNumber = Number(formData.get("slotNumber"));

    if (!slotNumber || isNaN(slotNumber) || slotNumber <= 0) {
      return { success: false, message: "Invalid slot number" };
    }

    const existingSlot = await db.collection("slots").findOne({ slotNumber });

    if (existingSlot) {
      return { success: false, message: "Slot number already exists" };
    }

    await db.collection("slots").insertOne({
      slotNumber,
      status: "available",
      bookedBy: null,
      createdAt: new Date(),
    });

    revalidateTag("slots");
    revalidatePath("/dashboard");
    revalidatePath("/slots");

    return { success: true, message: "Slot added successfully" };
  } catch (error: unknown) {
    console.error("Error adding slot:", error);
    return {
      success: false,
      message: (error as Error).message || "Failed to add slot",
    };
  }
}

export async function deleteSlot(id: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, message: "Unauthorized" };
    }

    const { db } = await connectToDB();

    if (!ObjectId.isValid(id)) {
      return { success: false, message: "Invalid slot ID" };
    }

    const result = await db
      .collection("slots")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return { success: false, message: "Slot not found" };
    }

    revalidateTag("slots");
    revalidatePath("/dashboard");
    revalidatePath("/slots");

    return { success: true, message: "Slot deleted successfully" };
  } catch (error: unknown) {
    console.error("Error deleting slot:", error);
    return {
      success: false,
      message: (error as Error).message || "Failed to delete slot",
    };
  }
}

export async function updateSlot(id: string, newSlotNumber: number) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, message: "Unauthorized" };
    }

    const { db } = await connectToDB();

    if (!ObjectId.isValid(id)) {
      return { success: false, message: "Invalid slot ID" };
    }

    if (!newSlotNumber || isNaN(newSlotNumber) || newSlotNumber <= 0) {
      return { success: false, message: "Invalid slot number" };
    }

    const existingSlot = await db.collection("slots").findOne({
      slotNumber: newSlotNumber,
      _id: { $ne: new ObjectId(id) },
    });

    if (existingSlot) {
      return { success: false, message: "Slot number already exists" };
    }

    const result = await db.collection("slots").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          slotNumber: newSlotNumber,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return { success: false, message: "Slot not found" };
    }

    revalidateTag("slots");
    revalidatePath("/dashboard");
    revalidatePath("/slots");

    return { success: true, message: "Slot updated successfully" };
  } catch (error: unknown) {
    console.error("Error updating slot:", error);
    return {
      success: false,
      message: (error as Error).message || "Failed to update slot",
    };
  }
}

export async function bookSlot(id: string, userEmail: string) {
  try {
    const { db } = await connectToDB();

    if (!ObjectId.isValid(id)) {
      return { success: false, message: "Invalid slot ID" };
    }

    if (!userEmail || !userEmail.includes("@")) {
      return { success: false, message: "Invalid email address" };
    }

    // Check if user exists in database
    const user = await db.collection("users").findOne({ email: userEmail });

    if (!user) {
      return {
        success: false,
        message: "User not found. Please register first.",
      };
    }

    const slot = await db
      .collection("slots")
      .findOne({ _id: new ObjectId(id) });

    if (!slot) {
      return { success: false, message: "Slot not found" };
    }

    if (slot.status === "booked" || slot.bookedBy) {
      return { success: false, message: "This slot is already booked" };
    }

    const result = await db.collection("slots").updateOne(
      {
        _id: new ObjectId(id),
        status: "available",
        bookedBy: { $in: [null, undefined, ""] },
      },
      {
        $set: {
          status: "booked",
          bookedBy: userEmail,
          bookedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return { success: false, message: "Slot is no longer available" };
    }

    revalidateTag("slots");
    revalidateTag("user-slots");
    revalidatePath("/slots");
    revalidatePath("/dashboard");
    revalidatePath(`/slots/${id}`);

    return { success: true, message: "Slot booked successfully" };
  } catch (error: unknown) {
    console.error("Error booking slot:", error);
    return {
      success: false,
      message: (error as Error).message || "Failed to book slot",
    };
  }
}

export async function unbookSlot(id: string, userEmail: string) {
  try {
    const { db } = await connectToDB();

    if (!ObjectId.isValid(id)) {
      return { success: false, message: "Invalid slot ID" };
    }

    const slot = await db
      .collection("slots")
      .findOne({ _id: new ObjectId(id) });

    if (!slot) {
      return { success: false, message: "Slot not found" };
    }

    if (slot.status !== "booked") {
      return { success: false, message: "Slot is not booked" };
    }

    if (slot.bookedBy !== userEmail) {
      return {
        success: false,
        message: "You can only unbook your own slots",
      };
    }

    const result = await db.collection("slots").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "available",
          bookedBy: null,
          unbookedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return { success: false, message: "Failed to unbook slot" };
    }

    revalidateTag("slots");
    revalidateTag("user-slots");
    revalidatePath("/slots");
    revalidatePath("/dashboard");

    return { success: true, message: "Slot unbooked successfully" };
  } catch (error: unknown) {
    console.error("Error unbooking slot:", error);
    return {
      success: false,
      message: (error as Error).message || "Failed to unbook slot",
    };
  }
}

export const getSlotStats = unstable_cache(
  async () => {
    try {
      const { db } = await connectToDB();

      const totalSlots = await db.collection("slots").countDocuments();
      const bookedSlots = await db
        .collection("slots")
        .countDocuments({ status: "booked" });
      const availableSlots = await db
        .collection("slots")
        .countDocuments({ status: "available" });

      return {
        total: totalSlots,
        booked: bookedSlots,
        available: availableSlots,
        occupancyRate:
          totalSlots > 0 ? ((bookedSlots / totalSlots) * 100).toFixed(2) : "0",
      };
    } catch (error) {
      console.error("Error fetching slot stats:", error);
      throw new Error("Failed to fetch slot statistics");
    }
  },
  ["slot-stats"],
  {
    tags: ["slots", "stats"],
    revalidate: 120,
  }
);
