// NavItem.tsx — dùng NavIcon thay emoji
import { NavIcon } from './NavIcon';

export const NavItem = ({ icon, label, active, onClick }: {
    icon?: string; label?: string; active: boolean; onClick: () => void;
}) => (
    <div
        onClick={onClick}
        className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all
            ${active
                ? 'bg-[#4f46e5] text-white'
                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            }`}
    >
        {icon && <NavIcon name={icon} />}
        <span className="text-xs font-medium truncate">{label}</span>
    </div>
);