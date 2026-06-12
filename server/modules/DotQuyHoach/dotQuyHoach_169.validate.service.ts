import { BuocHoiNghiQH_169, KetQuaHoiNghiQH, KetQuaPhieuBauQH} from "./dotQuyHoach.validate.type";
import * as DotQuyHoachRepository from "./dotQuyHoach.validate.repository";
import { PoolClient } from "pg";

export const validateVoteInput = (data: KetQuaHoiNghiQH) => {
    if(!data.dotQHId || !data.buocHoiNghi) 
        throw new Error ("Thiếu thông tin bắc buộc")
    if(data.soNguoiCoMat > data.soNguoiTrieuTap) 
        throw new Error("Số người có mặt không vượt quá số người triệu tập ")
}
export const processStep2 = async (client: PoolClient, data: KetQuaHoiNghiQH) => {
    for(const uv of data.ketQuaUngVien){
        await DotQuyHoachRepository.upsertKetQuaBuoc2(client, [uv.chiTietQHId, data.buocHoiNghi, data.soNguoiTrieuTap, data.soNguoiCoMat])
        await DotQuyHoachRepository.updateBuocHienTaiByChiTietId(client, BuocHoiNghiQH_169.HoiNghiCBChuChot, uv.chiTietQHId)
    }
}

// Bước 3: HN CB chủ chốt — phiếu kín, ngưỡng >= 30% có mặt
export const processStep3 = async (client: PoolClient, data: KetQuaHoiNghiQH) => {
    const nguong = data.soNguoiCoMat * 0.30
    for(const uv of data.ketQuaUngVien){
        if(uv.soPhieuDongY + uv.soPhieuKhongDongY !== data.soPhieuHopLe)
            throw new Error(`Ứng viên ${uv.chiTietQHId}: tổng phiếu không khớp`);
        const ketQua = uv.soPhieuDongY >= nguong ? KetQuaPhieuBauQH.Dat : KetQuaPhieuBauQH.KhongDat

        await DotQuyHoachRepository.insertKetQuaQuyHoach(client, [uv.chiTietQHId, data.buocHoiNghi, data.soNguoiTrieuTap, data.soNguoiCoMat, data.soPhieuPhatRa, data.soPhieuThuVe,
            data.soPhieuHopLe, uv.soPhieuDongY, uv.soPhieuKhongDongY, ketQua
        ])
        const nextStep = ketQua === KetQuaPhieuBauQH.Dat ? BuocHoiNghiQH_169.HoiNghiLanhDaoMoRong : 0
        await DotQuyHoachRepository.updateBuocHienTaiByChiTietId(client, nextStep, uv.chiTietQHId);
        
        // Cap nhat trang thai cho ung vien
        if(ketQua === KetQuaPhieuBauQH.KhongDat)
            await DotQuyHoachRepository.updateTrangThaiChiTietDQH(client, uv.chiTietQHId, 0);
    }
}

// Bước 4: phiếu kín, ngưỡng > 50% số có mặt
const processStep4  = async (client: PoolClient, data: KetQuaHoiNghiQH) => {
    const nguong = data.soNguoiCoMat * 0.50;
    for(const uv of data.ketQuaUngVien) {
        if(uv.soPhieuDongY + uv.soPhieuKhongDongY !== data.soPhieuHopLe)
            throw new Error (`Ứng viên ${uv.chiTietQHId}: tổng số phiếu không khớp`)
        const ketQua = uv.soPhieuDongY > nguong ? KetQuaPhieuBauQH.Dat : KetQuaPhieuBauQH.KhongDat
        await DotQuyHoachRepository.insertKetQuaQuyHoach(client, [uv.chiTietQHId, data.buocHoiNghi, data.soNguoiTrieuTap, data.soNguoiCoMat, data.soPhieuPhatRa, data.soPhieuThuVe,
            data.soPhieuHopLe, uv.soPhieuDongY, uv.soPhieuKhongDongY, ketQua
        ])
        const nextStep = ketQua === KetQuaPhieuBauQH.Dat ? BuocHoiNghiQH_169.HoiNghiLanhDaoLan2 : 0
        await DotQuyHoachRepository.updateBuocHienTaiByChiTietId(client, nextStep, uv.chiTietQHId);

        if(ketQua === KetQuaPhieuBauQH.KhongDat)
            await DotQuyHoachRepository.updateTrangThaiChiTietDQH(client, uv.chiTietQHId, 0);
    }
}
//Bước 5: HN lãnh đạo lần 2 — phiếu kín, ngưỡng > 50% triệu tập
const processStep5 = async (client: PoolClient, data: KetQuaHoiNghiQH) => {
    for(const uv of data.ketQuaUngVien) {
        if(uv.soPhieuDongY + uv.soPhieuKhongDongY !== data.soPhieuHopLe)
            throw new Error (`Ứng viên ${uv.chiTietQHId}: tổng số phiếu không khớp`)
        const tiLe = data.soNguoiTrieuTap > 0 ? uv.soPhieuDongY / data.soNguoiTrieuTap : 0
        const ketQua = tiLe > 0.5 ? KetQuaPhieuBauQH.Dat : KetQuaPhieuBauQH.KhongDat
        await DotQuyHoachRepository.insertKetQuaQuyHoach(client, [uv.chiTietQHId, data.buocHoiNghi, data.soNguoiTrieuTap, data.soNguoiCoMat, data.soPhieuPhatRa, data.soPhieuThuVe,
            data.soPhieuHopLe, uv.soPhieuDongY, uv.soPhieuKhongDongY, ketQua
        ])
        const nextStep = ketQua === KetQuaPhieuBauQH.Dat ? BuocHoiNghiQH_169.HoanThanh : 0
        await DotQuyHoachRepository.updateBuocHienTaiByChiTietId(client, nextStep, uv.chiTietQHId);
        
        if(ketQua === KetQuaPhieuBauQH.Dat)
            await DotQuyHoachRepository.updateTrangThaiChiTietDQH(client, uv.chiTietQHId, 1)
        else
            await DotQuyHoachRepository.updateTrangThaiChiTietDQH(client, uv.chiTietQHId, 0);
    }
};

export const submitVoteResult_QT169 = async (client: PoolClient, data: KetQuaHoiNghiQH) => {
    validateVoteInput(data);
    const current = await DotQuyHoachRepository.getBuocHienTaiByDotId(client, data.dotQHId);
        if (!current?.buoc_hien_tai)
            throw new Error("Đợt quy hoạch không có ứng viên đang xử lý");

        const currentStep = Number(current.buoc_hien_tai);
        // const loaiQuyHoach = Number(current.loai_quy_hoach);
    
        const ungVien = await DotQuyHoachRepository.getChiTietByDotAndBuoc(client, data.dotQHId, currentStep);
        if (data.ketQuaUngVien.length !== ungVien.length)
            throw new Error(`Số ứng viên không khớp: gửi ${data.ketQuaUngVien.length}, DB có ${ungVien.length}`);
        switch (currentStep) {
            case BuocHoiNghiQH_169.HoiNghiLanhDao:
                await processStep2(client, data); break;
            case BuocHoiNghiQH_169.HoiNghiCBChuChot:
                await processStep3(client, data); break;
            case BuocHoiNghiQH_169.HoiNghiLanhDaoMoRong:
                await processStep4(client, data); break;
            case BuocHoiNghiQH_169.HoiNghiLanhDaoLan2:
                await processStep5(client, data); break;
            default:
                throw new Error("Bước không hợp lệ");
        }

        const isDone = await DotQuyHoachRepository.checkDQH_QT169(client, data.dotQHId);
        if (isDone) await DotQuyHoachRepository.updateTrangThaiDQH(client, data.dotQHId);
}


