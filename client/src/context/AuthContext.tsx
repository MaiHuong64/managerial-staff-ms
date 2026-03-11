import {createContext, useContext } from "react";
import type {AuthContextType,  } from "../types/auth";

// tạo context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("Lỗi: Bạn chưa bọc AuthProvider ở ngoài App!");
    
    return context; 
};