import { useMutation, useQueryClient } from "@tanstack/react-query";
import InputBox from "../input-box";
import { axiosInstance } from "../../services/axios-instance";
import { Message } from "../../types";
import { useNavigate } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";

export default function EmptyChat() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: startChat } = useMutation({
    mutationFn: async (content: string) => {
      const { data, status } = await axiosInstance.post<{
        _id: string;
        messages: Message[];
      }>("/api/completion/newChat", {
        firstMessage: content,
      });

      if (status === 201) {
        queryClient.invalidateQueries({ queryKey: ["chats"] });
        navigate(`/${data._id}?autoGen=true`);
      }
    },
  });

  useDocumentTitle();

  return (
    <div className="flex flex-col justify-center items-center h-full w-full max-w-[1200px] gap-[16px] p-[16px]">
      <span className="text-center font-bold text-[40px]">Ask away</span>
      <InputBox className="text-[18px]" onSubmit={startChat} />
    </div>
  );
}
