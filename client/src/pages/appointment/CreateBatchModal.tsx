import type React from "react";
import { useState, useEffect } from "react";
import { Modal, Form, Input, DatePicker, Button, Card, message } from "antd";
import dayjs from "dayjs";
import axiosClient from "../../utils/AxiosClient";

interface CreateBatchModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

export const CreateBatchModal: React.FC<CreateBatchModalProps> = ({
    visible, onCancel, onSuccess
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Reset form khi modal đóng
    useEffect(() => {
        if (!visible) {
            form.resetFields();
        }
    }, [visible, form]);

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            const batchData = {
                ma_dot_bo_nhiem: values.ma_dot_bo_nhiem,
                ten_dot_bo_nhiem: values.ten_dot_bo_nhiem,
                ngay_bat_dau: values.ngay_bat_dau ? values.ngay_bat_dau.format('YYYY-MM-DD') : null,
                ngay_ket_thuc: values.ngay_ket_thuc ? values.ngay_ket_thuc.format('YYYY-MM-DD') : null
            };

            await axiosClient.post('/appointments', batchData);
            message.success("Tạo đợt bổ nhiệm thành công!");
            onSuccess();
            handleCancel();
        } catch (error: any) {
            console.error("Lỗi khi tạo đợt bổ nhiệm:", error);
            message.error(error.response?.data?.message || "Lỗi khi tạo đợt bổ nhiệm");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title="Tạo đợt bổ nhiệm mới"
            open={visible}
            onCancel={handleCancel}
            width={600}
            footer={null}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    ngay_bat_dau: dayjs(),
                    ngay_ket_thuc: dayjs().add(30, 'day')
                }}
            >
                <Card title="Thông tin cơ bản" className="mb-4">
                    <div className="grid grid-cols-1 gap-4">
                        <Form.Item
                            label="Mã đợt bổ nhiệm"
                            name="ma_dot_bo_nhiem"
                            rules={[{ required: true, message: 'Vui lòng nhập mã đợt bổ nhiệm' }]}
                        >
                            <Input placeholder="Mã đợt bổ nhiệm" />
                        </Form.Item>

                        <Form.Item
                            label="Tên đợt bổ nhiệm"
                            name="ten_dot_bo_nhiem"
                            rules={[{ required: true, message: 'Vui lòng nhập tên đợt bổ nhiệm' }]}
                        >
                            <Input placeholder="Tên đợt bổ nhiệm" />
                        </Form.Item>

                        <Form.Item
                            label="Người lập"
                        >
                            <Input value="Người dùng hiện tại" disabled />
                        </Form.Item>
                    </div>
                </Card>

                <Card title="Thời gian thực hiện" className="mb-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            label="Ngày bắt đầu"
                            name="ngay_bat_dau"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
                        >
                            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>

                        <Form.Item
                            label="Ngày kết thúc"
                            name="ngay_ket_thuc"
                        >
                            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </div>
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
                        Tạo đợt bổ nhiệm
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateBatchModal;
