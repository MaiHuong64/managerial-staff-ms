import React from "react";

export const NavItem = ({ icon, label, active, onClick }: {
    icon?: React.ReactNode;
    label?: string;
    active: boolean;
    onClick: () => void;
}) => (
    <div
        onClick={onClick}
        className={`
            flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer
            transition-all duration-150 border-l-2
            ${active
                ? "bg-indigo-500/20 border-indigo-400 text-white"
                : "border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }
        `}
    >
        {icon && (
            <span className={`text-base leading-none shrink-0 ${active ? "text-indigo-300" : ""}`}>
                {icon}
            </span>
        )}
        <span className="text-sm font-medium">{label}</span>
    </div>
);
