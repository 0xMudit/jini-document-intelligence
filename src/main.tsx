import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./Jini.css";
import { Jini } from "./Jini.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <Jini />
    </ErrorBoundary>
  </StrictMode>,
);