import ChatHub from "./components/ChatHub.tsx";
import { Login } from "./components/Login.tsx";
import {Signup} from "./components/Signup.tsx";
import BoardManagement from "./components/BoardManagement.tsx";
import FourOFour from "./components/FourOFour.tsx";
import ClickJackingWarning from "./components/ClickJackingWarning.tsx";
// import ClickJackingWarning from "./components/ClickJackingWarning.tsx";

export type RouteInfo = { index?: boolean, isPrivate: boolean, path?: string, element: JSX.Element };

export const AppRoutes : RouteInfo[] = [
    {
        index: true,
        isPrivate: true,
        element: <ChatHub />,
    },
    {
        path: '/login',
        isPrivate: false,
        element: <Login />
    },
    {
        path: '/signup',
        isPrivate: false,
        element: <Signup />
    },
    // For debugging purpose
    {
        path: '/clickjacking',
        isPrivate: false,
        element: <ClickJackingWarning />
    },
    {
        path: '*',
        isPrivate: false,
        element: <FourOFour />
    },
    {
        path: '/boards',
        isPrivate: true,
        element: <BoardManagement />
    },
];
