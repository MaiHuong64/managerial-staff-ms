import React from "react";
import {
    CalendarOutlined,
    ClockCircleOutlined,
    SyncOutlined,
    CheckCircleOutlined,
} from "@ant-design/icons";
import { StatCard } from "../../components/common/StatCard";

interface Props {
    total: number;
    notStarted: number;
    inProgress: number;
    completed: number;
    activeFilter?: number | null;
    onFilter?: (val: number | null) => void;
}

export const AppointmentStatus: React.FC<Props> = ({ total, notStarted, inProgress, completed }) => (
    <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard title="Tổng số đợt" value={total} icon={<CalendarOutlined />} color="indigo"  />
        <StatCard title="Chưa bắt đầu" value={notStarted} icon={<ClockCircleOutlined />} color="amber"   />
        <StatCard title="Đang thực hiện" value={inProgress} icon={<SyncOutlined spin={inProgress > 0} />} color="sky" />
        <StatCard title="Hoàn thành" value={completed}  icon={<CheckCircleOutlined />} color="emerald" />
    </div>
);

export default AppointmentStatus;
