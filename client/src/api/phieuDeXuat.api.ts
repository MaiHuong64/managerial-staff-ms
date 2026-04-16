import axiosClient from "../utils/AxiosClient";

export const getAllPhieuDeXuatNhanSu = () =>
    axiosClient.get("/phieu-de-xuat");

export const getPhieuDeXuatNhanSuById = (id: number) =>
    axiosClient.get(`/phieu-de-xuat/${id}`);

export const createPhieuDeXuatNhanSu = (data: unknown) =>
    axiosClient.post("/phieu-de-xuat", data);

export const guiPhieuDeXuatNhanSu = (id: number) =>
    axiosClient.patch(`/phieu-de-xuat/${id}/submit`);

export const approvePhieuDeXuatNhanSu = (id: number, dotQuyHoachId: number) =>
    axiosClient.post(`/phieu-de-xuat/${id}/approve`, { trangThai: 1, dotQuyHoachId });

export const rejectPhieuDeXuatNhanSu = (id: number, ghiChu?: string) =>
    axiosClient.post(`/phieu-de-xuat/${id}/reject`, { trangThai: 2, ghiChu });
