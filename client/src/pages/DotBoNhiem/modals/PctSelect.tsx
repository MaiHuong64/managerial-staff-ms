import { Button, Card, Select } from "antd"
import { TeamOutlined, PlusOutlined } from "@ant-design/icons";
import type { ChucDanhItem, PCT } from "../../../types/BoNhiem";

    
interface Props{
    pctList: PCT[];
    chucDanhList: ChucDanhItem[];
    selectedPctId: number | null;
    onSelect: (id: number) => void;
    addingPct: boolean;
    onAddPCT: () => void;
}

export const PctSelect: React.FC<Props> = ({ pctList, chucDanhList, selectedPctId, onSelect, addingPct, onAddPCT }) => {
    return (
        <Card size="small" title={<span><TeamOutlined className="mr-2 text-blue-500" />Chọn phiếu chủ trương</span>}>
            <Select
                placeholder="Chọn phiếu chủ trương đã duyệt..."
                style={{ width: "100%" }}
                showSearch
                optionFilterProp="label"
                value={selectedPctId}
                onChange={(val) => onSelect(val)}
                options={pctList
                .filter(p => !chucDanhList.find(cd => cd.pct_id === p.id))
                .map(p => ({ value: p.id, label: `${p.ten_chuc_danh} — ${p.ten_don_vi}` }))}
                />
            <Button
                type="dashed"
                icon={<PlusOutlined />}
                className="w-full mt-3"
                disabled={!selectedPctId}
                loading={addingPct}
                onClick={onAddPCT}
                >
            Đưa vào danh sách đợt
            </Button>
        </Card>
    )
}
export default PctSelect;