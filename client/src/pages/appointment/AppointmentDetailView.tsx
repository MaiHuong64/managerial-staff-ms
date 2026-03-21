import type React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { ChiTietBoNhiemReq } from "../../types/BoNhiem";
import axiosClient from "../../utils/AxiosClient";
import { 
    Card, message, Spin, Steps, Table, Tag, Button, Alert, Row, Col, Statistic, Progress, Avatar
} from "antd";
import { 
    FormOutlined, PlayCircleOutlined, UserOutlined, HomeOutlined, 
    CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined,
    FileTextOutlined, EditOutlined, TeamOutlined
} from "@ant-design/icons";
import VoteModal from "./VoteModal";

const state: Record<number, { label: string; color: string; badgeStatus: "default" | "warning" | "processing" | "success" | "error" }> = {
    0: { label: "Đã dừng", color: "error", badgeStatus: "error" },
    1: { label: "Đang soạn thảo", color: "default", badgeStatus: "default" },
    2: { label: "Hội nghị lãnh đạo (vòng 1)", color: "processing", badgeStatus: "processing" },
    3: { label: "Hội nghị lãnh đạo (vòng 2)", color: "processing", badgeStatus: "processing" },
    4: { label: "Hội nghị cán bộ chủ chốt", color: "processing", badgeStatus: "processing" },
    5: { label: "Hội nghị lãnh đạo (vòng cuối)", color: "processing", badgeStatus: "processing" },
    6: { label: "Hoàn thành", color: "success", badgeStatus: "success" },
};

const step_index: Record<number, number> = {
    2: 0, 3: 1, 4: 2, 5: 3, 6: 4,
};

const STEP_ITEMS = [
    { title: "Bước 1", description: "Hội nghị tập thể lãnh đạo (vòng 1)" },
    { title: "Bước 2", description: "Hội nghị tập thể lãnh đạo (vòng 2)" },
    { title: "Bước 3", description: "Hội nghị cán bộ chủ chốt" },
    { title: "Bước 4", description: "Hội nghị tập thể lãnh đạo (vòng cuối)" },
    { title: "Hoàn thành", description: "Quy trình bổ nhiệm hoàn tất" },
];

const vote_step_label: Record<number, string> = {
    2: "Hội nghị tập thể lãnh đạo (vòng 1) - Thảo luận và đề xuất danh sách",
    3: "Hội nghị tập thể lãnh đạo (vòng 2) - Lấy phiếu giới thiệu",
    4: "Hội nghị cán bộ chủ chốt - Lấy ý kiến tín nhiệm",
    5: "Hội nghị tập thể lãnh đạo (vòng cuối) - Biểu quyết cuối cùng",
};

export const AppointmentDetailView: React.FC = () => {
    const { id } = useParams();
    const [data, setData] = useState<ChiTietBoNhiemReq | null>(null);
    const [loading, setLoading] = useState(true);
    const [voteModalVisible, setVoteModalVisible] = useState(false);
    const [currentVotingStep, setCurrentVotingStep] = useState<number | null>(null);

    const fetchDetail = async () => {
        try {
            setLoading(true);
            const result = await axiosClient.get(`/appointments/${id}`);
            if (result.data.data) setData(result.data.data);
            else message.error("Không thể lấy dữ liệu đợt bổ nhiệm");
        } catch {
            message.error("Lỗi kết nối tới máy chủ");
        } finally {
            setLoading(false);
        }
    };

    const fetchCurrentStep = async () => {
        try {
            const result = await axiosClient.get(`/appointments/${id}/current-step`);
            setCurrentVotingStep(result.data.data.currentStep);
        } catch {
            // silent
        }
    };

    const handleVoteSuccess = async() => {
        await fetchDetail();
        await fetchCurrentStep();
        message.success("Ghi nhận kết quả bỏ phiếu thành công!");
    };

    const handleStartVoting = async () => {
        try {
            const result = await axiosClient.post(`/appointments/${id}/start-voting`);
            if (result.data.success) {
                message.success(result.data.message);
                fetchDetail();
                fetchCurrentStep();
            }
        } catch {
            message.error( "Không thể bắt đầu quy trình bỏ phiếu");
        }
    };

    useEffect(() => {
        if (id) { fetchDetail(); fetchCurrentStep(); }
    }, [id]);

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <Spin size="large" tip="Đang tải dữ liệu..." />
        </div>
    );
    if (!data?.batchInfo) return (
        <div className="text-center mt-10 text-red-500">Không tìm thấy dữ liệu!</div>
    );

    const { batchInfo, candidates } = data;
    const trangThai = state[batchInfo.trang_thai];
    const stepIndex  = step_index[batchInfo.trang_thai] ?? 0;

    // Hiện nút bắt đầu quy trình ở bước 1 (Đang soạn thảo)
    const canStartVoting = batchInfo.trang_thai === 1;
    // Hiện nút next ở bước 2, 3, 4, 5 (Tất cả các bước hội nghị)
    const canVote = [2, 3, 4, 5].includes(batchInfo.trang_thai);

    const validCandidates = candidates.filter(c => c.trang_thai === 1);
    const passedCandidates = candidates.filter(c => c.trang_thai === 3);
    const failedCandidates = candidates.filter(c => c.trang_thai === 2);
    const invalidCandidates = candidates.filter(c => c.trang_thai === 0);

    const cols = [
        { 
            title: "Mã viên chức", 
            dataIndex: "ma_vien_chuc", 
            key: "ma_vien_chuc",
            render: (text: string) => (
                <div className="flex items-center space-x-2">
                    <Avatar size="small" icon={<UserOutlined />} className="bg-blue-100 text-blue-600" />
                    <span className="font-medium">{text}</span>
                </div>
            )
        },
        { 
            title: "Họ và tên", 
            dataIndex: "ho_va_ten", 
            key: "ho_va_ten",
            render: (text: string) => (
                <div className="font-semibold text-gray-900">{text}</div>
            )
        },
        { 
            title: "Đơn vị", 
            dataIndex: "ten_don_vi", 
            key: "ten_don_vi",
            render: (text: string) => (
                <div className="flex items-center space-x-2">
                    <HomeOutlined className="text-gray-400" />
                    <span>{text}</span>
                </div>
            )
        },
        { 
            title: "Nguồn viên chức", 
            dataIndex: "nguon_vien_chuc",
            key: "nguon_vien_chuc",
            render: (text: string) => (
                <Tag color="geekblue" className="rounded-full">{text}</Tag>
            )
        },
        { 
            title: "Chức vụ hiện tại",
            dataIndex: "ten_chuc_danh", 
            key: "ten_chuc_danh",
            render: (text: string) => (
                <Tag color="purple" className="rounded-full">{text}</Tag>
            )
        },
        {
            title: "Trạng thái",
            dataIndex: "trang_thai",
            key: "trang_thai",
            render: (s: number) => {
                let color = "default";
                let text = "Không xác định";
                let icon = null;
                
                switch(s) {
                    case 1:
                        color = "success";
                        text = "Hợp lệ";
                        icon = <CheckCircleOutlined />;
                        break;
                    case 2:
                        color = "error";
                        text = "Không đạt";
                        icon = <ExclamationCircleOutlined />;
                        break;
                    case 3:
                        color = "processing";
                        text = "Đạt";
                        icon = <CheckCircleOutlined />;
                        break;
                    default:
                        color = "default";
                        text = "Đã loại";
                        icon = <ExclamationCircleOutlined />;
                }
                
                return (
                    <div className="flex items-center space-x-2">
                        <span className={`text-${color === 'success' ? 'green' : color === 'error' ? 'red' : color === 'processing' ? 'blue' : 'gray'}-500`}>
                            {icon}
                        </span>
                        <Tag color={color} className="rounded-full">{text}</Tag>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header Statistics */}
            <Row gutter={16} className="mb-6">
                <Col span={6}>
                    <Card className="text-center">
                        <Statistic
                            title="Tổng ứng viên"
                            value={candidates.length}
                            prefix={<TeamOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card className="text-center">
                        <Statistic
                            title="Hợp lệ"
                            value={validCandidates.length}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card className="text-center">
                        <Statistic
                            title="Đạt"
                            value={passedCandidates.length}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#13c2c2' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card className="text-center">
                        <Statistic
                            title="Không đạt"
                            value={failedCandidates.length}
                            prefix={<ExclamationCircleOutlined />}
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Main Content */}
            <div className="space-y-6">
                {/* Thông tin đợt bổ nhiệm */}
                <Card 
                    title={
                        <div className="flex items-center space-x-3">
                            <FileTextOutlined className="text-blue-500" />
                            <span className="text-lg font-semibold">Thông tin đợt bổ nhiệm</span>
                        </div>
                    }
                    className="shadow-lg"
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <span className="text-gray-500 font-medium">Mã đợt:</span>
                                    <span className="font-semibold">{batchInfo.ma_dot_bo_nhiem}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-gray-500 font-medium">Tên đợt:</span>
                                    <span className="font-semibold">{batchInfo.ten_dot_bo_nhiem}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-gray-500 font-medium">Chức danh:</span>
                                    <Tag color="purple" className="rounded-full">{batchInfo.ten_chuc_danh}</Tag>
                                </div>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <span className="text-gray-500 font-medium">Đơn vị:</span>
                                    <div className="flex items-center space-x-2">
                                        <HomeOutlined className="text-gray-400" />
                                        <span className="font-semibold">{batchInfo.ten_don_vi}</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-gray-500 font-medium">Số lượng đề xuất:</span>
                                    <span className="font-semibold text-blue-600">{batchInfo.so_luong_de_xuat}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-gray-500 font-medium">Trạng thái:</span>
                                    {trangThai ? (
                                        <div className="flex items-center space-x-2">
                                            <span className={`text-${trangThai.color === 'success' ? 'green' : trangThai.color === 'error' ? 'red' : trangThai.color === 'processing' ? 'blue' : 'gray'}-500`}>
                                                {trangThai.badgeStatus === 'success' ? <CheckCircleOutlined /> : 
                                                 trangThai.badgeStatus === 'error' ? <ExclamationCircleOutlined /> : 
                                                 trangThai.badgeStatus === 'processing' ? <ClockCircleOutlined /> : 
                                                 <EditOutlined />}
                                            </span>
                                            <Tag color={trangThai.color} className="rounded-full">{trangThai.label}</Tag>
                                        </div>
                                    ) : <Tag>Không xác định</Tag>}
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Card>

                {/* Alert theo trạng thái */}
                {canStartVoting && (
                    <Alert
                        type="info"
                        showIcon
                        message="Đang soạn thảo đợt bổ nhiệm"
                        description={
                            validCandidates.length > 0 
                                ? `Đã có ${validCandidates.length} ứng viên hợp lệ. Nhấn "Bắt đầu quy trình bỏ phiếu" khi đã sẵn sàng.`
                                : "Chưa có ứng viên nào. Vui lòng thêm ứng viên vào đợt bổ nhiệm."
                        }
                        className="border-l-4 border-blue-500"
                    />
                )}
                {canVote && (
                    <Alert
                        type="info"
                        showIcon
                        message={`Đang thực hiện: ${vote_step_label[batchInfo.trang_thai]}`}
                        description={
                            currentVotingStep ? `Bước hiện tại: ${vote_step_label[currentVotingStep]}`: "Đang xác định bước tiếp theo..."
                        }
                        className="border-l-4 border-blue-500"
                    />
                )}
                {batchInfo.trang_thai === 6 && (
                    <Alert
                        type="success"
                        showIcon
                        message="Quy trình bổ nhiệm đã hoàn thành"
                        description={
                            passedCandidates.length > 0 
                                ? `Có ${passedCandidates.length} ứng viên đạt và ${failedCandidates.length} ứng viên không đạt. Quy trình bổ nhiệm đã hoàn tất.`
                                : "Không có ứng viên nào đạt yêu cầu."
                        }
                        className="border-l-4 border-green-500"
                    />
                )}

                {/* Steps Progress */}
                <Card className="shadow-lg">
                    <Steps
                        current={stepIndex}
                        status={batchInfo.trang_thai === 6 ? "finish" : "process"}
                        items={STEP_ITEMS}
                        className="mb-2"
                    />
                    <Progress 
                        percent={((stepIndex + 1) / STEP_ITEMS.length) * 100} 
                        strokeColor={{
                            '0%': '#108ee9',
                            '100%': '#87d068',
                        }}
                        showInfo={false}
                    />
                </Card>

                {/* Danh sách ứng viên */}
                <Card
                    title={
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <TeamOutlined className="text-blue-500" />
                                <span className="text-lg font-semibold">Danh sách ứng viên</span>
                            </div>
                            <div className="flex gap-2"> 
                                {canStartVoting && (
                                    <Button 
                                        type="primary" 
                                        icon={<PlayCircleOutlined />} 
                                        onClick={handleStartVoting} 
                                        disabled={validCandidates.length === 0}
                                        className="bg-linear-to-r from-green-500 to-green-600 border-0 hover:from-green-600 hover:to-green-700"
                                    >
                                        Bắt đầu quy trình bỏ phiếu
                                    </Button>
                                )}
                                {canVote && (
                                    <Button 
                                        type="primary" 
                                        icon={<FormOutlined />} 
                                        onClick={() => setVoteModalVisible(true)}
                                        className="bg-linear-to-r from-blue-500 to-blue-600 border-0 hover:from-blue-600 hover:to-blue-700"
                                    >
                                        Ghi nhận kết quả
                                    </Button>
                                )}
                            </div>
                        </div>
                    }
                    className="shadow-lg"
                >
                    <div className="mb-4 flex flex-wrap gap-2">
                        <Tag color="blue" className="rounded-full">Tổng: {candidates.length}</Tag>
                        <Tag color="green" className="rounded-full">Hợp lệ: {validCandidates.length}</Tag>
                        {batchInfo.trang_thai === 6 && (
                            <>
                                <Tag color="processing" className="rounded-full">Đạt: {passedCandidates.length}</Tag>
                                <Tag color="error" className="rounded-full">Không đạt: {failedCandidates.length}</Tag>
                            </>
                        )}
                        <Tag color="red" className="rounded-full">Bị loại: {invalidCandidates.length}</Tag>
                    </div>

                    <Table
                        rowKey="chi_tiet_bn_id"
                        columns={cols}
                        dataSource={candidates}
                        pagination={{ 
                            pageSize: 10, 
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) => 
                                `Hiển thị ${range[0]}-${range[1]} của ${total} ứng viên`
                        }}
                        rowClassName={(r) => r.trang_thai !== 1 ? "opacity-60" : ""}
                        className="rounded-lg"
                    />
                </Card>
            </div>

            {/* Modals */}
            <VoteModal
                visible={voteModalVisible}
                onCancel={() => setVoteModalVisible(false)}
                onSuccess={handleVoteSuccess}
                batchId={id!}
                candidates={validCandidates}
                currentStep={batchInfo.trang_thai}
            />
        </div>
    );
}
export default AppointmentDetailView;