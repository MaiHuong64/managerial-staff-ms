import { useState, useEffect } from "react";
import { Modal, Select, Button, Table, Tag, message, Form } from "antd";
import { SearchOutlined, UserAddOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { getDonViList } from "../../api/donVi.api";
import { getChucDanhList } from "../../api/chucDanh.api";
import { addCandidates, filterPlanningCandidates } from "../../api/dotQuyHoach.api";

interface FilteredStaff {
    id: number;
    ma_vien_chuc: string;
    ho_va_ten: string;
    trinh_do_chuyen_mon: string;
}

interface Department {
    id: number;
    ten_don_vi: string;
}

interface Position {
    id: number;
    ten_chuc_danh: string;
}

interface AddStaffsModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    dotQuyHoachId: number;
}

const TRINH_DO_OPTIONS = [
    "Thạc sĩ", "Tiến sĩ", "Tiến sĩ khoa học",
];

export const AddStaffsModal: React.FC<AddStaffsModalProps> = ({
    open, onClose, onSuccess, dotQuyHoachId,
}) => {
    const [form] = Form.useForm();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);
    const [filteredStaff, setFilteredStaff] = useState<FilteredStaff[]>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
    const [chucDanhId, setChucDanhId] = useState<number | null>(null);
    const [searching, setSearching] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        if (!open) return;
        setFilteredStaff([]);
        setSelectedRowKeys([]);
        setChucDanhId(null);
        setHasSearched(false);
        form.resetFields();

        const fetchMaster = async () => {
            const [deptRes, posRes] = await Promise.all([
                getDonViList(),
                getChucDanhList(),
            ]);
            setDepartments(deptRes.data?.data ?? []);
            setPositions(posRes.data?.data ?? []);
        };
        fetchMaster().catch(() => message.error("Lỗi tải danh mục"));
    }, [open, form]);

    const handleSearch = async (values: { don_vi_id: number; trinh_do_chuyen_mon: string }) => {
        setSearching(true);
        setSelectedRowKeys([]);
        try {
            const res = await filterPlanningCandidates(values.don_vi_id, values.trinh_do_chuyen_mon, dotQuyHoachId);
            setFilteredStaff(res.data?.data ?? []);
            setHasSearched(true);
        } catch {
            message.error("Lỗi khi tìm kiếm viên chức");
        } finally {
            setSearching(false);
        }
    };

    const handleSubmit = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning("Vui lòng chọn ít nhất 1 viên chức");
            return;
        }
        if (!chucDanhId) {
            message.warning("Vui lòng chọn chức danh quy hoạch");
            return;
        }

        setSubmitting(true);
        try {
            await Promise.all(
                selectedRowKeys.map(vcId => addCandidates(dotQuyHoachId, { vien_chuc_id: vcId, chuc_danh_id: chucDanhId, don_vi_id: form.getFieldValue("don_vi_id") }))
            );
            message.success(`Đã thêm ${selectedRowKeys.length} viên chức vào quy hoạch`);
            onSuccess();
            onClose();
        } catch {
            message.error("Có lỗi khi thêm viên chức, vui lòng thử lại");
        } finally {
            setSubmitting(false);
        }
    };

    const columns: ColumnsType<FilteredStaff> = [
        { title: "Mã VC", dataIndex: "ma_vien_chuc", width: 110 },
        { title: "Họ và tên", dataIndex: "ho_va_ten" },
        {
            title: "Trình độ",
            dataIndex: "trinh_do_chuyen_mon",
            render: (val: string) => <Tag color="blue">{val}</Tag>,
        },
    ];

    return (
        <Modal
            title="Thêm viên chức vào quy hoạch"
            open={open}
            onCancel={onClose}
            width={780}
            footer={null}
            destroyOnClose
        >
            {/* Bộ lọc */}
            <Form form={form} layout="vertical" onFinish={handleSearch} className="mb-4">
                <div className="grid grid-cols-2 gap-3">
                    <Form.Item
                        label="Đơn vị"
                        name="don_vi_id"
                        rules={[{ required: true, message: "Chọn đơn vị" }]}
                    >
                        <Select
                            placeholder="Chọn đơn vị..."
                            showSearch
                            optionFilterProp="label"
                            options={departments.map(d => ({ value: d.id, label: d.ten_don_vi }))}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Trình độ chuyên môn"
                        name="trinh_do_chuyen_mon"
                        rules={[{ required: true, message: "Chọn trình độ" }]}
                    >
                        <Select
                            placeholder="Chọn trình độ..."
                            options={TRINH_DO_OPTIONS.map(t => ({ value: t, label: t }))}
                        />
                    </Form.Item>
                </div>
                <Button
                    htmlType="submit"
                    icon={<SearchOutlined />}
                    loading={searching}
                    className="w-full"
                >
                    Tìm kiếm
                </Button>
            </Form>

            {/* Kết quả */}
            {hasSearched && (
                <>
                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={filteredStaff}
                        pagination={false}
                        size="small"
                        bordered
                        rowSelection={{
                            selectedRowKeys,
                            onChange: keys => setSelectedRowKeys(keys as number[]),
                        }}
                        locale={{ emptyText: "Không tìm thấy viên chức phù hợp hoặc đã có trong quy hoạch" }}
                        className="mb-4"
                    />

                    {filteredStaff.length > 0 && (
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                            <span className="text-sm text-gray-600 whitespace-nowrap">
                                Chức danh quy hoạch:
                            </span>
                            <Select
                                placeholder="Chọn chức danh..."
                                className="flex-1"
                                showSearch
                                optionFilterProp="label"
                                value={chucDanhId}
                                onChange={setChucDanhId}
                                options={positions.map(p => ({ value: p.id, label: p.ten_chuc_danh }))}
                            />
                            <Button
                                type="primary"
                                icon={<UserAddOutlined />}
                                loading={submitting}
                                disabled={selectedRowKeys.length === 0 || !chucDanhId}
                                onClick={handleSubmit}
                                className="whitespace-nowrap"
                            >
                                Thêm {selectedRowKeys.length > 0 ? `(${selectedRowKeys.length})` : ""}
                            </Button>
                        </div>
                    )}
                </>
            )}
        </Modal>
    );
};

export default AddStaffsModal;
