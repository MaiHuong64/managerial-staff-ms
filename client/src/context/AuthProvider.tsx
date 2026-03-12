import React, {useState,  } from "react";
import type { AuthUser } from "../types/auth";
import type { ReactNode } from "react";
import { AuthContext } from "./AuthContext";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(() =>
    {
        const saveUser = localStorage.getItem("user");
        return saveUser? JSON.parse(saveUser): null;
    });

    //Lưu trữ token 
    const [token, setToken] = useState<string | null>(
        localStorage.getItem("token")
    );

    const login = (userData: AuthUser, token: string) =>{
        setUser(userData);
        setToken(token);
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
    };
    const logout = () =>{
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user")
        // window.location.href = '/login';
    }
    return(
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};