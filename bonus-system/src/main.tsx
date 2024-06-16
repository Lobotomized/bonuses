import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import "./index.css";
import LoginForm from "./Login";
import RegisterForm from "./Register";
import BonusShop from "./BonusShop";
import StateMachine from "./StateMachine";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginForm></LoginForm>
  },
  {
    path: "/signup",
    element: <RegisterForm></RegisterForm>
  },
  {
    path: "/BonusShop",
    element: <BonusShop></BonusShop>
  },
  {
    path: "/",
    element: <StateMachine></StateMachine>
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);