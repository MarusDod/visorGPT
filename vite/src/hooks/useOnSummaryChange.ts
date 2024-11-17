import { useEffect } from "react";
import { axiosInstance } from "../services/axios-instance";
import { useQueryClient } from "@tanstack/react-query";
import { Chat } from "../types";
import { identity } from "lodash";

export default function useOnSummaryChanges(chatId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!chatId) {
      return identity;
    }

    const controller = new AbortController();

    axiosInstance
      .get(`/api/chat/${chatId}/subscribeHead`, {
        signal: controller.signal,
        responseType: "stream",
        headers: {
          Accept: "text/event-stream",
          Connection: "keep-alive",
        },
      })
      .then(async ({ status, data }) => {
        if (status !== 200) {
          return;
        }

        for await (const text of data.pipeThrough(
          new TextDecoderStream("utf-8")
        )) {
          const updatedDoc: { _id: string; summary: string } = JSON.parse(
            text.trim()
          );

          queryClient.setQueryData<{ pages: Chat[][] }>(["chats"], (props) =>
            props
              ? {
                  ...props,
                  pages: props!.pages!.map((chats) =>
                    chats.map((c) =>
                      c._id === updatedDoc._id
                        ? { ...c, summary: updatedDoc.summary }
                        : c
                    )
                  ),
                }
              : undefined
          );

          queryClient.setQueryData(["chat", chatId, "metadata"], (chat) =>
            chat
              ? {
                  ...chat,
                  summary: updatedDoc.summary,
                }
              : undefined
          );
        }
      })
      .catch(() => null);

    return () => {
      controller.abort();
    };
  }, [chatId]);
}
