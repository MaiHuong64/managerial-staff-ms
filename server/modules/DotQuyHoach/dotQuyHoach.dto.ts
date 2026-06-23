export interface CreateDotQuyHoachDTO {
    tenQuyHoach: string;
    loaiQuyHoach: 1 | 2; //1: đầu nhiệm kỳ, 2: rà soát hằng năm
    namThucHien: number;
    nhiemKy?: string;
    soQdPheDuyet?: string;
    ngayQdPheDuyet?: Date;
    dotGocId?: number; 
}
export interface ChucDanhDTO {
    vienChucId: number[];
    chucDanhId: number;
}
export interface ChiTietDotQuyHoachDTO {
    dotQuyHoachId: number;
    vienChucId:number [];
    chucDanhId: number;
    donViId: number;
    ngayVaoQh?: Date;
}

export interface DotQuyHoachDTO {
    id: number;
    maQuyHoach: string;
    tenQuyHoach: string;
    trangThai: number; //0: Đang xử lý, 1: Hoàn thành bỏ phiếu (chờ phê duyệt), 2: Đã phê duyệt
}

export interface ApproveDotQuyHoachDTO {
    soQdPheDuyet: string;
    ngayQdPheDuyet: Date;
    // trangThai: number;
}
export interface CreateUngVienDTO {
    dotQuyHoachId: number;
    vienChucId: number;
    chucDanhId: number;
    donViId: number;
    ngayVaoQH: Date;
    // loaiNguon: number; // 1: ứng viên mới, 2: copy từ đợt gốc
}
export interface ThongTinDotQH {
    tenQuyHoach: string;
}
