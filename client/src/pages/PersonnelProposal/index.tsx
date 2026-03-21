import type React from "react";
import { useEffect, useState } from "react";
import { Card, Table, Button, Tag, message, Input, Modal, Space } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axiosClient from "../../utils/AxiosClient";
import PersonnelProposalModal from "./PersonnelProposalModal";
import type { DotBoNhiem } from "../../types/BoNhiem";

const { Search } = Input;

interface PersonnelProposal {
    id: number;
    so_to_trinh: string;
    ngay_to_trinh: string;
    trang_thai: number;
    so_luong_ung_vien: number;
    ghi_chu: string;
    created_at: string;
}

const STATE_MAP: Record<number, { label: string; color: string }> = {
    0: { label: "Nháp", color: "default" },
    1: { label: "Đã trình", color: "processing" },
    2: { label: "Đã phê duyệt", color: "success" },
    3: { label: "Đã từ chối", color: "error" }
};

export const PersonnelProposalPage: React.FC = () => {
    const [data, setData] = useState<PersonnelProposal[]>([]);
    const [availableBatches, setAvailableBatches] = useState<DotBoNhiem[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [editingProposal, setEditingProposal] = useState<PersonnelProposal | null>(null);

    const fetchProposals = async () => {
        try {
            setLoading(true);
            const result = await axiosClient.get('/personnel-proposals');
            if (result.data.success) {
                setData(result.data.data);
            }
        } catch (error) {
            message.error("Không thể tải danh sách phương án nhân sự");
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableBatches = async () => {
        try {
            const result = await axiosClient.get('/appointments/available-for-proposal');
            if (result.data.success) {
                setAvailableBatches(result.data.data);
            }
        } catch (error) {
            console.error("Không thể tải danh sách đợt bổ nhiệm:", error);
        }
    };

    useEffect(() => {
        fetchProposals();
        fetchAvailableBatches();
    }, []);

    const handleCreateSuccess = () => {
        fetchProposals();
        message.success("Tạo phương án nhân sự thành công!");
        setModalVisible(false);
    };

    const handleEdit = (record: PersonnelProposal) => {
        setEditingProposal(record);
        setModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        Modal.confirm({
            title: "Xác nhận xóa",
            content: "Bạn có chắc chắn muốn xóa phương án nhân sự này?",
            onOk: async () => {
                try {
                    await axiosClient.delete(`/personnel-proposals/${id}`);
                    message.success("Xóa phương án nhân sự thành công!");
                    fetchProposals();
                } catch (error) {
                    message.error("Không thể xóa phương án nhân sự");
                }
            }
        });
    };

    const filteredData = data.filter(item =>
        item.so_to_trinh.toLowerCase().includes(searchText.toLowerCase()) ||
        item.ghi_chu.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: "Số tờ trình",
            dataIndex: "so_to_trinh",
            key: "so_to_trinh",
            width: 150,
        },
        {
            title: "Ngày tờ trình",
            dataIndex: "ngay_to_trinh",
            key: "ngay_to_trinh",
            width: 120,
            render: (date: string) => date ? new Date(date).toLocaleDateString('vi-VN') : ''
        },
        {
            title: "Số ứng viên",
            dataIndex: "so_luong_ung_vien",
            key: "so_luong_ung_vien",
            width: 120,
            render: (value: number) => (
                <Tag color="blue">{value || 0}</Tag>
            )
        },
        {
            title: "Trạng thái",
            dataIndex: "trang_thai",
            key: "trang_thai",
            width: 120,
            render: (status: number) => {
                const state = STATE_MAP[status];
                if (!state) return <Tag>Không xác định ({status})</Tag>;
                return <Tag color={state.color}>{state.label}</Tag>;
            }
        },
        {
            title: "Ghi chú",
            dataIndex: "ghi_chu",
            key: "ghi_chu",
            width: 200,
            ellipsis: true,
        },
        {
            title: "Ngày tạo",
            dataIndex: "created_at",
            key: "created_at",
            width: 120,
            render: (date: string) => date ? new Date(date).toLocaleDateString('vi-VN') : ''
        },
        {
            title: "Thao tác",
            key: "actions",
            width: 150,
            render: (_: unknown, record: PersonnelProposal) => (
                <Space>
                    <Button
                        type="primary"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        disabled={record.trang_thai !== 0}
                    >
                        Sửa
                    </Button>
                    <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.id)}
                        disabled={record.trang_thai !== 0}
                    >
                        Xóa
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div className="p-6">
            <Card title="Quản lý phương án nhân sự" extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
                        Tạo phương án
                    </Button>
                }
            >
                <div className="mb-4">
                    <Search
                        placeholder="Tìm kiếm theo số tờ trình, ghi chú..."
                        allowClear
                        enterButton="Tìm kiếm"
                        size="large"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 400 }}
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => 
                            `Hiển thị ${range[0]}-${range[1]} của ${total} phương án`
                    }}
                    scroll={{ x: 1200 }}
                />
            </Card>

            <PersonnelProposalModal
                visible={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    setEditingProposal(null);
                }}
                onSuccess={handleCreateSuccess}
                availableBatches={availableBatches}
                editingProposal={editingProposal}
            />
        </div>
    );
};

export default PersonnelProposalPage;
