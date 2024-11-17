import express from "express";
import { GuestDocument, GuestModel } from "../schemas/guest";
import { z } from "zod";
import { AccountDTO, AccountModel } from "../schemas/account";
import { hashPassword, objectIdSchema } from "../utils";
import { Types } from "mongoose";
import {
  SessionTokenDocument,
  SessionTokenModel,
} from "../schemas/session-token";

const loginRouter = express.Router();

loginRouter.get("/getTemporaryGuest", async (req, res) => {
  let token: SessionTokenDocument | null = null;

  const tokenId = objectIdSchema.optional().parse(req.query.id);

  if (req.query.id) {
    token = await SessionTokenModel.findOne({
      _id: tokenId,
    }).populate("guest");

    if (token) {
      res.status(200).json(token);
      return;
    }
  }

  const guest = await GuestModel.create({});
  token = await SessionTokenModel.create({ guest: guest._id });

  res.json({
    ...token.toObject(),
    guest: guest.toObject(),
  });
});

loginRouter.post("/createAccountFromGuest", async (req, res) => {
  const input = z
    .object({
      guestId: objectIdSchema.refine(async (v) => {
        const guestExists = !!(await GuestModel.countDocuments({
          _id: new Types.ObjectId(v),
        }));

        if (!guestExists) {
          return false;
        }

        const accountExists = !!(await AccountModel.countDocuments({
          guest: new Types.ObjectId(v),
        }));

        return !accountExists;
      }),
      name: z.string(),
      email: z.string().email(),
      password: z
        .string()
        .min(6, "too few characters")
        .max(20, "too many characters")
        .regex(/[a-z]/, "Must contain one lowercase letter")
        .regex(/[A-Z]/, "Must contain one uppercase letter")
        .regex(/[0-9]/, "Must contain one number")
        .regex(/[@$!%*?&#]/, "Must contain special character"),
    })
    .parse(req.body);

  const account = await AccountModel.create({
    guest: input.guestId,
    email: input.email,
    hashedPassword: hashPassword(input.password),
  });

  res.status(201).json(AccountDTO.parse(account));
});

export { loginRouter };
