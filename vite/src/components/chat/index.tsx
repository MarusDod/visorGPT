import { useSearchParams } from "react-router-dom";
import ChatLayout from "./chat";
import ChatBodySuspense from "./chat-body";
import EmptyChat from "./empty-chat";
import SidebarRender from "../sidebar";

export default function Chat() {
  const [searchParams] = useSearchParams();

  return (
    <>
      <SidebarRender />
      <ChatLayout>
        {searchParams.get("chatId") ? <ChatBodySuspense /> : <EmptyChat />}
      </ChatLayout>
    </>
  );
}
