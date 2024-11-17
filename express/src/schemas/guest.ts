import { DocumentType, getModelForClass, prop } from "@typegoose/typegoose";

export class GuestSchema {
  @prop({ type: String, default: "" })
  public memory: string;
}

export type GuestDocument = DocumentType<GuestSchema>;

export const GuestModel = getModelForClass(GuestSchema);
