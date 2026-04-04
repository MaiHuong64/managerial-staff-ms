import axiosClient from "../utils/AxiosClient";

export const getDonViList = () =>
    axiosClient.get("/don-vi");

export const getDonViById = (id: number) =>
    axiosClient.get(`/don-vi/${id}`);
 