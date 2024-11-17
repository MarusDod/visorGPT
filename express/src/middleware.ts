import { NextFunction, Request, Response } from "express";
import { SessionTokenModel, SessionTokenSchema } from "./schemas/session-token";
import { Types } from "mongoose";
import { DocumentType } from "@typegoose/typegoose";
import { GuestSchema } from "./schemas/guest";

export type PopulatedToken = DocumentType<SessionTokenSchema> & {
  guest: DocumentType<GuestSchema>;
};

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.cookies.authorization) {
    const token = (await SessionTokenModel.findOne({
      _id: new Types.ObjectId(req.cookies.authorization as string),
    })
      .populate("guest")
      .lean()) as PopulatedToken;

    if (token) {
      if (!req.context) {
        req.context = {};
      }

      req.context.token = token;
      next();
      return;
    }
  }

  res.status(403).send("Unauthenticated");
}
