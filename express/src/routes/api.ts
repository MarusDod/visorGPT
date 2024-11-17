import express from "express";
import { z } from "zod";
import { objectIdSchema } from "../utils";
import { ChatModel } from "../schemas/chat";
import mongoose, { Types } from "mongoose";
import { GuestModel } from "../schemas/guest";
import { completionRouter } from "./completion";
import { database } from "../services/mongoose";

export const apiRouter = express.Router();

apiRouter.use("/completion", completionRouter);

apiRouter.post("/proompt", async (req, res) => {
  const { input } = z
    .object({
      input: z.string().max(1000, "plz don't make me go bankrupt"),
    })
    .parse(req.body);

  const completion = await prompt(input);
  res.status(200).send(completion);
});

apiRouter.get("/guestChats", async (req, res) => {
  const guestId = req.context.token!.guest._id;

  const guest = await GuestModel.findOne({
    _id: new Types.ObjectId(guestId),
    archived: { $ne: true },
  });

  if (!guest) {
    res.status(404);
    return;
  }

  const pagination = z
    .object({
      skip: z.coerce.number().min(0).default(0),
      limit: z.coerce.number().max(100).default(25),
    })
    .parse(req.query);

  const chats = await ChatModel.find(
    { createdBy: guest._id, archived: { $ne: true } },
    { messages: 0, createdBy: 0 }
  )
    .sort({ createdAt: -1 })
    .skip(pagination.skip)
    .limit(pagination.limit);

  res.status(200).json(chats);

  return;
});

apiRouter.get("/chat/messages", async (req, res) => {
  const { chatId } = z
    .object({
      chatId: objectIdSchema,
    })
    .parse(req.query);

  const result = await ChatModel.findOne(
    { _id: chatId, archived: { $ne: true } },
    { messages: 1 }
  ).lean();

  if (!result) {
    res.status(404);
    return;
  }

  const { messages } = result;

  res.status(200).json(messages);
});

apiRouter.get("/chat/:chatId/metadata", async (req, res) => {
  const chatId = objectIdSchema.parse(req.params.chatId);

  const result = await ChatModel.findOne(
    { _id: chatId, archived: { $ne: true } },
    { _id: 1, createdAt: 1, createdBy: 1, summary: 1 }
  );

  if (!result) {
    res.status(404);
    return;
  }

  res.status(200).json(result);
});

apiRouter.post("/chat/update", async (req, res) => {
  const { chatId, description } = z
    .object({
      chatId: objectIdSchema,
      description: z.string().min(0).max(50),
    })
    .parse(req.body);

  const guestId = req.context.token!.guest._id;

  const chat = await ChatModel.findOne({
    _id: chatId,
    createdBy: guestId,
    archived: { $ne: true },
  });

  if (!chat) {
    res.status(404);
    return;
  }

  chat.edited = true;
  chat.summary = description;

  await chat.save();

  res.status(200).json({
    _id: chat._id,
    summary: chat.summary,
  });
});

apiRouter.post("/chat/archive", async (req, res) => {
  const { chatId } = z
    .object({
      chatId: objectIdSchema,
    })
    .parse(req.body);

  const guestId = req.context.token!.guest._id;

  const chat = await ChatModel.findOne({
    _id: chatId,
    createdBy: guestId,
    archived: { $ne: true },
  });

  if (!chat) {
    res.status(404);
    return;
  }

  chat.archived = true;

  await chat.save();

  res.status(200).json("");
});

apiRouter.get("/chat/:chatId/subscribeHead", async (req, res) => {
  const chatId = objectIdSchema.parse(req.params.chatId);

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const changeStream = ChatModel.watch([
    {
      $match: {
        operationType: "update",
        "documentKey._id": chatId,
        "updateDescription.updatedFields.summary": { $exists: true },
      },
    },
  ]);

  while (await changeStream.hasNext()) {
    const doc = await changeStream.next();

    const resp = {
      _id: chatId,
      summary: doc.updateDescription.updatedFields.summary,
    };

    if (!res.write(JSON.stringify(resp))) {
      res.emit("drain");
    }
  }

  await changeStream.close();
});
