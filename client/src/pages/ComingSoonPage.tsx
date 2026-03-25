import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

interface Props {
    title: string;
    description?: string;
}

export const ComingSoonPage: React.FC<Props> = ({ title, description }) => {
    const navigate = useNavigate();
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <Result
                status="info"
                title={title}
                subTitle={description ?? "Tính năng đang được phát triển, vui lòng quay lại sau."}
                extra={
                    <Button type="primary" onClick={() => navigate("/dashboard")}>
                        Về trang chủ
                    </Button>
                }
            />
        </div>
    );
};
