import type { ChucDanh, CreateChucDanh } from "../types/ChucDanh";
import axiosClient from "../utils/AxiosClient";

export const getChucDanhList = () =>
    axiosClient.get("/chuc-danh");

 export const createChucDanh = (payload: CreateChucDanh) =>
    axiosClient.post("/chuc-danh", payload);
export const updateChucDanh = (id: number, payload: ChucDanh) =>
    axiosClient.put(`/chuc-danh/${id}`, payload);
export const deleteChucDanh = (id: number) =>
    axiosClient.patch(`/chuc-danh/${id}`);
 