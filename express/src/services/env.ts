import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

export const env = z
  .object({
    OPENAI_API_KEY: z.string(),
    MONGODB_CONN: z.string(),
    PORT: z.coerce.number().max(65561).min(0).optional(),
  })
  .parse(process.env);
