import React from "react";

export type CumailNEXTUserSession = { idToken: string, username: string, userId: string };

export type CumailNEXTAuthContextType = {
    userSession: React.MutableRefObject<CumailNEXTUserSession>,
    isLoading: boolean,
    lastError: string,
    signUpWithEmailPassword: (email: string, password: string) => Promise<void>,
    loginWithEmailPassword: (email: string, password: string) => Promise<void>,
    logout: () => void,
    isLoggedIn: () => boolean,
    getSession: () => CumailNEXTUserSession
}
