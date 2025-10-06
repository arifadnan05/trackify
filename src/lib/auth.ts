import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { connectToDB } from "./db";

const JWT_SECRET = process.env.JWT_SECRET ?? "default_secret";
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET");

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function createJWT(
  payload: object,
  options: SignOptions = { expiresIn: "7d" }
) {
  return jwt.sign(payload, JWT_SECRET, options);
}

// --- User helpers ---
export interface UserDoc {
  _id?: ObjectId;
  name?: string;
  email: string;
  password: string;
  createdAt?: Date;
  role: string;
}

export async function findUserByEmail(email: string): Promise<UserDoc | null> {
  const { db } = await connectToDB();
  return db.collection<UserDoc>("users").findOne({ email });
}

export async function createUser({
  name,
  email,
  passwordHash,
}: {
  name?: string;
  email: string;
  passwordHash: string;
}) {
  const { db } = await connectToDB();
  const res = await db.collection<UserDoc>("users").insertOne({
    name,
    email,
    password: passwordHash,
    createdAt: new Date(),
    role: "user",
  });
  return res;
}

export async function findUserById(id: string): Promise<UserDoc | null> {
  const { db } = await connectToDB();
  return db.collection<UserDoc>("users").findOne({ _id: new ObjectId(id) });
}
