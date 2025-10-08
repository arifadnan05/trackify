"use client";

import {
  bookSlot,
  getSlots,
  getSlotStats,
  unbookSlot,
} from "@/app/actions/slotAction";
import { useState, useEffect, useTransition, useMemo, Suspense } from "react";

interface Slot {
  _id: string;
  slotNumber: number;
  status: "available" | "booked";
  bookedBy: string | null;
  createdAt: Date;
  bookedAt?: Date;
  updatedAt?: Date;
}

interface SlotStats {
  total: number;
  booked: number;
  available: number;
  occupancyRate: string;
}

function StatsPanel({ stats }: { stats: SlotStats | null }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
        <div className="text-sm text-gray-600">Total Slots</div>
      </div>
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="text-2xl font-bold text-green-600">
          {stats.available}
        </div>
        <div className="text-sm text-gray-600">Available</div>
      </div>
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="text-2xl font-bold text-red-600">{stats.booked}</div>
        <div className="text-sm text-gray-600">Booked</div>
      </div>
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="text-2xl font-bold text-purple-600">
          {stats.occupancyRate}%
        </div>
        <div className="text-sm text-gray-600">Occupancy</div>
      </div>
    </div>
  );
}

const SlotCard = ({
  slot,
  userEmail,
  onBook,
  onUnbook,
  isPending,
  actionLoading,
}: {
  slot: Slot;
  userEmail: string;
  onBook: (id: string) => void;
  onUnbook: (id: string) => void;
  isPending: boolean;
  actionLoading: string | null;
}) => {
  const isMySlot = slot.bookedBy === userEmail.trim();
  const isLoading = actionLoading === slot._id || isPending;

  const cardClass = isMySlot
    ? "bg-white rounded-xl shadow-md p-6 border-2 border-green-500 hover:shadow-xl transition-all"
    : slot.status === "available"
    ? "bg-white rounded-xl shadow-md p-6 border-2 border-blue-200 hover:shadow-xl hover:border-blue-400 transition-all"
    : "bg-white rounded-xl shadow-md p-6 border-2 border-gray-300 opacity-70";

  const badgeClass = isMySlot
    ? "bg-green-100 text-green-800"
    : slot.status === "available"
    ? "bg-blue-100 text-blue-800"
    : "bg-gray-200 text-gray-700";

  const badgeText = isMySlot
    ? "YOURS"
    : slot.status === "available"
    ? "AVAILABLE"
    : "BOOKED";

  const circleClass = isMySlot
    ? "bg-green-500 text-white"
    : slot.status === "available"
    ? "bg-blue-500 text-white"
    : "bg-gray-400 text-white";

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between mb-4">
        <div
          className={`${circleClass} rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold`}
        >
          {slot.slotNumber}
        </div>
        <span
          className={`${badgeClass} px-3 py-1 rounded-full text-xs font-semibold`}
        >
          {badgeText}
        </span>
      </div>

      {isMySlot && (
        <>
          <p className="text-sm text-gray-600 mb-4">
            Booked by: <span className="font-medium">{slot.bookedBy}</span>
          </p>
          <button
            onClick={() => onUnbook(slot._id)}
            disabled={isLoading}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Unblock slot
          </button>
        </>
      )}

      {slot.status === "available" && !isMySlot && (
        <button
          onClick={() => onBook(slot._id)}
          disabled={isLoading || !userEmail.trim()}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Book Now
        </button>
      )}

      {slot.status === "booked" && !isMySlot && (
        <p className="text-sm text-gray-500">Not available</p>
      )}
    </div>
  );
};

export default function UserSlotsPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [stats, setStats] = useState<SlotStats | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadSlots();
    loadStats();
  }, []);

  async function loadSlots() {
    try {
      const data = await getSlots();
      setSlots(data);
    } catch (error) {
      console.error("Error loading slots:", error);
      setMessage({ type: "error", text: "Failed to load slots" });
    } finally {
    }
  }
  useEffect(() => {
    fetch("/api/token")
      .then((res) => res.json())
      .then((data) => setUserEmail(data.userEmail || ""));
  }, []);
  async function loadStats() {
    try {
      const statsData = await getSlotStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  }

  async function handleBookSlot(slotId: string) {
    if (!userEmail.trim()) {
      setMessage({ type: "error", text: "Please enter your email address" });
      return;
    }

    if (!userEmail.includes("@")) {
      setMessage({ type: "error", text: "Please enter a valid email address" });
      return;
    }

    setActionLoading(slotId);
    setMessage(null);

    startTransition(() => {
      setSlots((prevSlots) =>
        prevSlots.map((slot) =>
          slot._id === slotId
            ? { ...slot, status: "booked" as const, bookedBy: userEmail.trim() }
            : slot
        )
      );
    });

    const result = await bookSlot(slotId, userEmail.trim());

    if (result.success) {
      setMessage({ type: "success", text: result.message });
      await Promise.all([loadSlots(), loadStats()]);
    } else {
      setMessage({ type: "error", text: result.message });
      await loadSlots();
    }

    setActionLoading(null);
  }

  async function handleUnbookSlot(slotId: string) {
    if (!userEmail.trim()) {
      setMessage({ type: "error", text: "Please enter your email address" });
      return;
    }

    setActionLoading(slotId);
    setMessage(null);

    startTransition(() => {
      setSlots((prevSlots) =>
        prevSlots.map((slot) =>
          slot._id === slotId
            ? { ...slot, status: "available" as const, bookedBy: null }
            : slot
        )
      );
    });

    const result = await unbookSlot(slotId, userEmail.trim());

    if (result.success) {
      setMessage({ type: "success", text: result.message });
      await Promise.all([loadSlots(), loadStats()]);
    } else {
      setMessage({ type: "error", text: result.message });
      await loadSlots();
    }

    setActionLoading(null);
  }

  const { availableSlots, myBookedSlots, otherBookedSlots } = useMemo(() => {
    const available = slots.filter((slot) => slot.status === "available");
    const myBooked = slots.filter((slot) => slot.bookedBy === userEmail.trim());
    const otherBooked = slots.filter(
      (slot) => slot.status === "booked" && slot.bookedBy !== userEmail.trim()
    );

    return {
      availableSlots: available,
      myBookedSlots: myBooked,
      otherBookedSlots: otherBooked,
    };
  }, [slots, userEmail]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Parking Slot Booking
          </h1>
          <p className="text-gray-600">
            Book your parking slot easily with real-time updates
          </p>
        </div>

        <Suspense
          fallback={
            <div className="animate-pulse h-24 bg-white rounded-xl mb-8"></div>
          }
        >
          <StatsPanel stats={stats} />
        </Suspense>

        {/* Pending Indicator */}
        {isPending && (
          <div className="max-w-md mx-auto mb-6 p-3 bg-blue-100 text-blue-800 rounded-lg text-center">
            ⚡ Updating slots...
          </div>
        )}

        {/* My Booked Slots */}
        {myBookedSlots.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                ✓
              </span>
              My Booked Slots ({myBookedSlots.length})
            </h2>
            <Suspense fallback={<div> Loading... </div>}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {myBookedSlots.map((slot) => (
                  <SlotCard
                    key={slot._id}
                    slot={slot}
                    userEmail={userEmail}
                    onBook={handleBookSlot}
                    onUnbook={handleUnbookSlot}
                    isPending={isPending}
                    actionLoading={actionLoading}
                  />
                ))}
              </div>
            </Suspense>
          </div>
        )}

        {/* Available Slots */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
              {availableSlots.length}
            </span>
            Available Slots
          </h2>
          {availableSlots.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-10 text-center">
              <p className="text-gray-500 text-lg">
                No slots available at the moment
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Please check back later
              </p>
            </div>
          ) : (
            <Suspense fallback={<div> Loading... </div>}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {availableSlots.map((slot) => (
                  <SlotCard
                    key={slot._id}
                    slot={slot}
                    userEmail={userEmail}
                    onBook={handleBookSlot}
                    onUnbook={handleUnbookSlot}
                    isPending={isPending}
                    actionLoading={actionLoading}
                  />
                ))}
              </div>
            </Suspense>
          )}
        </div>

        {/* Other Booked Slots */}
        {otherBookedSlots.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="bg-gray-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                {otherBookedSlots.length}
              </span>
              Booked by Others
            </h2>
            <Suspense fallback={<div> Loading... </div>}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {otherBookedSlots.map((slot) => (
                  <SlotCard
                    key={slot._id}
                    slot={slot}
                    userEmail={userEmail}
                    onBook={handleBookSlot}
                    onUnbook={handleUnbookSlot}
                    isPending={isPending}
                    actionLoading={actionLoading}
                  />
                ))}
              </div>
            </Suspense>
          </div>
        )}
      </div>
      {message && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-2 rounded-lg shadow-lg ${
            message.type === "success"
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
