import type { ThongBao } from "../types/ThongBao";

export const routes: Record<string, (id: number) => string> = {
    dot_quy_hoach: (id: number) => `/dot-quy-hoach/${id}`,
    phieu_de_xuat_nhan_su_quy_hoach: (id) => `/phieu-de-xuat/${id}`,
    ho_so_quy_hoach: (id: number) => `/ho-so-quy-hoach/${id}`,
};
export const getRouteByLoaiTB = (tb: ThongBao) => {
    if(!tb.data) return null;
    const route = routes[tb.data.ob];
    return route ? route(tb.data.obId) : null;
};
export const isCanSuLy = (tb: ThongBao) => tb.loaiTb === "CAN_XU_LY";