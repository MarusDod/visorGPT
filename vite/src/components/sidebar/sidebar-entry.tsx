import { MoreHorizontalIcon } from "hugeicons-react";
import { Chat } from "../../types";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { axiosInstance } from "../../services/axios-instance";
import EntryPopover from "./popover";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";

export default function SidebarEntry({
  chat,
  isSelected,
}: {
  chat: Chat;
  isSelected: boolean;
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [moreSelected, setMoreSelected] = useState<HTMLDivElement | null>(null);
  const [editMode, setEditMode] = useState(false);

  const { mutate: renameMutation } = useMutation({
    mutationFn: async (description: string) => {
      const { data, status } = await axiosInstance.post<{
        _id: string;
        summary: string;
      }>("/api/chat/update", {
        chatId: chat._id,
        description,
      });

      if (status === 200) {
        enqueueSnackbar({
          variant: "success",
          message: "Chat renamed with success!",
        });

        queryClient.setQueryData<{ pages: Chat[][] }>(["chats"], (props) => ({
          ...props,
          pages: props!.pages!.map((chats) =>
            chats.map((c) =>
              c._id === data._id ? { ...c, summary: data.summary } : c
            )
          ),
        }));

        setEditMode(false);
        return;
      }

      throw new Error();
    },
  });

  const { mutateAsync: archiveMutation } = useMutation({
    mutationFn: async () => {
      const { status } = await axiosInstance.post("/api/chat/archive", {
        chatId: chat._id,
      });

      if (status === 200) {
        if (isSelected) {
          navigate("/");
        }

        await queryClient.invalidateQueries({ queryKey: ["chats"] });

        return;
      }

      throw new Error();
    },
  });

  const { mutateAsync: createSharedLink } = useMutation({
    mutationFn: async () => {
      const { status, data } = await axiosInstance.post<string>(
        "/api/chat/createSharedLink",
        {
          chatId: chat._id,
        }
      );

      if (status === 200) {
        return data;
      }

      throw new Error();
    },
  });

  return (
    <>
      <span
        onClick={() => navigate(`?chatId=${chat._id}`)}
        className={`flex min-w-0 flex-nowrap overflow-hidden items-center justify-between w-full text-left py-[10px] px-[4px] cursor-pointer relative whitespace-nowrap rounded-md hover:cursor-pointer hover:bg-white hover:bg-opacity-10 ${
          isSelected ? "bg-white bg-opacity-10" : ""
        }`}
      >
        {!editMode ? (
          <>
            <span className="clip-text w-full">
              {chat.summary?.substring(0, 50)}
            </span>
            {isSelected && (
              <MoreHorizontalIcon
                onClick={(ev) => {
                  ev.stopPropagation();
                  setMoreSelected(ev.currentTarget as any);
                }}
                className="absolute mr-[8px] right-0 hover:scale-x-90"
              />
            )}
          </>
        ) : (
          <input
            autoFocus
            placeholder={chat.summary}
            onKeyUp={(ev) => {
              if (ev.key === "Enter") {
                renameMutation(ev.currentTarget.value);
              }
            }}
            onBlur={() => setEditMode(false)}
          />
        )}
      </span>
      {!!moreSelected && (
        <EntryPopover
          anchorEl={moreSelected}
          onClose={() => setMoreSelected(null)}
          onRename={() => setEditMode(true)}
          onArchive={archiveMutation}
          onCreateSharedLink={createSharedLink}
        />
      )}
    </>
  );
}
