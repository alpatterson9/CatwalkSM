/**
 * This component creates and manages access tokens for the sake of persistence.
 * Users, after logging in, are given an access token and a refresh token.
 * The access token expires quickly and is stored in memory while the refresh
 * token is stored in a cookie. If the access token expires, a new refresh
 * token will be minted and issues. If the refresh token expires, the user must
 * log in again.
 */
import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userID, setUserID] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [isLoggedIn, setLoggedInStatus] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Handles user login requests
     * @param {*} data json object containing username and access token
     */
    const login = (data) => {
        //TODO fix this to be either username, or id universally
        setUser(data.user);
        setUserID(data.userID);
        setAccessToken(data.accessToken);
        setLoggedInStatus(true);
    };

    /**
     * Logs user out, removing access tokens
     * @param {*} data json request object (might not be necessary)
     */
    const logout = async () => {
        setUser(null);
        setUserID(null);
        setLoggedInStatus(false);
        setAccessToken(null);

        try { await signOut(auth); } catch {}

        fetch("http://localhost:3000/logout", {
            method: "POST",
            credentials: "include",
        });
    };

    /**
     * checks validity of access token, redirects to refresh if invalid
     */
    const checkAccessToken = async () => {
        try {
            const fbUser = auth.currentUser;
            if (!fbUser) {
            setLoggedInStatus(false);
            return;
            }

            const token = await fbUser.getIdToken(); // not forced
            setAccessToken(token);

            const res = await fetch("http://localhost:3000/users/me", {
            headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Auth failed");

            setUser(data.user);
            setUserID(data.userID);
            setLoggedInStatus(true);
        } catch (err) {
            console.error("checkAccessToken failed:", err);
            setLoggedInStatus(false);
        }

        /* await fetch("http://localhost:3000/users/me", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }).then(async (res) => {
            const data = await res.json(); 
            if (!res.ok)
            {
                const error = new Error(data.error);
                throw error;
            }
            return data;
        })
        .then((data) => {
            console.log("Valid token, assigning user: ", data.user);
            setUser(data.user);
            setUserID(data.userID);
            setLoggedInStatus(true);
        })
        .catch((err) => {
            console.error("Invalid or Expired token, refreshing token.", err);
            refreshTokens();
        }); */
        
    };

    /**
     * Checks validity of refresh token, gives new access token if necessary
     * @returns 
     */
    const refreshTokens = async () => {
        const fbUser = auth.currentUser;
        if (!fbUser) throw new Error("No Firebase user");

        const token = await fbUser.getIdToken(true); // force refresh
        setAccessToken(token);
        return token;

        /* try {
            const res = await fetch("http://localhost:3000/users/refresh", {
                method: "POST",
                credentials: "include",
            });
            if (!res.ok) {
                console.log("Force Logout here.");
                logout(); //force logout, bad credentials
                return;
            };
            const data = await res.json();
            
            setAccessToken(data.accessToken);
            setUser(data.user);
            setUserID(data.userID);
            setLoggedInStatus(true);
        } catch (e){
            console.error("Token refresh failed", e)
            logout();
        } */
    }

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (fbUser) => {
            if (!fbUser) {
            setUser(null);
            setUserID(null);
            setAccessToken(null);
            setLoggedInStatus(false);
            setIsLoading(false);
            return;
            }

            try {
            const token = await fbUser.getIdToken();
            setAccessToken(token);

            // trying to keep the same routes we had before (/me in this case)
            const res = await fetch("http://localhost:3000/users/me", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Auth failed");

            setUser(data.user);
            setUserID(data.userID);
            setLoggedInStatus(true);
            } catch (e) {
            console.error("Firebase auth state -> backend sync failed", e);
            
            setLoggedInStatus(false);
            setAccessToken(null);
            }
            setIsLoading(false);
        });

    return () => unsub();
    }, []);

    //useEffect(() => {
    //    checkAccessToken();
    //}, []);

    return (
        <AuthContext.Provider value={{ userID, user, accessToken, login, logout,
         refreshTokens, checkAccessToken, isLoggedIn, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);