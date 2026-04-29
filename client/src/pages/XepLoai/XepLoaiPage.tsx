import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Tag, Card, Row, Col, Statistic, Tabs, message, Modal, Select, Input } from 'antd';
import { PlusOutlined, StarOutlined, CheckCircleOutlined, HistoryOutlined } from '@ant-design/icons';
import { getAllXepLoaiVC, getAllXepLoaiDangVien, deleteXepLoaiVC, deleteXepLoaiDangVien } from '../../api/xeploai.api';
import { type XepLoaiVC, type XepLoaiDV, MUC_XEP_LOAI_OPTIONS } from '../../types/XepLoai';

const XepLoaiPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'vc' | 'dv'>('vc');
    const [dataVC, setDataVC] = useState<XepLoaiVC[]>([]);
    const [dataDV, setDataDV] = useState<XepLoaiDV[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState<XepLoaiVC | XepLoaiDV | null>(null);
    const [historyDrawerVisible, setHistoryDrawerVisible] = useState(false);
    const [selectedVienChucId, setSelectedVienChucId] = useState<number | null>(null);
    const [selectedVienChucName, setSelectedVienChucName] = useState<string>('');
    const [filterYear, setFilterYear] = useState<number | null>(null);
    const [searchText, setSearchText] = useState('');

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [resVC, resDV] = await Promise.all([
                getAllXepLoaiVC(),
                getAllXepLoaiDangVien()
            ]);
            setDataVC(resVC.data.data);
            setDataDV(resDV.data.data);
        } catch {
            message.error('Không thể tải dữ liệu xếp loại');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleDelete = async (id: number, type: 'vc' | 'dv') => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa kết quả xếp loại này?',
            okText: 'Xóa',
            cancelText: 'Hủy',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    if (type === 'vc') {
                        await deleteXepLoaiVC(id);
                    } else {
                        await deleteXepLoaiDangVien(id);
                    }
                    message.success('Xóa thành công');
                    fetchData();
                } catch {
                    message.error('Xóa thất bại');
                }
            }
        });
    };

    const handleEdit = (record: XepLoaiVC | XepLoaiDV) => {
        setEditingRecord(record);
        setModalVisible(true);
    };

    const handleViewHistory = (vienChucId: number, hoVaTen: string) => {
        setSelectedVienChucId(vienChucId);
        setSelectedVienChucName(hoVaTen);
        setHistoryDrawerVisible(true);
    };

    const getColorByDanhGia = (danhGia: string) => {
        const option = MUC_XEP_LOAI_OPTIONS.find(o => o.value === danhGia);
        return option?.color || 'default';
    };

    // Filter data
    const filteredDataVC = useMemo(() => {
        return dataVC.filter(item => {
            const matchYear = !filterYear || item.namDanhGia === filterYear;
            const matchSearch = !searchText ||
                item.hoVaTen?.toLowerCase().includes(searchText.toLowerCase()) ||
                item.maVienChuc?.toLowerCase().includes(searchText.toLowerCase());
            return matchYear && matchSearch;
        });
    }, [dataVC, filterYear, searchText]);

    const filteredDataDV = useMemo(() => {
        return dataDV.filter(item => {
            const matchYear = !filterYear || item.namDanhGia === filterYear;
            const matchSearch = !searchText ||
                item.hoVaTen?.toLowerCase().includes(searchText.toLowerCase()) ||
                item.maVienChuc?.toLowerCase().includes(searchText.toLowerCase());
            return matchYear && matchSearch;
        });
    }, [dataDV, filterYear, searchText]);

    // Stats
    const statsVC = useMemo(() => ({
        total: dataVC.length,
        currentYear: dataVC.filter(d => d.namDanhGia === currentYear).length,
        xuatSac: dataVC.filter(d => d.danhGia.includes('xuất sắc')).length,
    }), [dataVC, currentYear]);

    const statsDV = useMemo(() => ({
        total: dataDV.length,
        currentYear: dataDV.filter(d => d.namDanhGia === currentYear).length,
        xuatSac: dataDV.filter(d => d.danhGia.includes('xuất sắc')).length,
    }), [dataDV, currentYear]);

    const columnsVC = [
        {
            title: 'Mã VC',
            dataIndex: 'maVienChuc',
            key: 'maVienChuc',
            width: 100,
            render: (text: string) => <span className="font-mono font-semibold">{text}</span>
        },
        {
            title: 'Họ tên',
            dataIndex: 'hoVaTen',
            key: 'hoVaTen',
            width: 180,
        },
        {
            title: 'Đơn vị',
            dataIndex: 'tenDonVi',
            key: 'tenDonVi',
            width: 150,
        },
        {
            title: 'Năm',
            dataIndex: 'namDanhGia',
            key: 'namDanhGia',
            width: 80,
            sorter: (a: XepLoaiVC, b: XepLoaiVC) => b.namDanhGia - a.namDanhGia,
        },
        {
            title: 'Kết quả',
            dataIndex: 'danhGia',
            key: 'danhGia',
            width: 200,
            render: (text: string) => (
                <Tag color={getColorByDanhGia(text)}>{text}</Tag>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 200,
            render: (_: unknown, record: XepLoaiVC) => (
                <div className="flex gap-2">
                    <Button
                        size="small"
                        type="link"
                        icon={<HistoryOutlined />}
                        onClick={() => handleViewHistory(record.vienChucId, record.hoVaTen || '')}
                    >
                        Lịch sử
                    </Button>
                    <Button size="small" onClick={() => handleEdit(record)}>Sửa</Button>
                    <Button size="small" danger onClick={() => handleDelete(record.id, 'vc')}>Xóa</Button>
                </div>
            )
        }
    ];

    const columnsDV = [
        {
            title: 'Mã VC',
            dataIndex: 'maVienChuc',
            key: 'maVienChuc',
            width: 100,
            render: (text: string) => <span className="font-mono font-semibold">{text}</span>
        },
        {
            title: 'Họ tên',
            dataIndex: 'hoVaTen',
            key: 'hoVaTen',
            width: 180,
        },
        {
            title: 'Đơn vị',
            dataIndex: 'tenDonVi',
            key: 'tenDonVi',
            width: 150,
        },
        {
            title: 'Năm',
            dataIndex: 'namDanhGia',
            key: 'namDanhGia',
            width: 80,
            sorter: (a: XepLoaiDV, b: XepLoaiDV) => b.namDanhGia - a.namDanhGia,
        },
        {
            title: 'Kết quả',
            dataIndex: 'danhGia',
            key: 'danhGia',
            width: 200,
            render: (text: string) => (
                <Tag color={getColorByDanhGia(text)}>{text}</Tag>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 200,
            render: (_: unknown, record: XepLoaiDV) => (
                <div className="flex gap-2">
                    <Button
                        size="small"
                        type="link"
                        icon={<HistoryOutlined />}
                        onClick={() => handleViewHistory(record.vienChucId, record.hoVaTen || '')}
                    >
                        Lịch sử
                    </Button>
                    <Button size="small" onClick={() => handleEdit(record)}>Sửa</Button>
                    <Button size="small" danger onClick={() => handleDelete(record.id, 'dv')}>Xóa</Button>
                </div>
            )
        }
    ];

    const tabItems = [
        {
            key: 'vc',
            label: 'Xếp loại viên chức',
            children: (
                <div>
                    <Row gutter={16} className="mb-6">
                        <Col span={8}>
                            <Card size="small" className="border-l-4 border-l-blue-500 shadow-sm">
                                <Statistic
                                    title="Tổng số bản ghi"
                                    value={statsVC.total}
                                    prefix={<StarOutlined />}
                                    valueStyle={{ color: '#2563eb', fontWeight: 'bold' }}
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card size="small" className="border-l-4 border-l-green-500 shadow-sm">
                                <Statistic
                                    title={`Năm ${currentYear}`}
                                    value={statsVC.currentYear}
                                    prefix={<CheckCircleOutlined />}
                                    valueStyle={{ color: '#16a34a', fontWeight: 'bold' }}
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card size="small" className="border-l-4 border-l-orange-500 shadow-sm">
                                <Statistic
                                    title="Xuất sắc"
                                    value={statsVC.xuatSac}
                                    prefix={<StarOutlined />}
                                    valueStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
                                />
                            </Card>
                        </Col>
                    </Row>

                    <div className="flex gap-4 mb-4">
                        <Select
                            placeholder="Chọn năm"
                            style={{ width: 150 }}
                            allowClear
                            value={filterYear}
                            onChange={setFilterYear}
                        >
                            {years.map(year => (
                                <Select.Option key={year} value={year}>{year}</Select.Option>
                            ))}
                        </Select>
                        <Input
                            placeholder="🔍 Tìm theo tên/mã viên chức"
                            style={{ width: 300 }}
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                        />
                    </div>

                    <Table
                        columns={columnsVC}
                        dataSource={filteredDataVC}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 10, showTotal: (total) => `Tổng ${total} bản ghi` }}
                    />
                </div>
            )
        },
        {
            key: 'dv',
            label: 'Xếp loại đảng viên',
            children: (
                <div>
                    <Row gutter={16} className="mb-6">
                        <Col span={8}>
                            <Card size="small" className="border-l-4 border-l-blue-500 shadow-sm">
                                <Statistic
                                    title="Tổng số bản ghi"
                                    value={statsDV.total}
                                    prefix={<StarOutlined />}
                                    valueStyle={{ color: '#2563eb', fontWeight: 'bold' }}
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card size="small" className="border-l-4 border-l-green-500 shadow-sm">
                                <Statistic
                                    title={`Năm ${currentYear}`}
                                    value={statsDV.currentYear}
                                    prefix={<CheckCircleOutlined />}
                                    valueStyle={{ color: '#16a34a', fontWeight: 'bold' }}
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card size="small" className="border-l-4 border-l-orange-500 shadow-sm">
                                <Statistic
                                    title="Xuất sắc"
                                    value={statsDV.xuatSac}
                                    prefix={<StarOutlined />}
                                    valueStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
                                />
                            </Card>
                        </Col>
                    </Row>

                    <div className="flex gap-4 mb-4">
                        <Select
                            placeholder="Chọn năm"
                            style={{ width: 150 }}
                            allowClear
                            value={filterYear}
                            onChange={setFilterYear}
                        >
                            {years.map(year => (
                                <Select.Option key={year} value={year}>{year}</Select.Option>
                            ))}
                        </Select>
                        <Input
                            placeholder="🔍 Tìm theo tên/mã viên chức"
                            style={{ width: 300 }}
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                        />
                    </div>

                    <Table
                        columns={columnsDV}
                        dataSource={filteredDataDV}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 10, showTotal: (total) => `Tổng ${total} bản ghi` }}
                    />
                </div>
            )
        }
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 m-0">Quản lý xếp loại hằng năm</h1>
                    <p className="text-slate-500 text-sm mt-1">Đánh giá viên chức và đảng viên theo năm</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingRecord(null);
                        setModalVisible(true);
                    }}
                >
                    Thêm kết quả
                </Button>
            </div>

            <Card className="shadow-sm">
                <Tabs
                    activeKey={activeTab}
                    onChange={(key) => setActiveTab(key as 'vc' | 'dv')}
                    items={tabItems}
                />
            </Card>
        </div>
    );
};

export default XepLoaiPage;