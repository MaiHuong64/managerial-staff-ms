import type React from "react";
import { useState, useEffect } from "react";
import { Modal, Form, Input, DatePicker, Button, Card, message, Select, Tag, Avatar, Divider, Tooltip } from "antd";
import { DeleteOutlined, UserOutlined, FileTextOutlined, TeamOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import axiosClient from "../../utils/AxiosClient";
import { useAuth } from "../../hook/useAuth";
import type { ChucDanhItem, VienChuc } from "../../types/BoNhiem";

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

    // Các State chứa dữ liệu danh mục
    const [allStaff, setAllStaff] = useState<VienChuc[]>([]);
    const [donViList, setDonViList] = useState<{ id: number, ten_don_vi: string }[]>([]);
    const [chucDanhQLList, setChucDanhQLList] = useState<{ id: number, ten_chuc_danh: string }[]>([]);
    
    // State lưu cấu trúc Đợt bổ nhiệm đang tạo
    const [chucDanhList, setChucDanhList] = useState<ChucDanhItem[]>([]);
    const [thuCongForm, setThuCongForm] = useState<{ chuc_danh_id: number | null, don_vi_id: number | null, ten_chuc_danh: string, ten_don_vi: string }>({ chuc_danh_id: null, don_vi_id: null, ten_chuc_danh: "", ten_don_vi: "" });

    // Fetch dữ liệu Master (Chỉ lấy Viên chức, Đơn vị, Chức danh)
    useEffect(() => {
        if (!visible) return;
        
        form.setFieldsValue({
            ngay_bat_dau: dayjs(),
            ngay_ket_thuc: dayjs().add(30, "day"),
        });
        setChucDanhList([]);

        const fetchMasterData = async () => {
            try {
                // Gom 3 API chạy cùng lúc cho nhanh
                const [staffRes, deptRes, posRes] = await Promise.all([
                    axiosClient.get("/staffs"),
                    axiosClient.get("/departments"),
                    axiosClient.get("/positions")
                ]);

                const staffs = staffRes.data?.data || staffRes.data || [];
                const depts = deptRes.data?.data || deptRes.data || [];
                const positions = posRes.data?.data || posRes.data || [];

                setAllStaff(Array.isArray(staffs) ? staffs : []);
                setDonViList(Array.isArray(depts) ? depts : []);
                setChucDanhQLList(Array.isArray(positions) ? positions : []);

            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
                message.error("Lỗi khi kết nối lấy danh mục Đơn vị / Chức danh!");
            }
        };

        fetchMasterData();
    }, [visible, form]);
    // Hàm gắn 1 viên chức vào chức danh
    const handleAddManualStaff = (tempId: string, vcId: number) => {
        const vc = allStaff.find(s => s.id === vcId);
        if (!vc) return;
        
        setChucDanhList(prev => prev.map(cd => {
            if (cd.tempId !== tempId) return cd;
            // Nếu đã thêm người này rồi thì bỏ qua
            if (cd.ung_vien.find(u => u.vien_chuc_id === vc.id)) return cd; 
            return {
                ...cd,
                ung_vien: [...cd.ung_vien, {
                    vien_chuc_id: vc.id,
                    ma_vien_chuc: vc.ma_vien_chuc,
                    ho_va_ten: vc.ho_va_ten,
                    ten_don_vi: vc.ten_don_vi,
                    nguon: "thu_cong",
                }],
            };
        }));
    };

    const handleRemoveUngVien = (tempId: string, vcId: number) => {
        setChucDanhList(prev => prev.map(cd =>
            cd.tempId === tempId ? { ...cd, ung_vien: cd.ung_vien.filter(u => u.vien_chuc_id !== vcId) }: cd
        ));
    };

    const handleRemoveChucDanh = (tempId: string) => {
        setChucDanhList(prev => prev.filter(cd => cd.tempId !== tempId));
    };

    const handleSubmit = async (values: FormValues) => {
        if (chucDanhList.length === 0) {
            return message.warning("Vui lòng thêm ít nhất 1 chức danh cho đợt bổ nhiệm!");
        }

        setLoading(true);
        try {
            const res = await axiosClient.post("/appointments/create-with-candidates", {
                ten_dot_bo_nhiem: values.ten_dot_bo_nhiem,
                nguoi_lap: user?.ho_va_ten,
                ngay_bat_dau: values.ngay_bat_dau?.format("YYYY-MM-DD") ?? null,
                ngay_ket_thuc: values.ngay_ket_thuc?.format("YYYY-MM-DD") ?? null,
                chuc_danh_list: chucDanhList.map(cd => ({
                    pct_id: null,
                    chuc_danh_id: cd.chuc_danh_id,
                    don_vi_id: donViList.find(d => d.ten_don_vi === cd.ten_don_vi)?.id, 
                    ung_vien: cd.ung_vien.map(u => ({
                        vien_chuc_id: u.vien_chuc_id,
                        chi_tiet_qh_id: null,
                    })),
                })),
            });

            if (res.data.success) {
                message.success("Tạo đợt bổ nhiệm thành công!");
                onSuccess();
                handleCancel();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || "Lỗi khi tạo đợt bổ nhiệm");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setChucDanhList([]);
        setThuCongForm({ chuc_danh_id: null, don_vi_id: null, ten_chuc_danh: "", ten_don_vi: "" });
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
                        
                        {/* Box 1: Thông tin đợt */}
                        <Card size="small" title={<span><FileTextOutlined className="mr-2 text-blue-500" />Thông tin chung</span>}>
                            <Form.Item label="Tên đợt bổ nhiệm" name="ten_dot_bo_nhiem"
                                rules={[{ required: true, message: "Vui lòng nhập tên đợt" }]}>
                                <Input placeholder="VD: Đợt bổ nhiệm tháng 3/2026" />
                            </Form.Item>
                            <Form.Item label="Người lập">
                                <Input value={user?.ho_va_ten} disabled />
                            </Form.Item>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                <Form.Item label="Ngày bắt đầu" name="ngay_bat_dau" rules={[{ required: true, message: "Chọn ngày" }]}>
                                    <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                                </Form.Item>
                                <Form.Item label="Ngày kết thúc" name="ngay_ket_thuc">
                                    <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                                </Form.Item>
                            </div>
                        </Card>

                        {/* Box 2: Chỉ định chức danh & đơn vị */}
                        <Card size="small" title={<span><TeamOutlined className="mr-2 text-blue-500" />Chỉ định chức danh cần bổ nhiệm</span>}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                <Select
                                    placeholder="Chọn chức danh..."
                                    style={{ width: "100%" }}
                                    showSearch
                                    optionFilterProp="label"
                                    value={thuCongForm.chuc_danh_id}
                                    onChange={(val: number, opt: any) => setThuCongForm(prev => ({
                                        ...prev, chuc_danh_id: val, ten_chuc_danh: opt.label
                                    }))}
                                    options={chucDanhQLList.map(cd => ({ value: cd.id, label: cd.ten_chuc_danh }))}
                                />
                                <Select
                                    placeholder="Chọn đơn vị..."
                                    style={{ width: "100%" }}
                                    showSearch
                                    optionFilterProp="label"
                                    value={thuCongForm.don_vi_id}
                                    onChange={(val: number, opt: any) => setThuCongForm(prev => ({
                                        ...prev, don_vi_id: val, ten_don_vi: opt.label
                                    }))}
                                    options={donViList.map(dv => ({ value: dv.id, label: dv.ten_don_vi }))}
                                />
                            </div>
                            <Button
                                type="dashed"
                                icon={<PlusOutlined />}
                                className="w-full mt-3"
                                disabled={!thuCongForm.chuc_danh_id || !thuCongForm.don_vi_id}
                                onClick={() => {
                                    setChucDanhList(prev => [...prev, {
                                        tempId: `thu-cong-${Date.now()}`,
                                        loai: "thu_cong",
                                        ten_chuc_danh: thuCongForm.ten_chuc_danh,
                                        ten_don_vi: thuCongForm.ten_don_vi,
                                        chuc_danh_id: thuCongForm.chuc_danh_id!,
                                        ung_vien: [],
                                    }]);
                                    setThuCongForm({ chuc_danh_id: null, don_vi_id: null, ten_chuc_danh: "", ten_don_vi: "" });
                                }}
                            >
                                Đưa vào danh sách đợt
                            </Button>
                        </Card>
                    </div>

                    {/* ── CỘT PHẢI: HIỂN THỊ DANH SÁCH CHỨC DANH & CHỌN ỨNG VIÊN ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 580, overflowY: "auto" }}>
                        {chucDanhList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 border border-dashed rounded-lg p-10 bg-gray-50">
                                <TeamOutlined style={{ fontSize: 40, marginBottom: 8 }} />
                                <span>Chưa có chức danh nào được chỉ định</span>
                                <span className="text-xs text-gray-400">Vui lòng thiết lập ở cột bên trái</span>
                            </div>
                        ) : (
                            chucDanhList.map(cd => (
                                <Card key={cd.tempId} size="small" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
                                    title={
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-blue-700">{cd.ten_chuc_danh}</span>
                                            <div className="flex items-center gap-2">
                                                <Tag color="cyan" className="text-xs m-0">{cd.ten_don_vi}</Tag>
                                                <Tooltip title="Loại bỏ chức danh này">
                                                    <Button type="text" danger size="small" icon={<DeleteOutlined />}
                                                        onClick={() => handleRemoveChucDanh(cd.tempId)} />
                                                </Tooltip>
                                            </div>
                                        </div>
                                    }
                                >
                                    {/* Danh sách người được chọn */}
                                    {cd.ung_vien.length > 0 && (
                                        <div style={{ marginBottom: 12 }}>
                                            {cd.ung_vien.map(uv => (
                                                <div key={uv.vien_chuc_id} className="flex items-center justify-between py-2 px-3 bg-white rounded-md mb-2 shadow-sm border border-gray-100">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar size="small" icon={<UserOutlined />} className="bg-blue-100 text-blue-600" />
                                                        <div>
                                                            <div className="text-sm font-semibold">{uv.ho_va_ten}</div>
                                                            <div className="text-xs text-gray-500">{uv.ten_don_vi}</div>
                                                        </div>
                                                    </div>
                                                    <Button type="text" danger size="small" icon={<DeleteOutlined />}
                                                        onClick={() => handleRemoveUngVien(cd.tempId, uv.vien_chuc_id)} />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Nút chọn thêm ứng viên thủ công */}
                                    <Select
                                        placeholder="🔍 Gõ tên để thêm ứng viên..."
                                        size="middle"
                                        style={{ width: "100%" }}
                                        showSearch
                                        optionFilterProp="label"
                                        value={null} // Luôn null để nhập xong là trắng ô
                                        onChange={vcId => handleAddManualStaff(cd.tempId, vcId)}
                                        options={allStaff
                                            .filter(v => !cd.ung_vien.find(u => u.vien_chuc_id === v.id))
                                            .map(v => ({ value: v.id, label: `${v.ho_va_ten} — ${v.ten_don_vi}` }))}
                                    />
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                <Divider style={{ margin: "16px 0" }} />
                
                <div className="flex justify-end gap-3">
                    <Button onClick={handleCancel}>Hủy thao tác</Button>
                    <Button type="primary" htmlType="submit" loading={loading} disabled={chucDanhList.length === 0}>
                        Hoàn tất & Tạo đợt bổ nhiệm
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateBatchModal;