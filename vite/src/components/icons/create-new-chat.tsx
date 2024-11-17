import { Tooltip } from "@mui/material";
import { PencilEdit02Icon } from "hugeicons-react";
import { Link } from "react-router-dom";

export default function CreateNewChat() {
  return (
    <Tooltip title="Create new chat" arrow>
      <Link to={"/"}>
        <PencilEdit02Icon cursor={"pointer"} />
      </Link>
    </Tooltip>
  );
}
