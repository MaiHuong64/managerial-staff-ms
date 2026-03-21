export const TRANG_THAI_DOT_BO_NHIEM = {
    DUNG:        0,  // Đã dừng (không ai đạt)
    SOAN_THAO:   1,  // Đang soạn thảo
    VONG_1:      2,  // Hội nghị lãnh đạo vòng 1 - Thảo luận, ghi biên bản (không phiếu)
    VONG_2:      3,  // Hội nghị lãnh đạo vòng 2 - Lấy phiếu giới thiệu
    CBCC:        4,  // Hội nghị cán bộ chủ chốt - Lấy ý kiến tín nhiệm
    VONG_CUOI:   5,  // Hội nghị lãnh đạo vòng cuối - Biểu quyết
    HOAN_THANH:  6,  // Hoàn thành
} as const;

export const TRANG_THAI_UNG_VIEN = {
    DA_LOAI:    0,  // Đã loại
    HOP_LE:     1,  // Hợp lệ, đang trong quy trình
    KHONG_DAT:  2,  // Không đạt sau vòng cuối
    DAT:        3,  // Đạt sau vòng cuối
} as const;

export const TRANG_THAI_PHUONG_AN = {
    DA_HUY:    0,  // Đã hủy
    CHO_DUYET: 1,  // Chờ BGH phê duyệt
    DA_DUYET:  2,  // BGH đã phê duyệt
} as const;

export const LOAI_PHUONG_AN = {
    BO_NHIEM:        "Bổ nhiệm",
    BO_NHIEM_LAI:    "Bổ nhiệm lại",
    THOI_CHUC_VU:    "Thôi chức vụ",
    THOI_KIEM_NHIEM: "Thôi kiêm nhiệm",
} as const;

export const KET_QUA_PHIEU = {
    KHONG_DAT: 0,
    DAT:       1,
} as const;

export const TRANG_THAI_PHIEU_CT = {
    CHO_DUYET: 0,
    DA_DUYET:  1,
    TU_CHOI:   2,
} as const;

export const VAI_TRO = {
    PTCCT: "PTCCT",
    BGH:   "BGH",
    VCQL:  "VCQL",
    VC:    "VC",
} as const;

export const TRANG_THAI_TAI_KHOAN = {
    VO_HIEU:   0,
    HOAT_DONG: 1,
} as const;

export const LOAI_QUY_HOACH = {
    DAU_NHIEM_KY:     1,
    RA_SOAT_HANG_NAM: 2,
} as const;

export const TRANG_THAI_QUY_HOACH = {
    DA_LOAI:     0,
    TRONG_QH:    1,
    DA_BO_NHIEM: 2,
} as const;