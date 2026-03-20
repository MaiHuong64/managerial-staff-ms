import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Table, Button, Tag, message, Input } from "antd";
import { PlusOutlined, EyeOutlined } from "@ant-design/icons";
import axiosClient from "../../utils/AxiosClient";
import CreateBatchModal from "./CreateBatchModal";

const { Search } = Input;

interface BatchData {
    id: number;
    ma_dot_bo_nhiem: string;
    ten_dot_bo_nhiem: string;
    trang_thai: number;
    so_luong_de_xuat: number;
    ten_chuc_danh: string;
    ten_don_vi: string;
}

const STATE_MAP: Record<number, { label: string; color: string }> = {
    1: { label: "Đang soạn thảo", color: "default" },
    2: { label: "Chờ hội nghị vòng 1", color: "warning" },
    3: { label: "Chờ hội nghị vòng 2", color: "processing" },
    4: { label: "Chờ hội nghị cán bộ chủ chốt", color: "processing" },
    5: { label: "Chờ hội nghị vòng cuối", color: "processing" },
    6: { label: "Chờ xử lý hòa phiếu", color: "warning" },
    7: { label: "Hoàn thành", color: "success" },
    0: { label: "Đã hủy", color: "error" },
};

export const AppointmentList: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<BatchData[]>([]);
    const [loading, setLoading] = useState(true);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [searchText, setSearchText] = useState("");

    const fetchBatches = async () => {
        try {
            setLoading(true);
            const result = await axiosClient.get('/appointments');
            if (result.data.success) {
                setData(result.data.data);
            }
        } catch (error) {
            message.error("Không thể tải danh sách đợt bổ nhiệm");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBatches();
    }, []);

    const handleCreateSuccess = () => {
        fetchBatches();
        message.success("Tạo đợt bổ nhiệm thành công!");
    };

    const handleViewDetail = (id: number) => {
        navigate(`/appointments/${id}`);
    };

    const filteredData = data.filter(item =>
        item.ma_dot_bo_nhiem.toLowerCase().includes(searchText.toLowerCase()) ||
        item.ten_dot_bo_nhiem.toLowerCase().includes(searchText.toLowerCase()) ||
        item.ten_chuc_danh.toLowerCase().includes(searchText.toLowerCase()) ||
        item.ten_don_vi.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: "Mã đợt",
            dataIndex: "ma_dot_bo_nhiem",
            key: "ma_dot_bo_nhiem",
            width: 120,
            render: (text: string, record: BatchData) => (
                <Button
                    type="link"
                    onClick={() => handleViewDetail(record.id)}
                    style={{ padding: 0 }}
                >
                    {text}
                </Button>
            )
        },
        {
            title: "Tên đợt bổ nhiệm",
            dataIndex: "ten_dot_bo_nhiem",
            key: "ten_dot_bo_nhiem",
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
            title: "Trạng thái",
            dataIndex: "trang_thai",
            key: "trang_thai",
            width: 150,
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
            width: 100,
            render: (_: any, record: BatchData) => (
                <Button
                    type="primary"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetail(record.id)}
                >
                    Chi tiết
                </Button>
            )
        }
    ];

    return (
        <div className="p-6">
            <Card
                title="Danh sách đợt bổ nhiệm"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setCreateModalVisible(true)}
                    >
                        Tạo đợt bổ nhiệm
                    </Button>
                }
            >
                <div className="mb-4">
                    <Search
                        placeholder="Tìm kiếm theo mã, tên, chức danh, đơn vị..."
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
                            `Hiển thị ${range[0]}-${range[1]} của ${total} đợt bổ nhiệm`
                    }}
                    scroll={{ x: 1000 }}
                />
            </Card>

            <CreateBatchModal
                visible={createModalVisible}
                onCancel={() => setCreateModalVisible(false)}
                onSuccess={handleCreateSuccess}
            />
        </div>
    );
};

export default AppointmentList;
