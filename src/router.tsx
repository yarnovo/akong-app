import { createHashRouter } from "react-router-dom"
import App from "./App"
import { List } from "./pages/List"
import { Agents } from "./pages/Agents"
import { Me } from "./pages/Me"
import { Chat } from "./pages/Chat"

export const router = createHashRouter([
  {
    path: "/",
    Component: App,
    children: [
      { index: true, Component: List },
      { path: "agents", Component: Agents },
      { path: "me", Component: Me },
      { path: "chat/:scope/:target", Component: Chat },
    ],
  },
])
