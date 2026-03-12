export interface NavItem {
    section?: string;
    icon?: string;
    label?: string;
    path?: string;
    roles?: string[];
}

export const NAV_ITEMS: NavItem[] = [
    { section: 'Tổng quan' },
    { icon: '🏠', label: 'Dashboard', path: '/dashboard', roles: ['VC','VCQL','BGH','PTCCT'] },
    { icon: '🔔', label: 'Thông báo', path: '/thong-bao', roles: ['VC','VCQL','BGH','PTCCT'] },
    { section: 'Hồ sơ' },
    { icon: '👤', label: 'Hồ sơ của tôi', path: '/profile', roles: ['VC','VCQL','BGH','PTCCT']},
    { icon: '👥', label: 'Danh sách viên chức', path: '/vien-chuc', roles: ['VCQL','BGH','PTCCT'] },
    { icon: '✅', label: 'Xét duyệt hồ sơ', path: '/xet-duyet', roles: ['VCQL'] },
    { section: 'Phê duyệt' },
    { icon: '📊', label: 'Duyệt quy hoạch', path: '/duyet-quy-hoach', roles: ['BGH'] },
    { icon: '📄', label: 'Duyệt bổ nhiệm', path: '/duyet-bo-nhiem', roles: ['BGH'] },
    { section: 'Danh mục' },
    { icon: '🏷️', label: 'Quản lý chức danh', path: '/chuc-danh', roles: ['PTCCT'] },
    { icon: '🏢', label: 'Quản lý đơn vị', path: '/don-vi', roles: ['PTCCT'] },
    { section: 'Nghiệp vụ' },
    { icon: '📊', label: 'Quy hoạch cán bộ', path: '/quy-hoach', roles: ['PTCCT'] },
    { icon: '📄', label: 'Bổ nhiệm viên chức', path: '/bo-nhiem', roles: ['PTCCT'] },
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