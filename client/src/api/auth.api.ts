import axiosClient from "../utils/AxiosClient";

export const login = (tenDangNhap: string, matKhau: string) =>
    axiosClient.post("/auth/login", { 
        ten_dang_nhap: tenDangNhap, 
        mat_khau: matKhau  });

export const logout = () =>
    axiosClient.post("/auth/logout");
