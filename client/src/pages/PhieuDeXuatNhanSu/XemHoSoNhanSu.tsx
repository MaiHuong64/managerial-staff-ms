import { useEffect, useState } from "react";
import { Button, Card, Descriptions, Divider, Drawer, Form, Input, message, Radio, Space, Tag, Timeline, Alert } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { getFullProfileById } from "../../api/vienChuc.api";
import { auditPhieuDeXuatCandidate } from "../../api/phieuDeXuat.api";
import type { VienChuc } from "../../types/VienChuc";
import type { XepLoaiVC } from "../../types/XepLoai";

interface Props {
    vienChucId: number | null;
    chiTietPhieuId: number;
    hoVaTen: string;
    onClose: () => void;
    onSuccess: () => void;
}

interface FullProfile {
    profile: VienChuc & { tenDonVi: string };
    lichSuChucVu: Array<{
        ngayBatDau: string;
        ngayKetThuc: string | null;
        tenChucDanh: string;
        soQuyetDinh: string | null;
    }>;
    xepLoaiVc: XepLoaiVC[];
    xepLoaiDangVien: XepLoaiVC[];
}

const format = (d: string) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

const tinhTuoi = (ngaySinh: string) => {
    const today = new Date();
    const birth = new Date(ngaySinh);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
};

const kiemTraXepLoai3Nam = (xepLoai: XepLoaiVC[]) => {
    if (xepLoai.length < 3) return false;
    return xepLoai.slice(0, 3).every(xl =>
        xl.danhGia.includes('xuất sắc') || xl.danhGia.includes('tốt')
    );
};

const CheckItem = ({ label, checked, detail }: { label: string; checked: boolean; detail: string }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
            {checked ? (
                <CheckCircleOutlined className="text-green-500 text-lg" />
            ) : (
                <CloseCircleOutlined className="text-red-500 text-lg" />
            )}
            <span className={checked ? 'text-gray-700' : 'text-gray-400'}>{label}</span>
        </div>
        <Tag color={checked ? 'green' : 'red'}>{detail}</Tag>
    </div>
);

const XemHoSoNhanSu: React.FC<Props> = ({ vienChucId, chiTietPhieuId, hoVaTen, onClose, onSuccess }) => {
    const [profile, setProfile] = useState<FullProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (!vienChucId) return;
        setLoading(true);
        form.resetFields();

        getFullProfileById(vienChucId)
            .then(res => setProfile(res.data.data))
            .catch(() => message.error("Không thể tải hồ sơ"))
            .finally(() => setLoading(false));
    }, [vienChucId, form]);

    const handleXetDuyet = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);

            await auditPhieuDeXuatCandidate(chiTietPhieuId, {
                duDieuKien: values.duDieuKien,
                lyDo: values.lyDoKhongDu ?? ""
            });

            message.success("Đã cập nhật xét duyệt");
            onSuccess();
            onClose();
        } catch (error: any) {
            if (error.errorFields) return;
            message.error(error?.response?.data?.message || "Xét duyệt thất bại");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Drawer
            title={`Hồ sơ nhân sự: ${hoVaTen}`}
            open={!!vienChucId}
            onClose={onClose}
            placement="right"
            width="85%"
            loading={loading}
            extra={
                <Space>
                    <Button onClick={onClose}>Đóng</Button>
                    <Button type="primary" loading={submitting} onClick={handleXetDuyet}>
                        Lưu kết quả xét duyệt
                    </Button>
                </Space>
            }
        >
            {profile && (
                <>
                    {/* Header Card */}
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 mb-6">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-full bg-indigo-500 text-white flex items-center justify-center text-3xl font-bold">
                                {hoVaTen.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold mb-2">{hoVaTen}</h2>
                                <Space>
                                    <Tag color="blue">{profile.profile.tenDonVi}</Tag>
                                    <Tag color="orange">Mã: {profile.profile.maVienChuc}</Tag>
                                </Space>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Tuổi</div>
                                <div className="text-3xl font-bold text-indigo-600">
                                    {tinhTuoi(profile.profile.ngaySinh)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3 cột */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {/* Cột 1: Thông tin cá nhân */}
                        <Card title="Thông tin cá nhân" size="small">
                            <Descriptions column={1} size="small">
                                <Descriptions.Item label="CCCD">{profile.profile.soCccd}</Descriptions.Item>
                                <Descriptions.Item label="Ngày sinh">
                                    {format(profile.profile.ngaySinh)} ({tinhTuoi(profile.profile.ngaySinh)} tuổi)
                                </Descriptions.Item>
                                <Descriptions.Item label="Giới tính">
                                    {profile.profile.gioiTinh === 1 ? 'Nam' : 'Nữ'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Dân tộc">{profile.profile.danToc}</Descriptions.Item>
                                <Descriptions.Item label="Điện thoại">{profile.profile.soDienThoai}</Descriptions.Item>
                                <Descriptions.Item label="Email">{profile.profile.email}</Descriptions.Item>
                            </Descriptions>
                            <Divider />
                            <div className="text-xs font-semibold text-gray-500 mb-2">Thông tin Đảng</div>
                            <Descriptions column={1} size="small">
                                <Descriptions.Item label="Ngày kết nạp">
                                    {format(profile.profile.ngayKetNap)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày chính thức">
                                    {format(profile.profile.ngayChinhThuc)}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        {/* Cột 2: Trình độ */}
                        <Card title="Trình độ & Chuyên môn" size="small">
                            <Descriptions column={1} size="small">
                                <Descriptions.Item label="Trình độ">
                                    <Tag color="green">{profile.profile.trinhDoChuyenMon}</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Chuyên ngành">{profile.profile.chuyenNganh}</Descriptions.Item>
                                <Descriptions.Item label="Năm TN">{profile.profile.namTotNghiep}</Descriptions.Item>
                                <Descriptions.Item label="Ngạch">{profile.profile.ngach}</Descriptions.Item>
                                <Descriptions.Item label="Lý luận CT">{profile.profile.trinhDoLyLuanCt}</Descriptions.Item>
                                <Descriptions.Item label="Ngoại ngữ">{profile.profile.trinhDoNgoaiNgu}</Descriptions.Item>
                                <Descriptions.Item label="Tin học">{profile.profile.trinhDoTinHoc}</Descriptions.Item>
                            </Descriptions>
                        </Card>

                        {/* Cột 3: Đánh giá */}
                        <Card title="Xếp loại & Lịch sử" size="small">
                            <div className="mb-4">
                                <div className="text-xs font-semibold text-gray-500 mb-2">Xếp loại VC (3 năm)</div>
                                <Timeline size="small">
                                    {profile.xepLoaiVc.slice(0, 3).map(xl => (
                                        <Timeline.Item
                                            key={xl.namDanhGia}
                                            color={xl.danhGia.includes('xuất sắc') ? 'green' : 'blue'}
                                        >
                                            <div className="text-xs">
                                                <strong>{xl.namDanhGia}</strong>: {xl.danhGia}
                                            </div>
                                        </Timeline.Item>
                                    ))}
                                </Timeline>
                            </div>

                            {profile.xepLoaiDangVien.length > 0 && (
                                <div className="mb-4">
                                    <div className="text-xs font-semibold text-gray-500 mb-2">Xếp loại ĐV (3 năm)</div>
                                    <Timeline size="small">
                                        {profile.xepLoaiDangVien.slice(0, 3).map(xl => (
                                            <Timeline.Item key={xl.namDanhGia} color="red">
                                                <div className="text-xs">
                                                    <strong>{xl.namDanhGia}</strong>: {xl.danhGia}
                                                </div>
                                            </Timeline.Item>
                                        ))}
                                    </Timeline>
                                </div>
                            )}

                            {profile.lichSuChucVu.length > 0 && (
                                <div>
                                    <div className="text-xs font-semibold text-gray-500 mb-2">Lịch sử nhiệm kỳ</div>
                                    {profile.lichSuChucVu.slice(0, 2).map((nk, idx) => (
                                        <div key={idx} className="text-xs mb-2 p-2 bg-gray-50 rounded">
                                            <div className="font-semibold">{nk.tenChucDanh}</div>
                                            <div className="text-gray-500">
                                                {format(nk.ngayBatDau)} - {nk.ngayKetThuc ? format(nk.ngayKetThuc) : 'Hiện tại'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Checklist điều kiện */}
                    <Card title="Kiểm tra điều kiện bổ nhiệm" className="mb-4">
                        <Alert
                            message="Điều kiện theo Nghị định 115/2020/NĐ-CP"
                            type="info"
                            showIcon
                            className="mb-3"
                        />
                        <Space direction="vertical" className="w-full">
                            <CheckItem
                                label="Có ít nhất 3 năm xếp loại từ Hoàn thành tốt nhiệm vụ trở lên"
                                checked={kiemTraXepLoai3Nam(profile.xepLoaiVc)}
                                detail={`${profile.xepLoaiVc.length}/3 năm`}
                            />
                            <CheckItem
                                label="Trình độ chuyên môn phù hợp"
                                checked={['Tiến sĩ', 'Thạc sĩ'].includes(profile.profile.trinhDoChuyenMon)}
                                detail={profile.profile.trinhDoChuyenMon}
                            />
                            <CheckItem
                                label="Trình độ lý luận chính trị"
                                checked={['Cao cấp', 'Trung cấp'].includes(profile.profile.trinhDoLyLuanCt)}
                                detail={profile.profile.trinhDoLyLuanCt}
                            />
                            <CheckItem
                                label="Tuổi đời (dưới 60 tuổi)"
                                checked={tinhTuoi(profile.profile.ngaySinh) < 60}
                                detail={`${tinhTuoi(profile.profile.ngaySinh)} tuổi`}
                            />
                            <CheckItem
                                label="Là đảng viên chính thức"
                                checked={!!profile.profile.ngayChinhThuc}
                                detail={profile.profile.ngayChinhThuc ? format(profile.profile.ngayChinhThuc) : 'Chưa'}
                            />
                        </Space>
                    </Card>

                    {/* Form xét duyệt */}
                    <Card title="Xét duyệt">
                        <Form form={form} layout="vertical">
                            <Form.Item
                                name="duDieuKien"
                                label="Kết quả xét duyệt"
                                rules={[{ required: true, message: 'Vui lòng chọn kết quả' }]}
                            >
                                <Radio.Group>
                                    <Radio value={1}>
                                        <CheckCircleOutlined className="text-green-500" /> Đủ điều kiện
                                    </Radio>
                                    <Radio value={2}>
                                        <CloseCircleOutlined className="text-red-500" /> Không đủ điều kiện
                                    </Radio>
                                </Radio.Group>
                            </Form.Item>

                            <Form.Item
                                noStyle
                                shouldUpdate={(prev, curr) => prev.duDieuKien !== curr.duDieuKien}
                            >
                                {({ getFieldValue }) =>
                                    getFieldValue('duDieuKien') === 2 && (
                                        <Form.Item
                                            name="lyDoKhongDu"
                                            label="Lý do không đủ điều kiện"
                                            rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
                                        >
                                            <Input.TextArea rows={3} placeholder="Nhập lý do cụ thể..." />
                                        </Form.Item>
                                    )
                                }
                            </Form.Item>
                        </Form>
                    </Card>
                </>
            )}
        </Drawer>
    );
};

export default XemHoSoNhanSu;
