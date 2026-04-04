import pool from "../../config/db";
import { KetQuaHoiNghi } from "./dotBoNhiem.dto";
import { BuocHoiNghi, KetQuaPhieuBau } from "./dotBoNhiem.type";
import { insertKetQuaBoNhiem, upsertKetQuaBuoc2, getChiTietDotBoNhiem, updateBuocHienTai, checkAllDone } from "./dotBoNhiem.validate.repository";

export const validateVoteInput = (data: KetQuaHoiNghi) => {
    if(!data.chiTietDotBoNhiemId || !data.buocHoiNghi)
        throw new Error("Thiếu thông tin bắt");
    if(data.soNguoiCoMat > data.soNguoiTrieuTap)
        throw new Error ("Số người có mặt không được lớn hơn số người triệu tập");
    if ([BuocHoiNghi.HoiNghiLanhDaoVong2, BuocHoiNghi.HoiNghiCanBoChuChot, BuocHoiNghi.HoiNghiLanhDaoVongCuoi].includes(data.buocHoiNghi)) {
        const min = Math.ceil ( (2 /3 ) * data.soNguoiTrieuTap);
        if(data.soNguoiCoMat < min)
            throw new Error (`Hội nghị cần ít nhất ${min} số người triệu tập`);
    }
}
export const processStep2 = async (client: any, data: KetQuaHoiNghi) => {
    for(const uv of data.ketQuaUngVien){
        await upsertKetQuaBuoc2(client, [uv.chiTietBnId, data.buocHoiNghi,
             data.soNguoiTrieuTap, data.soNguoiCoMat])
    }
    return {nextStep: BuocHoiNghi.HoiNghiLanhDaoVong2}
}
export const processStep3 = async (client: any, data: KetQuaHoiNghi) => {
    const results = data.ketQuaUngVien.map(uv => {
        if(uv.soPhieuDongY + uv.soPhieuKhongDongY !== data.soPhieuHopLe)
             throw new Error(`Ứng viên ${uv.chiTietBnId}: tổng phiếu không khớp`);
        const tiLe = data.soPhieuHopLe > 0 ? uv.soPhieuDongY / data.soPhieuHopLe : KetQuaPhieuBau.KhongDat;
        return {...uv, tiLe: Math.round(tiLe * 100 ), ketQua: 0}
    })
    const maxPhieu = Math.max(...results.map(r => r.soPhieuDongY));

    for (const r of results) {
        r.ketQua = (r.soPhieuDongY === maxPhieu && r.tiLe > 50) ? KetQuaPhieuBau.Dat : KetQuaPhieuBau.KhongDat;
    }
    for (const r of results) {
        await insertKetQuaBoNhiem(client, [
            r.chiTietBnId, data.buocHoiNghi, data.soNguoiTrieuTap,
            data.soNguoiCoMat, data.soPhieuPhatRa, data.soPhieuThuVe,
            data.soPhieuHopLe, r.soPhieuDongY, r.soPhieuKhongDongY, r.ketQua
        ]);
    }

    const qualified = results.filter(r => r.ketQua === KetQuaPhieuBau.Dat);
    return { nextStep: qualified.length === 1 ? BuocHoiNghi.HoiNghiCanBoChuChot : KetQuaPhieuBau.KhongDat };
}

const processStep4  = async (client: any, data: KetQuaHoiNghi) => {
    for (const uv of data.ketQuaUngVien) {
        if (uv.soPhieuDongY + uv.soPhieuKhongDongY !== data.soPhieuHopLe)
            throw new Error(`Ứng viên ${uv.chiTietBnId}: tổng phiếu không khớp`);

        await insertKetQuaBoNhiem(client, [
            uv.chiTietBnId, data.buocHoiNghi, data.soNguoiTrieuTap,
            data.soNguoiCoMat, data.soPhieuPhatRa, data.soPhieuThuVe,
            data.soPhieuHopLe, uv.soPhieuDongY, uv.soPhieuKhongDongY, null
        ]);
    }
    return { nextStep: BuocHoiNghi.HoiNghiLanhDaoVongCuoi };
}
const processStep5 = async (client: any, data: KetQuaHoiNghi) => {
    const results = data.ketQuaUngVien.map(uv => {
        if (uv.soPhieuDongY + uv.soPhieuKhongDongY !== data.soPhieuHopLe)
            throw new Error(`Ứng viên ${uv.chiTietBnId}: tổng phiếu không khớp`);
        const tiLe = data.soNguoiTrieuTap > 0
            ? uv.soPhieuDongY / data.soNguoiTrieuTap : KetQuaPhieuBau.KhongDat;
        return {
            ...uv,
            tiLe: Math.round(tiLe * 100),
            ketQua: tiLe > 0.5 ? KetQuaPhieuBau.Dat : KetQuaPhieuBau.KhongDat
        };
    });
    for (const r of results) {
        await insertKetQuaBoNhiem(client, [
            r.chiTietBnId, data.buocHoiNghi, data.soNguoiTrieuTap,
            data.soNguoiCoMat, data.soPhieuPhatRa, data.soPhieuThuVe,
            data.soPhieuHopLe, r.soPhieuDongY, r.soPhieuKhongDongY, r.ketQua
        ]);
    }
    const qualified = results.filter(r => r.ketQua === KetQuaPhieuBau.Dat)
    if(qualified.length === 0) return {nextStep: KetQuaPhieuBau.KhongDat}

     if (qualified.length > 1) {
        const maxPhieu = Math.max(...qualified.map(r => r.soPhieuDongY));
        const hoa = qualified.filter(r => r.soPhieuDongY === maxPhieu);
        if (hoa.length > 1) return { nextStep: BuocHoiNghi.HoiNghiLanhDaoVongCuoi };
    }

    return { nextStep: BuocHoiNghi.HoanThanhBoPhieu };
};

export const submitVoteResult = async (data: KetQuaHoiNghi) => {
    validateVoteInput(data);
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const chiTiet = await getChiTietDotBoNhiem(client, data.chiTietDotBoNhiemId);
        
        const currentStep = Number(chiTiet.buoc_hoi_nghi);
        if(currentStep !== data.buocHoiNghi)
            throw new Error(`Bước hiện tại đang ở ${currentStep}`);
        let result; 

        switch (data.buocHoiNghi) {
            case BuocHoiNghi.HoiNghiLanhDaoVong1: result = await processStep2(client, data); break;
            case BuocHoiNghi.HoiNghiLanhDaoVong2: result = await processStep3 (client, data); break;
            case BuocHoiNghi.HoiNghiCanBoChuChot: result = await processStep4(client, data); break;
            case BuocHoiNghi.HoiNghiLanhDaoVongCuoi: result = await processStep5 (client, data); break;
            default: throw new Error("Bước không hợp lệ");  
        }
      
        await updateBuocHienTai(client, result.nextStep, data.chiTietDotBoNhiemId);
        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error
    } finally{
        client.release();
    }
}
