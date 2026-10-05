import { createBrowserRouter } from "react-router-dom";
import { routesConfig } from "./routes";
import MainLayout from "../../layout/MainLayout";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: routesConfig
    }
])