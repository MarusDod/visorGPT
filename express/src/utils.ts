import bcrypt from "bcrypt";
import { Types } from "mongoose";
import { z } from "zod";

const saltRounds = 15;

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, saltRounds);
}

export const objectIdSchema = z
  .string()
  .refine((v) => Types.ObjectId.isValid(v), "not a valid objectId")
  .transform((v) => new Types.ObjectId(v));
