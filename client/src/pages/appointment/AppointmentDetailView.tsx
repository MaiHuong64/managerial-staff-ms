import type React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { ChiTietBoNhiemReq } from "../../types/BoNhiem";
import axiosClient from "../../utils/AxiosClient";
import {Card, message, Spin, Steps, Table, Tag } from "antd";

export const AppointmentDetailView: React.FC = () => {
    const {id} = useParams();
    // const navigate = useNavigate();

    const [data, setData] = useState<ChiTietBoNhiemReq | null>(null);
    const [loading, setLoading] = useState(true);

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
    useEffect(() => {
        if (id) fetchDetail();
    }, [id]);

    const renderStatusTag = (status?: number) => {
        switch(status){
            case 1: return <Tag color="processing">Chọn ứng viên</Tag>;
            case 2: return <Tag color="warning">Đang bỏ phiếu</Tag>;
            case 3: return <Tag color="orange">Lập phương án / Chờ duyệt</Tag>;
            case 4: 
            case 9: return <Tag color="success">Đã hoàn thành (Có Quyết định)</Tag>;
            case 0: 
            case 7: return <Tag color="error">Đã hủy</Tag>;
            default: return <Tag>Không xác định</Tag>;
        }
    }

    const currentStep = (status?: number) => {
        switch (status) {
            case 1: return 0; // Đang ở bước 1 (index 0)
            case 2: return 1;
            case 3: return 2;
            case 4: 
            case 9: return 4; // Hoàn tất
            default: return 0;
        }
    }
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
        }
    ]

    const stepItem = [
        { title: "Chọn ứng viên" },
        { title: "Bỏ phiếu" },
        { title: "Phương án" },
        { title: "Hoàn tất" }
    ]

    if (loading) return <div className="flex justify-center items-center h-64"><Spin size="large" /></div>;
    if (!data || !data.batchInfo) return <div className="text-center mt-10 text-red-500">Không tìm thấy dữ liệu!</div>;

    const { batchInfo, candidates } = data;
    console.log(batchInfo)
    console.log(candidates)
    return (
        <div className="p-6">
            <Card title="Thông tin đợt bổ nhiệm" className="mb-6">
            <p><b>Mã:</b> {batchInfo.ma_dot_bo_nhiem}</p>
            <p><b>Tên:</b> {batchInfo.ten_dot_bo_nhiem}</p>
            <p><b>Trạng thái:</b>{renderStatusTag(batchInfo.trang_thai)}</p>
            </Card>

            <Steps current={currentStep(batchInfo.trang_thai)} className="mb-6" items={stepItem}>
              
            </Steps>

            <Card title="Danh sách ứng viên">
            <div className="mb-4 flex gap-6">
                <Tag color="blue">Tổng: {candidates.length}</Tag>
                <Tag color="green">
                    Hợp lệ: {candidates.filter(c => c.trang_thai === 1).length}
                </Tag>
                <Tag color="red">
                    Bị loại: {candidates.filter(c => c.trang_thai !== 1).length}
                </Tag>
            </div>
            <Table
                rowKey="id"
                columns={cols}
                dataSource={candidates}
                pagination={false}
            />
            </Card>
        </div>
        );

}
export default AppointmentDetailView