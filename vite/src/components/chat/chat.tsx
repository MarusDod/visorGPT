import { SidebarLeft01Icon } from "hugeicons-react";
import { Route, Routes } from "react-router-dom";
import EmptyChat from "./empty-chat";
import ChatBody from "./chat-body";
import VisorBackground from "assets/visor-background.jpg";
import { Tooltip } from "@mui/material";
import CreateNewChat from "../icons/create-new-chat";

interface ChatBodyProps {
  isMinimized: boolean;
  onSideBarOpen: () => any;
}

export default function Chat({ isMinimized, onSideBarOpen }: ChatBodyProps) {
  return (
    <div
      className="flex flex-col flex-grow justify-start items-center h-full w-full bg-opacity-30"
      style={{
        background: `linear-gradient(rgba(255,255,255,.3), rgba(255,255,255,.3)), url(${VisorBackground}`,
        backgroundColor: "rgba(0,0,0, 0.5)",
        backgroundRepeat: "no-repeat",
        backgroundSize: "100%",
        filter: "alpha(opacity=50)",
      }}
    >
      <div className="flex flex-row justify-start items-center w-full px-[16px] py-[12px] gap-[16px]">
        <div className={`contents ${isMinimized ? "visible" : "invisible"}`}>
          <Tooltip title="Show sidebar" arrow>
            <SidebarLeft01Icon cursor={"pointer"} onClick={onSideBarOpen} />
          </Tooltip>
          <CreateNewChat />
        </div>
      </div>
      <Routes>
        <Route index element={<EmptyChat />} />
        <Route path={":chatId"} element={<ChatBody />}></Route>
      </Routes>
    </div>
  );
}
