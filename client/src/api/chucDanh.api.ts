import axiosClient from "../utils/AxiosClient";

export const getChucDanhList = () =>
    axiosClient.get("/chuc-danh");
 