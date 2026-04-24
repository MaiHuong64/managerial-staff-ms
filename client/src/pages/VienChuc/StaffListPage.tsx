import React, { useEffect, useState } from "react";
import type { VienChuc } from "../../types/VienChuc";
import { SearchOutlined, UserAddOutlined, HistoryOutlined } from '@ant-design/icons';
import { Button, Input, Table, message } from "antd";
import { getVienChucList, getVienChucTheoDonVi } from "../../api/vienChuc.api";
import { getNhiemKyByStaffId } from "../../api/nhiemKyChucVu";
import { useAuth } from "../../hook/useAuth";
import { TermHistoryView, type TermUIModel } from "./LichSuNhiemKy";

export const StaffPage: React.FC = () => {
    const  {user} = useAuth()
    const [staffList, setStaffList] = useState<VienChuc[]>([]);
    const [searchText, setSearchText] = useState('');
    // const [loading, setLoading] = useState(true);
    const [loadingTerm, setLoadingTerm] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<VienChuc | null>(null);
    const [termData, setTermData] = useState<{ currentTerm: TermUIModel | null; historyTerms: TermUIModel[] }>({
        currentTerm: null,
        historyTerms: []
    });
    
    useEffect(() => {
        if(user?.vaiTro === "VCQL"){
            getVienChucTheoDonVi()
            .then(res => setStaffList(res.data.data))
            .catch(console.error);
        }
        else{
             getVienChucList()
            .then(res => setStaffList(res.data.data))
            .catch(console.error);
        }
    }, [])

    const handleViewHistory = async (staff: VienChuc) => {
        setSelectedStaff(staff);
        setLoadingTerm(true);

        try {
            const res = await getNhiemKyByStaffId(staff.id);
            const { nhiemKyHienTai, lichSuNhiemKy } = res.data.data;

            // Map backend data to UI model
            const mapToUIModel = (nk: any): TermUIModel => ({
                id: nk.id,
                role: nk.tenChucDanh,
                startDate: nk.ngayBatDau,
                endDate: nk.ngayKetThuc,
                decisionNumber: nk.soQuyetDinh || 'N/A',
                decisionDate: nk.ngayQuyetDinh,
                signer: nk.nguoiPheDuyet || 'N/A',
                signerTitle: '',
                type: nk.loaiBoNhiem || 'Bổ nhiệm',
                status: nk.trangThai === 1 ? 'Đang nhiệm kỳ' : 'Đã kết thúc',
                reasonForEnding: nk.lyDoKetThuc
            });

            setTermData({
                currentTerm: nhiemKyHienTai ? mapToUIModel(nhiemKyHienTai) : null,
                historyTerms: [
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
            setTermData({ currentTerm: null, historyTerms: [] });
        };
    
    if(!staffList) return(
        <div className="flex justify-center items-center h-screen text-gray-400 italic font-light">
            Đang tải dữ liệu viên chức...
        </div>
    )

    // Nếu đang xem chi tiết nhiệm kỳ, hiển thị TermHistoryView
    if (selectedStaff) {
        return (
            <TermHistoryView
                onBack={handleCloseHistory}
                staffName={selectedStaff.hoVaTen}
                currentTerm={termData.currentTerm}
                historyTerms={termData.historyTerms}
                loading={loadingTerm}
            />
        );
    }

    const filteredStaff = staffList.filter(s =>
        s.hoVaTen.toLowerCase().includes(searchText.toLowerCase())
    );

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
            render: (_: any, record: VienChuc) => (
                <Button
                    type="link"
                    icon={<HistoryOutlined />}
                    onClick={() => handleViewHistory(record)}
                    className="text-indigo-600"
                >
                    Xem lịch sử
                </Button>
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
                <Button type="primary" icon={<UserAddOutlined />} className="bg-indigo-600 hover:bg-indigo-700 border-none h-10 px-6 rounded-xl shadow-lg shadow-indigo-100">
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