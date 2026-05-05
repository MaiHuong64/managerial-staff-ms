import { useEffect, useState } from "react";
import { Button, Card, message, Popconfirm, Space, Table, Tag, Tooltip, Modal, Form, Input, Select, Badge} from "antd";
import { LockOutlined, UnlockOutlined, EditOutlined, KeyOutlined, UserOutlined, CheckCircleOutlined, StopOutlined} from "@ant-design/icons";
import { getTaiKhoanList, updateVaiTro, updateTrangThai, doiMatKhau} from "../../api/taiKhoan.api";
import type { TaiKhoan } from "../../types/TaiKhoan";

const VAI_TRO_MAP: Record<string, { label: string; color: string }> = {
    ADMIN:  { label: "Admin",       color: "red"    },
    BGH:    { label: "Ban giám hiệu", color: "purple" },
    PTCCT:  { label: "PTCCT",       color: "blue"   },
    VCQL:   { label: "VC Quản lý",  color: "orange" },
    VC:     { label: "Viên chức",   color: "default"},
};

const VALID_ROLES = ["ADMIN", "BGH", "PTCCT", "VCQL", "VC"];

const TaiKhoanPage = () => {
    const [danhSach, setDanhSach] = useState<TaiKhoan[]>([]);
    const [loading, setLoading] = useState(true);

    const [vaiTroModal, setVaiTroModal] = useState(false);
    const [selectedTK, setSelectedTK] = useState<TaiKhoan | null>(null);
    const [updatingVaiTro, setUpdatingVaiTro] = useState(false);
    const [vaiTroForm] = Form.useForm();

    const [matKhauModal, setMatKhauModal] = useState(false);
    const [updatingMK, setUpdatingMK] = useState(false);
    const [matKhauForm] = Form.useForm();

    const [togglingId, setTogglingId] = useState<number | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getTaiKhoanList();
            setDanhSach(res.data.data || []);
        } catch {
            message.error("Không thể tải danh sách tài khoản");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleToggleTrangThai = async (record: TaiKhoan) => {
        const newTrangThai = record.trangThai === 1 ? 0 : 1;
        try {
            setTogglingId(record.id);
            await updateTrangThai(record.id, newTrangThai);
            message.success(newTrangThai === 1 ? "Đã mở khoá tài khoản" : "Đã khoá tài khoản");
            fetchData();
        } catch (err: any) {
            message.error(err?.response?.data?.message || "Lỗi khi cập nhật trạng thái");
        } finally {
            setTogglingId(null);
        }
    };

    const openVaiTroModal = (record: TaiKhoan) => {
        setSelectedTK(record);
        vaiTroForm.setFieldsValue({ vaiTro: record.vaiTro });
        setVaiTroModal(true);
    };

    const handleUpdateVaiTro = async (values: { vaiTro: string }) => {
        if (!selectedTK) return;
        try {
            setUpdatingVaiTro(true);
            await updateVaiTro(selectedTK.id, values.vaiTro);
            message.success("Cập nhật vai trò thành công");
            setVaiTroModal(false);
            fetchData();
        } catch (err: any) {
            message.error(err?.response?.data?.message || "Lỗi khi cập nhật vai trò");
        } finally {
            setUpdatingVaiTro(false);
        }
    };

    const openMatKhauModal = (record: TaiKhoan) => {
        setSelectedTK(record);
        matKhauForm.resetFields();
        setMatKhauModal(true);
    };

    const handleDoiMatKhau = async (values: { matKhauCu: string; matKhauMoi: string }) => {
        if (!selectedTK) return;
        try {
            setUpdatingMK(true);
            await doiMatKhau(selectedTK.id, values.matKhauCu, values.matKhauMoi);
            message.success("Đổi mật khẩu thành công");
            setMatKhauModal(false);
        } catch (err: any) {
            message.error(err?.response?.data?.message || "Lỗi khi đổi mật khẩu");
        } finally {
            setUpdatingMK(false);
        }
    };
    const columns = [
        {
            title: "Tên đăng nhập",
            dataIndex: "tenDangNhap",
            key: "tenDangNhap",
            render: (text: string) => (
                <div className="flex items-center gap-2">
                    <UserOutlined className="text-blue-400" />
                    <span className="font-mono font-semibold text-slate-700">{text}</span>
                </div>
            ),
        },
        {
            title: "Họ và tên",
            dataIndex: "hoVaTen",
            key: "hoVaTen",
            render: (text: string) => (
                <span className="font-medium text-slate-800">{text ?? "—"}</span>
            ),
        },
        {
            title: "Vai trò",
            dataIndex: "vaiTro",
            key: "vaiTro",
            width: 150,
            render: (vaiTro: string) => {
                const info = VAI_TRO_MAP[vaiTro] ?? { label: vaiTro, color: "default" };
                return (
                    <Tag color={info.color} className="font-medium">
                        {info.label}
                    </Tag>
                );
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "trangThai",
            key: "trangThai",
            width: 130,
            render: (trangThai: number) => (
                trangThai === 1
                    ? <Badge status="success" text={<span className="text-green-600 font-medium">Hoạt động</span>} />
                    : <Badge status="error"   text={<span className="text-red-500 font-medium">Đã khoá</span>} />
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            width: 150,
            fixed: "right" as const,
            render: (_: unknown, record: TaiKhoan) => (
                <Space size="small">
                    {/* Phân quyền */}
                    <Tooltip title="Phân quyền">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            className="text-blue-600 hover:bg-blue-50"
                            onClick={() => openVaiTroModal(record)}
                        />
                    </Tooltip>

                    {/* Đổi mật khẩu */}
                    <Tooltip title="Đổi mật khẩu">
                        <Button
                            type="text"
                            icon={<KeyOutlined />}
                            className="text-amber-500 hover:bg-amber-50"
                            onClick={() => openMatKhauModal(record)}
                        />
                    </Tooltip>

                    {/* Khoá / Mở khoá */}
                    <Tooltip title={record.trangThai === 1 ? "Khoá tài khoản" : "Mở khoá"}>
                        <Popconfirm
                            title={record.trangThai === 1 ? "Khoá tài khoản này?" : "Mở khoá tài khoản này?"}
                            description={
                                record.trangThai === 1
                                    ? "Tài khoản sẽ không thể đăng nhập."
                                    : "Tài khoản sẽ được phép đăng nhập lại."
                            }
                            onConfirm={() => handleToggleTrangThai(record)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                            okButtonProps={{ danger: record.trangThai === 1 }}
                        >
                            <Button
                                type="text"
                                icon={record.trangThai === 1 ? <LockOutlined /> : <UnlockOutlined />}
                                danger={record.trangThai === 1}
                                className={record.trangThai !== 1 ? "text-green-600 hover:bg-green-50" : "hover:bg-red-50"}
                                loading={togglingId === record.id}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <Card
                title={
                    <div className="flex items-center gap-2">
                       
                        <span className="font-semibold">Quản lý tài khoản</span>
                    </div>
                }
                className="shadow-sm rounded-xl"
            >
                <Table
                    columns={columns}
                    dataSource={danhSach}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                    scroll={{ x: 800 }}
                    rowClassName={(record) =>
                        record.trangThai === 0 ? "opacity-60" : ""
                    }
                />
            </Card>

            {/* Modal phân quyền */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                      
                        <span>Phân quyền — <span className="font-mono text-blue-600">{selectedTK?.tenDangNhap}</span></span>
                    </div>
                }
                open={vaiTroModal}
                onCancel={() => setVaiTroModal(false)}
                footer={null}
                destroyOnClose
            >
                <Form form={vaiTroForm} layout="vertical" onFinish={handleUpdateVaiTro} className="mt-4">
                    <Form.Item
                        label="Vai trò"
                        name="vaiTro"
                        rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
                    >
                        <Select size="large" placeholder="Chọn vai trò">
                            {VALID_ROLES.map((role) => (
                                <Select.Option key={role} value={role}>
                                    <Tag color={VAI_TRO_MAP[role]?.color ?? "default"}>
                                        {VAI_TRO_MAP[role]?.label ?? role}
                                    </Tag>
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button onClick={() => setVaiTroModal(false)}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={updatingVaiTro}
                            icon={<CheckCircleOutlined />}>
                            Cập nhật
                        </Button>
                    </div>
                </Form>
            </Modal>

            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <KeyOutlined className="text-amber-500" />
                        <span>Đổi mật khẩu — <span className="font-mono text-blue-600">{selectedTK?.tenDangNhap}</span></span>
                    </div>
                }
                open={matKhauModal}
                onCancel={() => setMatKhauModal(false)}
                footer={null}
                destroyOnClose
            >
                <Form form={matKhauForm} layout="vertical" onFinish={handleDoiMatKhau} className="mt-4">
                    <Form.Item
                        label="Mật khẩu hiện tại"
                        name="matKhauCu"
                        rules={[{ required: true, message: "Nhập mật khẩu hiện tại" }]}
                    >
                        <Input.Password size="large" placeholder="Mật khẩu hiện tại"
                            prefix={<LockOutlined className="text-slate-400" />} />
                    </Form.Item>
                    <Form.Item
                        label="Mật khẩu mới"
                        name="matKhauMoi"
                        rules={[
                            { required: true, message: "Nhập mật khẩu mới" },
                            { min: 6, message: "Tối thiểu 6 ký tự" },
                        ]}
                    >
                        <Input.Password size="large" placeholder="Mật khẩu mới"
                            prefix={<KeyOutlined className="text-slate-400" />} />
                    </Form.Item>
                    <Form.Item
                        label="Xác nhận mật khẩu mới"
                        name="xacNhanMatKhau"
                        dependencies={["matKhauMoi"]}
                        rules={[
                            { required: true, message: "Xác nhận mật khẩu mới" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("matKhauMoi") === value)
                                        return Promise.resolve();
                                    return Promise.reject("Mật khẩu xác nhận không khớp");
                                },
                            }),
                        ]}
                    >
                        <Input.Password size="large" placeholder="Nhập lại mật khẩu mới"
                            prefix={<StopOutlined className="text-slate-400" />} />
                    </Form.Item>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button onClick={() => setMatKhauModal(false)}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={updatingMK}
                            icon={<CheckCircleOutlined />}>
                            Đổi mật khẩu
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default TaiKhoanPage;