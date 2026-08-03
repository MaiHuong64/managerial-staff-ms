import axiosClient from "../utils/AxiosClient";
export const getPhieuChuTruongList = () =>
    axiosClient.get("/phieu-chu-truong");
export const getPhieuChuTruongByDonViId = (donViId: number) =>
    axiosClient.get(`/phieu-chu-truong/don-vi/${donViId}`);
export const getPhieuChuTruongFollowingAppointment = () =>
    axiosClient.get("/phieu-chu-truong/following-appointment");
export const getPhieuChuTruongById = (id: number) =>
    axiosClient.get(`/phieu-chu-truong/${id}`);
export const createPhieuChuTruong = (data: unknown) =>
    axiosClient.post("/phieu-chu-truong", data);

export const approvePhieuChuTruong = (id: number) =>
    axiosClient.post(`/phieu-chu-truong/${id}/approve`);
export const rejectPhieuChuTruong = (id: number, lyDoTuChoi: string) =>
    axiosClient.post(`/phieu-chu-truong/${id}/reject`, { lyDoTuChoi });
 