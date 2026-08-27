// src/App.tsx
import { RouterProvider } from "react-router-dom";
import { ModeProvider } from "./context/ModeContext";
import { router } from "./router";
import { ChatAI } from "./components/ChatAI";

export default function App() {
  return (
    <ModeProvider>
      <RouterProvider router={router} />
      <ChatAI />
    </ModeProvider>
  );
}
