import axiosClient from "../utils/AxiosClient";


export const createQDBoNhiem = (hoSoId: number, data: unknown) => 
    axiosClient.post(`/quyet-dinh-bo-nhiem/ho-so-bo-nhiem/${hoSoId}/quyet-dinh`, data);
export const getChiTietBoNhiem = (id: number) =>
    axiosClient.get(`quyet-dinh-bo-nhiem/${id}`)