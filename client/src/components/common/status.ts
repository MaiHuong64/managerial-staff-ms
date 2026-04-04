export const BUOC_HIEN_TAI_MAP: Record<number, { label: string; color: string }> = {
    0: { label: "Không đạt", color: "error" },
    2: { label: "Hội nghị lãnh đạo (vòng 1)", color: "processing" },
    3: { label: "Hội nghị lãnh đạo (vòng 2)", color: "processing" },
    4: { label: "Hội nghị cán bộ chủ chốt", color: "warning" },
    5: { label: "Hội nghị lãnh đạo (vòng cuối)", color: "processing" },
    6: { label: "Hoàn thành", color: "success" },
};

export const PCT_STATUS_MAP: Record<number, { label: string; color: string }> = {
    0: { label: "Chờ duyệt", color: "default" },
    1: { label: "Đã duyệt", color: "success" },
    2: { label: "Từ chối", color: "error" },
};

export const PHUONG_AN_STATUS_MAP: Record<number, { label: string; color: string }> = {
    0: { label: "Chờ trình", color: "default" },
    1: { label: "Đã trình", color: "processing" },
    2: { label: "Đã duyệt", color: "success" },
    3: { label: "Từ chối", color: "error" },
};
