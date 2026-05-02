import type { CreateDonVi, DonVi } from "../types/DonVi";
import axiosClient from "../utils/AxiosClient";

export const getDonViList = () =>
    axiosClient.get("/don-vi");

export const getDonViById = (id: number) =>
    axiosClient.get(`/don-vi/${id}`);
 export const createDonVi = (payload: CreateDonVi) =>
    axiosClient.post("/don-vi", payload);
export const updateDonVi = (id: number, payload: DonVi) =>
    axiosClient.put(`/don-vi/${id}`, payload);
export const deleteDonVi = (id: number) =>
    axiosClient.delete(`/don-vi/${id}`);