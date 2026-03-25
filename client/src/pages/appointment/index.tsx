import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Card, Table, Button, Tag, message, Input, Statistic, Row, Col, 
    Select, Space
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import axiosClient from "../../utils/AxiosClient";
import CreateBatchModal from "./CreateBatchModal";

const { Search } = Input;
const { Option } = Select;

interface BatchData {
    id: number;
    ma_dot_bo_nhiem: string;
    ten_dot_bo_nhiem: string;
    trang_thai: number;
    so_luong_thuc_te: number;
}

const STATE_MAP: Record<number, { label: string; color: string }> = {
    0: { label: "Đã dừng", color: "error" },
    1: { label: "Đang soạn thảo", color: "default" },
    2: { label: "Hội nghị lãnh đạo (vòng 1)", color: "processing" },
    3: { label: "Hội nghị lãnh đạo (vòng 2)", color: "processing" },
    4: { label: "Hội nghị cán bộ chủ chốt", color: "processing" },
    5: { label: "Hội nghị lãnh đạo (vòng cuối)", color: "processing" },
    6: { label: "Ghi nhận kết quả", color: "success" },
};

export const AppointmentPage: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<BatchData[]>([]);
    const [loading, setLoading] = useState(true);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [filterStatus, setFilterStatus] = useState<number | null>(null);

    // Thống kê dữ liệu
    const statistics = useMemo(() => {
        const total = data.length;
        const completed = data.filter(item => item.trang_thai === 6).length;
        const inProgress = data.filter(item => item.trang_thai >= 2 && item.trang_thai <= 5).length;
        const drafting = data.filter(item => item.trang_thai === 1).length;
        
        return { total, completed, inProgress, drafting };
    }, [data]);

    // Lấy dữ liệu từ API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axiosClient.get('/appointments');
                setData(response.data.data || []);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
                message.error("Không thể tải dữ liệu đợt bổ nhiệm");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Lọc dữ liệu
    const filteredData = useMemo(() => {
        return data.filter(item => {
            const matchesSearch = 
                item.ma_dot_bo_nhiem.toLowerCase().includes(searchText.toLowerCase()) ||
                item.ten_dot_bo_nhiem.toLowerCase().includes(searchText.toLowerCase())
        
            const matchesFilter = filterStatus === null || item.trang_thai === filterStatus;
        
            return matchesSearch && matchesFilter;
        });
    }, [data, searchText, filterStatus]);

    const columns = [
        {
            title: "Tên đợt bổ nhiệm",
            dataIndex: "ten_dot_bo_nhiem",
            key: "ten_dot_bo_nhiem",
            width: 280,
            render: (text: string, record: BatchData) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div>
                        <div style={{ fontWeight: 'bold', color: '#262626' }}>{text}</div>
                        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.ma_dot_bo_nhiem}</div>
                    </div>
                </div>
            )
        },
        {
            title: "Số ứng viên",
            dataIndex: "so_ung_vien",
            key: "so_ung_vien",
            width: 120,
            render: (value: number) => (
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>{value || 0}</div>
                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>ứng viên</div>
                </div>
            )
        },
        {
            title: "Trạng thái",
            dataIndex: "trang_thai",
            key: "trang_thai",
            width: 200,
            render: (status: number) => {
                const state = STATE_MAP[status];
                if (!state) return <Tag>Không xác định ({status})</Tag>;
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Tag color={state.color} style={{ borderRadius: '16px' }}>
                            {state.label}
                        </Tag>
                    </div>
                );
            }
        },
        {
            title: "Thao tác",
            key: "actions",
            width: 120,
            render: (_: unknown, record: BatchData) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Button
                        type="primary"
                        size="small"
                        onClick={() => handleViewDetail(record.id)}
                    >
                        Xem chi tiết
                    </Button>
                </div>
            )
        }
    ];

    const handleViewDetail = (id: number) => {
        navigate(`/appointments/${id}`);
    };

    const handleCreateSuccess = () => {
        setCreateModalVisible(false);
        // Refresh data
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axiosClient.get('/appointments');
                setData(response.data.data || []);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
                message.error("Không thể tải dữ liệu đợt bổ nhiệm");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header Statistics */}
            <Row gutter={16} style={{ marginBottom: '24px' }}>
                <Col span={6}>
                    <Card style={{ textAlign: 'center' }}>
                        <Statistic
                            title="Tổng số đợt"
                            value={statistics.total}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card style={{ textAlign: 'center' }}>
                        <Statistic
                            title="Đang soạn thảo"
                            value={statistics.drafting}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card style={{ textAlign: 'center' }}>
                        <Statistic
                            title="Đang thực hiện"
                            value={statistics.inProgress}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card style={{ textAlign: 'center' }}>
                        <Statistic
                            title="Hoàn thành"
                            value={statistics.completed}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Table */}
            <Card 
                title="Danh sách đợt bổ nhiệm"
                extra={
                    <Space>
                        <Search
                            placeholder="Tìm kiếm theo tên hoặc mã đợt"
                            allowClear
                            style={{ width: 300 }}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        <Select
                            placeholder="Lọc theo trạng thái"
                            allowClear
                            style={{ width: 200 }}
                            onChange={(value) => setFilterStatus(value)}
                        >
                            <Option value={1}>Đang soạn thảo</Option>
                            <Option value={2}>Hội nghị (vòng 1)</Option>
                            <Option value={3}>Hội nghị (vòng 2)</Option>
                            <Option value={4}>Hội nghị cán bộ chủ chốt</Option>
                            <Option value={5}>Hội nghị (vòng cuối)</Option>
                            <Option value={6}>Hoàn thành</Option>
                            <Option value={0}>Đã dừng</Option>
                        </Select>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setCreateModalVisible(true)}
                        >
                            Tạo đợt mới
                        </Button>
                    </Space>
                }
            >
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => 
                            `Hiển thị ${range[0]}-${range[1]} của ${total} đợt bổ nhiệm`
                    }}
                    scroll={{ x: 800 }}
                />
            </Card>

            {/* Create Modal */}
            <CreateBatchModal
                visible={createModalVisible}
                onCancel={() => setCreateModalVisible(false)}
                onSuccess={handleCreateSuccess}
            />
        </div>
    );
};

export default AppointmentPage;
