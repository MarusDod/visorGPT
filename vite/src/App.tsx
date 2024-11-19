import { lazy, Suspense } from "react";
import LazyLoading from "./components/icons/lazy-loading";
import GuestProvider from "./services/query-providers/guest-provider";
import { Route, Routes } from "react-router-dom";
import Chat from "./components/chat";
const LoginPage = lazy(() => import("./components/auth/login"));
const SignUpPage = lazy(() => import("./components/auth/sign-up"));

export default function App() {
  return (
    <main className="h-screen w-screen overflow-hidden flex">
      <Suspense fallback={<LazyLoading size={100} />}>
        <GuestProvider>
          <Routes>
            <Route path={"/login"} element={<LoginPage />} />
            <Route path={"/signup"} element={<SignUpPage />} />
            <Route index element={<Chat />} />
          </Routes>
        </GuestProvider>
      </Suspense>
    </main>
  );
}
