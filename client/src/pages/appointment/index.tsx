import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
    Card, Table, Button, Tag, message, Input, Statistic, Row, Col, 
    Tooltip, Dropdown, Avatar, Select, Space
} from "antd";
import { 
    PlusOutlined, EyeOutlined, SearchOutlined, FilterOutlined, 
    MoreOutlined, HomeOutlined,
    CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined,
    FileTextOutlined, EditOutlined, DeleteOutlined
} from "@ant-design/icons";
import axiosClient from "../../utils/AxiosClient";
import CreateBatchModal from "./CreateBatchModal";
import axios from "axios";

const { Search } = Input;
const { Option } = Select;

interface BatchData {
    id: number;
    ma_dot_bo_nhiem: string;
    ten_dot_bo_nhiem: string;
    trang_thai: number;
    so_luong_de_xuat: number;
    so_luong_thuc_te: number;
    ten_chuc_danh: string;
    ten_don_vi: string;
}

const STATE_MAP: Record<number, { label: string; color: string; icon: React.ReactNode }> = {
    0: { label: "Đã dừng", color: "error", icon: <ExclamationCircleOutlined /> },
    1: { label: "Đang soạn thảo", color: "default", icon: <EditOutlined /> },
    2: { label: "Hội nghị lãnh đạo (vòng 1)", color: "processing", icon: <ClockCircleOutlined /> },
    3: { label: "Hội nghị lãnh đạo (vòng 2)", color: "processing", icon: <ClockCircleOutlined /> },
    4: { label: "Hội nghị cán bộ chủ chốt", color: "processing", icon: <ClockCircleOutlined /> },
    5: { label: "Hội nghị lãnh đạo (vòng cuối)", color: "processing", icon: <ClockCircleOutlined /> },
    6: { label: "Ghi nhận kết quả", color: "success", icon: <CheckCircleOutlined /> },
};

export const AppointmentPage: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<BatchData[]>([]);
    const [loading, setLoading] = useState(true);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [filterStatus, setFilterStatus] = useState<number | null>(null);
    const location = useLocation();

    // Thống kê dữ liệu
    const statistics = useMemo(() => {
        const total = data.length;
        const completed = data.filter(item => item.trang_thai === 6).length;
        const inProgress = data.filter(item => item.trang_thai >= 2 && item.trang_thai <= 5).length;
        const draft = data.filter(item => item.trang_thai === 1).length;
        const stopped = data.filter(item => item.trang_thai === 0).length;
        
        return { total, completed, inProgress, draft, stopped };
    }, [data]);

    const fetchBatches = async () => {
        try {
            setLoading(true);
            console.log("fetchBatches đang chạy...")
            const result = await axiosClient.get('/appointments');
            console.log("Raw data từ API:", result.data.data);
            console.log("trang_thai sample:", result.data.data[0]?.trang_thai, typeof result.data.data[0]?.trang_thai)
            if (result.data.success) {
                const normalized = result.data.data.map((item: BatchData) => ({
                ...item,
                trang_thai: Number(item.trang_thai),
                so_luong_thuc_te: Number(item.so_luong_thuc_te),
            }));
            setData(normalized);
            }
        }  catch (error) {
            if (axios.isAxiosError(error)) {
                message.error(error.response?.data?.message || "...");
            } else {
                message.error("Không thể bắt đầu quy trình bỏ phiếu");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBatches();
    }, [location]);

    const handleCreateSuccess = () => {
        fetchBatches();
        message.success("Tạo đợt bổ nhiệm thành công!");
    };

    const handleViewDetail = (id: number) => {
        navigate(`/appointments/${id}`);
    };

   const filteredData = useMemo(() => 
    data.filter(item => {
        const matchesSearch = 
            item.ma_dot_bo_nhiem.toLowerCase().includes(searchText.toLowerCase()) ||
            item.ten_dot_bo_nhiem.toLowerCase().includes(searchText.toLowerCase()) ||
            item.ten_chuc_danh.toLowerCase().includes(searchText.toLowerCase()) ||
            item.ten_don_vi.toLowerCase().includes(searchText.toLowerCase());
        
        const matchesFilter = filterStatus === null || item.trang_thai === filterStatus;
        
        return matchesSearch && matchesFilter;
    }), [data, searchText, filterStatus]
);

    const columns = [
        {
            title: "Tên đợt bổ nhiệm",
            dataIndex: "ten_dot_bo_nhiem",
            key: "ten_dot_bo_nhiem",
            width: 280,
            render: (text: string, record: BatchData) => (
                <div className="flex items-center space-x-3">
                    <Avatar 
                        size="small" 
                        icon={<FileTextOutlined />}
                        className="bg-blue-100 text-blue-600"
                    />
                    <div>
                        <div className="font-medium text-gray-900">{text}</div>
                        <div className="text-xs text-gray-500">{record.ma_dot_bo_nhiem}</div>
                    </div>
                </div>
            )
        },
        {
            title: "Chức danh",
            dataIndex: "ten_chuc_danh",
            key: "ten_chuc_danh",
            width: 180,
            render: (text: string) => (
                <Tag color="purple" className="rounded-full">
                    {text}
                </Tag>
            )
        },
        {
            title: "Đơn vị",
            dataIndex: "ten_don_vi",
            key: "ten_don_vi",
            width: 180,
            render: (text: string) => (
                <div className="flex items-center space-x-2">
                    <HomeOutlined className="text-gray-400" />
                    <span>{text}</span>
                </div>
            )
        },
        {
            title: "Số lượng",
            dataIndex: "so_luong_thuc_te",
            key: "so_luong_thuc_te",
            width: 120,
            render: (value: number, record: BatchData) => (
                <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">{value || 0}</div>
                    <div className="text-xs text-gray-500">/{record.so_luong_de_xuat}</div>
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
                    <div className="flex items-center space-x-2">
                        <span className={`text-${state.color === 'success' ? 'green' : state.color === 'error' ? 'red' : state.color === 'processing' ? 'blue' : 'gray'}-500`}>
                            {state.icon}
                        </span>
                        <Tag color={state.color} className="rounded-full">
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
                <div className="flex items-center space-x-2">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="primary"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetail(record.id)}
                            className="bg-blue-500 hover:bg-blue-600"
                        />
                    </Tooltip>
                    <Dropdown
                        menu={{
                            items: [
                                {
                                    key: 'edit',
                                    icon: <EditOutlined />,
                                    label: 'Chỉnh sửa',
                                    disabled: record.trang_thai !== 1
                                },
                                {
                                    key: 'delete',
                                    icon: <DeleteOutlined />,
                                    label: 'Xóa',
                                    danger: true,
                                    disabled: record.trang_thai !== 1
                                }
                            ]
                        }}
                        trigger={['click']}
                    >
                        <Button size="small" icon={<MoreOutlined />} />
                    </Dropdown>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header Statistics */}
            <Row gutter={16} className="mb-6">
                <Col span={6}>
                    <Card className="text-center">
                        <Statistic
                            title="Tổng số đợt"
                            value={statistics.total}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card className="text-center">
                        <Statistic
                            title="Hoàn thành"
                            value={statistics.completed}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card className="text-center">
                        <Statistic
                            title="Đang thực hiện"
                            value={statistics.inProgress}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card className="text-center">
                        <Statistic
                            title="Nháp"
                            value={statistics.draft}
                            prefix={<EditOutlined />}
                            valueStyle={{ color: '#8c8c8c' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Main Content */}
            <Card 
                title={
                    <div className="flex items-center space-x-3">
                        <FileTextOutlined className="text-blue-500" />
                        <span className="text-lg font-semibold">Danh sách đợt bổ nhiệm</span>
                    </div>
                } 
                extra={
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={() => setCreateModalVisible(true)}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 border-0 hover:from-blue-600 hover:to-blue-700"
                    >
                        Tạo đợt bổ nhiệm
                    </Button>
                }
                className="shadow-lg"
            >
                {/* Search and Filter */}
                <div className="mb-6">
                    <Row gutter={16} align="middle">
                        <Col flex="auto">
                            <Search
                                placeholder="Tìm kiếm theo mã, tên, chức danh, đơn vị..."
                                allowClear
                                enterButton={<SearchOutlined />}
                                size="large"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="w-full"
                            />
                        </Col>
                        <Col>
                            <Space>
                                <Select
                                    placeholder="Lọc theo trạng thái"
                                    allowClear
                                    size="large"
                                    value={filterStatus}
                                    onChange={setFilterStatus}
                                    style={{ width: 200 }}
                                    suffixIcon={<FilterOutlined />}
                                >
                                    <Option value={0}>
                                        <Space>
                                            <ExclamationCircleOutlined className="text-red-500" />
                                            Đã dừng
                                        </Space>
                                    </Option>
                                    <Option value={1}>
                                        <Space>
                                            <EditOutlined className="text-gray-500" />
                                            Đang soạn thảo
                                        </Space>
                                    </Option>
                                    <Option value={2}>
                                        <Space>
                                            <ClockCircleOutlined className="text-blue-500" />
                                            Hội nghị lãnh đạo (vòng 1)
                                        </Space>
                                    </Option>
                                    <Option value={3}>
                                        <Space>
                                            <ClockCircleOutlined className="text-blue-500" />
                                            Hội nghị lãnh đạo (vòng 2)
                                        </Space>
                                    </Option>
                                    <Option value={4}>
                                        <Space>
                                            <ClockCircleOutlined className="text-blue-500" />
                                            Hội nghị cán bộ chủ chốt
                                        </Space>
                                    </Option>
                                    <Option value={5}>
                                        <Space>
                                            <ClockCircleOutlined className="text-blue-500" />
                                            Hội nghị lãnh đạo (vòng cuối)
                                        </Space>
                                    </Option>
                                    <Option value={6}>
                                        <Space>
                                            <CheckCircleOutlined className="text-green-500" />
                                            Ghi nhận kết quả
                                        </Space>
                                    </Option>
                                </Select>
                            </Space>
                        </Col>
                    </Row>
                </div>

                {/* Table */}
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
                            `Hiển thị ${range[0]}-${range[1]} của ${total} đợt bổ nhiệm`,
                        className: "mt-4"
                    }}
                    scroll={{ x: 1200 }}
                    className="rounded-lg"
                    rowClassName={(record) => 
                        record.trang_thai === 6 ? 'bg-green-50' : 
                        record.trang_thai === 0 ? 'bg-red-50' : ''
                    }
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

export default AppointmentPage;
