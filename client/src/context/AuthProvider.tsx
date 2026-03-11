import React, { useState,  } from "react";
import type { AuthUser } from "../types/auth";
import type { ReactNode } from "react";
import { AuthContext } from "./AuthContext";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);

    //Lưu trữ token 
    const [token, setToken] = useState<string | null>(
        localStorage.getItem("token")
    );

    const login = (userData: AuthUser, token: string) =>{
        setUser(userData);
        setToken(token);
        //restore token when page reload
        localStorage.setItem("token", token);
    };

    const logout = () =>{
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        // window.location.href = '/login';
    }
    return(
       <AuthContext.Provider value={{ user, token, login, logout }}>
            {children} 
        </AuthContext.Provider>
    );
};