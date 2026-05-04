import { useEffect, useState } from "react";
import type { DonVi } from "../../types/DonVi";
import { deleteDonVi, getDonViList } from "../../api/donVi.api";
import { Button, Card, message, Modal, Popconfirm, Space, Table, Tag, Tooltip } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import ThemDonViModal from "./ThemDonViModal";

const DonViPage = () => {
  const [danhSachDonVi, setDanhSachDonVi] = useState<DonVi[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectModalVisible, setSelectModalVisible] = useState(false);
  const [editDonVi, setEditDonVi] = useState<DonVi | null>(null);


  const fectData = async () => {
    try {
      setLoading(true);
      const res = await getDonViList();
      setDanhSachDonVi(res.data.data || []);
    } catch {
      message.error("Không thể tải danh sách đơn vị");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fectData();
  }, []);

  const handleOpenModal = (record?: DonVi) => {
    setEditDonVi(record || null);
    setSelectModalVisible(true);
  };
  const handleDelete = async (id: number) => {
    try {
      await deleteDonVi(id);
      message.success("Xóa đơn vị thành công!");
      fectData();
    } catch (error) {
      message.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Lỗi khi xóa đơn vị");
    }
  };
  

  const columns = [
    {
      title: "Mã đơn vị",
      dataIndex: "maDonVi",
      key: "maDonVi",
      width: 120,
      render: (text: string) => (
        <span className="font-mono text-blue-600 font-semibold">{text}</span>
      )
    },
    {
      title: "Tên đơn vị",
      dataIndex: "tenDonVi",
      key: "tenDonVi",
      width: 250,  
      render: (text: string, record: DonVi) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-800">{text}</span>
          {record.diaChi && (
            <span className="text-xs text-slate-500 mt-1">📍 {record.diaChi}</span>
          )}
        </div>
      )
    },
    {
      title: "Loại",
      dataIndex: "loaiDonVi",
      key: "loaiDonVi",
      width: 120,
      render: (text: string) => (
        <Tag color="purple" className="rounded-full">
          {text}
        </Tag>
      )
    },
    {
      title: "Liên hệ",
      key: "contact",
      width: 200,
      render: (_: unknown, record: DonVi) => (
        <div className="flex flex-col gap-1 text-xs">
          {record.soDienThoai && (
            <div className="flex items-center gap-1 text-slate-600">
              <PhoneOutlined className="text-blue-500" />
              <span>{record.soDienThoai}</span>
            </div>
          )}
          {record.email && (
            <div className="flex items-center gap-1 text-slate-600">
              <MailOutlined className="text-green-500" />
              <span>{record.email}</span>
            </div>
          )}
          {!record.soDienThoai && !record.email && (
            <span className="text-slate-400">—</span>
          )}
        </div>
      )
    },
    {
      title: "Lãnh đạo đơn vị",
      key: "lanhDao",
      width: 250,
      render: (_: unknown, record: DonVi) => {
        const chucDanhTruong = record.loaiDonVi === "Phòng ban" ? "Trưởng phòng" : record.loaiDonVi === "Khoa" ? "Trưởng khoa" : "Trưởng bộ môn";
        const chucDanhPho = record.loaiDonVi === "Phòng ban" ? "Phó phòng" : record.loaiDonVi === "Khoa" ? "Phó khoa" : "Phó bộ môn";

        const hasTruong = record.tenTruongDonVi;
        const hasPho = record.tenPhoDonVi;

        if (!hasTruong && !hasPho) {
          return <Tag color="warning" className="rounded-full">Chưa có</Tag>;
        }

        return (
          <div className="flex flex-col gap-2">
            {hasTruong && (
              <div className="flex flex-col">
                <span className="text-sm font-medium">{record.tenTruongDonVi}</span>
                <span className="text-xs text-slate-400">{chucDanhTruong}</span>
              </div>
            )}
            {hasPho && (
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-600">{record.tenPhoDonVi}</span>
                <span className="text-xs text-slate-400">{chucDanhPho}</span>
              </div>
            )}
          </div>
        );
      }
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      width: 120,
      render: (status: number) => (
        <Tag
          color={status === 1 ? "success" : "default"}
          className="rounded-full font-medium"
        >
          {status === 1 ? "Hoạt động" : "Giải thể"}
        </Tag>
      )
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      fixed: 'right' as const,
      render: (_: unknown, record: DonVi) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleOpenModal(record)}
              className="text-blue-600 hover:bg-blue-50"
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc muốn xóa đơn vị này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                className="hover:bg-red-50"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <Card title={
            <div className="flex items-center justify-between">
              <span className="font-semibold">Danh sách đơn vị</span>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
                    Thêm đơn vị
                  </Button>
            </div>
        }>
              <Table columns={columns} dataSource={danhSachDonVi} rowKey="id" loading={loading} pagination={{  }} />
        </Card>

        <Modal
          title="Thêm đơn vị"
          open={selectModalVisible}
          onCancel={() => setSelectModalVisible(false)}
          footer={null}>
            <ThemDonViModal 
              isOpen={selectModalVisible} 
              onCancel={() => setSelectModalVisible(false)} 
              onSuccess={() => {
                setSelectModalVisible(false);
                fectData();}} 
              editDonVi={editDonVi}
            />
        </Modal>
      </div>
  );
}
export default DonViPage;