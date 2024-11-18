import { useInfiniteQuery } from "@tanstack/react-query";
import { SidebarLeft01Icon } from "hugeicons-react";
import { axiosInstance } from "../../services/axios-instance";
import { useLocation } from "react-router-dom";
import { Chat } from "../../types";
import SidebarEntry from "./sidebar-entry";
import { Fragment, useMemo } from "react";
import { capitalize, groupBy, map } from "lodash";
import { DateTime } from "luxon";
import { Tooltip } from "@mui/material";
import CreateNewChat from "../icons/create-new-chat";
import LazyLoading from "../icons/lazy-loading";

const default_limit = 25;

export function Sidebar({ onClose }: { onClose: () => any }) {
  const location = useLocation();

  const chatId = location.pathname.split("/")[1];

  const { data, fetchNextPage, hasNextPage, isPending, isLoading } =
    useInfiniteQuery({
      queryKey: ["chats"],
      queryFn: async ({ pageParam }) => {
        if (pageParam == null) {
          return [];
        }

        const { data, status } = await axiosInstance.get<Array<Chat>>(
          "/api/guestChats",
          {
            params: {
              skip: pageParam * default_limit,
              limit: default_limit,
            },
          }
        );

        if (status === 200) {
          return data;
        }

        throw new Error();
      },
      initialPageParam: 0,
      getNextPageParam(lastPage, allPages) {
        return lastPage.length === default_limit ? allPages.length : undefined;
      },
    });

  const groupedChats = useMemo(
    () =>
      groupBy(data?.pages.flat() || [], (x) =>
        DateTime.fromISO(x.createdAt).toRelativeCalendar()
      ),
    [data]
  );

  return (
    <div
      className={
        "h-full w-[300px] py-[12px] px-[16px] bg-slate-600 overflow-hidden flex flex-shrink-0 flex-col transition-[max-width] duration-300 ease-out"
      }
    >
      <div className="flex justify-between items-center">
        <Tooltip arrow title="Hide sidebar">
          <SidebarLeft01Icon cursor={"pointer"} onClick={() => onClose()} />
        </Tooltip>
        <CreateNewChat />
      </div>
      <div
        onScroll={(ev) => {
          const { scrollTop, scrollHeight, clientHeight } = ev.currentTarget;

          if (
            scrollTop + clientHeight >= scrollHeight &&
            hasNextPage &&
            !isPending &&
            !isLoading
          ) {
            fetchNextPage();
          }
        }}
        className="flex flex-col gap-[8px] mt-[24px] h-full w-inherit justify-start items-center overflow-y-auto overflow-x-hidden font-sans"
      >
        {map(groupedChats, (chats, key) => (
          <Fragment key={key}>
            <div className="mt-[16px] mb-[8px] text-start self-start font-bold">
              {capitalize(key)}
            </div>
            {chats.map((c) => (
              <SidebarEntry
                key={c._id}
                chat={c}
                isSelected={c._id === chatId}
              />
            ))}
          </Fragment>
        ))}

        {(isLoading || isPending) && <LazyLoading size={50} />}
        <span></span>
      </div>
    </div>
  );
}
