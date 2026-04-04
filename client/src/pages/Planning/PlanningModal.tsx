import { Form, message, Modal, Input, Select, InputNumber, Button } from "antd";
import type { DotQuyHoach } from "../../types/QuyHoach";
import { useEffect } from "react";
import { createDotQuyHoach } from "../../api/dotQuyHoach.api";

interface PlanningModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const PlanningModal: React.FC<PlanningModalProps> = ({open, onClose, onSuccess}) => {
    const [form] = Form.useForm();

    useEffect( () => {
        form.resetFields();
        form.setFieldsValue({nam_thuc_hien: new Date().getFullYear()});
    }, [open, form]);

    const handleFinish = async (values: Partial<DotQuyHoach>) => {
        try {
            await createDotQuyHoach(values);
            message.success("Tạo đợt quy hoạch thành công");
            
            form.resetFields();
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            message.error('Có lỗi xảy ra, vui lòng thử lại!');
        };
    }
     return(
            <Modal title={<span className="text-xl font-bold text-gray-800">Tạo đợt quy hoạch mới</span>}
            open={open} onCancel={onClose} footer={null} destroyOnClose className="rounded-2xl overflow-hidden">
                <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-4">
                    
                    <Form.Item label={<span className="font-medium text-gray-700">Tên đợt quy hoạch</span>}
                    name='ten_quy_hoach' rules={[{required: true, message: 'Vui lòng nhập tên đợt'}]}>
                        <Input placeholder="VD: Quy hoạch A1 giai đoạn 2025-2030" className="rounded-lg h-10" />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item label={<span className="font-medium text-gray-700">Loại quy hoạch</span>}
                            name="loai_quy_hoach"
                            rules={[{ required: true, message: 'Vui lòng chọn loại!' }]}>
                            <Select className="h-10 rounded-lg">
                                <Select.Option value={1}>Đầu nhiệm kỳ</Select.Option>
                                <Select.Option value={2}>Rà soát bổ sung hằng năm</Select.Option>
                            </Select>
                        </Form.Item>
                        
                        <Form.Item
                            label={<span className="font-medium text-gray-700">Năm thực hiện</span>}
                            name="nam_thuc_hien"
                            rules={[{ required: true, message: 'Vui lòng nhập năm!' }]}>
                            <InputNumber className="w-full h-10 rounded-lg" min={2000} max={2100} />
                        </Form.Item>

                        <div className="flex justify-end gap-3 mt-6 pt-4">
                            <Button onClick={onClose} className="rounded-xl h-10 px-6 font-medium">Hủy</Button>
                            <Button type="primary" htmlType="submit" className="bg-indigo-500">Tạo mới</Button>
                        </div>
                    </div>

                </Form>
            </Modal>
        );
}