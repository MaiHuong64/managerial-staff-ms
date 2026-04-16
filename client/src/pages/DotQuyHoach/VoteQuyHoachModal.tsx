import React, { useEffect, useMemo } from 'react';
import {
  Modal,Form,InputNumber,Table,Tag,Alert,Typography,message, Card,} from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { submitVoteQuyHoach } from '../../api/dotQuyHoach.api';

const { Text } = Typography;

// --- TYPES ---
export interface QHCandidate {
  chi_tiet_qh_id: number;
  ma_vien_chuc: string;
  ho_va_ten: string;
  ten_chuc_danh: string;
  ten_don_vi: string;
  buoc_hien_tai: number;
}

interface CandidateVoteInput {
  chiTietQHId: number;
  soPhieuDongY: number;
  soPhieuKhongDongY: number;
}

export interface VoteQHPayload {
  dotQHId: number;
  buocHoiNghi: number;
  soNguoiTrieuTap: number;
  soNguoiCoMat: number;
  soPhieuPhatRa: number;
  soPhieuThuVe: number;
  soPhieuHopLe: number;
  ketQuaUngVien: CandidateVoteInput[];
}

interface VoteQuyHoachModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  dotQuyHoachId: number;
  candidates: QHCandidate[];
  currentStep: number;
}

const STEP_NAMES: Record<number, string> = {
  2: "HN lãnh đạo lần 1 — Thảo luận",
  3: "HN CB chủ chốt — Lấy phiếu",
  4: "HN lãnh đạo mở rộng — Biểu quyết",
  5: "HN lãnh đạo lần 2 — Biểu quyết chốt",
};

const VoteQuyHoachModal: React.FC<VoteQuyHoachModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  dotQuyHoachId,
  candidates,
  currentStep,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  // Reset form mỗi khi modal mở
  useEffect(() => {
    if (visible) form.resetFields();
  }, [visible, form]);

  // Chỉ lọc các ứng viên thuộc bước hiện tại
  const activeCandidates = useMemo(() => 
    candidates.filter(c => c.buoc_hien_tai === currentStep),
    [candidates, currentStep]
  );

  // Watch values để tính toán realtime
  const values = Form.useWatch([], form);
  const soNguoiTrieuTap = values?.soNguoiTrieuTap || 0;
  const soNguoiCoMat = values?.soNguoiCoMat || 0;
  const soPhieuHopLe = values?.soPhieuHopLe || 0;

  const handleSubmit = async () => {
    try {
      const formValues = await form.validateFields();
      setLoading(true);

      const payload: VoteQHPayload = {
        dotQHId: dotQuyHoachId,
        buocHoiNghi: currentStep,
        soNguoiTrieuTap: formValues.soNguoiTrieuTap,
        soNguoiCoMat: formValues.soNguoiCoMat,
        soPhieuPhatRa: currentStep === 2 ? 0 : formValues.soPhieuPhatRa,
        soPhieuThuVe: currentStep === 2 ? 0 : formValues.soPhieuThuVe,
        soPhieuHopLe: currentStep === 2 ? 0 : formValues.soPhieuHopLe,
        ketQuaUngVien: activeCandidates.map(c => ({
          chiTietQHId: c.chi_tiet_qh_id,
          soPhieuDongY: currentStep === 2 ? 0 : (formValues[`dongY_${c.chi_tiet_qh_id}`] || 0),
          soPhieuKhongDongY: currentStep === 2 ? 0 : (formValues[`khongDongY_${c.chi_tiet_qh_id}`] || 0),
        })),
      };

      await submitVoteQuyHoach(payload);
      message.success("Cập nhật kết quả hội nghị thành công");
      onSuccess();
    } catch (error: any) {
      if (error?.errorFields) return; // Ant Design form validation error, bỏ qua
      message.error(error.response?.data?.message || "Có lỗi xảy ra khi gửi dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const renderAlert = () => {
    switch (currentStep) {
      case 2:
        return <Alert message={STEP_NAMES[2]} description="Hội nghị thảo luận — ghi nhận danh sách, chưa bỏ phiếu." type="info" showIcon icon={<InfoCircleOutlined />} className="mb-4" />;
      case 3:
        return <Alert message={STEP_NAMES[3]} description="Ngưỡng đạt: >= 30% số người CÓ MẶT." type="info" showIcon className="mb-4" />;
      case 4:
        return <Alert message={STEP_NAMES[4]} description="Ngưỡng đạt: > 50% số người CÓ MẶT." type="info" showIcon className="mb-4" />;
      case 5:
        return <Alert message={STEP_NAMES[5]} description="Ngưỡng đạt: > 50% số người TRIỆU TẬP (không dựa trên số có mặt)." type="warning" showIcon icon={<WarningOutlined />} className="mb-4" />;
      default:
        return null;
    }
  };

  const columns = [
    { title: 'STT', dataIndex: 'index', key: 'index', width: 60, render: (_: unknown, __: unknown, index: number) => index + 1 },
    { title: 'Họ và tên', dataIndex: 'ho_va_ten', key: 'ho_va_ten', render: (text: string, record: QHCandidate) => (
        <div>
          <div className="font-medium text-slate-900">{text}</div>
          <div className="text-xs text-slate-500">{record.ma_vien_chuc}</div>
        </div>
      ) 
    },
    { title: 'Chức danh', dataIndex: 'ten_chuc_danh', key: 'ten_chuc_danh' },
    {
      title: 'Phiếu Đồng ý',
      key: 'dongY',
      width: 150,
      render: (_: unknown, record: QHCandidate) => (
        <Form.Item name={`dongY_${record.chi_tiet_qh_id}`} noStyle rules={[{ required: true, message: '' }]}>
          <InputNumber min={0} max={soPhieuHopLe} className="w-full" placeholder="Số phiếu" />
        </Form.Item>
      ),
    },
    {
      title: 'Không đồng ý',
      key: 'khongDongY',
      width: 150,
      render: (_: unknown, record: QHCandidate) => (
        <Form.Item name={`khongDongY_${record.chi_tiet_qh_id}`} noStyle rules={[{ required: true, message: '' }]}>
          <InputNumber min={0} max={soPhieuHopLe} className="w-full" placeholder="Số phiếu" />
        </Form.Item>
      ),
    },
    {
      title: 'Kiểm tra',
      key: 'check',
      width: 120,
      render: (_: unknown, record: QHCandidate) => {
        const dy = values?.[`dongY_${record.chi_tiet_qh_id}`] || 0;
        const kdy = values?.[`khongDongY_${record.chi_tiet_qh_id}`] || 0;
        const total = dy + kdy;
        const isMatch = soPhieuHopLe > 0 && total === soPhieuHopLe;

        return (
          <Tag color={isMatch ? 'success' : 'error'} icon={isMatch ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
            {total}/{soPhieuHopLe}
          </Tag>
        );
      },
    },
    {
      title: 'Tỉ lệ',
      key: 'ratio',
      width: 180,
      render: (_: unknown, record: QHCandidate) => {
        const dy = values?.[`dongY_${record.chi_tiet_qh_id}`] || 0;
        let ratio = 0;
        let isPass = false;

        if (currentStep === 3 && soNguoiCoMat > 0) {
          ratio = (dy / soNguoiCoMat) * 100;
          isPass = ratio >= 30;
        } else if (currentStep === 4 && soNguoiCoMat > 0) {
          ratio = (dy / soNguoiCoMat) * 100;
          isPass = ratio > 50;
        } else if (currentStep === 5 && soNguoiTrieuTap > 0) {
          ratio = (dy / soNguoiTrieuTap) * 100;
          isPass = ratio > 50;
        }

        return (
          <div className="flex flex-col">
            <Text strong className={isPass ? 'text-green-600' : 'text-red-600'}>
              {ratio.toFixed(2)}% — {isPass ? 'ĐẠT' : 'KHÔNG ĐẠT'}
            </Text>
          </div>
        );
      },
    },
  ];

  return (
    <Modal
      title={<span className="text-xl font-bold text-slate-800">Cập nhật kết quả: {STEP_NAMES[currentStep]}</span>}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={1100}
      centered
      destroyOnClose
      okText="Lưu kết quả"
      cancelText="Đóng"
    >
      <div className="py-2">
        {renderAlert()}

        <Form form={form} layout="vertical" initialValues={{ soNguoiTrieuTap: 0, soNguoiCoMat: 0, soPhieuPhatRa: 0, soPhieuThuVe: 0, soPhieuHopLe: 0 }}>
          <Card size="small" title="Thông tin Hội nghị" className="bg-slate-50 border-slate-200 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-2">
              <Form.Item name="soNguoiTrieuTap" label="Số triệu tập" rules={[{ required: true }]}>
                <InputNumber min={0} className="w-full" />
              </Form.Item>
              <Form.Item name="soNguoiCoMat" label="Số có mặt" rules={[{ required: true }]}>
                <InputNumber min={0} max={soNguoiTrieuTap} className="w-full" />
              </Form.Item>
              
              {currentStep !== 2 && (
                <>
                  <Form.Item name="soPhieuPhatRa" label="Số phiếu phát ra" rules={[{ required: true }]}>
                    <InputNumber min={0} className="w-full" />
                  </Form.Item>
                  <Form.Item name="soPhieuThuVe" label="Số phiếu thu về" rules={[{ required: true }]}>
                    <InputNumber min={0} max={values?.soPhieuPhatRa} className="w-full" />
                  </Form.Item>
                  <Form.Item name="soPhieuHopLe" label="Số phiếu hợp lệ" rules={[{ required: true }]}>
                    <InputNumber min={0} max={values?.soPhieuThuVe} className="w-full" />
                  </Form.Item>
                </>
              )}
            </div>
          </Card>

          {currentStep !== 2 && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <Text strong className="text-lg">Danh sách ứng viên lấy phiếu</Text>
                <Tag color="blue">Số lượng: {activeCandidates.length}</Tag>
              </div>
              <Table
                dataSource={activeCandidates}
                columns={columns}
                rowKey="chi_tiet_qh_id"
                pagination={false}
                bordered
                size="middle"
                scroll={{ y: 400 }}
                className="ant-table-striped"
              />
            </div>
          )}
        </Form>
      </div>
    </Modal>
  );
};

export default VoteQuyHoachModal;