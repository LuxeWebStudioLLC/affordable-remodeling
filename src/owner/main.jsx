import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./owner.css";
import Owner from "./Owner.jsx";

createRoot(document.getElementById("owner-root")).render(
  <StrictMode>
    <Owner />
  </StrictMode>,
);
