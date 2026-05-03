import React, { useEffect, useState } from "react";
import type { VienChuc } from "../../types/VienChuc";
import { SearchOutlined, UserAddOutlined, HistoryOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Input, Popconfirm, Space, Table, message } from "antd";
import { deleteVienChuc, getVienChucList, getVienChucTheoDonVi } from "../../api/vienChuc.api";
import { getNhiemKyByStaffId } from "../../api/nhiemKyChucVu";
import { useAuth } from "../../hook/useAuth";
import type { NhiemKy, NhiemKyHienTai } from "../../types/NhiemKyChucVu";
import { TermHistoryView } from "./LichSuNhiemKy";
import { useNavigate } from "react-router-dom";

export const StaffPage: React.FC = () => {
    const  {user} = useAuth()
    const [staffList, setStaffList] = useState<VienChuc[]>([]);
    const [searchText, setSearchText] = useState('');
    // const [loading, setLoading] = useState(true);
    const [loadingTerm, setLoadingTerm] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<VienChuc | null>(null);
    const [termData, setTermData] = useState<{ nhiemKyHienTai: NhiemKy | null; lichSuNhiemKy: NhiemKy[] }>({
        nhiemKyHienTai: null,
        lichSuNhiemKy: []
    });
    const navigate = useNavigate();
    
    const fetchData = async () => {
        try {
            if (user?.vaiTro === "VCQL") {
                const res = await getVienChucTheoDonVi();
                setStaffList(res.data.data);
            } else {
                const res = await getVienChucList();
                setStaffList(res.data.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user?.vaiTro])

    const handleViewHistory = async (staff: VienChuc) => {
        setSelectedStaff(staff);
        setLoadingTerm(true);

        try {
            const res = await getNhiemKyByStaffId(staff.id);
            const { nhiemKyHienTai, lichSuNhiemKy } = res.data.data;

            const mapToUIModel = (nk: NhiemKyHienTai): NhiemKy => ({
                id: nk.id,
                chucDanh: nk.chucDanh,
                ngayBatDau: nk.ngayBatDau,
                ngayKetThuc: nk.ngayKetThuc,
                soQuyetDinh: nk.soQuyetDinh || 'N/A',
                ngayQuyetDinh: nk.ngayQuyetDinh,
                nguoiPheDuyet: nk.nguoiPheDuyet || '-',
                chucVu: nk.chucVu || '',
                loaiBoNhiem: nk.loaiBoNhiem || 'Bổ nhiệm',
                trangThai: nk.trangThai === 1 ? 'Đang nhiệm kỳ' : 'Đã kết thúc',
                lyDoKetThuc: nk.lyDoKetThuc
            });

            setTermData({
                nhiemKyHienTai: nhiemKyHienTai ? mapToUIModel(nhiemKyHienTai) : null,
                lichSuNhiemKy: [
                    ...(nhiemKyHienTai ? [mapToUIModel(nhiemKyHienTai)] : []),
                    ...lichSuNhiemKy.map(mapToUIModel)
                ]
            });
        } catch (error) {
            console.error(error);
            message.error('Không thể tải lịch sử nhiệm kỳ');
        } finally {
            setLoadingTerm(false);
        }
    };
    
        // Hàm đóng màn hình chi tiết
        const handleCloseHistory = () => {
            setSelectedStaff(null);
            setTermData({ nhiemKyHienTai: null, lichSuNhiemKy: [] });
        };
    
    if(!staffList) return(
        <div className="flex justify-center items-center h-screen text-gray-400 italic font-light">
            Đang tải dữ liệu viên chức...
        </div>
    )

    if (selectedStaff) {
        return (
            <TermHistoryView
                onBack={handleCloseHistory}
                tenVienChuc={selectedStaff.hoVaTen}
                nhiemKyHienTai={termData.nhiemKyHienTai}
                lichSuNhiemKy={termData.lichSuNhiemKy}
                loading={loadingTerm}
            />
        );
    }

    const filteredStaff = staffList.filter(s =>
        s.hoVaTen?.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleDelete = async (id: number) => {
        try {
          await deleteVienChuc(id);
          message.success("Xóa viên chức thành công!");
          await fetchData();
        } catch (error) {
          message.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Lỗi khi xóa viên chức");
        }
    };
    const cols = [
        {
            title: 'Mã viên chức',
            dataIndex: 'maVienChuc',
            key: 'maVienChuc',
        },
        {
            title: 'Họ và tên',
            dataIndex: 'hoVaTen',
            key: 'hoVaTen',
        },
         {
            title: 'Đơn vị',
            dataIndex: 'tenDonVi',
            key: 'tenDonVi',
        }, {
            title: 'Chức vụ hiện tại',
            dataIndex: 'chucVuHienTai',
            render: (val: string) => val || <span className="text-gray-300 italic">null</span>
        },
        {
            title: 'Ngạch',
            dataIndex: 'ngach',
            key: 'ngach',
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_: unknown, record: VienChuc) => (
                <Space>
                <Button type="link" icon={<HistoryOutlined />} onClick={() => handleViewHistory(record)} className="text-indigo-600" >
                    Xem lịch sử
                </Button>
                <Button type="link" icon={<EditOutlined />} onClick={() => navigate(`/vien-chuc/${record.id}/chinh-sua`)} className="text-green-600">
                    Chỉnh sửa
                </Button>
                <Popconfirm title="Xác nhận xóa?" description="Viên chức sẽ bị vô hiệu hóa khỏi hệ thống." onConfirm={() => handleDelete(record.id)} okText="Xóa" okButtonProps={{ danger: true }} cancelText="Hủy">
                    <Button type="link" danger icon={<DeleteOutlined />}> Xóa </Button>
                </Popconfirm>
            </Space>
            )
        }
    ]
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Danh sách Viên chức Quản lý</h1>
                    <p className="text-sm text-slate-400">Quản lý và theo dõi thông tin nhân sự toàn hệ thống</p>
                </div>
                <Button type="primary" icon={<UserAddOutlined />} className="bg-indigo-600 hover:bg-indigo-700 border-none h-10 px-6 rounded-xl shadow-lg shadow-indigo-100" onClick={() => navigate('/vien-chuc/them-moi')}>
                    Thêm viên chức
                </Button>
            </div>

            <div className="bg-white p-4 rounded-2xl flex flex-wrap gap-4 items-center">
                <Input prefix={<SearchOutlined className="text-slate-300" />}
                        placeholder="Nhập tên viên chức"
                        className="max-w-xs rounded-xl border-slate-100"
                        onChange={e => setSearchText(e.target.value)}/>
            </div>

            <div className="bg-white rounded-2xl border-slate-500 overflow-hidden">
               <Table dataSource={filteredStaff} columns={cols} rowKey="id"></Table>
            </div>

        </div>
    )
}