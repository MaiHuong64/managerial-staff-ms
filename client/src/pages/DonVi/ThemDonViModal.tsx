import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, message, Row, Col, Divider } from 'antd';
import { BankOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined, ApartmentOutlined } from '@ant-design/icons';
import { createDonVi, getDonViList, updateDonVi } from '../../api/donVi.api';
import type { DonVi } from '../../types/DonVi';

interface ThemDonViModalProps {
    isOpen: boolean;
    editDonVi?: DonVi | null;
    onCancel: () => void;
    onSuccess: () => void;
}

const ThemDonViModal: React.FC<ThemDonViModalProps> = ({ isOpen, onCancel, onSuccess, editDonVi }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [danhSachDonVi, setDanhSachDonVi] = useState<DonVi[]>([]);

    const fetchDonViList = async () => {
        try {
            const res = await getDonViList();
            setDanhSachDonVi(res.data.data);
        } catch (error) {
            console.error("Error fetching don vi list:", error);
        }
    };

    useEffect(() => {
        fetchDonViList();
    }, []);

    useEffect(() => {
        if (isOpen) {
            if (editDonVi) {
                form.setFieldsValue(editDonVi);
            } else {
                form.resetFields();
            }
        }
    }, [editDonVi, form, isOpen]);

    const handleSubmit = async (values: DonVi) => {
        setLoading(true);
        try {
            if (editDonVi) {
                await updateDonVi(editDonVi.id, values);
                message.success("Cập nhật đơn vị thành công!");
                onSuccess();
            } else {
                await createDonVi(values);
                message.success("Tạo đơn vị thành công!");
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
                    <Form.Item label={<span className="text-sm font-medium">Tên đơn vị</span>} name="tenDonVi" rules={[{ required: true, message: 'Vui lòng nhập tên đơn vị' }]} >
                        <Input placeholder="VD: Khoa Công nghệ Thông tin" size="large" className="rounded-lg" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label={<span className="text-sm font-medium">Loại đơn vị</span>} name="loaiDonVi" rules={[{ required: true, message: 'Vui lòng chọn loại đơn vị' }]}>
                        <Select placeholder="Chọn loại đơn vị" size="large" className="rounded-lg">
                            <Select.Option value="Phòng ban">Phòng ban</Select.Option>
                            <Select.Option value="Khoa">Khoa</Select.Option>
                            <Select.Option value="Bộ môn">Bộ môn</Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item label={<span className="text-sm font-medium flex items-center gap-2"><ApartmentOutlined />Đơn vị cha</span>} name="donViCha">
                <Select
                    placeholder="— Không có —" size="large" className="rounded-lg" allowClear>
                    {danhSachDonVi .filter((dv) => dv.id !== editDonVi?.id) .map((dv) => (
                        <Select.Option key={dv.id} value={dv.id}>
                            {dv.tenDonVi}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>

            <Divider className="my-6" />

            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Thông tin liên hệ
            </div>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item label={<span className="text-sm font-medium flex items-center gap-2"><PhoneOutlined />Số điện thoại</span>} name="soDienThoai" rules={[ { pattern: /^[0-9.\-\s]+$/, message: 'Số điện thoại không hợp lệ' } ]} >
                        <Input placeholder="0292.123.456" size="large" className="rounded-lg"/>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label={<span className="text-sm font-medium flex items-center gap-2"><MailOutlined />Email</span>} name="email" rules={[ { type: 'email', message: 'Email không hợp lệ' } ]} >
                        <Input placeholder="cntt@agu.edu.vn" size="large" className="rounded-lg"/>
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item label={<span className="text-sm font-medium flex items-center gap-2"><EnvironmentOutlined />Địa chỉ</span>}name="diaChi">
                <Input.TextArea rows={3} placeholder="18 Ung Văn Khiêm, P. Đông Xuyên, TP. Long Xuyên" className="rounded-lg" />
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
                    {editDonVi ? 'Cập nhật' : 'Tạo mới'}
                </Button>
            </div>
        </Form>
    );
};

export default ThemDonViModal;