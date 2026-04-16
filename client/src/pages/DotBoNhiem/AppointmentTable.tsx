import React from "react";
import { Table, Tag, Badge } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import type { DanhSachDotBoNhiem } from "../../types/BoNhiem";
import { useNavigate } from "react-router-dom";
import { BUOC_HIEN_TAI_MAP } from "../../components/common/status";

interface Props {
    data: DanhSachDotBoNhiem[];
    loading: boolean;
}

export const  AppoinmentTable: React.FC<Props> = ({ data, loading }) => {
    const navigate = useNavigate();

    const columns = [
        {
            title: "Đợt bổ nhiệm",
            dataIndex: "tenDotBoNhiem",
            key: "tenDotBoNhiem",
            render: (text: string, record: DanhSachDotBoNhiem) => (
                <div>
                    <div className="font-semibold text-slate-800 text-sm">{text}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{record.maDotBoNhiem}</div>
                </div>
            ),
        },
        {
            title: "Số phiếu",
            dataIndex: "soPhieu",
            key: "soPhieu",
            width: 110,
            align: "center" as const,
            render: (value: number) => (
                <div className="text-center">
                    <span className="text-base font-bold text-indigo-600">{value || 0}</span>
                    <span className="text-xs text-slate-400 ml-1">phiếu</span>
                </div>
            ),
        },
        {
            title: "Bước hiện tại",
            dataIndex: "buocHienTai",
            key: "buocHienTai",
            width: 220,
            render: (status: number | null) => {
                if (status === null)
                    return <Badge status="default" text={<span className="text-slate-400 text-xs">Chưa bắt đầu</span>} />;
                const state = BUOC_HIEN_TAI_MAP[status];
                if (!state) return <Tag>—</Tag>;
                return (
                    <Tag
                        color={state.color}
                        className="rounded-full px-3 py-0.5 text-xs font-medium border-0"
                    >
                        {state.label}
                    </Tag>
                );
            },
        },
        {
            title: "",
            key: "action",
            width: 48,
            align: "center" as const,
            render: () => (
                <ArrowRightOutlined className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={data}
            loading={loading}
            rowKey="id"
            onRow={record => ({
                onClick: () => navigate(`/dot-bo-nhiem/${record.id}`),
                className: "cursor-pointer group hover:bg-slate-50 transition-colors",
            })}
            pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}–${range[1]} / ${total} đợt`,
            }}
            scroll={{ x: 700 }}
        />
    );
};

export default AppoinmentTable;
