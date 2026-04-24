import { Modal, Form, Input, DatePicker, message } from 'antd';
import { useState } from 'react';
import { approveQuyHoach } from '../../api/dotQuyHoach.api';
import dayjs from 'dayjs';

interface ApproveQuyHoachModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    dotQuyHoachId: number;
    tenQuyHoach: string;
}

export const ApproveQuyHoachModal: React.FC<ApproveQuyHoachModalProps> = ({
    visible,
    onCancel,
    onSuccess,
    dotQuyHoachId,
    tenQuyHoach,
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            await approveQuyHoach(dotQuyHoachId, {
                soQdPheDuyet: values.soQdPheDuyet,
                ngayQdPheDuyet: values.ngayQdPheDuyet.toDate(),
            });

            message.success('Phê duyệt quy hoạch thành công');
            form.resetFields();
            onSuccess();
        } catch (error: any) {
            if (error?.errorFields) return;
            message.error(error?.response?.data?.message || 'Phê duyệt thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Phê duyệt quy hoạch"
            open={visible}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Phê duyệt"
            cancelText="Hủy"
            width={500}
        >
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-xs text-slate-500 mb-1">Đợt quy hoạch</div>
                <div className="font-semibold text-slate-800">{tenQuyHoach}</div>
            </div>

            <Form form={form} layout="vertical">
                <Form.Item
                    label="Số quyết định phê duyệt"
                    name="soQdPheDuyet"
                    rules={[{ required: true, message: 'Vui lòng nhập số quyết định' }]}
                >
                    <Input placeholder="Ví dụ: 123/QĐ-ĐHAG" />
                </Form.Item>

                <Form.Item
                    label="Ngày quyết định"
                    name="ngayQdPheDuyet"
                    rules={[{ required: true, message: 'Vui lòng chọn ngày quyết định' }]}
                    initialValue={dayjs()}
                >
                    <DatePicker
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày"
                        className="w-full"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};
