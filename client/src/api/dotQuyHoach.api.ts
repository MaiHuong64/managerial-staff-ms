import axiosClient from "../utils/AxiosClient";

export const getDotQuyHoachList = () =>
    axiosClient.get("/quy-hoach");

export const getRoot = () =>
    axiosClient.get("/quy-hoach/root");
export const getDotQuyHoachDetailById = (id: number) =>
    axiosClient.get(`/quy-hoach/${id}`);

export const createDotQuyHoach = (data: unknown) =>
    axiosClient.post("/quy-hoach", data);

export const addCandidates = (id: number, data: unknown) =>
    axiosClient.post(`/quy-hoach/${id}/chi-tiet`, data);

export const getPlanningCandidates = (chucDanhId: number) =>
    axiosClient.get(`/quy-hoach/candidates/${chucDanhId}`);

export const submitVoteQuyHoach = (data: unknown) =>
    axiosClient.post("/quy-hoach/submit", data);

export const approveQuyHoach = (dotQuyHoachId: number, data: { soQdPheDuyet: string; ngayQdPheDuyet: Date }) =>
    axiosClient.patch(`/quy-hoach/${dotQuyHoachId}/phe-duyet`, data);

export const filterCandidatesHandler = (donViId: number, dotQuyHoachId: number) => {
    return axiosClient.get(`/quy-hoach/filter/`, {params: {donViId, dotQuyHoachId}});
}
export const addNewCandidate170 = (id: number, data: unknown) => 
    axiosClient.post(`/quy-hoach/${id}/chi-tiet/170`, data)