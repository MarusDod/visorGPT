import bcrypt from "bcrypt";
import { Types } from "mongoose";
import { z } from "zod";

const saltRounds = 15;

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, saltRounds);
}

export async function checkPassword(password: string, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

export const objectIdSchema = z
  .string()
  .refine((v) => Types.ObjectId.isValid(v), "not a valid objectId")
  .transform((v) => new Types.ObjectId(v));

export const passwordSchema = z
  .string()
  .min(6, "too few characters")
  .max(20, "too many characters")
  .regex(/[a-z]/, "Must contain one lowercase letter")
  .regex(/[A-Z]/, "Must contain one uppercase letter")
  .regex(/[0-9]/, "Must contain one number")
  .regex(/[@$!%*?&#]/, "Must contain special character");
