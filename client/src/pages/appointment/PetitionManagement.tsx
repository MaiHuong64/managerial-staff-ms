import type React from "react";
import { useEffect, useState } from "react";
import { Card, Table, Button, Tag, message, Input, DatePicker, Select, Form, Modal } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import axiosClient from "../../utils/AxiosClient";

interface Petition {
    id: number;
    ma_phieu: string;
    so_to_trinh_chu_truong: string;
    tieu_de: string;
    so_luong_de_xuat: number;
    nguon_nhan_su: number;
    ngay_lap: string;
    ten_chuc_danh: string;
    ten_don_vi: string;
    nguoi_lap_ten: string;
    trang_thai: number;
}

interface CreatePetitionModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: (values: any) => void;
    editingPetition?: Petition | null;
}

const { Option } = Select;

const STATE_MAP: Record<number, { label: string; color: string }> = {
    1: { label: "Soạn thảo", color: "default" },
    2: { label: "Đã trình ký", color: "warning" },
    3: { label: "Đã duyệt", color: "success" },
    0: { label: "Đã hủy", color: "error" },
};

export const PetitionManagement: React.FC = () => {
    const [data, setData] = useState<Petition[]>([]);
    const [loading, setLoading] = useState(true);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [editingPetition, setEditingPetition] = useState<Petition | null>(null);
    const [form] = Form.useForm();

    const fetchPetitions = async () => {
        try {
            setLoading(true);
            const result = await axiosClient.get('/petitions');
            if (result.data.success) {
                setData(result.data.data);
            }
        } catch (error) {
            message.error("Không thể tải danh sách phiếu chủ trưởng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPetitions();
    }, []);

    const handleCreate = () => {
        setEditingPetition(null);
        setCreateModalVisible(true);
        form.resetFields();
    };

    const handleEdit = (petition: Petition) => {
        setEditingPetition(petition);
        setCreateModalVisible(true);
        form.setFieldsValue({
            ...petition,
            ngay_lap: dayjs(petition.ngay_lap)
        });
    };

    const handleDelete = async (id: number) => {
        try {
            await axiosClient.delete(`/petitions/${id}`);
            message.success("Xóa phiếu chủ trưởng thành công!");
            fetchPetitions();
        } catch (error) {
            message.error("Không thể xóa phiếu chủ trưởng");
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            if (editingPetition) {
                await axiosClient.put(`/petitions/${editingPetition.id}`, values);
                message.success("Cập nhật phiếu chủ trưởng thành công!");
            } else {
                await axiosClient.post('/petitions', values);
                message.success("Tạo phiếu chủ trưởng thành công!");
            }
            setCreateModalVisible(false);
            setEditingPetition(null);
            form.resetFields();
            fetchPetitions();
        } catch (error: any) {
            message.error(error.response?.data?.message || "Lỗi khi lưu phiếu chủ trưởng");
        }
    };

    const handleCancel = () => {
        setCreateModalVisible(false);
        setEditingPetition(null);
        form.resetFields();
    };

    const columns = [
        {
            title: "Mã phiếu",
            dataIndex: "ma_phieu",
            key: "ma_phieu",
            width: 120,
        },
        {
            title: "Tiêu đề",
            dataIndex: "tieu_de",
            key: "tieu_de",
            width: 250,
        },
        {
            title: "Chức danh",
            dataIndex: "ten_chuc_danh",
            key: "ten_chuc_danh",
            width: 150,
        },
        {
            title: "Đơn vị",
            dataIndex: "ten_don_vi",
            key: "ten_don_vi",
            width: 150,
        },
        {
            title: "Số lượng đề xuất",
            dataIndex: "so_luong_de_xuat",
            key: "so_luong_de_xuat",
            width: 120,
            render: (value: number) => (
                <Tag color="blue">{value}</Tag>
            )
        },
        {
            title: "Ngày lập",
            dataIndex: "ngay_lap",
            key: "ngay_lap",
            width: 120,
            render: (date: string) => dayjs(date).format('DD/MM/YYYY')
        },
        {
            title: "Trạng thái",
            dataIndex: "trang_thai",
            key: "trang_thai",
            width: 120,
            render: (status: number) => {
                const state = STATE_MAP[status];
                return (
                    <Tag color={state?.color || "default"}>
                        {state?.label || "Không xác định"}
                    </Tag>
                );
            }
        },
        {
            title: "Thao tác",
            key: "actions",
            width: 150,
            render: (_: any, record: Petition) => (
                <div className="flex gap-2">
                    <Button
                        type="primary"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Button
                        type="primary"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.id)}
                    >
                        Xóa
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6">
            <Card
                title="Quản lý phiếu chủ trưởng"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                    >
                        Tạo phiếu mới
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => 
                            `Hiển thị ${range[0]}-${range[1]} của ${total} phiếu`
                    }}
                    scroll={{ x: 1200 }}
                />
            </Card>

            <CreatePetitionModal
                visible={createModalVisible}
                onCancel={handleCancel}
                onSuccess={handleSubmit}
                editingPetition={editingPetition}
                form={form}
            />
        </div>
    );
};

// Modal component
const CreatePetitionModal: React.FC<CreatePetitionModalProps> = ({
    visible, onCancel, onSuccess, editingPetition
}) => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            const submitData = {
                ...values,
                ngay_lap: values.ngay_lap.format('YYYY-MM-DD'),
                nguon_nhan_su: values.nguon_nhan_su || 0,
                trang_thai: 1 // Soạn thảo
            };

            await onSuccess(submitData);
        } catch (error) {
            console.error("Lỗi khi lưu phiếu:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={editingPetition ? "Cập nhật phiếu chủ trưởng" : "Tạo phiếu chủ trưởng mới"}
            open={visible}
            onCancel={onCancel}
            width={800}
            footer={null}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    ngay_lap: dayjs(),
                    trang_thai: 1
                }}
            >
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        label="Mã phiếu"
                        name="ma_phieu"
                        rules={[{ required: true, message: 'Vui lòng nhập mã phiếu' }]}
                    >
                        <Input placeholder="Nhập mã phiếu" />
                    </Form.Item>

                    <Form.Item
                        label="Số tờ trình chủ trưởng"
                        name="so_to_trinh_chu_truong"
                        rules={[{ required: true, message: 'Vui lòng nhập số tờ trình' }]}
                    >
                        <Input placeholder="Nhập số tờ trình chủ trưởng" />
                    </Form.Item>
                </div>

                <Form.Item
                    label="Tiêu đề"
                    name="tieu_de"
                    rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                >
                    <Input placeholder="Nhập tiêu đề phiếu" />
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        label="Số lượng đề xuất"
                        name="so_luong_de_xuat"
                        rules={[{ required: true, message: 'Vui lòng nhập số lượng đề xuất' }]}
                    >
                        <Input 
                            type="number" 
                            placeholder="Nhập số lượng đề xuất" 
                            min={1}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Nguồn nhân sự"
                        name="nguon_nhan_su"
                    >
                        <Select placeholder="Chọn nguồn nhân sự">
                            <Option value={1}>Kế hoạch</Option>
                            <Option value={2}>Đề xuất khác</Option>
                            <Option value={3}>Nhu cầu</Option>
                        </Select>
                    </Form.Item>
                </div>

                <Form.Item
                    label="Ngày lập"
                    name="ngay_lap"
                    rules={[{ required: true, message: 'Vui lòng chọn ngày lập' }]}
                >
                    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>

                <div className="flex justify-end gap-2">
                    <Button onClick={onCancel}>
                        Hủy
                    </Button>
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={loading}
                    >
                        {editingPetition ? "Cập nhật" : "Tạo phiếu"}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default PetitionManagement;
