import axiosClient from "../utils/AxiosClient";

export const getBGHDashboard = () =>
    axiosClient.get('/dashboard/bgh');

export const getPTCCTDashboard = () =>
    axiosClient.get('/dashboard/ptcct');
