import { Suspense, useState } from "react";
import { Sidebar } from "./components/sidebar";
import LazyLoading from "./components/icons/lazy-loading";
import GuestProvider from "./services/query-providers/guest-provider";
import Chat from "./components/chat/chat";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <main className="h-screen w-screen overflow-hidden flex">
      <Suspense fallback={<LazyLoading size={100} />}>
        <GuestProvider>
          {isSidebarOpen && <Sidebar onClose={() => setIsSidebarOpen(false)} />}
          <Chat
            isMinimized={!isSidebarOpen}
            onSideBarOpen={() => setIsSidebarOpen(true)}
          />
        </GuestProvider>
      </Suspense>
    </main>
  );
}

export default App;
