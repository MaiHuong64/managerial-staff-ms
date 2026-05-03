import { useState } from "react";
import { Modal, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { importExcel } from "../../api/xeploai.api";

interface Props {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

const ImportExcelModal: React.FC<Props> = ({ open, onCancel, onSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleUpload = async () => {
        if (!file) { message.warning("Vui lòng chọn file Excel"); return; }
        try {
            setLoading(true);
            const res = await importExcel(file);
            message.success(res.data.message);
            onSuccess();
        } catch (err: any) {
            console.log(err);
            message.error(err?.response?.data?.message || "Lỗi khi import");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title="Import xếp loại từ Excel" open={open} onCancel={onCancel} footer={null}>
            <div className="flex flex-col gap-4 py-4">
                <Upload
                    beforeUpload={(f) => { setFile(f); return false; }}
                    maxCount={1}
                    accept=".xlsx,.xls"
                    onRemove={() => setFile(null)}
                >
                    <Button icon={<UploadOutlined />}>Chọn file Excel</Button>
                </Upload>
                <div className="flex justify-end gap-2">
                    <Button onClick={onCancel}>Hủy</Button>
                    <Button type="primary" loading={loading} onClick={handleUpload}>
                        Import
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ImportExcelModal;