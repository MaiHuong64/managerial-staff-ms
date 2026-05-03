import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, message, Row, Col, InputNumber } from 'antd';
import { BankOutlined, ApartmentOutlined } from '@ant-design/icons';
import { createChucDanh, getChucDanhList, updateChucDanh } from '../../api/chucDanh.api';
import type { ChucDanh } from '../../types/ChucDanh';

interface ThemChucDanhModalProps {
    isOpen: boolean;
    editChucDanh?: ChucDanh | null;
    onCancel: () => void;
    onSuccess: () => void;
}

const ThemChucDanhModal: React.FC<ThemChucDanhModalProps> = ({ isOpen, onCancel, onSuccess, editChucDanh }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [danhSachChucDanh, setDanhSachChucDanh] = useState<ChucDanh[]>([]);

    const fetchChucDanhList = async () => {
        try {
            const res = await getChucDanhList();
            setDanhSachChucDanh(res.data.data);
        } catch (error) {
            console.error("Error fetching chuc danh list:", error);
        }
    };

    useEffect(() => {
        fetchChucDanhList();
    }, []);

    useEffect(() => {
        if (isOpen) {
            if (editChucDanh) {
                form.setFieldsValue(editChucDanh);
            } else {
                form.resetFields();
            }
        }
    }, [editChucDanh, form, isOpen]);

    const handleSubmit = async (values: ChucDanh) => {
        setLoading(true);
        try {
            if (editChucDanh) {
                await updateChucDanh(editChucDanh.id, values);
                message.success("Cập nhật chức danh thành công!");
                onSuccess();
            } else {
                await createChucDanh(values);
                message.success("Tạo chức danh thành công!");
                onSuccess();
                form.resetFields();
            }
        } catch (error) {
            message.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Có lỗi xảy ra!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <BankOutlined className="text-blue-500" />
                Thông tin cơ bản
            </div>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item label={<span className="text-sm font-medium">Tên chức danh</span>} name="tenChucDanh" rules={[{ required: true, message: 'Vui lòng nhập tên chức danh' }]} >
                        <Input placeholder="VD: Giảng viên" size="large" className="rounded-lg" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label={<span className="text-sm font-medium">Thời hạn giữ chức vụ</span>} name="thoiHanGiuChuVu" rules={[{ required: true, message: 'Vui lòng chọn thời hạn giữ chức vụ' }]}>
                        <Select placeholder="Chọn thời hạn giữ chức vụ" size="large" className="rounded-lg">
                            <Select.Option value="1 năm">1 năm</Select.Option>
                            <Select.Option value="2 năm">2 năm</Select.Option>
                            <Select.Option value="3 năm">5 năm</Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item label={<span className="text-sm font-medium flex items-center gap-2"><ApartmentOutlined />Hệ số phụ cấp</span>} name="heSoPhuCap" rules={[{ required: true, message: 'Vui lòng nhập hệ số phụ cấp' }]}>
                <InputNumber
                    placeholder="VD: 1.5"
                    size="large"
                    className="rounded-lg"
                    step={0.1}
                    min={0}
                />
            </Form.Item>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <Button onClick={onCancel} size="large" className="rounded-lg">
                    Hủy bỏ
                </Button>
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                    className="rounded-lg bg-blue-600 hover:bg-blue-700"
                >
                    {editChucDanh ? 'Cập nhật' : 'Tạo mới'}
                </Button>
            </div>
        </Form>
    );
};

export default ThemChucDanhModal;