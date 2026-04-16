import type React from "react";
import { useState, useEffect } from "react";
import { Modal, Form, Button, Card, message, Tag, Avatar, Divider } from "antd";
import { DeleteOutlined, UserOutlined, TeamOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { VienChuc, PCT, ChucDanhItem } from "../../../types/BoNhiem";
import PctSelect from "./PctSelect";
import { BatchInfo } from "./batchInfo";
import { getPlanningCandidates } from "../../../api/dotQuyHoach.api";
import { createDotBoNhiem } from "../../../api/dotBoNhiem.api";
import { useAuth } from "../../../hook/useAuth";
import { getPhieuChuTruongList } from "../../../api/phieuChuTruong.api";

interface CreateBatchModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

interface FormValues {
    ten_dot_bo_nhiem: string;
    ngay_bat_dau: dayjs.Dayjs;
    ngay_ket_thuc?: dayjs.Dayjs;
}

export const CreateBatchModal: React.FC<CreateBatchModalProps> = ({ visible, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const [pctList, setPctList] = useState<PCT[]>([]);
    const [selectedPctId, setSelectedPctId] = useState<number | null>(null);
    const [chucDanhList, setChucDanhList] = useState<ChucDanhItem[]>([]);
    const [addingPct, setAddingPct] = useState(false);

    useEffect(() => {
        if (!visible) return;
        form.setFieldsValue({
            ngayBatDau: dayjs(),
            ngayKetThuc: dayjs().add(30, "day"),
        });
        setChucDanhList([]);
        const fetchPCT = async () => {
            try {
                const pctRes = await getPhieuChuTruongList();
                setPctList((pctRes.data?.data ?? []).filter((p: PCT) => p.trangThai === 2));
            } catch {
                message.error("Lỗi khi tải danh mục Phiếu chủ trương!");
            }
        };
        fetchPCT();
    }, [visible, form]);

    const handleAddPct = async () => {
        const pct = pctList.find(p => p.id === selectedPctId);
        if (!pct) return;

        setAddingPct(true);
        try {
            const res = await getPlanningCandidates(pct.chucDanhId);
            const planningCandidates: VienChuc[] = res.data?.data ?? [];

            setChucDanhList(prev => [...prev, {
                tempId: `pct-${Date.now()}`,
                loai: "pct",
                pctId: pct.id,
                tenChucDanh: pct.tenChucDanh,
                tenDonVi: pct.tenDonVi,
                chucDanhId: pct.chucDanhId,
                ungVien: planningCandidates.map(vc => ({
                    vienChucId: vc.id,
                    maVienChuc: vc.maVienChuc,
                    hoVaTen: vc.hoVaTen,
                    tenDonVi: vc.tenDonVi,
                    nguon: "quy_hoach" as const,
                    chiTietQhId: vc.chiTietQhId,
                }))
            }]);
            setSelectedPctId(null);

            if (planningCandidates.length === 0)
                message.info("Chức danh này chưa có ứng viên quy hoạch.");
        } catch {
            message.error("Lỗi khi tải danh sách ứng viên quy hoạch");
        } finally {
            setAddingPct(false);
        }
    };

    const handleRemoveUngVien = (tempId: string, vcId: number) => {
        setChucDanhList(prev => prev.map(cd =>
            cd.tempId === tempId
                ? { ...cd, ungVien: cd.ungVien.filter(u => u.vienChucId !== vcId) }
                : cd
        ));
    };

    const handleRemoveChucDanh = (tempId: string) => {
        setChucDanhList(prev => prev.filter(cd => cd.tempId !== tempId));
    };

    const handleSubmit = async (values: FormValues) => {
        if (chucDanhList.length === 0)
            return message.warning("Vui lòng thêm ít nhất 1 chức danh cho đợt bổ nhiệm!");

        setLoading(true);
        try {
            const res = await createDotBoNhiem({
                tenDotBoNhiem: values.ten_dot_bo_nhiem,
                nguoiLap: user?.ho_va_ten,
                ngayBatDau: values.ngay_bat_dau?.format("YYYY-MM-DD") ?? null,
                ngayKetThuc: values.ngay_ket_thuc?.format("YYYY-MM-DD") ?? null,
                phieuChuTruong: chucDanhList.map(cd => cd.pctId),
            });
            if (res.data.success) {
                message.success("Tạo đợt bổ nhiệm thành công!");
                onSuccess();
                handleCancel();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message ?? "Lỗi khi tạo đợt bổ nhiệm");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setChucDanhList([]);
        setSelectedPctId(null);
        onCancel();
    };

    return (
        <Modal
            title="Tạo đợt bổ nhiệm mới"
            open={visible}
            onCancel={handleCancel}
            width={1100}
            footer={null}
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <BatchInfo user={user} />
                        <PctSelect
                            pctList={pctList}
                            chucDanhList={chucDanhList}
                            selectedPctId={selectedPctId}
                            onSelect={setSelectedPctId}
                            addingPct={addingPct}
                            onAddPCT={handleAddPct}
                        />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 580, overflowY: "auto" }}>
                        {chucDanhList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 border border-dashed rounded-lg p-10 bg-gray-50">
                                <TeamOutlined style={{ fontSize: 40, marginBottom: 8 }} />
                                <span>Chưa có chức danh nào được chỉ định</span>
                                <span className="text-xs text-gray-400">Vui lòng thiết lập ở cột bên trái</span>
                            </div>
                        ) : (
                            chucDanhList.map(cd => (
                                <Card
                                    key={cd.tempId}
                                    size="small"
                                    style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
                                    title={
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-blue-700">{cd.tenChucDanh}</span>
                                            <div className="flex items-center gap-2">
                                                <Tag color="cyan" className="text-xs m-0">{cd.tenDonVi}</Tag>
                                                <Button
                                                    type="text" danger size="small"
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => handleRemoveChucDanh(cd.tempId)}
                                                />
                                            </div>
                                        </div>
                                    }
                                >
                                    {cd.ungVien.length === 0 ? (
                                        <div className="text-xs text-gray-400 text-center py-2">
                                            Chưa có ứng viên
                                        </div>
                                    ) : (
                                        cd.ungVien.map(uv => (
                                            <div
                                                key={uv.vienChucId}
                                                className="flex items-center justify-between py-2 px-3 bg-white rounded-md mb-2 shadow-sm border border-gray-100"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Avatar size="small" icon={<UserOutlined />} className="bg-blue-100 text-blue-600" />
                                                    <div>
                                                        <div className="text-sm font-semibold">{uv.hoVaTen}</div>
                                                        <div className="text-xs text-gray-500">{uv.tenDonVi}</div>
                                                    </div>
                                                    {uv.nguon === "quy_hoach" && (
                                                        <Tag color="green" className="text-xs m-0">Quy hoạch</Tag>
                                                    )}
                                                </div>
                                                <Button
                                                    type="text" danger size="small"
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => handleRemoveUngVien(cd.tempId, uv.vienChucId)}
                                                />
                                            </div>
                                        ))
                                    )}
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                <Divider style={{ margin: "16px 0" }} />

                <div className="flex justify-end gap-3">
                    <Button onClick={handleCancel}>Hủy thao tác</Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        disabled={chucDanhList.length === 0}
                    >
                        Hoàn tất & Tạo đợt bổ nhiệm
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateBatchModal;