import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Account } from "../../types";
import { Avatar, IconButton, MenuItem, Popover, Tooltip } from "@mui/material";
import { SidebarLeft01Icon } from "hugeicons-react";
import CreateNewChat from "../icons/create-new-chat";
import { Link, useNavigate } from "react-router-dom";
import { useSidebarContext } from "../sidebar/sidebar-context";
import { useState } from "react";
import { axiosInstance } from "../../services/axios-instance";
import { enqueueSnackbar } from "notistack";
import Nonce from "assets/nonce.png";

export default function ChatHeader() {
  const { isSidebarOpen, setIsSidebarOpen } = useSidebarContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [openPopover, setOpenPopover] = useState<HTMLDivElement | null>(null);

  const account = queryClient.getQueryData<Account>(["guest", "account"]);

  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      const { status } = await axiosInstance.post("/auth/logout");

      if (status === 200) {
        return true;
      } else {
        throw new Error();
      }
    },
    async onSuccess() {
      enqueueSnackbar({
        variant: "success",
        message: "Successfully logged out",
      });

      sessionStorage.clear();
      await queryClient.invalidateQueries();
      await queryClient.resetQueries();

      navigate("/login");
    },
  });

  return (
    <div className="flex flex-row justify-start items-center w-full px-[16px] h-[56px] gap-[16px] bg-gray-500 bg-opacity-25">
      <div className={`contents ${!isSidebarOpen ? "visible" : "invisible"}`}>
        <Tooltip title="Show sidebar" arrow>
          <SidebarLeft01Icon
            cursor={"pointer"}
            onClick={() => setIsSidebarOpen(true)}
          />
        </Tooltip>
        <CreateNewChat />
      </div>

      <div className="ml-auto" />
      <IconButton onClick={(ev) => setOpenPopover(ev.target as any)}>
        <Avatar src={account ? undefined : Nonce}>
          {account?.name[0].toUpperCase()}
        </Avatar>
      </IconButton>
      {!!openPopover && (
        <Popover
          open={true}
          anchorEl={openPopover}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          onClose={() => setOpenPopover(null)}
          onClick={() => setOpenPopover(null)}
        >
          {account ? (
            <MenuItem onClick={() => logout()}>Log Out</MenuItem>
          ) : (
            <>
              <MenuItem>
                <Link to={"/signup"}>Sign Up</Link>
              </MenuItem>
              <MenuItem>
                <Link to={"/login"}>Log In</Link>
              </MenuItem>
            </>
          )}
        </Popover>
      )}
    </div>
  );
}
