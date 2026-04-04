import axiosClient from "../utils/AxiosClient";

export const getDotQuyHoachList = () =>
    axiosClient.get("/quy-hoach");

export const getDotQuyHoachDetailById = (id: number) =>
    axiosClient.get(`/quy-hoach/${id}`);

export const createDotQuyHoach = (data: unknown) =>
    axiosClient.post("/quy-hoach", data);

export const addCandidates = (id: number, data: unknown) =>
    axiosClient.post(`/quy-hoach/${id}/chi-tiet`, data);

export const getPlanningCandidates = (chucDanhId: number) =>
    axiosClient.get(`/quy-hoach/candidates/${chucDanhId}`);

export const filterPlanningCandidates = (donViId: number, trinhDoChuyenMon: string, dotQuyHoachId: number) =>
    axiosClient.get("/quy-hoach/filter", { params: { don_vi_id: donViId, trinh_do_chuyen_mon: trinhDoChuyenMon, dot_quy_hoach_id: dotQuyHoachId } });
