import type React from "react";

interface PageHeaderProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, action }) => (
    <div className="flex items-start justify-between mb-6">
        <div>
            <h2 className="text-xl font-bold text-slate-800 m-0">{title}</h2>
            {description && <p className="text-sm text-slate-500 mt-1 mb-0">{description}</p>}
        </div>
        {action && <div className="ml-4 shrink-0">{action}</div>}
    </div>
);

export default PageHeader;
