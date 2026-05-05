import axiosClient from "../utils/AxiosClient";

export const getTaiKhoanByVienChucId = (vienChucId: number) => {
    return axiosClient.get(`/tai-khoan/vien-chuc/${vienChucId}`);
};
export const updateVaiTro = (taiKhoanId: number, vaiTro: string) => {
    return axiosClient.patch(`/tai-khoan/${taiKhoanId}/vai-tro`, { vaiTro });
};
export const getTaiKhoanList = () => {return axiosClient.get('/tai-khoan');}
export const updateTrangThai = (taiKhoanId: number, trangThai: number) => {
    return axiosClient.patch (`/tai-khoan/${taiKhoanId}/trang-thai`, {trangThai});
}
export const doiMatKhau = (id: number, matKhauCu: string, matKhauMoi: string) =>
    axiosClient.patch(`/tai-khoan/${id}/mat-khau`, { matKhauCu, matKhauMoi });
 