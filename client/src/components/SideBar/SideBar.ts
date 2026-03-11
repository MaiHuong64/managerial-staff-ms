export interface NavItem {
    section?: string;
    icon?: string;
    label?: string;
    path?: string;
    roles?: string[];
}

export const NAV_ITEMS: NavItem[] = [
    { section: 'Tổng quan' },
    { icon: '🏠', label: 'Dashboard', path: '/dashboard', roles: ['vien_chuc', 'vien_chuc_ql', 'bgh', 'ptcct'] },
    { icon: '🔔', label: 'Thông báo', path: '/thong-bao', roles: ['vien_chuc', 'vien_chuc_ql', 'bgh', 'ptcct'] },
    { section: 'Hồ sơ' },
    { icon: '👤', label: 'Hồ sơ của tôi', path: '/profile', roles: ['vien_chuc', 'vien_chuc_ql', 'bgh', 'ptcct'] },
    { icon: '👥', label: 'Danh sách viên chức', path: '/vien-chuc', roles: ['vien_chuc_ql', 'bgh', 'ptcct'] },
    { icon: '✅', label: 'Xét duyệt hồ sơ', path: '/xet-duyet', roles: ['vien_chuc_ql'] },
    { section: 'Phê duyệt' },
    { icon: '📊', label: 'Duyệt quy hoạch', path: '/duyet-quy-hoach', roles: ['bgh'] },
    { icon: '📄', label: 'Duyệt bổ nhiệm', path: '/duyet-bo-nhiem', roles: ['bgh'] },
    { section: 'Danh mục' },
    { icon: '🏷️', label: 'Quản lý chức danh', path: '/chuc-danh', roles: ['ptcct'] },
    { icon: '🏢', label: 'Quản lý đơn vị', path: '/don-vi', roles: ['ptcct'] },
    { section: 'Nghiệp vụ' },
    { icon: '📊', label: 'Quy hoạch cán bộ', path: '/quy-hoach', roles: ['ptcct'] },
    { icon: '📄', label: 'Bổ nhiệm viên chức', path: '/bo-nhiem', roles: ['ptcct'] },
];

export const ROLE_LABEL: Record<string, string> = {
    vien_chuc: 'Viên Chức',
    vien_chuc_ql: 'Viên Chức Quản Lý',
    bgh: 'Ban Giám Hiệu',
    ptcct: 'P.TC-CT',
};

export const ROLE_AVATAR: Record<string, string> = {
    vien_chuc: 'VC',
    vien_chuc_ql: 'QL',
    bgh: 'BGH',
    ptcct: 'TC',
};