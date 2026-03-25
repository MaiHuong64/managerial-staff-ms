import {useEffect, useState } from "react";
import {useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../utils/AxiosClient";
import { Breadcrumb, Button, Table } from "antd";
import type { ChiTietQuyHoach } from "../../types/ChiTietQuyHoach";
import type { ColumnsType } from 'antd/es/table';
import {HomeOutlined, PlusOutlined} from '@ant-design/icons';

export const PlanningDetailPage: React.FC = () => {
    const {id} = useParams();
    const [staffList, setStaffList] = useState<ChiTietQuyHoach[]>([]);
    const [planning, setPlanning] = useState<ChiTietQuyHoach | null>(null);
    const [, setLoading] = useState(true);
    const navigate = useNavigate();
   
    useEffect( () => {
        const fetchData = async () => {
            try {
                const result = await axiosClient.get(`/plannings/${id}`)
                const {planning, staff} = result.data;
                setPlanning(planning);
                setStaffList(staff);
            } catch (error) {
                console.log(error);
            }
            finally {(setLoading(false))};
        }
        fetchData();
    }, [id])

    const formatDate = ((date: string) => date?new Date(date).toLocaleDateString("vi-VN") :"-")

    if(!staffList) return;
    if(!planning)  return <div>Loading...</div>;
    const columns: ColumnsType<ChiTietQuyHoach> = [{
        title: 'Tên viên chức',
        dataIndex: 'ho_va_ten'
    },
    {
        title: 'Tên đơn vị',
        dataIndex: 'ten_don_vi'
        // render: (text) => <span className="text-gray-600">{text}</span>
    },
    {
        title: 'Ngày vào quy hoạch',
        dataIndex: 'ngay_vao_qh',
        align: 'center',
        render: (val:string) => val? formatDate(val): "-"
    },
    {
        title: 'Ngày ra khỏi quy hoạch',
        dataIndex: 'ngay_ra_khoi_qh',
        render: (val:string) => val? formatDate(val):" - "
    },
    {
        title: 'Lý do ra',
        dataIndex: 'ly_do_ra_khoi_quy_hoach',
        align: 'center',
    },
    {
        title: "Trạng thái",
        key: "trang_thai",
        render: (_, record) =>
            record.trang_thai ? (
            <span className="text-red-500">Đã ra khỏi QH</span>
            ) : (
            <span className="text-green-600">Đang quy hoạch</span>
            )
        }
    ]
       
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                <Breadcrumb 
                    items={[ { title: <><HomeOutlined /> Dashboard</> },{ title: <span className="cursor-pointer hover:text-indigo-600" onClick={() => navigate('/plannings')}>Quy hoạch</span> },{ title: 'Chi tiết' },
                    ]}
                    className="text-sm font-medium"
                />

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h1 className="text-2xl font-bold text-slate-800 mb-6 border-b border-gray-200 pb-4">
                        {planning.ten_quy_hoach || 'Chi tiết quy hoạch'}
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-1">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">Loại quy hoạch</p>
                            <p className="text-sm font-semibold text-gray-700 items-center justify-center">
                                {planning.loai_quy_hoach === 1 ? 'Đầu nhiệm kỳ' : 'Rà soát hằng năm'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5"> Năm thực hiện</p>
                            <p className="text-sm font-semibold text-gray-700">{planning.nam_thuc_hien || '—'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5"> Số quyết định</p>
                            <p className="text-sm font-semibold text-indigo-600">{planning.so_qd_phe_duyet || 'Chưa có'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5"> Ngày quyết định</p>
                            <p className="text-sm font-semibold text-gray-700">{formatDate(planning.ngay_qd_phe_duyet)}</p>
                        </div>
                    </div>
                </div>

                {/* Danh sach */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-800">Danh sách viên chức trong quy hoạch</h2>
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />} 
                            className="bg-indigo-600 hover:bg-indigo-700 rounded-xl h-10 px-5 font-medium shadow-md shadow-indigo-100">Thêm nguồn nhân sự
                        </Button>
                    </div>

                    <Table 
                        dataSource={staffList} 
                        columns={columns} 
                        rowKey="id" 
                        pagination={false} // tắt phân trang 
                        className="[&_.ant-table-thead_th]:bg-gray-50/70 [&_.ant-table-thead_th]:text-gray-500 [&_.ant-table-thead_th]:font-semibold [&_.ant-table-thead_th]:text-xs [&_.ant-table-thead_th]:uppercase"
                    />
                    
                </div>
            </div>
        </div>
    )
}