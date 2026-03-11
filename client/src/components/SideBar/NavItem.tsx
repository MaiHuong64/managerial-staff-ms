import React from "react";

interface NavProps{
    icon?: string,
    label?: string,
    active?: boolean,
    onClick: () => void
}
export const NavItem: React.FC<NavProps> = ({label, active, onClick}) => (
    <div onClick={onClick}
        className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer"
        style={{fontSize:12, fontWeight: "bold", color: active ? '#fff' : 'rgba(255,255,255,0.45)',background: active ? 'rgba(79,70,229,0.25)' : 'transparent', borderLeft: active ? '3px solid #4f46e5' : '3px solid transparent',}}
    >
       <span>{label}</span>
    </div>
);