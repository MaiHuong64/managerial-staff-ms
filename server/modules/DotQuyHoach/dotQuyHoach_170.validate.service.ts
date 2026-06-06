import { BuocHoiNghiQH_170, KetQuaHoiNghiQH, KetQuaPhieuBauQH } from "./dotQuyHoach.validate.type";
import * as DotQuyHoachRepository from "./dotQuyHoach.validate.repository";

export const validateVoteInput = (data: KetQuaHoiNghiQH) => {
    if (!data.dotQHId || !data.buocHoiNghi)
        throw new Error("Thiếu thông tin bắt buộc");
    if (data.soNguoiCoMat > data.soNguoiTrieuTap)
        throw new Error("Số người có mặt không vượt quá số người triệu tập");
    if (data.soPhieuHopLe > data.soPhieuThuVe)
        throw new Error("Số phiếu hợp lệ không vượt quá số phiếu thu về");
    if (data.soPhieuThuVe > data.soPhieuPhatRa)
        throw new Error("Số phiếu thu về không vượt quá số phiếu phát ra");
};

// Bước 1: Rà soát đưa ra — chỉ cho ứng viên copy từ đợt gốc (loai_nguon = 2)
// Giữ lại → bước 6 (hoàn thành), đưa ra → bước 0 (loại)
const processStep1 = async (client: any, data: KetQuaHoiNghiQH) => {
    for (const uv of data.ketQuaUngVien) {
        if (uv.soPhieuDongY + uv.soPhieuKhongDongY !== data.soPhieuHopLe)
            throw new Error(`Ứng viên ${uv.chiTietQHId}: tổng phiếu không khớp`);

        const tiLe = data.soNguoiTrieuTap > 0 ? uv.soPhieuDongY / data.soNguoiTrieuTap : 0;
        const ketQua = tiLe > 0.5 ? KetQuaPhieuBauQH.KhongDat : KetQuaPhieuBauQH.Dat;

        await DotQuyHoachRepository.insertKetQuaQuyHoach(client, [uv.chiTietQHId, data.buocHoiNghi, data.soNguoiTrieuTap,
            data.soNguoiCoMat, data.soPhieuPhatRa, data.soPhieuThuVe,
            data.soPhieuHopLe, uv.soPhieuDongY, uv.soPhieuKhongDongY, ketQua]);

        const nextStep = ketQua === KetQuaPhieuBauQH.KhongDat ? 0 : BuocHoiNghiQH_170.HoanThanh;
        await DotQuyHoachRepository.updateBuocHienTaiById(client, nextStep, uv.chiTietQHId);

        if (ketQua === KetQuaPhieuBauQH.KhongDat)
            await DotQuyHoachRepository.updateStatusCandidate(client, uv.chiTietQHId, 0);
        else
            await DotQuyHoachRepository.updateStatusCandidate(client, uv.chiTietQHId, 1);
    }
};

// Bước 2: HN CB chủ chốt — phiếu kín, ngưỡng >= 30% có mặt
const processStep2 = async (client: any, data: KetQuaHoiNghiQH) => {
    const nguong = data.soNguoiCoMat * 0.30;
    for (const uv of data.ketQuaUngVien) {
        if (uv.soPhieuDongY + uv.soPhieuKhongDongY !== data.soPhieuHopLe)
            throw new Error(`Ứng viên ${uv.chiTietQHId}: tổng phiếu không khớp`);

        const ketQua = uv.soPhieuDongY >= nguong ? KetQuaPhieuBauQH.Dat : KetQuaPhieuBauQH.KhongDat;

        await DotQuyHoachRepository.insertKetQuaQuyHoach(client, [uv.chiTietQHId, data.buocHoiNghi, data.soNguoiTrieuTap,
            data.soNguoiCoMat, data.soPhieuPhatRa, data.soPhieuThuVe,
            data.soPhieuHopLe, uv.soPhieuDongY, uv.soPhieuKhongDongY, ketQua]);

        const nextStep = ketQua === KetQuaPhieuBauQH.Dat ? BuocHoiNghiQH_170.HoiNghiLanhDaoMoRong : 0;
        await DotQuyHoachRepository.updateBuocHienTaiById(client, nextStep, uv.chiTietQHId);

        if (ketQua === KetQuaPhieuBauQH.KhongDat)
            await DotQuyHoachRepository.updateStatusCandidate(client, uv.chiTietQHId, 0);
    }
};

// Bước 3: HN lãnh đạo mở rộng — phiếu kín, ngưỡng > 50% số có mặt
const processStep3 = async (client: any, data: KetQuaHoiNghiQH) => {
    const nguong = data.soNguoiCoMat * 0.50;
    for (const uv of data.ketQuaUngVien) {
        if (uv.soPhieuDongY + uv.soPhieuKhongDongY !== data.soPhieuHopLe)
            throw new Error(`Ứng viên ${uv.chiTietQHId}: tổng số phiếu không khớp`);

        const ketQua = uv.soPhieuDongY > nguong ? KetQuaPhieuBauQH.Dat : KetQuaPhieuBauQH.KhongDat;

        await DotQuyHoachRepository.insertKetQuaQuyHoach(client, [uv.chiTietQHId, data.buocHoiNghi, data.soNguoiTrieuTap,
            data.soNguoiCoMat, data.soPhieuPhatRa, data.soPhieuThuVe,
            data.soPhieuHopLe, uv.soPhieuDongY, uv.soPhieuKhongDongY, ketQua]);

        const nextStep = ketQua === KetQuaPhieuBauQH.Dat ? BuocHoiNghiQH_170.HoiNghiLanhDaoLan2 : 0;
        await DotQuyHoachRepository.updateBuocHienTaiById(client, nextStep, uv.chiTietQHId);

        if (ketQua === KetQuaPhieuBauQH.KhongDat)
            await DotQuyHoachRepository.updateStatusCandidate(client, uv.chiTietQHId, 0);
    }
};

// Bước 4: HN lãnh đạo lần 2 — phiếu kín, ngưỡng > 50% triệu tập
const processStep4 = async (client: any, data: KetQuaHoiNghiQH) => {
    for (const uv of data.ketQuaUngVien) {
        if (uv.soPhieuDongY + uv.soPhieuKhongDongY !== data.soPhieuHopLe)
            throw new Error(`Ứng viên ${uv.chiTietQHId}: tổng số phiếu không khớp`);

        const tiLe = data.soNguoiTrieuTap > 0 ? uv.soPhieuDongY / data.soNguoiTrieuTap : 0;
        const ketQua = tiLe > 0.5 ? KetQuaPhieuBauQH.Dat : KetQuaPhieuBauQH.KhongDat;

        await DotQuyHoachRepository.insertKetQuaQuyHoach(client, [uv.chiTietQHId, data.buocHoiNghi, data.soNguoiTrieuTap,
            data.soNguoiCoMat, data.soPhieuPhatRa, data.soPhieuThuVe,
            data.soPhieuHopLe, uv.soPhieuDongY, uv.soPhieuKhongDongY, ketQua]);

        const nextStep = ketQua === KetQuaPhieuBauQH.Dat ? BuocHoiNghiQH_170.HoanThanh : 0;
        await DotQuyHoachRepository.updateBuocHienTaiById(client, nextStep, uv.chiTietQHId);

        if (ketQua === KetQuaPhieuBauQH.Dat)
            await DotQuyHoachRepository.updateStatusCandidate(client, uv.chiTietQHId, 1);
        else
            await DotQuyHoachRepository.updateStatusCandidate(client, uv.chiTietQHId, 0);
    }
};

export const submitVoteResult_QT170 = async (client: any, data: KetQuaHoiNghiQH) => {
    validateVoteInput(data);
    // const client = await pool.connect();

    try {
        await client.query("BEGIN");
        const current = await DotQuyHoachRepository.getBuocHienTaiByDot(client, data.dotQHId);
        if (!current?.buoc_hien_tai)
            throw new Error("Đợt quy hoạch không có ứng viên đang xử lý");

        const currentStep = Number(current.buoc_hien_tai);

        const ungVien = await DotQuyHoachRepository.getUngVienByDotAndBuoc(client, data.dotQHId, currentStep);
        if (data.ketQuaUngVien.length !== ungVien.length)
            throw new Error(`Số ứng viên không khớp: gửi ${data.ketQuaUngVien.length}, DB có ${ungVien.length}`);

        switch (currentStep) {
            case BuocHoiNghiQH_170.RaSoatDuaRa:
                await processStep1(client, data); break;
            case BuocHoiNghiQH_170.HoiNghiCBChuChot:
                await processStep2(client, data); break;
            case BuocHoiNghiQH_170.HoiNghiLanhDaoMoRong:
                await processStep3(client, data); break;
            case BuocHoiNghiQH_170.HoiNghiLanhDaoLan2:
                await processStep4(client, data); break;
            default:
                throw new Error("Bước không hợp lệ");
        }

        // Với QT170, chỉ check ứng viên mới (loai_nguon = 1) đã xong chưa
        // Không tính ứng viên copy (loai_nguon = 2) vì họ đã ở bước 6 sau bước 1
        if (currentStep !== BuocHoiNghiQH_170.RaSoatDuaRa) {
            const isDone = await DotQuyHoachRepository.checkBatchDone_QT170(client, data.dotQHId);
            if (isDone) await DotQuyHoachRepository.updateStatusBatch(client, data.dotQHId);
        }
        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};