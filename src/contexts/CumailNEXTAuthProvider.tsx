import React, {useContext, useRef, useState} from "react";
import axios from "axios";
import {CumailNEXTAuthContextType, CumailNEXTUserSession} from "./CumailNEXTAuthContextType.ts";
import Cookies from 'js-cookie';

const CumailNEXTAuthContext = React.createContext<CumailNEXTAuthContextType | null>(null);

const AUTH_URL = process.env.REACT_APP_CUMAIL_AUTH_BASE_URL as string;
const AUTH_COOKIE_NAME = process.env.REACT_APP_CUMAIL_AUTH_COOKIE_NAME as string;
const SIGNUP_SUB_URL = process.env.REACT_APP_CUMAIL_SIGNUP_SUB_URL as string;
const LOGIN_SUB_URL = process.env.REACT_APP_CUMAIL_LOGIN_SUB_URL as string;

const authPOST = (subUrl: string, pack: { username?: string, password: string }) => {
    return axios.post(AUTH_URL + subUrl, pack, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    })
}

const authTokenHandler = async (subUrl: string, pack: { username?: string, password: string }): Promise<{ idToken: string, error: string }> => {
    try {
        const response = await authPOST(subUrl, pack);
        if (typeof response == "undefined") return {
            idToken: "",
            error: "response type undefined"
        };
        else if (response.status === 0) return {
            idToken: "",
            error: "network error"
        };
        else if (response.status !== 200) return {
            idToken: "",
            error: `HTTP ${response.status}: ${response.data}`
        }
        const { idToken } = response.data;
        return {
            idToken: idToken,
            error: ""
        }
    } catch (exception){
        console.error(exception);
    }
    return {
        idToken: "",
        error: "unknown"
    };
}

const signupWithEmailInternal = (email: string, password: string) => {
    return authTokenHandler(SIGNUP_SUB_URL, {
       username: email,
       password: password,
    });
}

const loginWithEmailInternal = (email: string, password: string) => {
    return authTokenHandler(LOGIN_SUB_URL, {
        username: email,
        password: password,
    });
}

const fetchUserProfileOLD = async (authorization: { idToken: string }): Promise<{ userName: string, userUUID: string }> => {
    try {
        const response = await axios.get(AUTH_URL + 'fetch_profile', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authorization.idToken
            }
        });
        if (response.status !== 200) return {
            "userName": "",
            "userUUID": "",
        }
        // console.log("Profile:", response.data)
        return response.data;
    } catch (exception){
        console.error(exception);
        return {
            "userName": "",
            "userUUID": "",
        }
    }
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCumailNEXTAuth = () => {
    return useContext(CumailNEXTAuthContext)
}

export const CumailNEXTAuthProvider: React.FC<{ children: JSX.Element }> = ({ children }) => {
    const userSession = useRef<CumailNEXTUserSession>({
        idToken: "",
        username: "",
        userId: "",
    })
    const [isLoading, setLoading] = useState(false);
    const [lastError, setLastError] = useState("");

    // useEffect(() => {
    //     console.log("useEffect called")
    //     loadUserSessionFromCookie();
    // }, []);

    function loadUserSessionFromCookie(){
        const sessionCookieRaw: string | undefined = Cookies.get(AUTH_COOKIE_NAME);
        if (sessionCookieRaw){
            const sessionCookie: CumailNEXTUserSession = JSON.parse(sessionCookieRaw);
            if (Object.keys(sessionCookie).length === 0) return false;
            // console.log("Loaded:", sessionCookie);
            changeUserNonVolatile(sessionCookie);
            return true;
        }
        return false;
    }

    function changeUserNonVolatile(session: CumailNEXTUserSession){
        // setCurrentUser((_oldSession) => session);
        userSession.current = session;
    }
    function getSession() {
        return userSession.current;
    }

    function changeUser(session: CumailNEXTUserSession){
        if (session.idToken === "" || session.userId === ""){
            console.log("Removing auth session cookie...")
            Cookies.remove(AUTH_COOKIE_NAME);
        } else {
            console.log("Saving auth session cookie...")
            Cookies.set(AUTH_COOKIE_NAME, JSON.stringify(session), {
                path: '/',
                secure: true,
                sameSite: 'Strict'
            })
        }
        changeUserNonVolatile(session);
    }

    async function functionAuthActionHandler(callback: (email: string, password: string) => Promise<{ idToken: string, error: string }>, email: string, password: string) {
        // if (isLoading) throw new Error("Authorization in progress");
        setLoading(true);
        const { idToken, error } = await callback(email, password);
        setLastError(error);
        if (error !== "") {
            changeUser({
                idToken: "",
                username: "",
                userId: "",
            });
            setLoading(false);
            return;
        }
        // TODO: clean up
        // Legacy endpoint
        // Shouldn't break anything, but I'm to lazy to refactor
        const profile = await fetchUserProfileOLD({
            idToken: idToken
        })
        changeUser({
            idToken: idToken,
            username: profile.userName,
            userId: profile.userUUID,
        });
        setLoading(false);
    }
    async function signUpWithEmailPassword(email: string, password: string){
        await functionAuthActionHandler(signupWithEmailInternal, email, password);
    }
    async function loginWithEmailPassword(email: string, password: string){
        await functionAuthActionHandler(loginWithEmailInternal, email, password);
    }
    function logout() {
        changeUser({
            idToken: "",
            userId: "",
            username: ""
        })
        window.location.reload();
    }

    function isLoggedIn() {
        loadUserSessionFromCookie();
        return getSession().idToken !== "" && getSession().userId !== "";
    }

    const value: CumailNEXTAuthContextType = {
        userSession: userSession,
        isLoading: isLoading,
        lastError: lastError,
        signUpWithEmailPassword: signUpWithEmailPassword,
        loginWithEmailPassword: loginWithEmailPassword,
        logout: logout,
        isLoggedIn: isLoggedIn,
        getSession: getSession,
    }
    return (<CumailNEXTAuthContext.Provider value={value}>
        {/*{ !isLoading && children }*/}
        { children }
    </CumailNEXTAuthContext.Provider>)
}
