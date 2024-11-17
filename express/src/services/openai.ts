import OpenAI from "openai";
import { env } from "./env";
import { AgentRole, Message } from "../schemas/chat";

export const OpenAIClient = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export async function basicPrompt(input: string) {
  const chatCompletion = await OpenAIClient.chat.completions.create({
    messages: [{ role: "user", content: input }],
    model: "gpt-3.5-turbo",
  });

  return chatCompletion.choices[0].message.content || "";
}

export async function promptMessages(messages: (Message & any)[]) {
  const chatCompletion = await OpenAIClient.chat.completions.create({
    messages,
    model: "gpt-3.5-turbo",
  });

  return chatCompletion.choices[0].message.content || "";
}
