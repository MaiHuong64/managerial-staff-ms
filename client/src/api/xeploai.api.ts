import type { CreateXepLoaiDTO, XepLoaiDV, XepLoaiVC, CheckDieuKienQH } from "../types/XepLoai";
import axiosClient from "../utils/AxiosClient";

export const getAllXepLoaiVC = () => axiosClient.get<{ data: XepLoaiVC[] }>("/xep-loai/vien-chuc");
export const getXepLoaiVCByVienChucId = (vienChucId: number) =>
    axiosClient.get<{ data: XepLoaiVC[] }>(`/xep-loai/vien-chuc/${vienChucId}`);
export const createXepLoaiVC = (data: CreateXepLoaiDTO) =>
    axiosClient.post<{ data: XepLoaiVC }>("/xep-loai/vien-chuc", data);
export const updateXepLoaiVC = (id: number, data: Partial<CreateXepLoaiDTO>) =>
    axiosClient.put<{ data: XepLoaiVC }>(`/xep-loai/vien-chuc/${id}`, data);
export const deleteXepLoaiVC = (id: number) =>
    axiosClient.delete(`/xep-loai/vien-chuc/${id}`);


export const getAllXepLoaiDangVien = () =>
    axiosClient.get<{ data: XepLoaiDV[] }>("/xep-loai/dang-vien");
export const getXepLoaiDangVienByVienChucId = (vienChucId: number) =>
    axiosClient.get<{ data: XepLoaiDV[] }>(`/xep-loai/dang-vien/${vienChucId}`);
export const createXepLoaiDangVien = (data: CreateXepLoaiDTO) =>
    axiosClient.post<{ data: XepLoaiDV }>("/xep-loai/dang-vien", data);
export const updateXepLoaiDangVien = (id: number, data: Partial<CreateXepLoaiDTO>) =>
    axiosClient.put<{ data: XepLoaiDV }>(`/xep-loai/dang-vien/${id}`, data);
export const deleteXepLoaiDangVien = (id: number) =>
    axiosClient.delete(`/xep-loai/dang-vien/${id}`);

export const checkDieuKienQuyHoach = (vienChucId: number) =>
    axiosClient.get<{ data: CheckDieuKienQH }>(`/xep-loai/check-dieu-kien/${vienChucId}`);