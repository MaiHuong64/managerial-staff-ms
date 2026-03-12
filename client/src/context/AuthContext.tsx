// import {createContext, useContext } from "react";
import { createContext } from "react";
import type {AuthContextType,  } from "../types/auth";

// tạo context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
