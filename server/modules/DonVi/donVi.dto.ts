export interface DonViDTO {
    id: number;
    maDonVi: string;
    tenDonVi: string;
    loaiDonVi: string;
    donViCha?: number;
    diaChi?: string;
    soDienThoai?: string;
    email?: string;
    trangThai: number;
    ngayThanhLap?: string;
    tenTruongDonVi?: string;
    tenPhoDonVi?: string;
}
export interface CreateDonViDTO {
    tenDonVi: string;
    loaiDonVi: string;
    donViCha?: number;
    soDienThoai?: string;
    email?: string;
    diaChi?: string;
}