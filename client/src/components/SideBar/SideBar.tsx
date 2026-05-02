import React from "react";
// import type { NavItem } from "./NavItem";
import {DashboardOutlined, TeamOutlined,  FileTextOutlined, ApartmentOutlined, TagsOutlined, BarChartOutlined, PlusOutlined, StarOutlined
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

    { section: 'Đánh giá', roles: ['PTCCT', 'VCQL'] }, 
    { icon: <StarOutlined />,      label: 'Xếp loại hằng năm', path: '/xep-loai',            roles: ['PTCCT', 'VCQL'] },

    { section: 'Quy hoạch', roles: ['VCQL','PTCCT'] }, 
    { icon: <FileTextOutlined />,  label: 'Phiếu Đề Xuất',         path: '/phieu-de-xuat',       roles: ['VCQL','PTCCT'] },
    { icon: <BarChartOutlined />,  label: 'Đợt Quy Hoạch',         path: '/dot-quy-hoach',       roles: ['PTCCT'] },

    { section: 'Bổ nhiệm', roles: ['VCQL','BGH','PTCCT'] },
    { icon: <FileTextOutlined />,  label: 'Phiếu Chủ Trương',      path: '/phieu-chu-truong',    roles: ['VCQL','BGH'] },
    { icon: <PlusOutlined />,      label: 'Đợt Bổ Nhiệm',          path: '/dot-bo-nhiem',        roles: ['PTCCT','BGH'] },
    { icon: <FileTextOutlined />,  label: 'Phương Án Nhân Sự',     path: '/phuong-an-nhan-su',   roles: ['PTCCT','BGH'] },

    { section: 'Danh mục', roles: ['PTCCT'] },
    { icon: <TagsOutlined />,      label: 'Quản lý chức danh',     path: '/chuc-danh',           roles: ['PTCCT'] },
    { icon: <ApartmentOutlined />, label: 'Quản lý đơn vị',        path: '/don-vi',              roles: ['PTCCT'] },
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