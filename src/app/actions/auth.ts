"use server";

import { cookies } from "next/headers";
import {
  hashPassword,
  createJWT,
  findUserByEmail,
  createUser,
  verifyPassword,
} from "@/lib/auth";

export async function registerUser(formData: FormData) {
  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) throw new Error("Missing fields");

  const existing = await findUserByEmail(email);
  if (existing) throw new Error("User already exists");

  const passwordHash = await hashPassword(password);
  const result = await createUser({ name, email, passwordHash });

  const token = createJWT({ sub: result.insertedId.toString(), email });
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function loginUser(formData: FormData) {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) throw new Error("Missing fields");

  const user = await findUserByEmail(email);
  if (!user) throw new Error("Invalid credentials");

  const ok = await verifyPassword(password, user.password);
  if (!ok) throw new Error("Invalid credentials");

  const token = createJWT({ sub: user._id?.toString(), email });
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
}
