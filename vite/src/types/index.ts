export enum AgentRole {
  User = "user",
  Assistant = "assistant",
  System = "system",
}

export type MessageInput = {
  content: string;
  role: AgentRole;
};

export type Message = MessageInput & {
  _id: string;
};

export type Chat = {
  _id: string;
  summary: string;
  createdBy: string;
  createdAt: string;
};

export type Account = {
  _id: string;
  email: string;
  name: string;
};
