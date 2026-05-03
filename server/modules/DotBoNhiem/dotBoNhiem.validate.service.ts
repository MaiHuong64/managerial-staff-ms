import pool from "../../config/db";
import { KetQuaHoiNghi } from "./dotBoNhiem.dto";
import { BuocHoiNghi, KetQuaPhieuBau, TrangThaiDoBoNhiem } from "./dotBoNhiem.type";
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
    // Lấy những ứng viên có số phiếu đồng ý cao nhất và tỷ lệ > 50%
    const qualified = results.filter(r => r.soPhieuDongY === maxPhieu && r.tiLe > 0.5)
    const isTie = qualified.length > 1;

    for(const r of results){
        const isWinner = qualified.some(w => w.chiTietBnId === r.chiTietBnId);
        const ketQua = isTie ? null : (isWinner ? KetQuaPhieuBau.Dat : KetQuaPhieuBau.KhongDat);
        await insertKetQuaBoNhiem(client, [r.chiTietBnId, data.buocHoiNghi, data.soNguoiTrieuTap,
            data.soNguoiCoMat, data.soPhieuPhatRa, data.soPhieuThuVe,
            data.soPhieuHopLe, r.soPhieuDongY, r.soPhieuKhongDongY, ketQua]);
        if(!isTie){
            await updateStepForCandidate(client, isWinner ? BuocHoiNghi.HoiNghiCanBoChuChot : 0, r.chiTietBnId)
            if(!isWinner){
                await updateStatusCandidate(client, r.chiTietBnId, KetQuaPhieuBau.KhongDat);
            }
        }
    }

    if (isTie) {
        const chiTietBnIds = qualified.map(q => q.chiTietBnId);
        const candidateInfo = await client.query(
            `SELECT ctbn.id as chi_tiet_bn_id, vc.ho_va_ten
             FROM chi_tiet_bo_nhiem ctbn
             JOIN vien_chuc vc ON ctbn.vien_chuc_id = vc.id
             WHERE ctbn.id = ANY($1)`,
            [chiTietBnIds]
        );

        console.log("Candidate info from DB:", candidateInfo.rows);
        console.log("Qualified candidates:", qualified);

        const danhSachHoa = qualified.map(q => {
            const info = candidateInfo.rows.find((c: any) => c.chi_tiet_bn_id === q.chiTietBnId);
            return {
                chiTietBnId: q.chiTietBnId,
                hoVaTen: info?.ho_va_ten || '',
                soPhieuDongY: q.soPhieuDongY
            };
        });

        console.log("Final danhSachHoa:", JSON.stringify(danhSachHoa, null, 2));
        return { isTie: true, danhSachHoa };
    }

    return { isTie: false, danhSachHoa: [] };
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

        let result = null;
        switch (data.buocHoiNghi) {
            case BuocHoiNghi.HoiNghiLanhDaoVong1:
                await processStep2(client, data); break;
            case BuocHoiNghi.HoiNghiLanhDaoVong2:
                result = await processStep3(client, data); break;
            case BuocHoiNghi.HoiNghiCanBoChuChot:
                await processStep4(client, data); break;
            case BuocHoiNghi.HoiNghiLanhDaoVongCuoi:
                await processStep5(client, data, data.chiTietDotBoNhiemId, chiTiet.dot_bo_nhiem_id); break;
            default: throw new Error("Bước không hợp lệ");
        }

        await client.query("COMMIT");
        return result;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error
    } finally{
        client.release();
    }
}
export const resolveVoteTieService = async (chiTietBnId: number, tieCandidates: number[]) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        for (const id of tieCandidates) {
            if(id === chiTietBnId){
                await updateStatusCandidate(client, id, KetQuaPhieuBau.Dat);
                await updateStepForCandidate(client, BuocHoiNghi.HoiNghiCanBoChuChot, id);
            } else {
                await updateStatusCandidate(client, id, KetQuaPhieuBau.KhongDat);
                await updateStepForCandidate(client, 0, id);
            }
           
        }
      
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}