import { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useNavigate } from "react-router-dom";

function NavigateBoundary() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/");
  }, []);

  return <></>;
}

export default function ErrorNavigateBoundary({ children }) {
  return (
    <ErrorBoundary fallback={<NavigateBoundary />}>{children}</ErrorBoundary>
  );
}
