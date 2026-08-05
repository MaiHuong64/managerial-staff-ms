import { Form, Input, InputNumber, message, Modal, Select, Table } from "antd";
import { useEffect, useState } from "react";
import { getChucDanhList } from "../../api/chucDanh.api";
import { getVienChucTheoDonVi } from "../../api/vienChuc.api";
import type { ChucDanh } from "../../types/ChucDanh";
import type { VienChuc } from "../../types/VienChuc";
import { createPhieuDeXuatNhanSu } from "../../api/phieuDeXuat.api";

interface Props {
    isVisible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

export const CreateDeXuatNhanSuModal: React.FC<Props> = ({ isVisible, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [chucDanhList, setChucDanhList] = useState<ChucDanh[]>([]);
    const [vienChucList, setVienChucList] = useState<VienChuc[]>([]);
    const [selectedVienChucIds, setSelectedVienChucIds] = useState<number[]>([]);

    useEffect(() => {
        if (!isVisible) return;
        form.resetFields();
        setSelectedVienChucIds([]);

        const fetchData = async () => {
            try {
                const [vienChucRes, chucDanhRes] = await Promise.all([
                    getVienChucTheoDonVi(),
                    getChucDanhList(),
                ]);
                setChucDanhList(chucDanhRes.data.data ?? []);
                setVienChucList(vienChucRes.data.data ?? []);
            } catch (error: any) {
                console.error("Lỗi khi tải dữ liệu:", error);
                message.error(
                    error?.response?.data?.message || "Không thể tải dữ liệu, vui lòng thử lại!"
                );
            }
        };

        fetchData();
    }, [isVisible, form]);
    const handleSubmit = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            
            if(selectedVienChucIds.length > 3) 
                throw new Error(`Chức danh này chỉ được đề xuất tối đa 3 ứng viên, hiện đề xuất ${selectedVienChucIds.length}`);
            
            const payload = {
                tieuDe: values.tieuDe,
                noiDung: values.noiDung,
                chucDanhId: values.chucDanhId,
                soLuongDeXuat: values.soLuongDeXuat,
                ngayLap: new Date(),
                vienChucList: selectedVienChucIds.map(id => ({ vienChucId: id })),
            };
            
            
            await createPhieuDeXuatNhanSu(payload);
            message.success("Lập phiếu đề xuất nhân sự thành công!");
            onSuccess();
        } catch (error: any) {
            message.error(error?.response?.data?.message || error?.message || "Lỗi khi tạo phiếu đề xuất!");
        } finally { 
            setLoading(false);
        }
    }; 

    const columns = [
        { title: "Họ và tên", dataIndex: "hoVaTen" },
        { title: "Ngạch", dataIndex: "ngach" },
        { title: "Trình độ CM", dataIndex: "trinhDoChuyenMon" },
    ];

    return (
        <Modal
            title="Lập phiếu đề xuất nhân sự quy hoạch"
            open={isVisible}
            onOk={handleSubmit}
            onCancel={onCancel}
            okButtonProps={{ disabled: selectedVienChucIds.length === 0 || selectedVienChucIds.length > 3 }}
            confirmLoading={loading}
            okText="Gửi phiếu"
            cancelText="Hủy"
            width={900}
            style={{ top: 20 }}
        >
            <Form form={form} layout="vertical" className="mt-4">
                <Form.Item
                    name="tieuDe"
                    label="Tiêu đề"
                    rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
                >
                    <Input placeholder="Nhập tiêu đề phiếu đề xuất" />
                </Form.Item>

                <div className="flex gap-4">
                    <Form.Item
                        name="chucDanhId"
                        label="Chức danh đề xuất"
                        className="flex-1"
                        rules={[{ required: true, message: "Vui lòng chọn chức danh" }]}
                    >
                        <Select
                            showSearch
                            placeholder="Tìm và chọn chức danh"
                            optionFilterProp="label"
                            options={chucDanhList.map(cd => ({ value: cd.id, label: cd.tenChucDanh }))}
                        />
                    </Form.Item>

                    <Form.Item
                        name="soLuongDeXuat"
                        label="Số lượng đề xuất"
                        initialValue={1}
                        rules={[{ required: true }]}
                    >
                        <InputNumber min={1} />
                    </Form.Item>
                </div>

                <Form.Item name="noiDung" label="Nội dung">
                    <Input.TextArea rows={2} placeholder="Ghi chú thêm (không bắt buộc)" />
                </Form.Item>

                <div className="mb-2 font-medium">
                    Chọn viên chức đề xuất
                    {selectedVienChucIds.length > 0 && (
                        <span className="ml-2 text-blue-500 font-normal">
                            Đã chọn {selectedVienChucIds.length} người
                        </span>
                    )}
                </div>

                <Table
                    dataSource={vienChucList}
                    columns={columns}
                    rowKey="id"
                    size="small"
                    pagination={{ pageSize: 5 }}
                    rowSelection={{
                        selectedRowKeys: selectedVienChucIds,
                        onChange: (keys) => setSelectedVienChucIds(keys as number[]),
                    }}
                />
            </Form>
        </Modal>
    );
};

export default CreateDeXuatNhanSuModal;
