import axiosClient from "../utils/AxiosClient";

export const login = (tenDangNhap: string, matKhau: string) =>
    axiosClient.post("/auth/login", { 
        tenDangNhap: tenDangNhap, 
        matKhau: matKhau  });

export const logout = () =>
    axiosClient.post("/auth/logout");
