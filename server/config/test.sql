CREATE TABLE don_vi (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_don_vi VARCHAR(6) UNIQUE NOT NULL,
    ten_don_vi VARCHAR(100),
    loai_don_vi VARCHAR(50)
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

CREATE TABLE dot_quy_hoach (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_quy_hoach VARCHAR(6) UNIQUE NOT NULL,
    ten_quy_hoach VARCHAR(255) NOT NULL,
    loai_quy_hoach SMALLINT NOT NULL CHECK (loai_quy_hoach IN (1, 2)),
    nam_thuc_hien INT NOT NULL,
    nhiem_ky VARCHAR(20),
    so_qd_phe_duyet VARCHAR(20),
    ngay_qd_phe_duyet DATE,
    trang_thai SMALLINT
);

CREATE TABLE chi_tiet_quy_hoach (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ngay_vao_qh DATE,
    ngay_ra_qh DATE,
    so_qd_ra_khoi_quy_hoach VARCHAR(50),
    ngay_qd_ra_khoi_quy_hoach DATE,
    ly_do_ra_khoi_quy_hoach TEXT,
    trang_thai SMALLINT,
    dot_quy_hoach_id INT NOT NULL,
    vien_chuc_id INT NOT NULL,
    chuc_danh_id INT NOT NULL,
    CONSTRAINT fk_ctqh_dqh FOREIGN KEY (dot_quy_hoach_id) REFERENCES dot_quy_hoach(id),
    CONSTRAINT fk_ctqh_vc FOREIGN KEY (vien_chuc_id) REFERENCES vien_chuc(id),
    CONSTRAINT uq_ctqh UNIQUE (dot_quy_hoach_id, vien_chuc_id, chuc_danh_id),
    CONSTRAINT fk_ctqh_cd FOREIGN KEY (chuc_danh_id) REFERENCES chuc_danh_quan_ly(id)
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
    CONSTRAINT fk_pct_dqh FOREIGN KEY (dot_quy_hoach_id) REFERENCES dot_quy_hoach(id),
    CONSTRAINT fk_pct_dv FOREIGN KEY (don_vi_id) REFERENCES don_vi(id),
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
    trang_thai SMALLINT DEFAULT 0,
    nguoi_lap VARCHAR(50)
);

CREATE TABLE chi_tiet_dot_bo_nhiem (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    dot_bo_nhiem_id INT NOT NULL,
    phieu_chu_truong_id INT,
    trang_thai SMALLINT DEFAULT 1,
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
    trang_thai SMALLINT DEFAULT 1,
    CONSTRAINT fk_ctbn_ctdbn FOREIGN KEY (chi_tiet_dot_bo_nhiem_id) REFERENCES chi_tiet_dot_bo_nhiem(id),
    CONSTRAINT fk_ctbn_vc FOREIGN KEY (vien_chuc_id) REFERENCES vien_chuc(id),
    CONSTRAINT fk_ctbn_ctqh FOREIGN KEY (chi_tiet_qh_id) REFERENCES chi_tiet_quy_hoach(id),
    CONSTRAINT uq_ctbn UNIQUE (chi_tiet_dot_bo_nhiem_id, vien_chuc_id)
);

CREATE TABLE ket_qua_bo_nhiem (
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
    trang_thai SMALLINT DEFAULT 1,
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
    CONSTRAINT fk_hs_ctpa FOREIGN KEY (chi_tiet_pa_id) REFERENCES chi_tiet_phuong_an(id)
);

CREATE TABLE chi_tiet_ho_so (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ten_tai_lieu VARCHAR(255) NOT NULL,
    loai_tai_lieu SMALLINT,
    file_dinh_kem TEXT,
    ngay_cap_nhat DATE,
    trang_thai SMALLINT DEFAULT 1,
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
CREATE TABLE tai_khoan (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ten_dang_nhap VARCHAR(6) NOT NULL UNIQUE,
    mat_khau VARCHAR(255) NOT NULL,
    vai_tro VARCHAR(20),
    trang_thai SMALLINT DEFAULT 1
);

-- ── 1. Đơn vị ─────────────────────────────────────────────
INSERT INTO don_vi (ma_don_vi, ten_don_vi, loai_don_vi) VALUES
('DV001', 'Khoa Kỹ thuật - Công nghệ - Môi trường', 'Khoa'),
('DV002', 'Khoa Ngoại ngữ - Sư phạm', 'Khoa'),
('DV003', 'Phòng Tổ chức - Cán bộ', 'Phòng');

-- ── 2. Chức danh quản lý ──────────────────────────────────
INSERT INTO chuc_danh_quan_ly (ma_chuc_danh, ten_chuc_danh, thoi_han_giu_chuc_vu, he_so_phu_cap) VALUES
('CD001', 'Trưởng khoa', 60, 0.50),
('CD002', 'Phó trưởng khoa', 60, 0.30),
('CD003', 'Trưởng phòng', 60, 0.45);

-- ── 3. Viên chức ──────────────────────────────────────────
INSERT INTO vien_chuc (ma_vien_chuc, ho_va_ten, gioi_tinh, so_cccd, ngay_sinh, dan_toc, trinh_do_chuyen_mon, trinh_do_ly_luan_ct, trinh_do_ngoai_ngu, trinh_do_tin_hoc, ngay_ket_nap, ngay_chinh_thuc, ngach, don_vi_id) VALUES
('0001', 'Nguyễn Văn An',  1, '079123456789', '1980-05-10', 'Kinh', 'Tiến sĩ', 'Cao cấp', 'B1', 'Cơ bản', '2005-03-15', '2007-03-15', 'Giảng viên cao cấp', 1),
('0002', 'Trần Thị Bích',  0, '079234567890', '1983-08-20', 'Kinh', 'Thạc sĩ',  'Trung cấp', 'B2', 'Cơ bản', '2008-06-01', '2010-06-01', 'Giảng viên chính',   1),
('0003', 'Lê Minh Khoa',   1, '079345678901', '1979-11-30', 'Kinh', 'Tiến sĩ', 'Cao cấp', 'C1', 'Nâng cao', '2003-01-20', '2005-01-20', 'Giảng viên cao cấp', 2),
('0004', 'Phạm Thị Lan',   0, '079456789012', '1985-03-15', 'Kinh', 'Thạc sĩ',  'Trung cấp', 'B1', 'Cơ bản', '2010-09-01', '2012-09-01', 'Giảng viên',         2),
('0005', 'Hoàng Văn Nam',  1, '079567890123', '1978-07-25', 'Kinh', 'Tiến sĩ', 'Cao cấp', 'C1', 'Nâng cao', '2002-04-10', '2004-04-10', 'Giảng viên cao cấp', 3);

-- ── 5. Đợt quy hoạch ──────────────────────────────────────
INSERT INTO dot_quy_hoach (ma_quy_hoach, ten_quy_hoach, loai_quy_hoach, nam_thuc_hien, nhiem_ky, trang_thai)
VALUES ('QH001', 'Quy hoạch cán bộ 2024-2026', 1, 2024, '2024-2026', 1);

-- ── 6. Chi tiết quy hoạch ─────────────────────────────────
INSERT INTO chi_tiet_quy_hoach (ngay_vao_qh, trang_thai, dot_quy_hoach_id, vien_chuc_id, chuc_danh_id
) VALUES
('2024-01-15', 1, 1, 1, 1),  -- Nguyễn Văn An → Trưởng khoa
('2024-01-15', 1, 1, 2, 2),  -- Trần Thị Bích → Phó trưởng khoa
('2024-01-15', 1, 1, 3, 2);  -- Lê Minh Khoa  → Phó trưởng khoa

-- ── 7. Phiếu chủ trương ───────────────────────────────────
INSERT INTO phieu_chu_truong (ma_phieu, so_to_trinh_chu_truong, tieu_de, ly_do_de_xuat, so_luong_de_xuat, nguon_nhan_su, ngay_lap, ngay_phe_duyet, trang_thai, don_vi_id, chuc_danh_id, nguoi_lap)
VALUES('PCT001', '12/TTr-ĐHAG', 'Xin chủ trương bổ nhiệm Trưởng khoa KT-CN-MT', 'Chức danh Trưởng khoa đã hết nhiệm kỳ', 1, 1, '2026-03-01', '2026-03-10', 2, 1, 1, 'Nguyễn Văn An'),

('PCT002', '13/TTr-ĐHAG',
 'Xin chủ trương bổ nhiệm Phó trưởng khoa NN-SP',
 'Bổ sung nhân sự lãnh đạo', 2, 1,
 '2026-03-01', '2026-03-10', 2,
 2, 2, 'Nguyễn Văn An');

-- ── 8. Đợt bổ nhiệm ───────────────────────────────────────
INSERT INTO dot_bo_nhiem (
    ma_dot_bo_nhiem, ten_dot_bo_nhiem,
    ngay_bat_dau, ngay_ket_thuc,
    trang_thai, nguoi_lap
) VALUES
('000001', 'Đợt bổ nhiệm tháng 3/2026',
 '2026-03-15', '2026-04-15',
 1, 'Nguyễn Văn An');

-- ── 9. Chi tiết đợt bổ nhiệm (gom 2 phiếu vào 1 đợt) ─────
INSERT INTO chi_tiet_dot_bo_nhiem (dot_bo_nhiem_id, phieu_chu_truong_id, trang_thai) VALUES
(1, 1, 1),  -- Trưởng khoa KT
(1, 2, 1);  -- Phó trưởng khoa NN

-- ── 10. Ứng viên ──────────────────────────────────────────
-- Trưởng khoa KT (chi_tiet_dot_bo_nhiem_id = 1): 1 ứng viên từ quy hoạch
INSERT INTO chi_tiet_bo_nhiem (ly_do_vao, chi_tiet_dot_bo_nhiem_id, vien_chuc_id, chi_tiet_qh_id, trang_thai)
VALUES ('Trong danh sách quy hoạch', 1, 1, 1, 1);

-- Phó trưởng khoa NN (chi_tiet_dot_bo_nhiem_id = 2): 2 ứng viên
INSERT INTO chi_tiet_bo_nhiem (ly_do_vao, chi_tiet_dot_bo_nhiem_id, vien_chuc_id, chi_tiet_qh_id, trang_thai)
VALUES
('Trong danh sách quy hoạch', 2, 3, 3, 1),
('Trong danh sách quy hoạch', 2, 4, NULL, 1);