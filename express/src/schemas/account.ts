import { getModelForClass, plugin, prop } from "@typegoose/typegoose";
import { Types } from "mongoose";
import MongooseDelete from "mongoose-delete";
import { z } from "zod";

@plugin(MongooseDelete)
export class AccountSchema {
  @prop({ type: String, required: true })
  public email: string;

  @prop({ type: String, required: true })
  public name: string;

  @prop({ type: String, required: true })
  public hashedPassword: string;

  @prop({ type: Types.ObjectId, required: true })
  public guest: Types.ObjectId;
}

export const AccountModel = getModelForClass(AccountSchema);

export const AccountDTO = z.object({
  _id: z.coerce.string(),
  email: z.string().email(),
  name: z.string(),
});
