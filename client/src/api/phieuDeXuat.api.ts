import axiosClient from "../utils/AxiosClient";
export const getAllPhieuDeXuatNhanSu = () =>
    axiosClient.get("/phieu-de-xuat");
export const gePhieuDeXuatNhanSutById = (id: number) =>
    axiosClient.get(`/phieu-de-xuat/${id}`);
export const createPhieuDeXuatNhanSu = (data: unknown) =>
    axiosClient.post("/phieu-de-xuat", data);

export const approvePhieuDeXuatNhanSu = (id: number) =>
    axiosClient.post(`/phieu-de-xuat/${id}/approve`);
export const rejectPhieuDeXuatNhanSu = (id: number, lyDoTuChoi: string) =>
    axiosClient.post(`/phieu-de-xuat/${id}/reject`, { lyDoTuChoi });
