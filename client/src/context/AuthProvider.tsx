import React, {useEffect, useState,  } from "react";
import type { AuthUser } from "../types/auth";
import type { ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { connectSocket, disconnectSocket, socket } from "../socket/socket";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(() => {
    try {
        const saveUser = localStorage.getItem("user");
        return saveUser ? JSON.parse(saveUser) : null;
    } catch {
        // localStorage.removeItem("user"); // ← xóa data lỗi
        return null;
    }
});

    //Lưu trữ token 
    const [token, setToken] = useState<string | null>(
        localStorage.getItem("token")
    );

    useEffect(() => {
        if(!token) return;
        connectSocket(token);
        return () => {
            socket.off("thong-bao");
            disconnectSocket();
        }
    }, [token]);

    const login = (userData: AuthUser, token: string) =>{
        setUser(userData);
        setToken(token);
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        connectSocket(token);
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