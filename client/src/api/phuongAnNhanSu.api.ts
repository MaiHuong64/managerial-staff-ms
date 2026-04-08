import axiosClient from "../utils/AxiosClient";

export const getPhuongAnList = () =>
    axiosClient.get("/phuong-an-nhan-su");

export const getPhuongAnById = (id: number) =>
    axiosClient.get(`/phuong-an-nhan-su/${id}`);

export const createPhuongAn = (data: unknown) =>
    axiosClient.post("/phuong-an-nhan-su", data);
 
export const approvePhuongAn = (id: number, yKienBGH?: string) =>
    axiosClient.patch(`/phuong-an-nhan-su/${id}/duyet`, { yKienBGH });

export const rejectPhuongAn = (id: number, yKienBGH?: string) =>
    axiosClient.patch(`/phuong-an-nhan-su/${id}/tu-choi`, { yKienBGH });
