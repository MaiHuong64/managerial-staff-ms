export enum BuocHoiNghiQH {
    HoiNghiLanhDao = 2,
    HoiNghiCBChuChot = 3,
    HoiNghiLanhDaoMoRong = 4,
    HoiNghiLanhDaoLan2 = 5,
    HoanThanh = 6
}
export interface PhieuBauQH {
    chiTietQHId: number;
    soPhieuDongY: number;
    soPhieuKhongDongY: number;
}
export enum KetQuaPhieuBauQH {
    KhongDat = 0,
    Dat = 1
}
export interface KetQuaHoiNghiQH {
    dotQHId: number;
    buocHoiNghi: BuocHoiNghiQH;
    soNguoiTrieuTap: number;
    soNguoiCoMat: number;
    soPhieuPhatRa: number;
    soPhieuThuVe: number;
    soPhieuHopLe: number;
    ketQuaUngVien: PhieuBauQH[]
}
