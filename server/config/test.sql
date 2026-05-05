CREATE TABLE don_vi (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_don_vi VARCHAR(6) UNIQUE NOT NULL,
    ten_don_vi VARCHAR(100),
    loai_don_vi VARCHAR(50),
    don_vi_cha_id INT,
    dia_chi TEXT,
    so_dien_thoai VARCHAR(15),
    email VARCHAR(100),
    trang_thai SMALLINT DEFAULT 1, -- 1: hoạt động, 0: giải thể
    ngay_thanh_lap DATE,
    CONSTRAINT fk_dv_cha FOREIGN KEY (don_vi_cha_id) REFERENCES don_vi(id)
);

CREATE TABLE vien_chuc (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_vien_chuc VARCHAR(6) UNIQUE NOT NULL,
    ho_va_ten VARCHAR(100),
    gioi_tinh SMALLINT CHECK (gioi_tinh IN (0, 1)),
    so_cccd VARCHAR(12) UNIQUE NOT NULL,
    so_dien_thoai VARCHAR(12),
    email VARCHAR(100),
    dia_chi TEXT,
    ngay_sinh DATE,
    dan_toc VARCHAR(30),
    trinh_do_chuyen_mon VARCHAR(30),
    ngay_ket_nap DATE,
    ngay_chinh_thuc DATE,
    chuyen_nganh VARCHAR(40),
    ngach VARCHAR(50),
    nam_tot_nghiep SMALLINT,
    trinh_do_ly_luan_ct VARCHAR(50),
    trinh_do_ngoai_ngu VARCHAR(50),
    trinh_do_tin_hoc VARCHAR(50),
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    trang_thai SMALLINT DEFAULT 1, -- 1: đang hoạt động, 0: đã xóa
    don_vi_id INT NOT NULL,
    CONSTRAINT fk_vc_dv FOREIGN KEY (don_vi_id) REFERENCES don_vi(id)
);

CREATE TABLE chuc_danh_quan_ly (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_chuc_danh VARCHAR(6) UNIQUE NOT NULL,
    ten_chuc_danh VARCHAR(50),
    thoi_han_giu_chuc_vu INT,
    he_so_phu_cap DECIMAL(5, 2)
);

CREATE TABLE xep_loai_vc (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nam_danh_gia INT NOT NULL,
    danh_gia VARCHAR(50),
    nhan_xet TEXT,
    vien_chuc_id INT NOT NULL,
    CONSTRAINT fk_xlvc_vc FOREIGN KEY (vien_chuc_id) REFERENCES vien_chuc(id)
);

CREATE TABLE xep_loai_dang_vien (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nam_danh_gia INT NOT NULL,
    danh_gia VARCHAR(50),
    nhan_xet TEXT,
    vien_chuc_id INT NOT NULL,
    CONSTRAINT fk_xldv_vc FOREIGN KEY (vien_chuc_id) REFERENCES vien_chuc(id)
);

--phiếu đề xuất từ đơn vị/khoa
CREATE TABLE phieu_de_xuat_nhan_su_quy_hoach (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_phieu_de_xuat VARCHAR(6) UNIQUE NOT NULL,
    tieu_de VARCHAR(255) NOT NULL,
    noi_dung TEXT,
    so_luong_de_xuat SMALLINT,
    ngay_lap DATE DEFAULT CURRENT_DATE,
    ngay_phe_duyet DATE,
    trang_thai SMALLINT DEFAULT 0, -- 0: chờ duyệt, 1: đã duyệt, 2: từ chối
    ghi_chu TEXT,
    don_vi_id INT NOT NULL,
    chuc_danh_id INT NOT NULL,
    nguoi_lap VARCHAR(100),
    CONSTRAINT fk_pdxqh_dv FOREIGN KEY (don_vi_id) REFERENCES don_vi(id),
    CONSTRAINT fk_pdxqh_cd FOREIGN KEY (chuc_danh_id) REFERENCES chuc_danh_quan_ly(id)
);

CREATE TABLE chi_tiet_phieu_de_xuat (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    phieu_de_xuat_id INT NOT NULL,
    vien_chuc_id INT NOT NULL,
    ghi_chu TEXT,
    du_dieu_kien SMALLINT DEFAULT 0, -- 0: chưa xét, 1: đủ, 2: không đủ
    ly_do_khong_du TEXT,
    CONSTRAINT fk_ctpdx_pdx FOREIGN KEY (phieu_de_xuat_id) REFERENCES phieu_de_xuat_nhan_su_quy_hoach(id),
    CONSTRAINT fk_ctpdx_vc FOREIGN KEY (vien_chuc_id) REFERENCES vien_chuc(id),
    CONSTRAINT uq_ctpdx UNIQUE (phieu_de_xuat_id, vien_chuc_id)
);

CREATE TABLE dot_quy_hoach (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_quy_hoach VARCHAR(6) UNIQUE NOT NULL,
    ten_quy_hoach VARCHAR(255) NOT NULL,
    loai_quy_hoach SMALLINT NOT NULL CHECK (loai_quy_hoach IN (1, 2)),
    nam_thuc_hien INT NOT NULL,
    nhiem_ky VARCHAR(20),
    so_qd_phe_duyet VARCHAR(20),
    ngay_qd_phe_duyet DATE,
    trang_thai SMALLINT, --0: Đang xử lý, 1: Hoàn thành bỏ phiếu (Chờ phê duyệt), 2: Đã phê duyệt
    dot_goc_id SMALLINT, 
    CONSTRAINT fk_dqh FOREIGN KEY (dot_goc_id) REFERENCES dot_quy_hoach(id)
);

CREATE TABLE chi_tiet_quy_hoach (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ngay_vao_qh DATE,
    ngay_ra_qh DATE,
    buoc_hien_tai SMALLINT DEFAULT 2, -- 2: HN lãnh đạo lần 1, 3: HN CB chủ chốt, 4: HN lãnh đạo mở rộng, 5: HN lãnh đạo lần 2, 6: hoàn thành, 0: không đạt
    so_qd_ra_khoi_quy_hoach VARCHAR(50),
    ngay_qd_ra_khoi_quy_hoach DATE,
    ly_do_ra_khoi_quy_hoach TEXT,
    trang_thai SMALLINT, --0: Bị loại, 1: Đạt, 2: Đã bổ nhiệm thành công
    loai_nguon SMALLINT,
    dot_quy_hoach_id INT NOT NULL,
    vien_chuc_id INT NOT NULL,
    chuc_danh_id INT NOT NULL,
    don_vi_id INT NOT NULL,
    chi_tiet_de_xuat_id INT,
    CONSTRAINT fk_ctqh_dqh FOREIGN KEY (dot_quy_hoach_id) REFERENCES dot_quy_hoach(id),
    CONSTRAINT fk_ctqh_vc FOREIGN KEY (vien_chuc_id) REFERENCES vien_chuc(id),
    CONSTRAINT uq_ctqh UNIQUE (dot_quy_hoach_id, vien_chuc_id, chuc_danh_id),
    CONSTRAINT fk_ctqh_cd FOREIGN KEY (chuc_danh_id) REFERENCES chuc_danh_quan_ly(id),
    CONSTRAINT fk_ctqh_dv FOREIGN KEY (don_vi_id) REFERENCES don_vi(id),
    CONSTRAINT fk_ctqh_ctpdx FOREIGN KEY (chi_tiet_de_xuat_id) REFERENCES chi_tiet_phieu_de_xuat(id)
);

CREATE TABLE ket_qua_quy_hoach (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    buoc_hoi_nghi SMALLINT NOT NULL,
    so_nguoi_trieu_tap INT,
    so_nguoi_co_mat INT,
    so_phieu_phat_ra INT,
    so_phieu_thu_ve INT,
    so_phieu_hop_le INT,
    so_phieu_dong_y INT,
    so_phieu_khong_dong_y INT,
    ket_qua SMALLINT,
    chi_tiet_qh_id INT NOT NULL,
    CONSTRAINT fk_kqqh_ctqh FOREIGN KEY (chi_tiet_qh_id) REFERENCES chi_tiet_quy_hoach(id),
    CONSTRAINT uq_kqqh_buoc UNIQUE (chi_tiet_qh_id, buoc_hoi_nghi)
);

CREATE TABLE ho_so_quy_hoach (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_ho_so VARCHAR(10) UNIQUE NOT NULL,
    ngay_lap DATE DEFAULT CURRENT_DATE,
    trang_thai SMALLINT DEFAULT 0,-- 0: chưa đủ, 1: đầy đủ, 2: cần bổ sung
    ghi_chu TEXT,
    chi_tiet_qh_id INT NOT NULL UNIQUE,
    CONSTRAINT fk_hsqh_ctqh FOREIGN KEY (chi_tiet_qh_id) REFERENCES chi_tiet_quy_hoach(id)
);

-- Danh mục tài liệu trong hồ sơ    
CREATE TABLE chi_tiet_ho_so_quy_hoach (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ten_tai_lieu VARCHAR(255) NOT NULL,
    loai_tai_lieu SMALLINT, -- 1: sơ yếu lý lịch, 2: bản nhận xét đánh giá, 3: kết luận tiêu chuẩn chính trị, 4: bản kê khai tài sản, 5: khác
    file_dinh_kem TEXT,
    ngay_cap_nhat DATE DEFAULT CURRENT_DATE,
    ho_so_qh_id INT NOT NULL,
    CONSTRAINT fk_cthsqh_hsqh FOREIGN KEY (ho_so_qh_id) REFERENCES ho_so_quy_hoach(id)
);

CREATE TABLE phieu_chu_truong (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_phieu VARCHAR(6) UNIQUE NOT NULL,
    so_to_trinh_chu_truong VARCHAR(50),
    tieu_de VARCHAR(200),
    ly_do_de_xuat TEXT,
    so_luong_de_xuat SMALLINT,
    nguon_nhan_su SMALLINT,
    ngay_lap DATE DEFAULT CURRENT_DATE,
    ngay_phe_duyet DATE,
    trang_thai SMALLINT DEFAULT 0,
    dot_quy_hoach_id INT,
    don_vi_id INT NOT NULL,
    chuc_danh_id INT NOT NULL,
    nguoi_lap VARCHAR(50),
    nguoi_duyet VARCHAR(50),
    ly_do_tu_choi TEXT,
    vien_chuc_id INT, 
    CONSTRAINT fk_pct_dqh FOREIGN KEY (dot_quy_hoach_id) REFERENCES dot_quy_hoach(id),
    CONSTRAINT fk_pct_dv FOREIGN KEY (don_vi_id) REFERENCES don_vi(id),
    CONSTRAINT fk_pct_vc FOREIGN KEY (vien_chuc_id) REFERENCES vien_chuc(id),
    CONSTRAINT fk_pct_cd FOREIGN KEY (chuc_danh_id) REFERENCES chuc_danh_quan_ly(id)
);

CREATE TABLE dot_bo_nhiem (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_dot_bo_nhiem VARCHAR(6) UNIQUE NOT NULL,
    ten_dot_bo_nhiem VARCHAR(255) NOT NULL,
    ngay_bat_dau DATE,  
    ngay_ket_thuc DATE,
    ngay_phe_duyet DATE,
    so_quyet_dinh VARCHAR(50),
    nguoi_lap VARCHAR(50),
    trang_thai SMALLINT DEFAULT 1 --1: Đang soạn thảo (chưa bắt đầu vote), 2: Đang bỏ phiếu (bước 2-5), 6: Hoàn thành, 0: Dừng
);

CREATE TABLE chi_tiet_dot_bo_nhiem (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    dot_bo_nhiem_id INT NOT NULL,
    phieu_chu_truong_id INT,
    trang_thai SMALLINT DEFAULT 1, --0: chưa hoàn thành, 1: hoàn thành
    buoc_hien_tai SMALLINT DEFAULT 2, --2: vòng 1, 3: vòng 2, 4: cán bộ chủ chốt, 5: vòng cuối, 6: hoàn thành
    CONSTRAINT fk_ctdbn_dbn FOREIGN KEY (dot_bo_nhiem_id) REFERENCES dot_bo_nhiem(id),
    CONSTRAINT fk_ctdbn_pct FOREIGN KEY (phieu_chu_truong_id) REFERENCES phieu_chu_truong(id),
    CONSTRAINT uq_ctdbn UNIQUE (dot_bo_nhiem_id, phieu_chu_truong_id)
);

CREATE TABLE chi_tiet_bo_nhiem ( 
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ly_do_vao TEXT,
    ly_do_ra TEXT,
    chi_tiet_dot_bo_nhiem_id INT NOT NULL,
    vien_chuc_id INT NOT NULL,
    chi_tiet_qh_id INT,
    buoc_hoi_nghi SMALLINT DEFAULT 2, -- Chức danh đang vote ở mức nào
    trang_thai SMALLINT DEFAULT 1, --1: Đang xử lý (đang trong vòng vote), 2: Không đạt (bị loại sau vote), 3: Đạt (được chọn bổ nhiệm)
    CONSTRAINT fk_ctbn_ctdbn FOREIGN KEY (chi_tiet_dot_bo_nhiem_id) REFERENCES chi_tiet_dot_bo_nhiem(id),
    CONSTRAINT fk_ctbn_vc FOREIGN KEY (vien_chuc_id) REFERENCES vien_chuc(id),
    CONSTRAINT fk_ctbn_ctqh FOREIGN KEY (chi_tiet_qh_id) REFERENCES chi_tiet_quy_hoach(id),
    CONSTRAINT uq_ctbn UNIQUE (chi_tiet_dot_bo_nhiem_id, vien_chuc_id)
);

CREATE TABLE ket_qua_bo_nhiem (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    buoc_hoi_nghi SMALLINT NOT NULL,    -- lịch sử phiếu của các ứng viên
    so_nguoi_trieu_tap INT,
    so_nguoi_co_mat INT,
    so_phieu_phat_ra INT,
    so_phieu_thu_ve INT,
    so_phieu_hop_le INT,
    so_phieu_dong_y INT,
    so_phieu_khong_dong_y INT,
    ket_qua SMALLINT,-- 0: không đạt, 1: đạt 
    chi_tiet_bn_id INT NOT NULL,
    CONSTRAINT fk_kqbn_ctbn FOREIGN KEY (chi_tiet_bn_id) REFERENCES chi_tiet_bo_nhiem(id),
    CONSTRAINT uq_kqbn_buoc UNIQUE (chi_tiet_bn_id, buoc_hoi_nghi)
);

CREATE TABLE phuong_an_nhan_su (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_phuong_an VARCHAR(6) UNIQUE NOT NULL,
    so_to_trinh VARCHAR(50),
    ngay_to_trinh DATE,
    ngay_lap DATE,
    ghi_chu TEXT,
    trang_thai SMALLINT DEFAULT 1, -- 0: từ chối, 1: chờ phê duyệt, 2: đã phê duyệt
    y_kien_bgh TEXT,
    ngay_phe_duyet DATE
);

CREATE TABLE chi_tiet_phuong_an (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    loai_phuong_an VARCHAR(30) NOT NULL CHECK (loai_phuong_an IN ('Bổ nhiệm', 'Bổ nhiệm lại', 'Thôi chức vụ', 'Thôi kiêm nhiệm')),
    ghi_chu TEXT,
    trang_thai SMALLINT DEFAULT 1,
    phuong_an_id INT NOT NULL,
    chi_tiet_bn_id INT NOT NULL,
    CONSTRAINT fk_ctpa_pa FOREIGN KEY (phuong_an_id) REFERENCES phuong_an_nhan_su(id),
    CONSTRAINT fk_ctpa_ctbn FOREIGN KEY (chi_tiet_bn_id) REFERENCES chi_tiet_bo_nhiem(id),
    CONSTRAINT uq_ctpa_bn UNIQUE (phuong_an_id, chi_tiet_bn_id)
);

CREATE TABLE ho_so_bo_nhiem (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_ho_so VARCHAR(6) UNIQUE NOT NULL,
    ngay_lap DATE,
    trang_thai SMALLINT DEFAULT 1,
    ghi_chu TEXT,
    chi_tiet_pa_id INT NOT NULL UNIQUE,
    phieu_chu_truong_id INT,
    CONSTRAINT fk_hs_ctpa FOREIGN KEY (chi_tiet_pa_id) REFERENCES chi_tiet_phuong_an(id),
    CONSTRAINT fk_pct_hs FOREIGN KEY (phieu_chu_truong_id) REFERENCES phieu_chu_truong(id)
);

CREATE TABLE chi_tiet_ho_so (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ten_tai_lieu VARCHAR(255) NOT NULL,
    loai_tai_lieu SMALLINT,
    file_dinh_kem TEXT,
    ngay_cap_nhat DATE,
    -- trang_thai SMALLINT DEFAULT 1,
    ho_so_bn_id INT NOT NULL,
    CONSTRAINT fk_cths_hs FOREIGN KEY (ho_so_bn_id) REFERENCES ho_so_bo_nhiem(id)
);

CREATE TABLE qd_bo_nhiem (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_bo_nhiem VARCHAR(6) UNIQUE NOT NULL,
    so_quyet_dinh VARCHAR(30),
    ngay_quyet_dinh DATE,
    ngay_co_hieu_luc DATE,
    thoi_han SMALLINT,
    loai_bo_nhiem VARCHAR(100),
    nguoi_phe_duyet VARCHAR(255),
    chuc_vu VARCHAR( 50),
    ho_so_bn_id INT NOT NULL UNIQUE,
    CONSTRAINT fk_qd_hs FOREIGN KEY (ho_so_bn_id) REFERENCES ho_so_bo_nhiem(id)
);

CREATE TABLE nhiem_ky_chuc_vu (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ngay_bat_dau DATE NOT NULL,
    ngay_ket_thuc DATE,
    ly_do_ket_thuc TEXT,
    trang_thai SMALLINT DEFAULT 1,
    vien_chuc_id INT NOT NULL,
    chuc_danh_id INT NOT NULL,
    qd_bo_nhiem_id INT,
    CONSTRAINT fk_nk_vc FOREIGN KEY (vien_chuc_id) REFERENCES vien_chuc(id),
    CONSTRAINT fk_nk_cd FOREIGN KEY (chuc_danh_id) REFERENCES chuc_danh_quan_ly(id),
    CONSTRAINT fk_nk_qd FOREIGN KEY (qd_bo_nhiem_id) REFERENCES qd_bo_nhiem(id)
);

CREATE TABLE yeu_cau_thay_doi (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_yeu_cau VARCHAR(6) UNIQUE NOT NULL,
    noi_dung TEXT,
    ngay_yeu_cau DATE,
    ngay_xu_ly DATE,
    trang_thai SMALLINT DEFAULT 0,
    loai_yeu_cau VARCHAR(100),
    ket_qua_xu_ly TEXT,
    chi_tiet_bn_id INT,
    chi_tiet_qh_id INT,
    nguoi_yeu_cau_id INT NOT NULL,
    CONSTRAINT fk_yc_ctbn FOREIGN KEY (chi_tiet_bn_id) REFERENCES chi_tiet_bo_nhiem(id),
    CONSTRAINT fk_yc_ctqh FOREIGN KEY (chi_tiet_qh_id) REFERENCES chi_tiet_quy_hoach(id),
    CONSTRAINT fk_yc_nyc FOREIGN KEY (nguoi_yeu_cau_id) REFERENCES vien_chuc(id)
);

CREATE TABLE loai_ho_so (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_ho_so VARCHAR(6) NOT NULL UNIQUE,
    ten_ho_so VARCHAR(50), 
    loai_ho_so INT
)

CREATE TABLE tai_khoan (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ten_dang_nhap VARCHAR(6) NOT NULL UNIQUE,
    mat_khau VARCHAR(255) NOT NULL,
    vai_tro VARCHAR(20),
    trang_thai SMALLINT DEFAULT 1,
    vien_chuc_id INT,
    CONSTRAINT fk_tk_nyc FOREIGN KEY (vien_chuc_id) REFERENCES vien_chuc(id)
);
-- =============================================
-- DEMO DATA - Trường Đại học An Giang (AGU)
-- =============================================

-- 1. DON VI
INSERT INTO don_vi (ma_don_vi, ten_don_vi, loai_don_vi, don_vi_cha_id, dia_chi, so_dien_thoai, email, trang_thai) VALUES
('DV001', 'Khoa công nghệ thông tin', 'Khoa', NULL, 'Văn phòng khoa, 18 Ung Văn Khiêm, TP. Long Xuyên', '0296.3841.448', 'kcntt@agu.edu.vn', 1),
('DV002', 'Phòng Tổ chức - Chính trị', 'Phòng ban', NULL, 'Tầng 3,Khu hiệu bộ, 18 Ung Văn Khiêm, TP. Long Xuyên', '0296.3841.435', 'ptcct@agu.edu.vn', 1)
('DV003', 'Khoa Nông nghiệp - Tài nguyên thiên nhiên', 'Khoa', NULL, 'Khu thực hành, 18 Ung Văn Khiêm, TP. Long Xuyên', '0296.3841.441', 'knntntn@agu.edu.vn', 1),
('DV004', 'Khoa Kinh tế - Quản trị kinh doanh', 'Khoa', NULL, 'Khu giảng đường, 18 Ung Văn Khiêm, TP. Long Xuyên', '0296.3841.443', 'kktqtkd@agu.edu.vn', 1),
('DV005', 'Phòng Đào tạo', 'Phòng ban', NULL, 'Tầng trệt, Khu hiệu bộ, 18 Ung Văn Khiêm, TP. Long Xuyên', '0296.3841.436', 'pdt@agu.edu.vn', 1),
('DV006', 'Trung tâm Tin học và Ngoại ngữ', 'Trung tâm', NULL, '18 Ung Văn Khiêm, TP. Long Xuyên', '0296.3841.458', 'ttthnn@agu.edu.vn', 1),
('DV007', 'Bộ môn giáo dục quốc phòng', 'Bộ môn', NULL, 'Văn phòng khoa CNTT, 18 Ung Văn Khiêm', '0296.3841.748', 'bmkhmt@agu.edu.vn', 1),
('DV008', 'Bộ môn giáo dục thể chất', 'Bộ môn', NULL, 'Văn phòng khoa CNTT, 18 Ung Văn Khiêm', '0296.3841.448', 'bmkhmt@agu.edu.vn', 1)
('DV009', 'Ban Giám hiệu', 'Ban Giám hiệu', NULL, 'Tầng 3, Khu hiệu bộ, 18 Ung Văn Khiêm, TP. Long Xuyên', '0296.3841.590', 'bgh@agu.edu.vn', 1);
-- 2. CHUC DANH QUAN LY
INSERT INTO chuc_danh_quan_ly (ma_chuc_danh, ten_chuc_danh, thoi_han_giu_chuc_vu, he_so_phu_cap) VALUES
('CD001', 'Trưởng phòng', 5, 0.50),
('CD002', 'Phó trưởng phòng', 5, 0.35),
('CD003', 'Trưởng khoa', 5, 0.50),
('CD004', 'Phó trưởng khoa', 5, 0.35),
('CD005', 'Trưởng bộ môn', 5, 0.25),
('CD006', 'Phó trưởng bộ môn', 5, 0.20),
('CD007', 'Hiệu trưởng', 5, 1.00),
('CD008', 'Phó Hiệu trưởng', 5, 0.80);

-- 3. VIEN CHUC (30 người)
INSERT INTO vien_chuc ( ma_vien_chuc, ho_va_ten, gioi_tinh, so_cccd, so_dien_thoai, email, dia_chi, ngay_sinh, dan_toc, trinh_do_chuyen_mon, ngay_ket_nap, ngay_chinh_thuc, chuyen_nganh, ngach, nam_tot_nghiep, trinh_do_ly_luan_ct, trinh_do_ngoai_ngu, trinh_do_tin_hoc, trang_thai, don_vi_id) VALUES
('VC001', 'Châu Ngân Khánh', 0, '086001234501', '0901234501', 'cnk@agu.edu.vn', '123 Trần Hưng Đạo, Long Xuyên', '1988-05-08', 'Kinh', 'Tiến sĩ', '2000-02-01', '2001-02-01', 'Hệ thống thông tin', 'Giảng viên', 2000, 'Cao cấp', 'C1', 'IC3', 1, 1),
('VC002', 'Đoàn Thanh Nghị', 1, '086001234502', '0901234502', 'dtn@agu.edu.vn', '45 Ngô Gia Tự, Long Xuyên', '1976-06-04', 'Kinh', 'Thạc sĩ', '2005-09-01', '2006-09-01', 'Khoa học máy tính', 'Chuyên viên cao cấp', 2004, 'Trung cấp', 'B2', 'IC3', 1, 1),
('VC003', 'Hồ Nhã Phong', 1, '086001234503', '0901234503', 'hnp@agu.edu.vn', '78 Lý Thái Tổ, Long Xuyên', '1973-12-01', 'Kinh', 'Thạc sĩ', '2008-04-01', '2009-04-01', 'Khoa học máy tính', 'Giảng viên', 2007, 'Sơ cấp', 'B1', 'IC3', 1, 1),
('VC004', 'Huỳnh Cao Thế Cường', 1, '086001234504', '0901234504', 'hctc@agu.edu.vn', '22 Hùng Vương, Long Xuyên', '1984-09-10', 'Kinh', 'Thạc sĩ', '2003-07-01', '2004-07-01', 'Tin học', 'Giảng viên', 2002, 'Trung cấp', 'B2', 'IC3', 1, 1),
('VC005', 'Huỳnh Lý Thanh Nhàn', 1, '086001234505', '0901234505', 'hltn@agu.edu.vn', '56 Trần Quốc Toản, Long Xuyên', '1986-12-08', 'Kinh', 'Tiến sĩ', '2007-03-01', '2008-03-01', 'Hệ thống thông tin', 'Giảng viên', 2006, 'Sơ cấp', 'B1', 'IC3', 1, 1),
('VC006', 'Lê Công Đoàn', 1, '086001234506', '0901234506', 'lcd@agu.edu.vn', '10 Đinh Tiên Hoàng, Long Xuyên', '1984-01-01', 'Kinh', 'Tiến sĩ', '2004-06-01', '2005-06-01', 'Khoa học máy tính', 'Giảng viên', 2003, 'Trung cấp', 'B2', 'IC3', 1, 1),
('VC007', 'Lê Hoàng Anh', 1, '086001234507', '0901234507', 'lha@agu.edu.vn', '34 Nguyễn Huệ, Long Xuyên', '1986-11-13', 'Kinh', 'Tiến sĩ', '2009-01-01', '2010-01-01', 'Hệ thống thông tin', 'Giảng viên', 2008, 'Sơ cấp', 'B1', 'IC3', 1, 1),
('VC008', 'Lê Thị Minh Nguyệt', 0, '086001234508', '0901234508', 'ltmn@agu.edu.vn', '67 Hai Bà Trưng, Long Xuyên', '1978-12-12', 'Kinh', 'Thạc sĩ', '2003-08-01', '2004-08-01', 'Khoa học máy tính', 'Giảng viên', 2002, 'Trung cấp', 'C1', 'IC3', 1, 1),
('VC009', 'Lê Trung Thư', 1, '086001234509', '0901234509', 'ltt@agu.edu.vn', '89 Lê Lợi, Long Xuyên', '1972-11-11', 'Kinh', 'Thạc sĩ', '2007-10-01', '2008-10-01', 'Tin học', 'Giảng viên', 2006, 'Sơ cấp', 'B2', 'IC3', 1, 1),
('VC010', 'Lê Văn Toán', 1, '086001234510', '0901234510', 'lvt@agu.edu.vn', '12 Phạm Hồng Thái, Long Xuyên', '1977-10-04', 'Kinh', 'Thạc sĩ', '2001-05-01', '2002-05-01', 'Hệ thống thông tin', 'Giảng viên', 2000, 'Cao cấp', 'C1', 'IC3', 1, 1),
('VC011', 'Lưu Thị Kim Loan', 0, '086001234511', '0901234511', 'ltkl@agu.edu.vn', '23 Lê Duẩn, Long Xuyên', '1980-03-12', 'Kinh', 'Thạc sĩ', '2005-02-01', '2006-02-01', 'Công nghệ thông tin', 'Chuyên viên', 2004, 'Trung cấp', 'C1', 'IC3', 1, 2),
('VC012', 'Nguyễn Hoài Nam', 1, '086001234512', '0901234512', 'nhn@agu.edu.vn', '34 Võ Thị Sáu, Long Xuyên', '1985-07-08', 'Kinh', 'Đại học', '2009-06-01', '2010-06-01', 'Công nghệ thông tin', 'Trợ giảng', 2008, 'Sơ cấp', 'B2', 'IC3', 1, 1),
('VC013', 'Nguyễn Hoàng Tùng', 1, '086001234513', '0901234513', 'nht@agu.edu.vn', '45 Nguyễn Đình Chiểu, Long Xuyên', '1986-04-18', 'Kinh', 'Thạc sĩ', '2002-08-01', '2003-08-01', 'Tin học', 'Giảng viên', 2001, 'Cao cấp', 'C1', 'IC3', 1, 1),
('VC014', 'Nguyễn Huỳnh Thuần', 1, '086001234514', '0901234514', 'nht@agu.edu.vn', '56 Phan Bội Châu, Long Xuyên', '1982-04-05', 'Kinh', 'Thạc sĩ', '2006-03-01', '2007-03-01', 'Công nghệ thông tin', 'Chuyên viên', 2005, 'Trung cấp', 'C1', 'IC3', 1, 2),
('VC015', 'Nguyễn Minh Vi', 0, '086001234515', '0901234515', 'nmv@agu.edu.vn', '67 Trần Phú, Long Xuyên', '1982-09-01', 'Kinh', 'Thạc sĩ', '2012-07-01', '2013-07-01', 'Hệ thống thông tin', 'Giảng viên', 2011, 'Sơ cấp', 'B2', 'IC3', 1, 1),
('VC016', 'Nguyễn Ngọc Minh', 1, '086001234516', '0901234516', 'nnm@agu.edu.vn', '78 Nguyễn Trãi, Long Xuyên', '1983-03-16', 'Kinh', 'Thạc sĩ', '2000-04-01', '2001-04-01', 'Công nghệ thông tin', 'Giảng viên', 1999, 'Cao cấp', 'C1', 'IC3', 1, 1),
('VC017', 'Nguyễn Quang Dũng', 1, '086001234517', '0901234517', 'nqd@agu.edu.vn', '89 Lý Tự Trọng, Long Xuyên', '1981-02-14', 'Kinh', 'Thạc sĩ', '2005-11-01', '2006-11-01', 'Công nghệ thông tin', 'Chuyên viên', 2004, 'Trung cấp', 'C1', 'IC3', 1, 2),
('VC018', 'Nguyễn Quang Huy', 1, '086001234518', '0901234518', 'nqh@agu.edu.vn', '12 Đinh Bộ Lĩnh, Long Xuyên', '1976-01-09', 'Kinh', 'Thạc sĩ', '2011-09-01', '2012-09-01', 'Khoa học máy tính', 'Giảng viên', 2010, 'Sơ cấp', 'B2', 'IC3', 1, 1),
('VC019', 'Nguyễn Quang Tường', 1, '086001234519', '0901234519', 'nqt@agu.edu.vn', '23 Trần Bình Trọng, Long Xuyên', '1974-05-18', 'Kinh', 'Đại học', '1999-03-01', '2000-03-01', 'Công nghệ thông tin', 'Chuyên viên', 1998, 'Cao cấp', 'C1', 'IC3', 1, 2),
('VC020', 'Nguyễn Thái Dư', 1, '086001234520', '0901234520', 'ntd@agu.edu.vn', '34 Chu Văn An, Long Xuyên', '1974-12-10', 'Kinh', 'Thạc sĩ', '2007-06-01', '2008-06-01', 'Công nghệ thông tin', 'Giảng viên', 2006, 'Trung cấp', 'C1', 'IC3', 1, 1),
('VC021', 'Nguyễn Thị Lan Quyên', 0, '086001234521', '0901234521', 'ntlq@agu.edu.vn', '45 Hoàng Diệu, Long Xuyên', '1979-03-21', 'Kinh', 'Thạc sĩ', '2013-08-01', '2014-08-01', 'Hệ thống thông tin', 'Giảng viên', 2012, 'Sơ cấp', 'B2', 'IC3', 1, 1),
('VC022', 'Nguyễn Thị Mỹ Truyền', 0, '086001234522', '0901234522', 'ntmt@agu.edu.vn', '56 Phan Đình Phùng, Long Xuyên', '1979-02-20', 'Kinh', 'Tiến sĩ', '2001-10-01', '2002-10-01', 'Khoa học máy tính', 'Giảng viên', 2000, 'Cao cấp', 'C1', 'IC3', 1, 1),
('VC023', 'Nguyễn Văn Đông', 1, '086001234523', '0901234523', 'nvd@agu.edu.vn', '67 Lê Văn Tám, Long Xuyên', '1979-01-12', 'Kinh', 'Thạc sĩ', '2006-07-01', '2007-07-01', 'Hệ thống thông tin', 'Giảng viên', 2005, 'Trung cấp', 'B2', 'IC3', 1, 1),
('VC024', 'Nguyễn Văn Hòa', 0, '086001234524', '0901234524', 'nvh@agu.edu.vn', '78 Nguyễn Văn Cừ, Long Xuyên', '1974-05-28', 'Kinh', 'Thạc sĩ', '2003-05-01', '2004-05-01', 'Tin học', 'Giảng viên chính', 2002, 'Cao cấp', 'C1', 'IC3', 1, 1),
('VC025', 'Phạm Hữu Dũng', 1, '086001234525', '0901234525', 'phd@agu.edu.vn', '89 Đinh Tiên Hoàng, Long Xuyên', '1975-01-26', 'Kinh', 'Thạc sĩ', '2009-04-01', '2010-04-01', 'Hệ thống thông tin', 'Giảng viên', 2008, 'Sơ cấp', 'B2', 'IC3', 1, 1),
('VC026', 'Phạm Thị Mộng Trinh', 0, '086001234526', '0901234526', 'ptmt@agu.edu.vn', '12 Trần Văn Ơn, Long Xuyên', '1980-06-14', 'Kinh', 'Thạc sĩ', '2004-09-01', '2005-09-01', 'Công nghệ thông tin', 'Chuyên viên', 2003, 'Trung cấp', 'C1', 'IC3', 1, 1),
('VC027', 'Phan Minh Trí', 1, '086001234527', '0901234527', 'pmt@agu.edu.vn', '23 Trần Quang Khải, Long Xuyên', '1973-03-02', 'Kinh', 'Thạc sĩ', '2010-08-01', '2011-08-01', 'Quản lý giáo dục', 'Giảng viên', 2009, 'Sơ cấp', 'B1', 'IC3', 1, 1),
('VC028', 'Phan Thanh Bình', 1, '086001234528', '0901234528', 'ptb@agu.edu.vn', '34 Ngô Quyền, Long Xuyên', '1975-12-29', 'Kinh', 'Thạc sĩ', '2004-06-01', '2005-06-01', 'Tin học', 'Giảng viên', 2003, 'Trung cấp', 'B2', 'IC3', 1, 1),
('VC029', 'Quách Thị Hồng', 0, '086001234529', '0901234529', 'qth@agu.edu.vn', '45 Bà Triệu, Long Xuyên', '1988-07-05', 'Kinh', 'Thạc sĩ', '2012-06-01', '2013-06-01', 'Công nghệ thông tin', 'Chuyên viên', 2011, 'Sơ cấp', 'B1', 'IC3', 1, 1),
('VC030', 'Thiều Thanh Quang Phú', 1, '086001234530', '0901234530', 'ttqp@agu.edu.vn', '56 Lê Thánh Tông, Long Xuyên', '1985-09-07', 'Kinh', 'Thạc sĩ', '2008-08-01', '2009-08-01', 'Hệ thống thông tin', 'Giảng viên', 2007, 'Sơ cấp', 'B1', 'IC3', 1, 1),
('VC031', 'Nguyễn Thế Thao', 1, '086001234531', '0901234531', 'ntt@agu.edu.vn', '12 Nguyễn Trãi, Long Xuyên', '1978-08-18', 'Kinh', 'Tiến sĩ', '2005-01-01', '2006-01-01', 'Chăn nuôi', 'Giảng viên', 2004, 'Sơ cấp', 'B2', 'IC3', 1, 3),
('VC032', 'Nguyễn Tuyết Giang', 0, '086001234532', '0901234532', 'ntg@agu.edu.vn', '34 Trần Hưng Đạo, Long Xuyên', '1981-09-08', 'Kinh', 'Thạc sĩ', '2007-02-01', '2008-02-01', 'Khoa học Động vật', 'Giảng viên', 2005, 'Sơ cấp', 'B1', 'IC3', 1, 3),
('VC033', 'Võ Lâm', 1, '086001234533', '0901234533', 'vl@agu.edu.vn', '56 Lý Thái Tổ, Long Xuyên', '1970-10-05', 'Kinh', 'Tiến sĩ', '2000-03-01', '2001-03-01', 'Chăn nuôi', 'Giảng viên', 1998, 'Cao cấp', 'C1', 'IC3', 1, 3),
('VC034', 'Dương Văn Nhã', 1, '086001234534', '0901234534', 'dvn@agu.edu.vn', '78 Hùng Vương, Long Xuyên', '1971-01-01', 'Kinh', 'Tiến sĩ', '1995-04-01', '1996-04-01', 'Khoa học Đất', 'Giảng viên', 1993, 'Cao cấp', 'C1', 'IC3', 1, 3),
('VC035', 'Nguyễn Văn Thái', 1, '086001234535', '0901234535', 'nvt@agu.edu.vn', '90 Nguyễn Huệ, Long Xuyên', '1987-08-02', 'Kinh', 'Đại học', '2010-05-01', '2011-05-01', 'Phát triển nông thôn', 'Giảng viên', 2009, 'Trung cấp', 'B2', 'IC3', 1, 3),
-- ==============================================================================
-- GIẢNG VIÊN KHOA KINH TẾ - QUẢN TRỊ KINH DOANH (don_vi_id = 4)
-- ==============================================================================
('VC036', 'Nguyễn Trí Tâm', 1, '086001234536', '0901234536', 'ntt2@agu.edu.vn', '15 Lê Lợi, Long Xuyên', '1952-03-12', 'Kinh', 'Tiến sĩ', '1980-06-01', '1981-06-01', 'Kinh tế tài chính', 'Giảng viên', 1978, 'Sơ cấp', 'B1', 'IC3', 1, 4),
('VC037', 'Bùi Thanh Quang', 1, '086001234537', '0901234537', 'btq@agu.edu.vn', '27 Phạm Hồng Thái, Long Xuyên', '1968-01-01', 'Kinh', 'Tiến sĩ', '1992-07-01', '1993-07-01', 'Tài chính doanh nghiệp', 'Giảng viên', 1990, 'Sơ cấp', 'B2', 'IC3', 1, 4),
('VC038', 'Tô Thiện Hiền', 1, '086001234538', '0901234538', 'tth@agu.edu.vn', '39 Chu Văn An, Long Xuyên', '1966-02-16', 'Kinh', 'Tiến sĩ', '1990-08-01', '1991-08-01', 'Tài chính ngân hàng', 'Giảng viên chính', 1988, 'Sơ cấp', 'B2', 'IC3', 1, 4),
('VC039', 'Nguyễn Lan Duyên', 0, '086001234539', '0901234539', 'nld@agu.edu.vn', '41 Đinh Bộ Lĩnh, Long Xuyên', '1980-01-23', 'Kinh', 'Thạc sĩ', '2005-09-01', '2006-09-01', 'Kinh tế nông nghiệp', 'Giảng viên', 2003, 'Trung cấp', 'C1', 'IC3', 1, 4),
('VC040', 'Mai Thị Ánh Tuyết', 0, '086001234540', '0901234540', 'mtat@agu.edu.vn', '53 Võ Thị Sáu, Long Xuyên', '1960-12-01', 'Kinh', 'Tiến sĩ', '1985-10-01', '1986-10-01', 'Kinh tế', 'Giảng viên', 1983, 'Trung cấp', 'B2', 'IC3', 1, 4);
-- ==============================================================================
-- GIẢNG VIÊN BỘ MÔN GIÁO DỤC QUỐC PHÒNG (don_vi_id = 7)
-- ==============================================================================
('VC041', 'Bùi Trường Xanh', 1, '086001234541', '0901234541', 'btx@agu.edu.vn', '12 Phạm Ngũ Lão, Long Xuyên', '1989-02-28', 'Kinh', 'Đại học', '2012-08-01', '2013-08-01', 'Giáo dục chính trị - Giáo dục Quốc phòng', 'Trợ giảng', 2011, 'Sơ cấp', 'B1', 'IC3', 1, 7),
-- ==============================================================================
-- GIẢNG VIÊN BỘ MÔN GIÁO DỤC THỂ CHẤT (don_vi_id = 8)
-- ==============================================================================
('VC042', 'Nguyễn Trần Phương Thảo', 0, '086001234542', '0901234542', 'ntpthao@agu.edu.vn', '34 Tôn Đức Thắng, Long Xuyên', '1967-06-09', 'Kinh', 'Thạc sĩ', '1990-09-01', '1991-09-01', 'Giáo dục học', 'Giảng viên', 1989, 'Sơ cấp', 'B2', 'IC3', 1, 8),
('VC043', 'Văng Công Danh', 1, '086001234543', '0901234543', 'vcd@agu.edu.vn', '56 Nguyễn Trường Tộ, Long Xuyên', '1964-05-15', 'Kinh', 'Thạc sĩ', '1988-01-01', '1989-01-01', 'Giáo dục học', 'Giảng viên chính', 1986, 'Trung cấp', 'C1', 'IC3', 1, 8),
('VC044', 'Trần Kỳ Quốc Tuấn', 1, '086001234544', '0901234544', 'tkqt@agu.edu.vn', '78 Thoại Ngọc Hầu, Long Xuyên', '1982-02-14', 'Kinh', 'Thạc sĩ', '2005-11-01', '2006-11-01', 'Thể dục Thể thao', 'Giảng viên', 2004, 'Sơ cấp', 'B2', 'IC3', 1, 8);
-- PGS.TS Võ Văn Thắng (Nguyên Hiệu trưởng)
('VC048', 'Võ Văn Thắng', 1, '086001234548', '0901234548', 'vvthang@agu.edu.vn', 'Khu Hiệu bộ, 18 Ung Văn Khiêm, Long Xuyên', '1962-05-15', 'Kinh', 'PGS.TS', '1990-02-03', '1991-02-03', 'Triết học', 'Giảng viên cao cấp', 1985, 'Cao cấp', 'C1', 'IC3', 1, 9),

-- TS. Nguyễn Hữu Trí (Phó Hiệu trưởng phụ trách)
('VC049', 'Nguyễn Hữu Trí', 1, '086001234549', '0901234549', 'nhtri@agu.edu.vn', 'Khu Hiệu bộ, 18 Ung Văn Khiêm, Long Xuyên', '1975-08-20', 'Kinh', 'Tiến sĩ', '2005-05-19', '2006-05-19', 'Môi trường và nghiên cứu tài nguyên', 'Giảng viên chính', 2005, 'Cao cấp', 'C1', 'IC3', 1, 9),

-- TS. Nguyễn Phương Thảo (Phó Hiệu trưởng)
('VC050', 'Nguyễn Phương Thảo', 0, '086001234550', '0985877299', 'npthao@agu.edu.vn', '18 Ung Văn Khiêm, Đông Xuyên, TP. Long Xuyên', '1982-01-01', 'Kinh', 'Tiến sĩ', '2008-09-02', '2009-09-02', 'Lý luận và PPDH Toán', 'Giảng viên', 2015, 'Cao cấp', 'C', 'IC3', 1, 9);



-- 4. XEP LOAI VIEN CHUC
INSERT INTO xep_loai_vc (nam_danh_gia, danh_gia, nhan_xet, vien_chuc_id) VALUES
(2022, 'Hoàn thành xuất sắc nhiệm vụ', 'Tích cực, có nhiều đóng góp cho đơn vị', 1),
(2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Gương mẫu, trách nhiệm cao trong công tác tổ chức', 1),
 
(2022, 'Hoàn thành tốt nhiệm vụ', 'Chấp hành tốt nội quy, quy định', 2),
(2023, 'Hoàn thành tốt nhiệm vụ', 'Năng lực chuyên môn ổn định', 2),
 
(2022, 'Hoàn thành tốt nhiệm vụ', 'Hoàn thành các nhiệm vụ được giao', 3),
(2023, 'Hoàn thành tốt nhiệm vụ', 'Tích cực trong công tác chuyên môn', 3),
 
(2022, 'Hoàn thành xuất sắc nhiệm vụ', 'Quản lý hành chính hiệu quả, gương mẫu', 4),
(2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Tổ chức tốt công tác văn phòng', 4),
 
(2022, 'Hoàn thành tốt nhiệm vụ', 'Nhiệt tình, trách nhiệm trong công việc', 5),
(2023, 'Hoàn thành tốt nhiệm vụ', 'Hoàn thành tốt công tác văn thư lưu trữ', 5),
 
(2022, 'Hoàn thành xuất sắc nhiệm vụ', 'Quản lý tài chính minh bạch, hiệu quả', 6),
(2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Lập kế hoạch tài vụ chính xác, kịp thời', 6),
 
(2022, 'Hoàn thành tốt nhiệm vụ', 'Thực hiện tốt công tác kế toán', 7),
(2023, 'Hoàn thành tốt nhiệm vụ', 'Phối hợp tốt với các đơn vị trong công tác tài vụ', 7),
 
(2022, 'Hoàn thành xuất sắc nhiệm vụ', 'Quản lý đào tạo bài bản, khoa học', 8),
(2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Cải tiến quy trình đào tạo hiệu quả', 8),
 
(2022, 'Hoàn thành tốt nhiệm vụ', 'Hỗ trợ tốt công tác đào tạo', 9),
(2023, 'Hoàn thành tốt nhiệm vụ', 'Tích cực trong công tác quản lý sinh viên', 9),
 
(2022, 'Hoàn thành xuất sắc nhiệm vụ', 'Nghiên cứu nông nghiệp đạt kết quả xuất sắc', 10),
(2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Chủ nhiệm đề tài cấp tỉnh thành công', 10),
 
(2022, 'Hoàn thành tốt nhiệm vụ', 'Giảng dạy và nghiên cứu tốt', 11),
(2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Công bố nhiều bài báo khoa học uy tín', 11),
 
(2022, 'Hoàn thành tốt nhiệm vụ', 'Giảng dạy nhiệt tình, sinh viên yêu thích', 12),
(2023, 'Hoàn thành tốt nhiệm vụ', 'Tích cực đổi mới phương pháp giảng dạy', 12),
 
(2022, 'Hoàn thành xuất sắc nhiệm vụ', 'Dẫn đầu nghiên cứu CNTT trong khoa', 13),
(2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Xuất bản nhiều công trình khoa học quốc tế', 13),
 
(2022, 'Hoàn thành xuất sắc nhiệm vụ', 'Nghiên cứu môi trường đạt kết quả tốt', 14),
(2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Chủ trì dự án môi trường cấp bộ', 14),
 
(2022, 'Hoàn thành tốt nhiệm vụ', 'Giảng dạy kỹ thuật hiệu quả', 15),
(2023, 'Hoàn thành tốt nhiệm vụ', 'Hỗ trợ sinh viên tốt trong học tập', 15),
 
(2022, 'Hoàn thành xuất sắc nhiệm vụ', 'Lãnh đạo khoa xuất sắc, uy tín cao', 16),
(2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Phát triển chương trình đào tạo sư phạm', 16),
 
(2022, 'Hoàn thành tốt nhiệm vụ', 'Giảng dạy Toán hiệu quả, sinh viên đánh giá cao', 17),
(2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Nghiên cứu và ứng dụng toán học trong giảng dạy', 17),
 
(2022, 'Hoàn thành tốt nhiệm vụ', 'Tích cực trong giảng dạy Vật lý', 18),
(2023, 'Hoàn thành tốt nhiệm vụ', 'Hỗ trợ sinh viên trong thực hành thí nghiệm', 18),
 
(2022, 'Hoàn thành xuất sắc nhiệm vụ', 'Quản lý khoa hiệu quả, uy tín cao', 19),
(2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Phát triển hợp tác doanh nghiệp cho sinh viên', 19),
 
(2022, 'Hoàn thành xuất sắc nhiệm vụ', 'Nghiên cứu kinh tế đạt nhiều thành tích', 20),
(2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Công bố nhiều bài báo kinh tế uy tín', 20),
 
(2022, 'Hoàn thành tốt nhiệm vụ', 'Giảng dạy kế toán tốt, sinh viên hài lòng', 21),
(2023, 'Hoàn thành tốt nhiệm vụ', 'Tích cực hướng dẫn sinh viên thực tập', 21),
 
(2022, 'Hoàn thành xuất sắc nhiệm vụ', 'Giảng dạy triết học sâu sắc, có uy tín', 22),
(2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Hoàn thành tốt công tác tư tưởng chính trị', 22),
 
(2022, 'Hoàn thành tốt nhiệm vụ', 'Nhiệt tình trong công tác lý luận chính trị', 23),
(2023, 'Hoàn thành tốt nhiệm vụ', 'Tích cực tuyên truyền tư tưởng Hồ Chí Minh', 23),
 
(2022, 'Hoàn thành xuất sắc nhiệm vụ', 'Giảng dạy ngoại ngữ xuất sắc, uy tín cao', 24),
(2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Phát triển chương trình tiếng Anh chuẩn quốc tế', 24),
 
(2022, 'Hoàn thành tốt nhiệm vụ', 'Giảng dạy tiếng Pháp hiệu quả', 25),
(2023, 'Hoàn thành tốt nhiệm vụ', 'Tích cực đổi mới phương pháp giảng ngoại ngữ', 25),
 
(2022, 'Hoàn thành xuất sắc nhiệm vụ', 'Nghiên cứu toán học ứng dụng xuất sắc', 26),
(2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Dẫn đầu bộ môn trong nghiên cứu khoa học', 26),
 
(2022, 'Hoàn thành tốt nhiệm vụ', 'Giảng dạy tin học hiệu quả', 27),
(2023, 'Hoàn thành tốt nhiệm vụ', 'Hỗ trợ tốt sinh viên trong học lập trình', 27),
 
(2022, 'Hoàn thành xuất sắc nhiệm vụ', 'Quản lý bộ môn GDTC tốt, uy tín cao', 28),
(2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Tổ chức hoạt động thể thao sinh viên hiệu quả', 28),
 
(2022, 'Hoàn thành tốt nhiệm vụ', 'Giảng dạy thể dục nhiệt tình', 29),
(2023, 'Hoàn thành tốt nhiệm vụ', 'Tích cực trong các phong trào thể thao', 29),
 
(2022, 'Hoàn thành tốt nhiệm vụ', 'Hỗ trợ sinh viên tốt trong công tác xã hội', 30),
(2023, 'Hoàn thành tốt nhiệm vụ', 'Tích cực trong công tác sinh viên', 30);
 
-- =============================================
-- XEP LOAI DANG VIEN - Chỉ các đảng viên (khoảng 20 người)
-- =============================================
INSERT INTO xep_loai_dang_vien (nam_danh_gia, danh_gia, nhan_xet, vien_chuc_id) VALUES
(2022, 'Hoàn thành xuất sắc nhiệm vụ', 'Tiên phong, gương mẫu trong chi bộ', 1),
(2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Phát huy tốt vai trò đảng viên', 1),
(2022, 'Hoàn thành tốt nhiệm vụ', 'Tham gia sinh hoạt chi bộ đầy đủ', 2),
(2023, 'Hoàn thành tốt nhiệm vụ', 'Chấp hành tốt Điều lệ Đảng', 2),
(2022, 'Hoàn thành xuất sắc nhiệm vụ', 'Gương mẫu trong lãnh đạo, quản lý', 4),
(2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Phát huy vai trò đảng viên trong đơn vị', 4),
(2022, 'Hoàn thành tốt nhiệm vụ', 'Chấp hành tốt chủ trương, đường lối của Đảng', 6),
(2023, 'Hoàn thành tốt nhiệm vụ', 'Tích cực tham gia sinh hoạt chi bộ', 6),
(2022, 'Hoàn thành xuất sắc nhiệm vụ', 'Đóng góp tích cực cho hoạt động chi bộ', 8),
(2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Giữ vững lập trường, phẩm chất đảng viên', 8),
(2022, 'Hoàn thành xuất sắc nhiệm vụ', 'Nêu cao tinh thần trách nhiệm đảng viên', 10),
(2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Dẫn đầu chi bộ trong các phong trào thi đua', 10),
(2022, 'Hoàn thành tốt nhiệm vụ', 'Thực hiện tốt nghị quyết chi bộ', 11),
(2023, 'Hoàn thành tốt nhiệm vụ', 'Gương mẫu trong lối sống, tác phong', 11),
(2022, 'Hoàn thành xuất sắc nhiệm vụ', 'Tích cực đấu tranh bảo vệ nền tảng tư tưởng', 13),
(2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Hoàn thành xuất sắc nhiệm vụ đảng giao', 13),
(2022, 'Hoàn thành tốt nhiệm vụ', 'Chấp hành tốt các nghị quyết của Đảng', 14),
(2023, 'Hoàn thành tốt nhiệm vụ', 'Tích cực tham gia các hoạt động đảng', 14),
(2022, 'Hoàn thành xuất sắc nhiệm vụ', 'Lãnh đạo chi bộ xuất sắc', 16),
(2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Phát triển đảng viên mới trong đơn vị', 16),
(2022, 'Hoàn thành tốt nhiệm vụ', 'Nhiệt tình tham gia công tác đảng', 19),
(2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Hoàn thành xuất sắc nhiệm vụ đảng giao', 19),
(2022, 'Hoàn thành xuất sắc nhiệm vụ', 'Gương mẫu trong công tác tư tưởng chính trị', 22),
(2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Tích cực tuyên truyền, giáo dục chính trị', 22),
(2022, 'Hoàn thành tốt nhiệm vụ', 'Chấp hành tốt điều lệ Đảng', 24),
(2023, 'Hoàn thành tốt nhiệm vụ', 'Tham gia đầy đủ sinh hoạt chi bộ', 24),
(2022, 'Hoàn thành xuất sắc nhiệm vụ', 'Đóng góp tích cực cho chi bộ bộ môn', 26),
(2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Nêu cao vai trò đảng viên trong nghiên cứu KH', 26),
(2022, 'Hoàn thành tốt nhiệm vụ', 'Thực hiện tốt nhiệm vụ đảng viên', 28),
(2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Gương mẫu trong công tác và sinh hoạt', 28);

-- =============================================
-- BỔ SUNG DATA VIÊN CHỨC (Năm 2021 - Tạo nền tảng quá khứ)
-- =============================================
INSERT INTO xep_loai_vc (nam_danh_gia, danh_gia, nhan_xet, vien_chuc_id) VALUES
(2021, 'Hoàn thành xuất sắc nhiệm vụ', 'Đạt danh hiệu chiến sĩ thi đua cấp cơ sở', 1),
(2021, 'Hoàn thành tốt nhiệm vụ', 'Mới tiếp nhận công tác, thích nghi nhanh', 2),
(2021, 'Không hoàn thành nhiệm vụ', 'Chưa hoàn thành định mức giờ chuẩn giảng dạy', 3), -- Test case: Quá khứ từng tạch
(2021, 'Hoàn thành tốt nhiệm vụ', 'Thực hiện tốt nhiệm vụ được giao', 4),
(2021, 'Hoàn thành nhiệm vụ', 'Còn chậm trễ trong báo cáo chuyên đề', 5), -- Test case: Lẹt đẹt
(2021, 'Hoàn thành xuất sắc nhiệm vụ', 'Chủ trì đề tài cấp trường xuất sắc', 6),
(2021, 'Hoàn thành tốt nhiệm vụ', 'Công tác tài vụ ổn định', 7),
(2021, 'Hoàn thành tốt nhiệm vụ', 'Tham gia tích cực công tác tuyển sinh', 8),
(2021, 'Hoàn thành tốt nhiệm vụ', 'Hoàn thành công tác quản lý sinh viên', 9),
(2021, 'Hoàn thành xuất sắc nhiệm vụ', 'Có 2 bài báo quốc tế', 10);
-- Các VC khác mặc định coi như chưa vào làm hoặc thiếu data 2021 để test case "Thiếu năm đánh giá"

-- =============================================
-- BỔ SUNG DATA VIÊN CHỨC (Năm 2024 & 2025 - Tạo drama để test Quy hoạch)
-- =============================================
INSERT INTO xep_loai_vc (nam_danh_gia, danh_gia, nhan_xet, vien_chuc_id) VALUES
-- NHÓM 1: "Ngôi sao sáng" - Chuỗi 5 năm toàn Tốt với Xuất sắc (Pass quy hoạch 100%)
(2024, 'Hoàn thành xuất sắc nhiệm vụ', 'Đạt bằng khen của Bộ GD&ĐT', 1),
(2025, 'Hoàn thành xuất sắc nhiệm vụ', 'Tiếp tục giữ vững phong độ lãnh đạo', 1),
(2024, 'Hoàn thành tốt nhiệm vụ', 'Hoàn thành vượt mức kế hoạch', 4),
(2025, 'Hoàn thành xuất sắc nhiệm vụ', 'Sáng kiến kinh nghiệm cấp tỉnh', 4),

-- NHÓM 2: "Rớt đài" - Đang Tốt/Xuất sắc tự nhiên dính phốt (Sẽ bị tool chặn quy hoạch)
(2024, 'Không hoàn thành nhiệm vụ', 'Vi phạm quy chế thi cử, bị kỷ luật khiển trách', 8), 
(2025, 'Hoàn thành nhiệm vụ', 'Đang trong thời gian thử thách sau kỷ luật', 8),
(2024, 'Hoàn thành tốt nhiệm vụ', 'Công tác bình thường', 13),
(2025, 'Không hoàn thành nhiệm vụ', 'Vi phạm đạo đức nghề nghiệp', 13),

-- NHÓM 3: "Bình bình" - Dính 1 năm "Hoàn thành nhiệm vụ" (Test logic 3 năm liên tiếp Tốt)
(2024, 'Hoàn thành nhiệm vụ', 'Chất lượng giảng dạy giảm sút do sức khỏe', 12),
(2025, 'Hoàn thành tốt nhiệm vụ', 'Đã khắc phục và cải thiện chuyên môn', 12),
(2024, 'Hoàn thành tốt nhiệm vụ', 'Làm tốt công tác chuyên môn', 19),
(2025, 'Hoàn thành nhiệm vụ', 'Không đạt chỉ tiêu nghiên cứu khoa học', 19),

-- NHÓM 4: Trộn lẫn ngẫu nhiên làm nền
(2024, 'Hoàn thành tốt nhiệm vụ', 'Hoàn thành nhiệm vụ năm', 2), (2025, 'Hoàn thành tốt nhiệm vụ', 'Ổn định chuyên môn', 2),
(2024, 'Hoàn thành tốt nhiệm vụ', 'Nhiệt tình công tác', 3), (2025, 'Hoàn thành xuất sắc nhiệm vụ', 'Đạt giáo viên dạy giỏi', 3),
(2024, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 5), (2025, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 5),
(2024, 'Hoàn thành xuất sắc nhiệm vụ', 'Hoàn thành xuất sắc', 6), (2025, 'Hoàn thành tốt nhiệm vụ', 'Hoàn thành tốt', 6),
(2024, 'Hoàn thành nhiệm vụ', 'Thường xuyên đi trễ', 7), (2025, 'Hoàn thành tốt nhiệm vụ', 'Đã chấn chỉnh tác phong', 7),
(2024, 'Hoàn thành tốt nhiệm vụ', 'Chỉ tiêu đạt 100%', 9), (2025, 'Hoàn thành tốt nhiệm vụ', 'Chỉ tiêu đạt 100%', 9),
(2024, 'Hoàn thành xuất sắc nhiệm vụ', 'Nghiên cứu xuất sắc', 10), (2025, 'Hoàn thành xuất sắc nhiệm vụ', 'Nghiên cứu xuất sắc', 10),
(2024, 'Hoàn thành tốt nhiệm vụ', 'Giảng dạy tốt', 11), (2025, 'Hoàn thành tốt nhiệm vụ', 'Giảng dạy tốt', 11),
(2024, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 14), (2025, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 14),
(2024, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 15), (2025, 'Hoàn thành xuất sắc nhiệm vụ', 'Xuất sắc', 15),
(2024, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 16), (2025, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 16),
(2024, 'Hoàn thành nhiệm vụ', 'Trễ deadline nhiều lần', 17), (2025, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 17),
(2024, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 18), (2025, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 18),
(2024, 'Hoàn thành xuất sắc nhiệm vụ', 'Xuất sắc', 20), (2025, 'Hoàn thành xuất sắc nhiệm vụ', 'Xuất sắc', 20),
(2024, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 21), (2025, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 21),
(2024, 'Hoàn thành xuất sắc nhiệm vụ', 'Xuất sắc', 22), (2025, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 22),
(2024, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 23), (2025, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 23),
(2024, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 24), (2025, 'Hoàn thành nhiệm vụ', 'Chưa tích cực tham gia phong trào', 24),
(2024, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 25), (2025, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 25),
(2024, 'Hoàn thành xuất sắc nhiệm vụ', 'Xuất sắc', 26), (2025, 'Hoàn thành xuất sắc nhiệm vụ', 'Xuất sắc', 26),
(2024, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 27), (2025, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 27),
(2024, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 28), (2025, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 28),
(2024, 'Không hoàn thành nhiệm vụ', 'Nghỉ làm không lý do quá số ngày', 29), (2025, 'Không hoàn thành nhiệm vụ', 'Chưa khắc phục khuyết điểm', 29),
(2024, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 30), (2025, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 30);


-- =============================================
-- BỔ SUNG DATA ĐẢNG VIÊN (Tương ứng với chuyên môn)
-- Lưu ý: Chuyên môn rớt thì Đảng cũng rớt hoặc lẹt đẹt theo
-- =============================================
INSERT INTO xep_loai_dang_vien (nam_danh_gia, danh_gia, nhan_xet, vien_chuc_id) VALUES
-- Quá khứ 2021
(2021, 'Hoàn thành xuất sắc nhiệm vụ', 'Đảng viên hoàn thành xuất sắc', 1),
(2021, 'Hoàn thành tốt nhiệm vụ', 'Sinh hoạt đảng đầy đủ', 2),
(2021, 'Hoàn thành xuất sắc nhiệm vụ', 'Đóng góp tốt cho chi bộ', 4),
(2021, 'Hoàn thành nhiệm vụ', 'Còn yếu trong tự phê bình', 6),

-- Năm 2024 & 2025
(2024, 'Hoàn thành xuất sắc nhiệm vụ', 'Bí thư chi bộ gương mẫu', 1), (2025, 'Hoàn thành xuất sắc nhiệm vụ', 'Lãnh đạo chi bộ đạt trong sạch vững mạnh', 1),
(2024, 'Hoàn thành tốt nhiệm vụ', 'Đảng viên tốt', 2), (2025, 'Hoàn thành tốt nhiệm vụ', 'Đảng viên tốt', 2),
(2024, 'Hoàn thành xuất sắc nhiệm vụ', 'Xuất sắc', 4), (2025, 'Hoàn thành xuất sắc nhiệm vụ', 'Xuất sắc', 4),
(2024, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 6), (2025, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 6),

-- Drama rớt đài (VC008)
(2024, 'Không hoàn thành nhiệm vụ', 'Vi phạm tư cách đảng viên, bị thi hành kỷ luật', 8), 
(2025, 'Hoàn thành nhiệm vụ', 'Đang theo dõi khắc phục hậu quả', 8),

-- Drama rớt đài (VC013)
(2024, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 13), 
(2025, 'Không hoàn thành nhiệm vụ', 'Vi phạm sinh hoạt đảng', 13),

-- Bình thường
(2024, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 10), (2025, 'Hoàn thành xuất sắc nhiệm vụ', 'Xuất sắc', 10),
(2024, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 11), (2025, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 11),
(2024, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 14), (2025, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 14),
(2024, 'Hoàn thành xuất sắc nhiệm vụ', 'Xuất sắc', 16), (2025, 'Hoàn thành xuất sắc nhiệm vụ', 'Xuất sắc', 16),
(2024, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 19), (2025, 'Hoàn thành nhiệm vụ', 'Chưa đóng đảng phí đầy đủ', 19),
(2024, 'Hoàn thành xuất sắc nhiệm vụ', 'Xuất sắc', 22), (2025, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 22),
(2024, 'Hoàn thành nhiệm vụ', 'Vắng sinh hoạt nhiều lần', 24), (2025, 'Hoàn thành tốt nhiệm vụ', 'Đã khắc phục', 24),
(2024, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 26), (2025, 'Hoàn thành xuất sắc nhiệm vụ', 'Xuất sắc', 26),
(2024, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 28), (2025, 'Hoàn thành tốt nhiệm vụ', 'Tốt', 28);

-- 7. NHIEM KY CHUC VU (người đang giữ chức)
INSERT INTO nhiem_ky_chuc_vu (ngay_bat_dau, ngay_ket_thuc, trang_thai, vien_chuc_id, chuc_danh_id) VALUES
-- Trưởng khoa CNTT
('2021-01-01', '2026-01-01', 1, 10, 3),
-- Phó trưởng khoa CNTT
('2021-01-01', '2026-01-01', 1, 11, 4),
-- Trưởng BM Toán-TH (Giả định trực thuộc Khoa CNTT)
('2021-08-01', '2026-08-01', 1, 26, 5),
-- Trưởng BM GDTC (Giả định trực thuộc Khoa CNTT)
('2020-04-01', '2025-04-01', 1, 28, 5)
-- Nguyên Hiệu trưởng (PGS.TS Võ Văn Thắng) -> Trạng thái 0 (Đã kết thúc vào 2025)
('2025-05-02', '2030-05-02', 0, 45, 7),

-- Phó Hiệu trưởng phụ trách (TS. Nguyễn Hữu Trí) -> Trạng thái 1 (Bắt đầu từ 2025)
('2025-05-02', '2030-05-02', 1, 46, 8),

-- Phó Hiệu trưởng (TS. Nguyễn Phương Thảo) -> Trạng thái 1 (Bắt đầu từ 2025)
('2025-05-02', '2030-05-02', 1, 47, 8);
-- 8. PHIEU CHU TRUONG (demo bổ nhiệm)
INSERT INTO phieu_chu_truong (ma_phieu, so_to_trinh_chu_truong, tieu_de, ly_do_de_xuat, so_luong_de_xuat, nguon_nhan_su, trang_thai, don_vi_id, chuc_danh_id, nguoi_lap, nguoi_duyet) VALUES
('PCT001', 'TT001/2024', 'Bổ nhiệm Phó Trưởng khoa Công Nghệ Thông Tin', 
    'Khoa cần bổ sung lãnh đạo do khối lượng công việc tăng', 1, 
    1, 1, 6, 4, 'Đoàn Thanh Nghị', 'VCQL'),
('PCT003', 'TT003/2024', 'Bổ nhiệm Phó Trưởng Phòng khoa Công Nghệ Thông Tin', 
    'Phòng cần bổ sung phó trưởng phòng hỗ trợ công tác', 1, 
    1, 0, 4, 2, 'Châu Ngân Khánh', NULL);

-- 9. DOT BO NHIEM
INSERT INTO dot_bo_nhiem ( ma_dot_bo_nhiem, ten_dot_bo_nhiem, ngay_bat_dau, ngay_ket_thuc, so_quyet_dinh, nguoi_lap, trang_thai) VALUES
('DBN001', 'Đợt bổ nhiệm lãnh đạo khoa tháng 3/2024', '2024-03-01', '2024-04-30', 'QD001/2024', 'Đoàn Thanh Nghị', 6),
('DBN002', 'Đợt bổ nhiệm bộ môn tháng 6/2024', '2024-06-01', '2024-07-31', 'QD002/2024', 'Đoàn Thanh Nghị', 2),
('DBN003', 'Đợt bổ nhiệm phòng ban tháng 9/2024', '2024-09-01', NULL, NULL, 'Đoàn Thanh Nghị', 1);

-- 9. DOT BO NHIEM
INSERT INTO dot_bo_nhiem ( ma_dot_bo_nhiem, ten_dot_bo_nhiem, ngay_bat_dau, ngay_ket_thuc, so_quyet_dinh, nguoi_lap, trang_thai) VALUES
('DBN001', 'Đợt bổ nhiệm lãnh đạo khoa tháng 3/2024', '2024-03-01', '2024-04-30', 'QD001/2024', 'Đoàn Thanh Nghị', 6),
('DBN002', 'Đợt bổ nhiệm bộ môn tháng 6/2024', '2024-06-01', '2024-07-31', 'QD002/2024', 'Đoàn Thanh Nghị', 2),
('DBN003', 'Đợt bổ nhiệm phòng ban tháng 9/2024', '2024-09-01', NULL, NULL, 'Đoàn Thanh Nghị', 1);

-- 10. CHI TIET DOT BO NHIEM
INSERT INTO chi_tiet_dot_bo_nhiem (dot_bo_nhiem_id, phieu_chu_truong_id, trang_thai, buoc_hien_tai) VALUES
(1, 1, 1, 6),  -- Hoàn thành
(2, 2, 0, 3),  -- Đang bỏ phiếu vòng 2
(3, 3, 0, 2);  -- Mới bắt đầu vòng 1

-- 11. CHI TIET BO NHIEM
INSERT INTO chi_tiet_bo_nhiem (ly_do_vao, chi_tiet_dot_bo_nhiem_id, vien_chuc_id, buoc_hoi_nghi, trang_thai) VALUES
-- Đợt 1 - Đã hoàn thành - VC012 được bổ nhiệm Phó khoa NN
('Có năng lực, kinh nghiệm phù hợp', 1, 12, 6, 3),
-- Đợt 2 - Đang bỏ phiếu - VC029 ứng viên Trưởng BM GDTC
('Có chuyên môn tốt, nhiệt tình', 2, 29, 3, 1),
-- Đợt 3 - Vòng 1 - VC009 ứng viên Phó phòng Đào tạo
('Kinh nghiệm quản lý đào tạo tốt', 3, 9, 2, 1);

-- 12. KET QUA BO NHIEM (lịch sử vote đợt 1)
INSERT INTO ket_qua_bo_nhiem ( buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat, so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le, so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua, chi_tiet_bn_id) VALUES
(2, 10, 9, 9, 9, 8, 7, 1, 1, 1),
(3, 10, 9, 9, 9, 8, 6, 2, 1, 1),
(4, 10, 8, 8, 8, 7, 6, 1, NULL, 1),
(5, 10, 9, 9, 9, 8, 7, 1, 1, 1);

-- 13. DOT QUY HOACH
INSERT INTO dot_quy_hoach (ma_quy_hoach, ten_quy_hoach, loai_quy_hoach, nam_thuc_hien, nhiem_ky, so_qd_phe_duyet, ngay_qd_phe_duyet, trang_thai) VALUES
('QH2024A', 'Quy hoạch cán bộ lãnh đạo cấp khoa 2024-2029', 1, 2024, '2024-2029', 'QD100/2024', '2024-03-15', 2),
('QH2024B', 'Quy hoạch cán bộ lãnh đạo cấp phòng 2024-2029', 2, 2024, '2024-2029', NULL, NULL, 0);

-- 14. CHI TIET QUY HOACH
INSERT INTO chi_tiet_quy_hoach (ngay_vao_qh, buoc_hien_tai, trang_thai, loai_nguon, dot_quy_hoach_id, vien_chuc_id, chuc_danh_id, don_vi_id) VALUES
('2024-03-15', 6, 1, 1, 1, 12, 4, 6),  -- Trần Thị Mỹ Linh - Phó khoa NN - Đạt
('2024-03-15', 6, 1, 1, 1, 14, 4, 7),  -- Phạm Thị Ngọc - Phó khoa KT - Đạt
('2024-06-01', 3, NULL, 1, 2, 9, 2, 4), -- Phan Văn Tài - Phó phòng ĐT - Đang xử lý
('2024-06-01', 2, NULL, 1, 2, 21, 4, 9); -- Lê Văn Vũ - Phó khoa KT-QTKD - Mới vào