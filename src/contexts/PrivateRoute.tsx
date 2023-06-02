import React from "react";
import { Navigate  } from "react-router-dom";
import {useCumailNEXTAuth} from "./CumailNEXTAuthProvider.tsx";
import {CumailNEXTAuthContextType} from "./CumailNEXTAuthContextType.ts";

const LOGIN_SUB_URL = process.env.REACT_APP_CUMAIL_LOGIN_SUB_URL as string;

const PrivateRoute: React.FC<{children: JSX.Element}> = ({ children }) => {
    const { isLoggedIn } = useCumailNEXTAuth() as CumailNEXTAuthContextType;
    return isLoggedIn() ? children : <Navigate to={`/${LOGIN_SUB_URL}`} />
}

export default PrivateRoute;
