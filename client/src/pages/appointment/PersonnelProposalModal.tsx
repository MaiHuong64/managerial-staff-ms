import type React from "react";
import { useState, useEffect } from "react";
import { Modal, Form, Input, DatePicker, Button, Card, Table, Select, message } from "antd";
import dayjs from "dayjs";
import type { ChiTietBoNhiem } from "../../types/BoNhiem";
import axiosClient from "../../utils/AxiosClient";

interface PersonnelProposalModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    batchId: string;
    candidates: ChiTietBoNhiem[];
}

interface ProposalCandidate {
    chi_tiet_bn_id: number;
    loai_phuong_an: string;
    ghi_chu_ung_vien: string;
}

const { TextArea } = Input;
const { Option } = Select;

export const PersonnelProposalModal: React.FC<PersonnelProposalModalProps> = ({visible,onCancel,onSuccess, batchId,candidates}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [proposalCandidates, setProposalCandidates] = useState<ProposalCandidate[]>([]);

    const activeCandidates = candidates.filter(c => c.trang_thai === 1);

    useEffect(() => {
        if (visible && activeCandidates.length > 0) {
            const initialCandidates: ProposalCandidate[] = activeCandidates.map(candidate => ({
                chi_tiet_bn_id: candidate.chi_tiet_bn_id,
                loai_phuong_an: "",
                ghi_chu_ung_vien: ""
            }));
            setProposalCandidates(initialCandidates);
        }
    }, [visible, activeCandidates]);

    const handleSubmit = async (values: any) => {
        // Validate candidates
        const invalidCandidates = proposalCandidates.filter(pc => !pc.loai_phuong_an);
        if (invalidCandidates.length > 0) {
            message.error("Vui lòng chọn loại phương án cho tất cả ứng viên");
            return;
        }

        setLoading(true);
        try {
            const proposalData = {
                so_to_trinh: values.so_to_trinh,
                ngay_to_trinh: values.ngay_to_trinh.format('YYYY-MM-DD'),
                ghi_chu: values.ghi_chu || "",
                danh_sach_ung_vien: proposalCandidates
            };

            await axiosClient.post(`/appointments/${batchId}/personnel-proposal`, proposalData);
            message.success("Lập phương án nhân sự thành công!");
            onSuccess();
            handleCancel();
        } catch (error: any) {
            console.error("Lỗi khi lập phương án:", error);
            message.error(error.response?.data?.message || "Lỗi khi lập phương án nhân sự");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setProposalCandidates([]);
        onCancel();
    };

    const handleCandidateChange = (chiTietId: number, field: 'loai_phuong_an' | 'ghi_chu_ung_vien', value: string) => {
        setProposalCandidates(prev => prev.map(pc => 
            pc.chi_tiet_bn_id === chiTietId 
                ? { ...pc, [field]: value }
                : pc
        ));
    };

    const candidateColumns = [
        {
            title: "Mã viên chức",
            dataIndex: 'ma_vien_chuc',
            key: 'ma_vien_chuc',
            width: 120
        },
        {
            title: "Họ và tên",
            dataIndex: 'ho_va_ten',
            key: 'ho_va_ten',
            width: 200
        },
        {
            title: "Đơn vị",
            dataIndex: 'ten_don_vi',
            key: 'ten_don_vi',
            width: 150
        },
        {
            title: "Loại phương án",
            key: 'loai_phuong_an',
            width: 150,
            render: (_: unknown, record: ChiTietBoNhiem) => (
                <Select
                    placeholder="Chọn loại phương án"
                    value={proposalCandidates.find(pc => pc.chi_tiet_bn_id === record.chi_tiet_bn_id)?.loai_phuong_an}
                    onChange={(value) => handleCandidateChange(record.chi_tiet_bn_id, 'loai_phuong_an', value)}
                    style={{ width: '100%' }}
                >
                    <Option value="Bổ nhiệm">Bổ nhiệm</Option>
                    <Option value="Miễn nhiệm">Miễn nhiệm</Option>
                    <Option value="Thuyên chuyển">Thuyên chuyển</Option>
                    <Option value="Luân chuyển">Luân chuyển</Option>
                </Select>
            )
        },
        {
            title: "Ghi chú",
            key: 'ghi_chu',
            width: 200,
            render: (_: unknown, record: ChiTietBoNhiem) => (
                <TextArea
                    placeholder="Nhập ghi chú"
                    value={proposalCandidates.find(pc => pc.chi_tiet_bn_id === record.chi_tiet_bn_id)?.ghi_chu_ung_vien}
                    onChange={(e) => handleCandidateChange(record.chi_tiet_bn_id, 'ghi_chu_ung_vien', e.target.value)}
                    rows={2}
                    maxLength={500}
                />
            )
        }
    ];

    return (
        <Modal
            title="Lập phương án nhân sự"
            open={visible}
            onCancel={handleCancel}
            width={1000}
            footer={null}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    ngay_to_trinh: dayjs()
                }}
            >
                <Card title="Thông tin tờ trình" className="mb-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            label="Số tờ trình"
                            name="so_to_trinh"
                            rules={[{ required: true, message: 'Vui lòng nhập số tờ trình' }]}
                        >
                            <Input placeholder="Nhập số tờ trình" />
                        </Form.Item>
                        <Form.Item
                            label="Ngày tờ trình"
                            name="ngay_to_trinh"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày tờ trình' }]}
                        >
                            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </div>
                    <Form.Item
                        label="Ghi chú"
                        name="ghi_chu"
                    >
                        <TextArea 
                            placeholder="Nhập ghi chú cho phương án" 
                            rows={3}
                            maxLength={1000}
                        />
                    </Form.Item>
                </Card>

                <Card title="Danh sách ứng viên trong phương án" className="mb-4">
                    <Table
                        rowKey="chi_tiet_bn_id"
                        columns={candidateColumns}
                        dataSource={activeCandidates}
                        pagination={false}
                        scroll={{ x: 1000 }}
                    />
                </Card>

                <div className="flex justify-end gap-2">
                    <Button onClick={handleCancel}>
                        Hủy
                    </Button>
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={loading}
                    >
                        Lập phương án
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default PersonnelProposalModal;
