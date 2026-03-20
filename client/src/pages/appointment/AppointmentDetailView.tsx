import type React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { ChiTietBoNhiemReq } from "../../types/BoNhiem";
import axiosClient from "../../utils/AxiosClient";
import { Card, message, Spin, Steps, Table, Tag, Button, Alert, Descriptions, Badge } from "antd";
import { FormOutlined, PlayCircleOutlined } from "@ant-design/icons";
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

    const handleVoteSuccess = () => {
        fetchDetail();
        fetchCurrentStep();
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
        { title: "Mã viên chức", dataIndex: "ma_vien_chuc", key: "ma_vien_chuc" },
        { title: "Họ và tên", dataIndex: "ho_va_ten", key: "ho_va_ten" },
        { title: "Đơn vị", dataIndex: "ten_don_vi", key: "ten_don_vi" },
        { title: "Nguồn viên chức", dataIndex: "nguon_vien_chuc",key: "nguon_vien_chuc" },
        { title: "Chức vụ hiện tại",dataIndex: "ten_chuc_danh", key: "ten_chuc_danh" },
        {
            title: "Trạng thái",
            dataIndex: "trang_thai",
            key: "trang_thai",
            render: (s: number) => {
                let color = "default";
                let text = "Không xác định";
                
                switch(s) {
                    case 1:
                        color = "success";
                        text = "Hợp lệ";
                        break;
                    case 2:
                        color = "error";
                        text = "Không đạt";
                        break;
                    case 3:
                        color = "processing";
                        text = "Đạt";
                        break;
                    default:
                        color = "default";
                        text = "Đã loại";
                }
                
                return <Tag color={color}>{text}</Tag>;
            },
        },
    ];

    return (
        <div className="p-6 space-y-6">

            {/* ── Thông tin đợt ── */}
            <Card title="Thông tin đợt bổ nhiệm">
                <Descriptions column={2} bordered size="small">
                    <Descriptions.Item label="Mã đợt">{batchInfo.ma_dot_bo_nhiem}</Descriptions.Item>
                    <Descriptions.Item label="Tên đợt">{batchInfo.ten_dot_bo_nhiem}</Descriptions.Item>
                    <Descriptions.Item label="Chức danh">{batchInfo.ten_chuc_danh}</Descriptions.Item>
                    <Descriptions.Item label="Đơn vị">{batchInfo.ten_don_vi}</Descriptions.Item>
                    <Descriptions.Item label="Số lượng đề xuất">{batchInfo.so_luong_de_xuat}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        {trangThai
                            ? <Badge status={trangThai.badgeStatus} text={<Tag color={trangThai.color}>{trangThai.label}</Tag>} />
                            : <Tag>Không xác định</Tag>
                        }
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            {/* ── Alert theo trạng thái ── */}
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
                />
            )}

            <Card>
                <Steps
                    current={stepIndex}
                    status={batchInfo.trang_thai === 6 ? "finish" : "process"}
                    items={STEP_ITEMS}
                />
            </Card>

            {/* ── Danh sách ứng viên ── */}
            <Card
                title="Danh sách ứng viên" extra={
                    <div className="flex gap-2"> 
                    {canStartVoting && (
                            <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleStartVoting} disabled={validCandidates.length === 0}>
                                Bắt đầu quy trình bỏ phiếu
                            </Button>
                        )}
                        {canVote && (
                            <Button type="primary" icon={<FormOutlined />} onClick={() => setVoteModalVisible(true)}> Next
                            </Button>
                        )}
                    </div>
                }>
                <div className="mb-4 flex gap-3">
                    <Tag color="blue">Tổng: {candidates.length}</Tag>
                    <Tag color="green">Hợp lệ: {validCandidates.length}</Tag>
                    {batchInfo.trang_thai === 6 && (
                        <>
                            <Tag color="processing">Đạt: {passedCandidates.length}</Tag>
                            <Tag color="error">Không đạt: {failedCandidates.length}</Tag>
                        </>
                    )}
                    <Tag color="red">Bị loại: {invalidCandidates.length}</Tag>
                </div>

                <Table
                    rowKey="chi_tiet_bn_id"
                    columns={cols}
                    dataSource={candidates}
                    pagination={{ pageSize: 10, showSizeChanger: false }}
                    rowClassName={(r) => r.trang_thai !== 1 ? "opacity-50" : ""}
                />
            </Card>

            {/* ── Modals ── */}
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
};

export default AppointmentDetailView;