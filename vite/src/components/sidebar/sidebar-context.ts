import { identity } from "lodash";
import { createContext, useContext } from "react";

export const SidebarContext = createContext<{
  isSidebarOpen: boolean;
  setIsSidebarOpen: (x: boolean) => any;
}>({
  isSidebarOpen: false,
  setIsSidebarOpen: identity,
});

export const useSidebarContext = () => useContext(SidebarContext);
