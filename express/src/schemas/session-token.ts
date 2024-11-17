import {
  DocumentType,
  getModelForClass,
  index,
  prop,
  Ref,
} from "@typegoose/typegoose";
import { GuestSchema } from "./guest";

@index({ expires: 1 }, { expireAfterSeconds: 3600 * 24 })
export class SessionTokenSchema {
  @prop({ ref: () => GuestSchema })
  public guest: Ref<GuestSchema>;
  @prop({ type: Date })
  public expires: Date;
}

export type SessionTokenDocument = DocumentType<SessionTokenSchema>;

export const SessionTokenModel = getModelForClass(SessionTokenSchema);
