import axiosClient from "../utils/AxiosClient";

export const getVienChucList = () =>
    axiosClient.get("/vien-chuc");

export const getVienChucById = (id: number) =>
    axiosClient.get(`/vien-chuc/${id}`);

export const getProfile = () =>
    axiosClient.get("/vien-chuc/profile");

export const createVienChuc = (data: unknown) =>
    axiosClient.post("/vien-chuc", data);

export const updateVienChuc = (id: number, data: unknown) =>
    axiosClient.put(`/vien-chuc/${id}`, data);

export const deleteVienChuc = (id: number) =>
    axiosClient.delete(`/vien-chuc/${id}`); 
 