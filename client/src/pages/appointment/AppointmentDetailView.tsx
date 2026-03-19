import type React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { ChiTietBoNhiemReq } from "../../types/BoNhiem";
import axiosClient from "../../utils/AxiosClient";
import {Card, message, Spin, Steps, Table, Tag, Button} from "antd";
import VoteModal from "./VoteModal";
import PersonnelProposalModal from "./PersonnelProposalModal";

const state: Record<number, { label: string; color: string }> = {
    2: { label: "Chưa bỏ phiếu", color: "warning" },
    3: { label: "Đã bỏ phiếu vòng 2", color: "processing" },
    4: { label: "Đã bỏ phiếu cán bộ chủ chốt", color: "processing" },
    5: { label: "Đã bỏ phiếu vòng cuối", color: "success" },
    0: { label: "Đã hủy", color: "error" },
};

const step: Record<number, number> = {
    2: 0, 3: 1, 4: 2, 5: 3,
};

const step_item = [
    { title: "Hội nghị tập thể lãnh đạo (vòng 2)" },
    { title: "Hội nghị cán bộ chủ chốt" },
    { title: "Hội nghị tập thể lãnh đạo (vòng cuối)" },
];

export const AppointmentDetailView: React.FC = () => {
    const {id} = useParams();
    const [data, setData] = useState<ChiTietBoNhiemReq | null>(null);
    const [loading, setLoading] = useState(true);
    const [voteModalVisible, setVoteModalVisible] = useState(false);
    const [proposalModalVisible, setProposalModalVisible] = useState(false);

    const fetchDetail = async () => {
        try {
            setLoading(true);
            const result = await axiosClient.get(`/appointments/${id}`);
            console.log(result.data.data)
            if(result.data.data)
                setData(result.data.data);
            else
                message.error("Không thể lấy dữ liệu từ đợt bổ nhiệm: ",);
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết: ", error)
            message.error("Lỗi kết nối tới máy chủ");
        } finally{
            setLoading(false);
        }
    }

    const handleVoteSuccess = () => {
        fetchDetail();
    };

    const handleProposalSuccess = () => {
        fetchDetail();
        message.success("Lập phương án nhân sự thành công!");
    };

    useEffect(() => {
        if (id) fetchDetail();
    }, [id]);

    if (loading) return <div className="flex justify-center items-center h-64"><Spin size="large" /></div>;
    if (!data || !data.batchInfo) return <div className="text-center mt-10 text-red-500">Không tìm thấy dữ liệu!</div>;

    const { batchInfo, candidates } = data;
    const trang_thai = state[batchInfo.trang_thai]

    const cols = [
        {
            title: "Mã viên chức",
            dataIndex: 'ma_vien_chuc',
            key: 'ma_vien_chuc'
        },
        {
            title: 'Họ và tên',
            dataIndex: 'ho_va_ten'
        },
        {
            title: 'Đơn vị',
            dataIndex: 'ten_don_vi'
        },
        {
            title: 'Nguồn viên chức',
            dataIndex: 'nguon_vien_chuc'
        },
        {
            title: "Chức vụ hiện tại",
            dataIndex: 'ten_chuc_danh'
        },
        {
            title: 'Trạng thái',
            dataIndex: 'trang_thai',
            key: 'trang_thai',
            render: (status: number) => <Tag color={status === 1 ? 'success': 'default'} >{status === 1 ? 'Hợp lệ': 'Đã loại'}</Tag>
        },
    ]

    const canShowVoteButton = batchInfo.trang_thai >= 2 && batchInfo.trang_thai < 5;
    const canShowProposalButton = batchInfo.trang_thai === 5;

    return (
        <div className="p-6">
            <Card title="Thông tin đợt bổ nhiệm" className="mb-6">
                <p><b>Mã:</b> {batchInfo.ma_dot_bo_nhiem}</p>
                <p><b>Tên:</b> {batchInfo.ten_dot_bo_nhiem}</p>
                <p><b>Trạng thái:</b>{" "}
                    {trang_thai? <Tag color={trang_thai.color}>{trang_thai.label}</Tag> : <Tag>Không xác định</Tag>}
                </p>
            </Card>

            <Steps
                current={step[batchInfo.trang_thai] ?? 0}
                items={step_item}
                className="mb-6"
            />
            <Card title="Danh sách ứng viên">
                <div className="mb-4 flex gap-6 justify-between items-center">
                    <div className="flex gap-6">
                        <Tag color="blue">Tổng: {candidates.length}</Tag>
                        <Tag color="green">Hợp lệ: {candidates.filter(c => c.trang_thai === 1).length}</Tag>
                        <Tag color="red">Bị loại: {candidates.filter(c => c.trang_thai !== 1).length}</Tag>
                    </div>
                    <div className="flex gap-2">
                        {canShowVoteButton && (
                            <Button 
                                type="primary" 
                                onClick={() => setVoteModalVisible(true)}
                            >
                                Ghi nhận kết quả bỏ phiếu
                            </Button>
                        )}
                        {canShowProposalButton && (
                            <Button 
                                type="primary" 
                                onClick={() => setProposalModalVisible(true)}
                            >
                                Lập phương án nhân sự
                            </Button>
                        )}
                    </div>
                </div>
                <Table
                    rowKey="id"
                    columns={cols}
                    dataSource={candidates}
                    pagination={false}
                />
            </Card>

            <VoteModal
                visible={voteModalVisible}
                onCancel={() => setVoteModalVisible(false)}
                onSuccess={handleVoteSuccess}
                batchId={id!}
                candidates={candidates}
                currentStep={batchInfo.trang_thai}
            />

            <PersonnelProposalModal
                visible={proposalModalVisible}
                onCancel={() => setProposalModalVisible(false)}
                onSuccess={handleProposalSuccess}
                batchId={id!}
                candidates={candidates}
            />
            
        </div>
    );

}
export default AppointmentDetailView