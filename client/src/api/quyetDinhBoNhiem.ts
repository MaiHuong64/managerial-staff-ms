import axios from "axios";

export const createQDBoNhiem = (hoSoId: number, data: unknown) => 
    axios.post(`quyet-dinh-bo-nhiem/ho-so-bo-nhiem/${hoSoId}/quyet-dinh`, data);
export const getChiTietBoNhiem = (id: number) =>
    axios.get(`quyet-dinh-bo-nhiem/${id}`)