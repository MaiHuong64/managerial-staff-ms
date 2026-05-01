export interface CreatePlanningBatchDTO {
    tenQuyHoach: string;
    loaiQuyHoach: 1 | 2; //1: đầu nhiệm kỳ, 2: rà soát hằng năm
    namThucHien: number;
    nhiemKy?: string;
    soQdPheDuyet?: string;
    ngayQdPheDuyet?: Date;
    dotGocId?: number; 
}
export interface ChucDanhItem {
    vienChucId: number[];
    chucDanhId: number;
}
export interface AddPlanningBatchDetailDTO {
    dotQuyHoachId: number;
    vienChucId:number [];
    chucDanhId: number;
    donViId: number;
    ngayVaoQh?: Date;
}

export interface PlanningBatch {
    id: number;
    maQuyHoach: string;
    tenQuyHoach: string;
    trangThai: number; //0: Đang xử lý, 1: Hoàn thành bỏ phiếu (chờ phê duyệt), 2: Đã phê duyệt
}

export interface ApprovalDecisionDTO {
    soQdPheDuyet: string;
    ngayQdPheDuyet: Date;
    // trangThai: number;
}
export interface AddNewCandidate {
    dotQuyHoachId: number;
    vienChucId: number;
    chucDanhId: number;
    donViId: number;
    ngayVaoQH: Date;
    // loaiNguon: number; // 1: ứng viên mới, 2: copy từ đợt gốc
}