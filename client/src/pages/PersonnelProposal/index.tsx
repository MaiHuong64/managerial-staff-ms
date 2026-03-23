import React, { useState } from 'react';

const CreatePhuongAnForm = ({ selectedPersonnel, onCancel, onSuccess }) => {
    // State quản lý thông tin chung (Master)
    const [thongTinChung, setThongTinChung] = useState({
        ma_phuong_an: '',
        so_to_trinh: '',
        ngay_to_trinh: '',
        ghi_chu: ''
    });

    // State quản lý chi tiết nhân sự (Detail) - Khởi tạo từ danh sách đã chọn
    const [chiTiet, setChiTiet] = useState(
        selectedPersonnel.map(person => ({
            chi_tiet_bn_id: person.chi_tiet_bn_id,
            ho_va_ten: person.ho_va_ten, // Giữ lại để hiển thị UI
            ten_chuc_danh: person.ten_chuc_danh, // Giữ lại để hiển thị UI
            loai_phuong_an: 'Bổ nhiệm', // Default value
            ghi_chu: ''
        }))
    );

    const [isLoading, setIsLoading] = useState(false);

    // Hàm xử lý khi thay đổi thông tin chung
    const handleMasterChange = (e) => {
        const { name, value } = e.target;
        setThongTinChung(prev => ({ ...prev, [name]: value }));
    };

    // Hàm xử lý khi thay đổi chi tiết từng nhân sự (Loại PA hoặc Ghi chú)
    const handleDetailChange = (index, field, value) => {
        const newChiTiet = [...chiTiet];
        newChiTiet[index][field] = value;
        setChiTiet(newChiTiet);
    };

    // Hàm Submit gửi data xuống Backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Chuẩn bị payload đúng format yêu cầu của API
        const payload = {
            thong_tin_chung: thongTinChung,
            chi_tiet: chiTiet.map(item => ({
                chi_tiet_bn_id: item.chi_tiet_bn_id,
                loai_phuong_an: item.loai_phuong_an,
                ghi_chu: item.ghi_chu
            }))
        };

        try {
            const response = await fetch('/api/phuong-an-nhan-su', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (data.success) {
                alert("Lập phương án thành công!");
                if (onSuccess) onSuccess(); // Báo cho Component cha biết để đóng form/chuyển trang
            } else {
                alert("Lỗi: " + data.message);
            }
        } catch (error) {
            console.error("Lỗi khi submit:", error);
            alert("Có lỗi xảy ra khi kết nối đến máy chủ.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow-md">
            <h2 className="text-xl font-bold mb-4">Lập Phương Án Nhân Sự Mới</h2>

            {/* Khối Thông Tin Chung */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium mb-1">Mã phương án (*)</label>
                    <input 
                        required type="text" name="ma_phuong_an" 
                        value={thongTinChung.ma_phuong_an} onChange={handleMasterChange}
                        className="w-full border p-2 rounded" placeholder="VD: PA003"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Số tờ trình</label>
                    <input 
                        type="text" name="so_to_trinh" 
                        value={thongTinChung.so_to_trinh} onChange={handleMasterChange}
                        className="w-full border p-2 rounded" placeholder="VD: 18/TTr-ĐHAG"
                    />
                </div>
                {/* Thêm input ngày tờ trình và ghi chú tương tự... */}
            </div>

            <hr className="my-4" />

            {/* Khối Chi Tiết Nhân Sự */}
            <h3 className="text-lg font-semibold mb-3">Danh sách nhân sự đưa vào phương án</h3>
            <table className="w-full text-left border-collapse border border-gray-300 mb-6">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border p-2">Họ và tên</th>
                        <th className="border p-2">Chức danh</th>
                        <th className="border p-2">Loại phương án (*)</th>
                        <th className="border p-2">Ghi chú</th>
                    </tr>
                </thead>
                <tbody>
                    {chiTiet.map((person, index) => (
                        <tr key={person.chi_tiet_bn_id}>
                            <td className="border p-2 font-medium">{person.ho_va_ten}</td>
                            <td className="border p-2">{person.ten_chuc_danh}</td>
                            <td className="border p-2">
                                <select 
                                    className="border p-1 w-full"
                                    value={person.loai_phuong_an}
                                    onChange={(e) => handleDetailChange(index, 'loai_phuong_an', e.target.value)}
                                >
                                    <option value="Bổ nhiệm">Bổ nhiệm</option>
                                    <option value="Bổ nhiệm lại">Bổ nhiệm lại</option>
                                    <option value="Thôi chức vụ">Thôi chức vụ</option>
                                    <option value="Thôi kiêm nhiệm">Thôi kiêm nhiệm</option>
                                </select>
                            </td>
                            <td className="border p-2">
                                <input 
                                    type="text" className="w-full border p-1"
                                    value={person.ghi_chu}
                                    onChange={(e) => handleDetailChange(index, 'ghi_chu', e.target.value)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
                <button type="button" onClick={onCancel} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">
                    Hủy bỏ
                </button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                    {isLoading ? 'Đang lưu...' : 'Lưu Phương Án'}
                </button>
            </div>
        </form>
    );
};

export default CreatePhuongAnForm;