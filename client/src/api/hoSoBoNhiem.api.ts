import axiosClient from "../utils/AxiosClient";

export const getHoSoByPhuongAn = (paId: number) =>
    axiosClient.get(`/ho-so-bo-nhiem/phuong-an/${paId}`);

export const getHoSoByPhieuChuTruong = (phieuId: number) =>
    axiosClient.get(`/ho-so-bo-nhiem/phieu-chu-truong/${phieuId}`);

export const getHoSoById = (id: number) =>
    axiosClient.get(`/ho-so-bo-nhiem/${id}`);

export const createHoSo = (data: { chiTietPAId?: number; phieuChuTruongId?: number; ghiChu?: string }) =>
    axiosClient.post(`/ho-so-bo-nhiem`, data);

export const uploadTaiLieu = (hoSoId: number, formData: FormData) =>
    axiosClient.post(`/ho-so-bo-nhiem/${hoSoId}/tai-lieu`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

export const deleteTaiLieu = (hoSoId: number, taiLieuId: number) =>
    axiosClient.delete(`/ho-so-bo-nhiem/${hoSoId}/tai-lieu/${taiLieuId}`);

export const hoanThienHoSo = (id: number) =>
    axiosClient.patch(`/ho-so-bo-nhiem/${id}/hoan-thanh`);