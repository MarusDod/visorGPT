import styled from "@emotion/styled";
import { MenuItem, Popover } from "@mui/material";
import { ArchiveIcon, PencilEdit01Icon, Share01Icon } from "hugeicons-react";
import { enqueueSnackbar } from "notistack";

const StyledMenuItem = styled(MenuItem)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: 8,
  fontSize: 16,
  padding: "8px 16px",
}));

export default function EntryPopover({
  anchorEl,
  onRename,
  onArchive,
  onClose,
  onCreateSharedLink,
}: {
  anchorEl: HTMLDivElement;
  onRename: () => any;
  onArchive: () => Promise<any>;
  onClose: () => any;
  onCreateSharedLink: () => Promise<string>;
}) {
  return (
    <>
      <Popover
        open={true}
        onClick={onClose}
        onClose={onClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        anchorEl={anchorEl}
        classes={{
          paper: "!bg-slate-800 !text-white !py-[8px] !rounded-lg",
        }}
      >
        <StyledMenuItem
          onClick={() =>
            onCreateSharedLink()
              .then((sharedId) =>
                navigator.clipboard
                  .writeText(`${window.location.origin}/shared/${sharedId}`)
                  .then(() =>
                    enqueueSnackbar({
                      variant: "success",
                      message: "Link shared with success!",
                    })
                  )
              )
              .catch(() =>
                enqueueSnackbar({
                  variant: "error",
                  message: "Failed to create link :(",
                })
              )
          }
        >
          <Share01Icon size={20} />
          Share
        </StyledMenuItem>
        <StyledMenuItem onClick={onRename}>
          <PencilEdit01Icon size={20} />
          Rename
        </StyledMenuItem>
        <StyledMenuItem
          className="!text-red-600"
          onClick={() =>
            onArchive()
              .then(() =>
                enqueueSnackbar({
                  variant: "success",
                  message: "Chat archived with success!",
                })
              )
              .catch(() =>
                enqueueSnackbar({
                  variant: "error",
                  message: "Failed to archive chat",
                })
              )
          }
        >
          <ArchiveIcon size={20} />
          Archive
        </StyledMenuItem>
      </Popover>
    </>
  );
}
