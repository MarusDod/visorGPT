import { Document, model, Schema, Types } from "mongoose";
import { GuestSchema } from "./guest";
import { z } from "zod";
import { objectIdSchema } from "../utils";
import { promptMessages } from "../services/openai";
import { omit } from "lodash";

export enum AgentRole {
  Assistant = "assistant",
  User = "user",
  System = "system",
}

export const MessageSchema = new Schema({
  role: { type: String, required: true, enum: AgentRole },
  content: { type: String },
});

export const ChatSchema = new Schema({
  createdBy: { ref: GuestSchema, type: Types.ObjectId },
  createdAt: Date,
  pinned: { type: Boolean, default: false },
  archived: { type: Boolean, default: false },
  edited: { type: Boolean, default: false },
  summary: { type: String, default: "" },
  messages: {
    default: [],
    required: true,
    type: [MessageSchema],
  },
});

export type ChatDocument = Document<typeof ChatSchema>;

export const messageInputSchema = z.object({
  role: z.nativeEnum(AgentRole),
  content: z.string(),
});

export type Message = z.infer<typeof messageInputSchema>;

export const messageUpdateSchema = z.object({
  _id: objectIdSchema.optional(),
  role: z.nativeEnum(AgentRole),
  content: z.string(),
});

export const messageInputIdSchema = z.object({
  _id: objectIdSchema,
  role: z.nativeEnum(AgentRole),
  content: z.string(),
});

ChatSchema.pre("save", async function () {
  if (
    !this.isModified("messages") ||
    this.messages.at(-1)?.role !== AgentRole.Assistant ||
    !this.messages.at(-1)?.content ||
    this.messages.length > 10 ||
    this.edited
  ) {
    //don't wast needless tokens
    return;
  }

  const systemMessage: Message = {
    role: AgentRole.System,
    content:
      "the previous conversation was between a human and a chatbot. say what the topic of the conversation was about in less than 6 words",
  };

  try {
    this.summary = await promptMessages([...this.messages, systemMessage]);
  } catch (err) {
    console.error(err);
  }
});

export const ChatModel = model("chat", ChatSchema);
