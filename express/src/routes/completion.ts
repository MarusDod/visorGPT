import express from "express";
import {
  AgentRole,
  ChatModel,
  messageInputIdSchema,
  messageInputSchema,
  messageUpdateSchema,
} from "../schemas/chat";
import { z } from "zod";
import { OpenAIClient } from "../services/openai";
import { objectIdSchema } from "../utils";
import { Types } from "mongoose";
import { DateTime } from "luxon";

export const completionRouter = express.Router();

completionRouter.post("/prompt", async (request, res) => {
  const { messages } = z
    .object({
      messages: z.array(messageInputSchema).min(1, "no messages"),
    })
    .parse(request.body);

  try {
    const stream = await OpenAIClient.chat.completions.create({
      messages,
      model: "gpt-3.5-turbo",
      stream: true,
      n: 1,
    });

    res.writeHead(200, {
      "Cache-Control": "no-cache",
    });

    //browser won't stream first 1024 characters for some reason
    res.write("\0".repeat(2000));

    for await (const chunk of stream) {
      const text = chunk.choices[0].delta.content;

      if (text) {
        if (!res.write(text)) {
          res.emit("drain");
        }
      }
    }

    res.end();
  } catch (error: any) {
    res.status(429).send(error.message);
  }
});

completionRouter.post("/newChat", async (req, res) => {
  const input = z
    .object({
      firstMessage: z.string(),
    })
    .parse(req.body);

  const chat = await ChatModel.create({
    createdAt: DateTime.now().toJSDate(),
    createdBy: req.context.token!.guest._id,
    messages: [{ content: input.firstMessage, role: AgentRole.User }],
  });

  res.status(201).json({
    _id: chat._id,
    messages: chat.toObject().messages,
  });

  return;
});

completionRouter.post("/persistMessage", async (req, res) => {
  const { message, chatId } = z
    .object({
      message: messageUpdateSchema,
      chatId: objectIdSchema,
    })
    .parse(req.body);

  const chat = await ChatModel.findOne({ _id: chatId });

  if (!chat) {
    res.status(404);
    return;
  }

  const foundIndex = chat.messages.findIndex(
    (m) => m._id.toString() === message._id?.toString()
  );

  let ret: object | null = null;

  if (foundIndex !== -1) {
    chat.messages[foundIndex].role = message.role;
    chat.messages[foundIndex].content = message.content;

    ret = chat.messages[foundIndex];

    chat.messages.splice(foundIndex + 1);
  } else {
    ret = { _id: new Types.ObjectId(), ...message };

    chat.messages.push(ret);
  }

  await chat.save();

  res.status(201).json(ret);
});
