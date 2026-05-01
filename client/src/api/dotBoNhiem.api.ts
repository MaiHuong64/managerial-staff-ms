import axiosClient from "../utils/AxiosClient";

export const getDotBoNhiemList = () =>
    axiosClient.get("/bo-nhiem");

export const getDotBoNhiemById = (id: number) =>
    axiosClient.get(`/bo-nhiem/${id}`);

export const createDotBoNhiem = (data: unknown) =>
    axiosClient.post("/bo-nhiem", data);

export const submitVote = (data: unknown) =>
    axiosClient.post("/bo-nhiem/submit", data);

export const getCandidatesByChiTietDot = (chiTietDotId: number) => 
    axiosClient.get(`/bo-nhiem/detail/${chiTietDotId}/candidates`);

export const addCandidateToChiTietDot = (chiTietDotId: number, data: unknown) =>
    axiosClient.post(`/bo-nhiem/detail/${chiTietDotId}/candidates`, data);

export const startVotingProcess = (id: number) =>
    axiosClient.post(`/bo-nhiem/${id}/start-voting`);

export const resolveVoteTie = (chiTietDotId: number, chiTietBnId: number, tieCandidates: number[]) =>
    axiosClient.post(`/bo-nhiem/detail/${chiTietDotId}/candidates/resolve-tie`, { 
        chiTietBnId,    // người thắng
        tieCandidates   // danh sách hòa
    });