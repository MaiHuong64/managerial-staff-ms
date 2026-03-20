import type React from "react";
import { useState, useEffect } from "react";
import { Modal, Form, Input, DatePicker, Button, Card, Select, message } from "antd";
import dayjs from "dayjs";
import axiosClient from "../../utils/AxiosClient";

interface CreateBatchModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

interface Petition {
    id: number;
    ma_phieu: string;
    so_to_trinh_chu_truong: string;
    tieu_de: string;
    so_luong_de_xuat: number;
    nguon_nhan_su: number;
    ngay_lap: string;
    ten_chuc_danh: string;
    ten_don_vi: string;
    nguoi_lap_ten: string;
}

const { Option } = Select;

export const CreateBatchModal: React.FC<CreateBatchModalProps> = ({
    visible, onCancel, onSuccess
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [petitions, setPetitions] = useState<Petition[]>([]);
    const [loadingPetitions, setLoadingPetitions] = useState(false);

    // Lấy danh sách phiếu chủ trưởng có sẵn
    useEffect(() => {
        if (!visible) return;

        const fetchPetitions = async () => {
            setLoadingPetitions(true);
            try {
                const result = await axiosClient.get('/appointments/petitions/available');
                if (result.data.success) {
                    setPetitions(result.data.data);
                }
            } catch (error) {
                message.error("Không thể lấy danh sách phiếu chủ trưởng");
            } finally {
                setLoadingPetitions(false);
            }
        };

        fetchPetitions();
    }, [visible]);

    // Reset form khi modal đóng
    useEffect(() => {
        if (!visible) {
            form.resetFields();
            setPetitions([]);
        }
    }, [visible, form]);

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            const batchData = {
                ma_dot_bo_nhiem: values.ma_dot_bo_nhiem,
                ten_dot_bo_nhiem: values.ten_dot_bo_nhiem,
                phieu_chu_truong_id: values.phieu_chu_truong_id,
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
        setPetitions([]);
        onCancel();
    };

    const handlePetitionChange = (petitionId: number) => {
        const petition = petitions.find(p => p.id === petitionId);
        if (petition) {
            form.setFieldsValue({
                ten_dot_bo_nhiem: `Đợt bổ nhiệm ${petition.ten_chuc_danh} - ${petition.ten_don_vi}`,
                ma_dot_bo_nhiem: `DBN${dayjs().format('YYMM')}${String(petition.id).padStart(3, '0')}`
            });
        }
    };

    return (
        <Modal
            title="Tạo đợt bổ nhiệm mới"
            open={visible}
            onCancel={handleCancel}
            width={800}
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
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            label="Chọn phiếu chủ trưởng"
                            name="phieu_chu_truong_id"
                            rules={[{ required: true, message: 'Vui lòng chọn phiếu chủ trưởng' }]}
                        >
                            <Select
                                placeholder="Chọn phiếu chủ trưởng"
                                loading={loadingPetitions}
                                onChange={handlePetitionChange}
                                showSearch
                                filterOption={(input, option) => {
                                    const label = petitions.find(p => p.id === option?.value);
                                    return label ? 
                                        `${label.ma_phieu} ${label.tieu_de} ${label.ten_chuc_danh} ${label.ten_don_vi}`
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                        : false;
                                }}
                            >
                                {petitions.map(petition => (
                                    <Option key={petition.id} value={petition.id}>
                                        <div>
                                            <strong>{petition.ma_phieu}</strong> - {petition.tieu_de}
                                            <div style={{ fontSize: '12px', color: '#666' }}>
                                                {petition.ten_chuc_danh} - {petition.ten_don_vi} | 
                                                SL: {petition.so_luong_de_xuat} | 
                                                Ngày lập: {dayjs(petition.ngay_lap).format('DD/MM/YYYY')}
                                            </div>
                                        </div>
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

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
