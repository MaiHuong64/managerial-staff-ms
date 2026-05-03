import { useEffect, useState } from "react";
import { Button, Card, message, Modal, Popconfirm, Space, Table, Tooltip } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined} from '@ant-design/icons';
import type { ChucDanh } from "../../types/ChucDanh";
import { deleteChucDanh, getChucDanhList } from "../../api/chucDanh.api";
import ThemChucDanhModal from "./ThemChucDanhModal";

const ChucDanhPage = () => {
  const [danhSachChucDanh, setDanhSachChucDanh] = useState<ChucDanh[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectModalVisible, setSelectModalVisible] = useState(false);
  const [editChucDanh, setEditChucDanh] = useState<ChucDanh | null>(null);


  const fectData = async () => {
    try {
      setLoading(true);
      const res = await getChucDanhList();
      setDanhSachChucDanh(res.data.data || []);
    } catch {
      message.error("Không thể tải danh sách chức danh");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fectData();
  }, []);

  const handleOpenModal = (record?: ChucDanh) => {
    setEditChucDanh(record || null);
    setSelectModalVisible(true);
  };
  const handleDelete = async (id: number) => {
    try {
      await deleteChucDanh(id);
      message.success("Xóa chức danh thành công!");
      fectData();
    } catch (error) {
      message.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Lỗi khi xóa chức danh");
    }
  };
  

  const columns = [
    {
      title: "Mã chức danh",
      dataIndex: "maChucDanh",
      key: "maChucDanh",
      width: 120,
      render: (text: string) => (
        <span className="font-mono text-blue-600 font-semibold">{text}</span>
      )
    },
    {
      title: "Tên chức danh",
      dataIndex: "tenChucDanh",
      key: "tenChucDanh",
      render: (text: string) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-800">{text}</span>
        </div>
      )
    },
    {
      title: "Thời hạn giữ chức vụ",
      dataIndex: "thoiHanGiuChucVu",
      key: "thoiHanGiuChucVu",
      width: 120,
      render: (val: number) => `${val} năm`
    },
    {
      title: "Hệ số phụ cấp",
      dataIndex: "heSoPhuCap",
      key: "heSoPhuCap",
      width: 200,
      render: (val: number) => Number(val).toFixed(2) 
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      fixed: 'right' as const,
      render: (_: unknown, record: ChucDanh) => (
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
              <span className="font-semibold">Danh sách chức danh</span>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
                    Thêm chức danh
                  </Button>
            </div>
        }>
              <Table columns={columns} dataSource={danhSachChucDanh} rowKey="id" loading={loading} pagination={{  }} />
        </Card>

        <Modal
          title="Thêm chức danh"
          open={selectModalVisible}
          onCancel={() => setSelectModalVisible(false)}
          footer={null}>
            <ThemChucDanhModal 
              isOpen={selectModalVisible} 
              onCancel={() => setSelectModalVisible(false)} 
              onSuccess={() => {
                setSelectModalVisible(false);
                fectData();}} 
                editChucDanh={editChucDanh}
            />
        </Modal>
      </div>
  );
}
export default ChucDanhPage;