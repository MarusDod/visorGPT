import { forwardRef, Ref } from "react";
import { AgentRole } from "../types";
import VisorBot from "assets/visorbot.png";
import Loader from "react-dots-loader";
import "react-dots-loader/index.css";
import { EditOutlined } from "@mui/icons-material";
import { IconButton } from "@mui/material";

const MessageComponent = forwardRef(function (
  {
    content = "",
    role,
    loading = false,
    onEdit,
  }: {
    content?: string;
    role: AgentRole;
    loading?: boolean;
    onEdit?: () => any;
  },
  ref: Ref<HTMLDivElement>
) {
  return (
    <div className="flex items-center gap-[8px] group">
      {role === AgentRole.Assistant && (
        <img
          src={VisorBot}
          width={30}
          height={30}
          className="rounded-[50%] object-contain self-start border-slate-500 border-spacing-5"
        />
      )}
      {role === AgentRole.User && (
        <>
          <div className="ml-auto" />
          {onEdit && (
            <IconButton
              className="group-hover:visible invisible"
              onClick={onEdit}
            >
              <EditOutlined htmlColor="white" />
            </IconButton>
          )}
        </>
      )}
      <div
        ref={ref}
        className={`whitespace-pre text-wrap rounded-[1.5rem] font-sans text-[1.2rem] text-white w-auto py-[8px] px-[16px] ${
          role === AgentRole.User
            ? "self-end text-right bg-gray-600"
            : "self-start text-left"
        }`}
      >
        {content}
        <Loader size={10} visible={loading} distance={2} />
      </div>
    </div>
  );
});

export default MessageComponent;
