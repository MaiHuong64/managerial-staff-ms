import React from "react"; 
// import type { NavItem } from "./NavItem";
import {DashboardOutlined, TeamOutlined,  FileTextOutlined, ApartmentOutlined, TagsOutlined, CheckOutlined, BarChartOutlined, PlusOutlined
} from "@ant-design/icons";

interface NavItem {
    section?: string;
    icon?: React.ReactNode;
    label?: string;
    path?: string;
    roles?: string[];
}

export const NAV_ITEMS: NavItem[] = [
    { section: 'Tổng quan' },
    { icon: <DashboardOutlined />, label: 'Dashboard', path: '/dashboard', roles: ['VC','VCQL','BGH','PTCCT'] },
    { icon: <TeamOutlined />, label: 'Danh sách viên chức', path: '/vien-chuc', roles: ['VCQL','BGH','PTCCT'] },
    { icon: <FileTextOutlined />, label: 'Phiếu chủ trương', path: '/phieu-chu-truong', roles: ['VCQL'] },
    { section: 'Phê duyệt' },
    { icon: <CheckOutlined />, label: 'Duyệt quy hoạch', path: '/approvePlanning', roles: ['BGH'] },
    { icon: <BarChartOutlined />, label: 'Duyệt bổ nhiệm', path: '/approveAppointment', roles: ['BGH'] },
    { section: 'Danh mục' },
    { icon: <TagsOutlined />, label: 'Quản lý chức danh', path: '/chuc-danh', roles: ['PTCCT'] },
    { icon: <ApartmentOutlined />, label: 'Quản lý đơn vị', path: '/don-vi', roles: ['PTCCT'] },
    { section: 'Nghiệp vụ' },
    { icon: <BarChartOutlined />, label: 'Quy hoạch cán bộ', path: '/dot-quy-hoach', roles: ['PTCCT'] },
    { icon: <PlusOutlined />, label: 'Bổ nhiệm viên chức', path: '/dot-bo-nhiem', roles: ['PTCCT', 'BGH'] },
    { icon: <FileTextOutlined />, label: 'Phương án nhân sự', path: '/phuong-an-nhan-su', roles: ['PTCCT', 'BGH'] },
];
export const ROLE_LABEL: Record<string, string> = {
    VC: 'Viên Chức',
    VCQL: 'Viên Chức Quản Lý',
    BGH: 'Ban Giám Hiệu',
    PTCCT: 'P.TC-CT',
};

export const ROLE_AVATAR: Record<string, string> = {
    VC: 'VC',
    VCQL: 'QL',
    BGH: 'BGH',
    PTCCT: 'TC',
};