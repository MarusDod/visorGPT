import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { axiosInstance } from "../../services/axios-instance";
import { AgentRole, Message, MessageInput } from "../../types";
import MessageComponent from "../message";
import InputBox from "../input-box";
import {
  Fragment,
  startTransition,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { enqueueSnackbar } from "notistack";
import useOnSummaryChanges from "../../hooks/useOnSummaryChange";
import EditMessageInput from "../edit-message-input";
import LazyLoading from "../icons/lazy-loading";
import ErrorNavigateBoundary from "../navigate-boundary";

function ChatBody() {
  const [searchParams, setSearchParams] = useSearchParams();
  const chatId = searchParams.get("chatId");

  const queryClient = useQueryClient();

  const lastMessageRef = useRef<HTMLDivElement>(null);
  const shouldStopGenerating = useRef(false);

  const [editMessage, setEditMessage] = useState<string | null>(null);

  const messageQueryKeys = useMemo(
    () => ["chat", chatId, "messages"],
    [chatId]
  );

  const scrollToBottom = useCallback(() => {
    if (!lastMessageRef.current) return;

    lastMessageRef.current.scrollIntoView({
      behavior: "smooth",
    });
  }, []);

  const setMessage = useCallback(
    (messageInput: Message) => {
      queryClient.setQueryData<Message[]>(messageQueryKeys, (messages) => {
        const res: Message[] = [];

        if (messages!.some((m) => m._id === messageInput._id)) {
          for (const message of messages!) {
            if (message._id === messageInput._id) {
              res.push({ ...message, ...messageInput });
              break;
            } else {
              res.push(message);
            }
          }
        } else {
          res.push(...[...messages!, messageInput]);
        }

        return res;
      });

      scrollToBottom();
    },
    [chatId]
  );

  const { data: messages } = useSuspenseQuery<Message[]>({
    queryKey: messageQueryKeys,
    queryFn: async () => {
      const { data, status } = await axiosInstance.get("/api/chat/messages", {
        params: {
          chatId,
        },
      });

      if (status === 200) {
        return data;
      }

      throw new Error();
    },
    retry: false,
    refetchOnMount: true,
  });

  const { data: chatInfo } = useQuery<{
    createdAt: string;
    createdBy: string;
    summary: string;
  }>({
    queryKey: ["chat", chatId, "metadata"],
    queryFn: async () => {
      const { data, status } = await axiosInstance.get(
        `/api/chat/${chatId}/metadata`
      );

      if (status === 200) {
        return data;
      }
    },
  });

  const {
    mutateAsync: persistMessage,
    isPending,
    variables: optimisticMessage,
  } = useMutation({
    mutationFn: async (message: MessageInput | Message) => {
      const { status, data } = await axiosInstance.post<Message>(
        "/api/completion/persistMessage",
        {
          message,
          chatId,
        }
      );

      if (status === 201) {
        setMessage(data);
        return data;
      }

      throw new Error("");
    },
    onSuccess(data) {
      if (data?.role === AgentRole.User) {
        promptGPT();
      }
    },
  });

  const { mutateAsync: promptMutation, isPending: isProompting } = useMutation({
    async onError(error) {
      enqueueSnackbar({ variant: "error", message: error.message });
    },
    async mutationFn(assistMessage: Message) {
      const messages = queryClient.getQueryData<Message[]>(messageQueryKeys)!;

      const { data, status } = await axiosInstance.post(
        "/api/completion/prompt",
        {
          messages,
        },
        {
          responseType: "stream",
        }
      );

      switch (status) {
        case 200: {
          let newContent = "";

          for await (const chunk of data.pipeThrough(
            new TextDecoderStream("utf-8")
          )) {
            if (shouldStopGenerating.current === true) {
              shouldStopGenerating.current = false;
              break;
            }

            newContent = newContent + chunk;

            startTransition(() => {
              setMessage({ ...assistMessage, content: newContent });
            });
          }

          return {
            ...assistMessage,
            content: newContent.trim().replaceAll(/\0/g, ""),
          };
        }
        default:
          throw new Error(`You've hit the rate limit`);
      }
    },
  });

  const promptGPT = async () => {
    const assistMessage = await persistMessage({
      content: "",
      role: AgentRole.Assistant,
    });

    const newMessage = await promptMutation(assistMessage);

    await persistMessage(newMessage);
  };

  useEffect(() => {
    if (!!messages?.length && searchParams.get("autoGen") && chatId) {
      promptGPT();
      setSearchParams(
        (params) => {
          params.delete("autoGen");

          return params;
        },
        {
          replace: true,
        }
      );
    }
  }, [chatId, searchParams.get("autoGen"), !!messages]);

  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages?.length]);

  useDocumentTitle(chatInfo?.summary);

  useOnSummaryChanges(chatId!);

  return (
    <>
      <div
        ref={lastMessageRef}
        className="flex flex-col w-full justify-start h-full gap-[16px] pt-[24px] px-[10%] overflow-y-auto overflow-x-hidden"
      >
        {messages
          ?.filter((m) => m.content)
          .map((message, index, arr) => {
            const isLast = index === arr.length - 1;

            return (
              <Fragment key={message._id}>
                {editMessage !== message._id ? (
                  <MessageComponent
                    ref={isLast ? lastMessageRef : undefined}
                    content={message.content}
                    role={message.role}
                    onEdit={() => setEditMessage(message._id)}
                    loading={
                      message.role === AgentRole.Assistant &&
                      isLast &&
                      isProompting
                    }
                  />
                ) : (
                  <EditMessageInput
                    content={message.content}
                    onCancel={() => setEditMessage(null)}
                    onSend={(newContent) => {
                      setEditMessage(null);

                      persistMessage({
                        ...message,
                        content: newContent,
                      });
                    }}
                  />
                )}
              </Fragment>
            );
          })}
        {isPending && optimisticMessage?.role === AgentRole.User && (
          <MessageComponent
            content={optimisticMessage.content}
            role={optimisticMessage.role}
          />
        )}
        {isPending &&
          !("_id" in optimisticMessage) &&
          optimisticMessage?.role === AgentRole.Assistant && (
            <MessageComponent role={optimisticMessage.role} loading={true} />
          )}
      </div>
      <div className="mt-auto w-[90%] h-[150px] p-[20px] flex justify-center items-end">
        <InputBox
          onSubmit={(content) =>
            persistMessage({ content, role: AgentRole.User })
          }
          isGenerating={isProompting || isPending}
          stopGenerating={() => {
            shouldStopGenerating.current = true;
          }}
        />
      </div>
    </>
  );
}

export default function ChatBodySuspense() {
  return (
    <ErrorNavigateBoundary>
      <Suspense fallback={<LazyLoading size={50} />}>
        <ChatBody />
      </Suspense>
    </ErrorNavigateBoundary>
  );
}
