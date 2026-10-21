import axiosClient from "../utils/AxiosClient";

export const getThongBaoList = () => 
    axiosClient.get("/thong-bao");

export const getMyUnreadCount = () => 
    axiosClient.get("/thong-bao/unread-count");

export const readAll = () => 
    axiosClient.patch("/thong-bao/read-all");

export const readOne = (id: number) => 
    axiosClient.patch(`/thong-bao/${id}/read`);