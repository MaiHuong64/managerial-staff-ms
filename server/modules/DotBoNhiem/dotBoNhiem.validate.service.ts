import pool from "../../config/db";
import { KetQuaHoiNghi } from "./dotBoNhiem.dto";
import { BuocHoiNghi, KetQuaPhieuBau } from "./dotBoNhiem.type";
import { insertKetQuaBoNhiem, upsertKetQuaBuoc2, getChiTietDotBoNhiem, checkAllDone, updateStepForCandidate, updateStatusChiTietDot, updateStatusBatch, getBuocHienTai, updateStatusCandidate } from "./dotBoNhiem.validate.repository";

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
// Bước 2: N ứng viên → vote → 1 winner (phiếu cao nhất & > 50%) lên bước 3
export const processStep2 = async (client: any, data: KetQuaHoiNghi) => {
    for(const uv of data.ketQuaUngVien){
        await upsertKetQuaBuoc2(client, [uv.chiTietBnId, data.buocHoiNghi,
            data.soNguoiTrieuTap, data.soNguoiCoMat])
        await updateStepForCandidate(client, BuocHoiNghi.HoiNghiLanhDaoVong2, uv.chiTietBnId);
        await updateStatusBatch(client, data.chiTietDotBoNhiemId, 2);
    }
}
// Bước 3: 1 ứng viên — công bố kết quả, lên bước 4
export const processStep3 = async (client: any, data: KetQuaHoiNghi) => {
     const results = data.ketQuaUngVien.map(uv => {
        if(uv.soPhieuDongY + uv.soPhieuKhongDongY !== data.soPhieuHopLe)
             throw new Error(`Ứng viên ${uv.chiTietBnId}: tổng phiếu không khớp`);
        const tiLe = data.soPhieuHopLe > 0 ? uv.soPhieuDongY / data.soPhieuHopLe : KetQuaPhieuBau.KhongDat;
        return {...uv, tiLe}
    });
    const maxPhieu = Math.max(...results.map(r => r.soPhieuDongY));
    const winner = results.filter(r => r.soPhieuDongY === maxPhieu && r.tiLe > 0.5)
    if(winner.length === 0)
        throw new Error("Không có ứng viên nào đạt ngưỡng > 50%");
    if (winner.length > 1)
        throw new Error("Hòa phiếu. Người đứng đầu cần quyết định");

    for(const r of results){
        const ketQua = r.chiTietBnId === winner[0].chiTietBnId ? KetQuaPhieuBau.Dat : KetQuaPhieuBau.KhongDat;
        await insertKetQuaBoNhiem(client, [r.chiTietBnId, data.buocHoiNghi, data.soNguoiTrieuTap,
            data.soNguoiCoMat, data.soPhieuPhatRa, data.soPhieuThuVe,
            data.soPhieuHopLe, r.soPhieuDongY, r.soPhieuKhongDongY, ketQua]);
        await updateStepForCandidate(client, ketQua === KetQuaPhieuBau.Dat ? BuocHoiNghi.HoiNghiCanBoChuChot  : 0, r.chiTietBnId);
        if(ketQua === KetQuaPhieuBau.KhongDat)
            await updateStatusCandidate(client, r.chiTietBnId, 0);
    } 
}
// Bước 4: 1 ứng viên — lấy phiếu tín nhiệm, không công bố, lên bước 5
const processStep4  = async (client: any, data: KetQuaHoiNghi) => {
    const uv = data.ketQuaUngVien[0];
    if (uv.soPhieuDongY + uv.soPhieuKhongDongY !== data.soPhieuHopLe)
        throw new Error("Tổng phiếu không khớp");

    await insertKetQuaBoNhiem(client, [
        uv.chiTietBnId, data.buocHoiNghi, data.soNguoiTrieuTap,
        data.soNguoiCoMat, data.soPhieuPhatRa, data.soPhieuThuVe,
        data.soPhieuHopLe, uv.soPhieuDongY, uv.soPhieuKhongDongY, null
    ]);
    await updateStepForCandidate(client, BuocHoiNghi.HoiNghiLanhDaoVongCuoi, uv.chiTietBnId);
}
// Bước 5: 1 ứng viên — biểu quyết cuối, > 50% triệu tập
const processStep5 = async (client: any, data: KetQuaHoiNghi, chiTietDotId: number, dotBoNhiemId: number) => {
    const uv = data.ketQuaUngVien[0];
    if (uv.soPhieuDongY + uv.soPhieuKhongDongY !== data.soPhieuHopLe)
        throw new Error("Tổng phiếu không khớp");
    const tiLe = data.soNguoiTrieuTap > 0 ? uv.soPhieuDongY / data.soNguoiTrieuTap: 0
    const ketQua = tiLe > 0.5 ? KetQuaPhieuBau.Dat : KetQuaPhieuBau.KhongDat;

    await insertKetQuaBoNhiem(client, [
        uv.chiTietBnId, data.buocHoiNghi, data.soNguoiTrieuTap,
        data.soNguoiCoMat, data.soPhieuPhatRa, data.soPhieuThuVe,
        data.soPhieuHopLe, uv.soPhieuDongY, uv.soPhieuKhongDongY, ketQua
    ]);

    if(ketQua === KetQuaPhieuBau.Dat) {
        await updateStepForCandidate(client, BuocHoiNghi.HoanThanhBoPhieu, uv.chiTietBnId);
        await updateStatusCandidate(client, uv.chiTietBnId, 3);
        await updateStatusChiTietDot(client, chiTietDotId, 0);

        const isDone = await checkAllDone(client, dotBoNhiemId);
        if (Number(isDone.dang_xu_ly) === 0)
            await updateStatusBatch(client, dotBoNhiemId, BuocHoiNghi.HoanThanhBoPhieu);
    }
}; 

export const submitVoteResult = async (data: KetQuaHoiNghi) => {
    validateVoteInput(data);
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const chiTiet = await getChiTietDotBoNhiem(client, data.chiTietDotBoNhiemId);
        
        const currentStep = await getBuocHienTai(client, data.chiTietDotBoNhiemId)
        if(currentStep !== data.buocHoiNghi)
            throw new Error(`Bước hiện tại đang ở ${currentStep}`);

        switch (data.buocHoiNghi) {
            case BuocHoiNghi.HoiNghiLanhDaoVong1: 
                await processStep2(client, data); break;
            case BuocHoiNghi.HoiNghiLanhDaoVong2:
                await processStep3 (client, data); break;
            case BuocHoiNghi.HoiNghiCanBoChuChot:
                await processStep4(client, data); break;
            case BuocHoiNghi.HoiNghiLanhDaoVongCuoi:
                await processStep5 (client, data, data.chiTietDotBoNhiemId, chiTiet.dot_bo_nhiem_id); break;
            default: throw new Error("Bước không hợp lệ");  
        } 
        
        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error
    } finally{
        client.release();
    }
}
