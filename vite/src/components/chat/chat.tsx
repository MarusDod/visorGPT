import VisorBackground from "assets/visor-background.jpg";
import ChatHeader from "./chat-header";

export default function ChatLayout({ children }) {
  return (
    <div
      className="flex flex-col flex-grow justify-start items-center h-full w-full bg-opacity-30"
      style={{
        background: `linear-gradient(rgba(255,255,255,.3), rgba(255,255,255,.3)), url(${VisorBackground}`,
        backgroundColor: "rgba(0,0,0, 0.5)",
        backgroundRepeat: "no-repeat",
        backgroundSize: "100% 100%",
        filter: "alpha(opacity=50)",
      }}
    >
      <ChatHeader />
      {children}
    </div>
  );
}
