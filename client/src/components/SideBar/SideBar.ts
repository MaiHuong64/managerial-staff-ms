export interface NavItem {
    section?: string;
    icon?: string;
    label?: string;
    path?: string;
    roles?: string[];
}

export const NAV_ITEMS: NavItem[] = [
    { section: 'Tổng quan' },
    { icon: 'dashboard', label: 'Dashboard', path: '/dashboard', roles: ['VC','VCQL','BGH','PTCCT'] },
    { icon: 'bell', label: 'Thông báo', path: '/nofication', roles: ['VC','VCQL','BGH','PTCCT'] },
    { section: 'Hồ sơ' },
    { icon: 'user', label: 'Hồ sơ của tôi', path: '/profile', roles: ['VC','VCQL','BGH','PTCCT'] },
    { icon: 'users', label: 'Danh sách viên chức', path: '/staffs', roles: ['VCQL','BGH','PTCCT'] },
    { section: 'Phê duyệt' },
    { icon: 'check', label: 'Duyệt quy hoạch', path: '/approvePlanning', roles: ['BGH'] },
    { icon: 'doc', label: 'Duyệt bổ nhiệm', path: '/approveAppointment', roles: ['BGH'] },
    { section: 'Danh mục' },
    { icon: 'tag', label: 'Quản lý chức danh', path: '/chuc-danh', roles: ['PTCCT'] },
    { icon: 'building', label: 'Quản lý đơn vị', path: '/don-vi', roles: ['PTCCT'] },
    { section: 'Nghiệp vụ' },
    { icon: 'chart', label: 'Quy hoạch cán bộ', path: '/plannings', roles: ['PTCCT'] },
    { icon: 'plus', label: 'Bổ nhiệm viên chức', path: '/appointments', roles: ['PTCCT'] },
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