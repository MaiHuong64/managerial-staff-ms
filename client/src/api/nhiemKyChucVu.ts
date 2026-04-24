import axiosClient from "../utils/AxiosClient";

export const getNhiemKyByStaffId = (vienChucId: number) =>
    axiosClient.get(`/vien-chuc/${vienChucId}/nhiem-ky`);
