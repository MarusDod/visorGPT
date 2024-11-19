import { Sidebar } from "./sidebar";
import { useSidebarContext } from "./sidebar-context";

export default function SidebarRender() {
  const { isSidebarOpen, setIsSidebarOpen } = useSidebarContext();

  return isSidebarOpen && <Sidebar onClose={() => setIsSidebarOpen(false)} />;
}
