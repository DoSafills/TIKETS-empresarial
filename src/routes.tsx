import { createBrowserRouter } from "react-router-dom";
import UserTicket from "../app/components/UserTicket";
import TechPanel from "../app/components/TechPanel";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: UserTicket,
  },
  {
    path: "/tecnico",
    Component: TechPanel,
  },
]);
