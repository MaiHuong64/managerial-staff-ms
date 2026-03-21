import type React from "react";
import { useState, useEffect } from "react";
import { Modal, Form, Input, DatePicker, Button, Card, message } from "antd";
import dayjs from "dayjs";
import axiosClient from "../../utils/AxiosClient";
import { useAuth } from "../../hook/useAuth";

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
    const {user} = useAuth();
    const nguoiLap = user?.ho_va_ten;

    // Tự động tạo mã đợt bổ nhiệm
    const generateMaDotBoNhiem = () => {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        return `DB${year}${month}${random}`.substring(0, 6);
    };

    // Reset form khi modal đóng
    useEffect(() => {
        if (visible) {
            form.setFieldsValue({
                ma_dot_bo_nhiem: generateMaDotBoNhiem(),
                ngay_bat_dau: dayjs(),
                ngay_ket_thuc: dayjs().add(30, 'day')
            });
        } else {
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

    const regenerateMaDot = () => {
        form.setFieldsValue({
            ma_dot_bo_nhiem: generateMaDotBoNhiem()
        });
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
            >
                <Card title="Thông tin cơ bản" style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <Form.Item
                            label="Mã đợt bổ nhiệm"
                            name="ma_dot_bo_nhiem"
                            rules={[{ required: true, message: 'Vui lòng nhập mã đợt bổ nhiệm' }]}
                        >
                            <Input 
                                placeholder="Mã đợt bổ nhiệm" 
                                addonAfter={
                                    <Button 
                                        type="link" 
                                        size="small" 
                                        onClick={regenerateMaDot}
                                        style={{ padding: '0 4px' }}
                                    >
                                        Tạo mới
                                    </Button>
                                }
                            />
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
                            <Input value={nguoiLap} disabled />
                        </Form.Item>
                    </div>
                </Card>

                <Card title="Thời gian thực hiện" style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
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
