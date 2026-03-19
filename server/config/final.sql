DROP TABLE IF EXISTS tai_khoan CASCADE;
DROP TABLE IF EXISTS yeu_cau_thay_doi CASCADE;
DROP TABLE IF EXISTS nhiem_ky_chuc_vu CASCADE;
DROP TABLE IF EXISTS qd_bo_nhiem CASCADE;
DROP TABLE IF EXISTS chi_tiet_ho_so CASCADE;
DROP TABLE IF EXISTS ho_so_bo_nhiem CASCADE;
DROP TABLE IF EXISTS chi_tiet_phuong_an CASCADE;
DROP TABLE IF EXISTS phuong_an_nhan_su CASCADE;
DROP TABLE IF EXISTS ket_qua_bo_nhiem CASCADE;
DROP TABLE IF EXISTS chi_tiet_bo_nhiem CASCADE;
DROP TABLE IF EXISTS dot_bo_nhiem CASCADE;
DROP TABLE IF EXISTS phieu_chu_truong CASCADE;
DROP TABLE IF EXISTS ket_qua_quy_hoach CASCADE;
DROP TABLE IF EXISTS chi_tiet_quy_hoach CASCADE;
DROP TABLE IF EXISTS dot_quy_hoach CASCADE;
DROP TABLE IF EXISTS xep_loai_dang_vien CASCADE;
DROP TABLE IF EXISTS xep_loai_vc CASCADE;
DROP TABLE IF EXISTS chuc_danh_quan_ly CASCADE;
DROP TABLE IF EXISTS vien_chuc CASCADE;
DROP TABLE IF EXISTS don_vi CASCADE;

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
    trinh_do_ly_luan_CT VARCHAR(50),
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
	loai_quy_hoach SMALLINT NOT NULL CHECK (loai_quy_hoach IN (1, 2)), -- 1: Đầu nhiệm kỳ, 2: Rà soát hằng năm
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
    nguoi_lap_id INT NOT NULL,
    CONSTRAINT fk_pct_dqh FOREIGN KEY (dot_quy_hoach_id) REFERENCES dot_quy_hoach(id),
    CONSTRAINT fk_pct_dv FOREIGN KEY (don_vi_id) REFERENCES don_vi(id),
    CONSTRAINT fk_pct_cd FOREIGN KEY (chuc_danh_id) REFERENCES chuc_danh_quan_ly(id),
    CONSTRAINT fk_pct_nl FOREIGN KEY (nguoi_lap_id) REFERENCES vien_chuc(id)
);

CREATE TABLE dot_bo_nhiem (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ma_dot_bo_nhiem VARCHAR(6) UNIQUE NOT NULL,
    ten_dot_bo_nhiem VARCHAR(255) NOT NULL,
    ngay_bat_dau DATE,
    ngay_ket_thuc DATE,
    ngay_phe_duyet DATE,
    so_quyet_dinh VARCHAR(50),
    trang_thai SMALLINT,
    phieu_chu_truong_id INT NOT NULL,
    CONSTRAINT fk_dbn_pct FOREIGN KEY (phieu_chu_truong_id) REFERENCES phieu_chu_truong(id)
);

CREATE TABLE chi_tiet_bo_nhiem (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ly_do_vao TEXT,
    ly_do_ra TEXT,
    dot_bo_nhiem_id INT NOT NULL,
    vien_chuc_id INT NOT NULL,
    chi_tiet_qh_id INT,
	trang_thai SMALLINT,
    CONSTRAINT fk_ctbn_dbn FOREIGN KEY (dot_bo_nhiem_id) REFERENCES dot_bo_nhiem(id),
    CONSTRAINT fk_ctbn_vc FOREIGN KEY (vien_chuc_id) REFERENCES vien_chuc(id),
    CONSTRAINT fk_ctbn_ctqh FOREIGN KEY (chi_tiet_qh_id) REFERENCES chi_tiet_quy_hoach(id),
    CONSTRAINT uq_ctbn UNIQUE (dot_bo_nhiem_id, vien_chuc_id)
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
    trang_thai SMALLINT,
    dot_bo_nhiem_id INT NOT NULL,
    CONSTRAINT fk_pa_dbn FOREIGN KEY (dot_bo_nhiem_id) REFERENCES dot_bo_nhiem(id)
);

CREATE TABLE chi_tiet_phuong_an (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    loai_phuong_an VARCHAR(30) NOT NULL CHECK (loai_phuong_an IN ('Bổ nhiệm', 'Bổ nhiệm lại', 'Thôi chức vụ', 'Thôi kiêm nhiệm')),
    ghi_chu TEXT,
    trang_thai SMALLINT,
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
    trang_thai SMALLINT,
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
    trang_thai SMALLINT,
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
    trang_thai SMALLINT,
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
    trang_thai SMALLINT,
    loai_yeu_cau VARCHAR(100),
    ket_qua_xu_ly TEXT,
    chi_tiet_bn_id INT,
    chi_tiet_qh_id INT,
    nguoi_yeu_cau_id INT NOT NULL,
    CONSTRAINT fk_yc_ctbn FOREIGN KEY (chi_tiet_bn_id) REFERENCES chi_tiet_bo_nhiem(id),
    CONSTRAINT fk_yc_ctqh FOREIGN KEY (chi_tiet_qh_id) REFERENCES chi_tiet_quy_hoach(id),
    CONSTRAINT fk_yc_nyc FOREIGN KEY (nguoi_yeu_cau_id) REFERENCES vien_chuc(id),
    CONSTRAINT chk_yc_nguon CHECK (chi_tiet_bn_id IS NOT NULL OR chi_tiet_qh_id IS NOT NULL)
);

CREATE TABLE tai_khoan (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ten_dang_nhap VARCHAR(255) NOT NULL UNIQUE,
	mat_khau VARCHAR(255) NOT NULL,
    vai_tro VARCHAR(20) NOT NULL CHECK (vai_tro IN ('PTCCT', 'BGH', 'VC', 'VCQL')),
    trang_thai SMALLINT DEFAULT 1 CHECK (trang_thai IN (0, 1)),
    ngay_tao TIMESTAMP DEFAULT NOW(),
    vien_chuc_id INT NOT NULL UNIQUE,
    CONSTRAINT fk_tk_vc FOREIGN KEY (vien_chuc_id) REFERENCES vien_chuc(id)
);

-- add contrants for table 
ALTER TABLE vien_chuc ADD COLUMN avatar VARCHAR(255);

ALTER TABLE vien_chuc ADD CONSTRAINT uq_vc_email UNIQUE (email);

ALTER TABLE vien_chuc ADD CONSTRAINT uq_vc_sdt UNIQUE (so_dien_thoai);
-- add index
CREATE INDEX idx_vc_don_vi ON vien_chuc(don_vi_id);
CREATE INDEX idx_ctqh_dot ON chi_tiet_quy_hoach(dot_quy_hoach_id);
CREATE INDEX idx_ctqh_vc ON chi_tiet_quy_hoach(vien_chuc_id);
CREATE INDEX idx_ctbn_dot ON chi_tiet_bo_nhiem(dot_bo_nhiem_id);
CREATE INDEX idx_nkcv_vc ON nhiem_ky_chuc_vu(vien_chuc_id);
CREATE INDEX idx_xlvc_vc ON xep_loai_vc(vien_chuc_id);

-- ============================================================
-- PHẦN 1: ĐƠN VỊ (id 1–16)
-- ============================================================
INSERT INTO don_vi (ma_don_vi, ten_don_vi, loai_don_vi) VALUES
('DV001', 'Khoa Công nghệ thông tin',         'Khoa'),
('DV002', 'Khoa Kinh tế',                     'Khoa'),
('DV003', 'Khoa Sư phạm',                     'Khoa'),
('DV004', 'Khoa Nông nghiệp',                 'Khoa'),
('DV005', 'Bộ môn Hệ thống thông tin',        'Bo mon'),
('DV006', 'Bộ môn Kế toán',                   'Bo mon'),
('DV007', 'Phòng Tổ chức - Công tác',         'Phong'),
('DV008', 'Phòng Đào tạo',                    'Phong'),
('DV009', 'Phòng Kế hoạch - Tài chính',       'Phong'),
('DV010', 'Phòng Khoa học - Hợp tác quốc tế', 'Phong'),
('DV011', 'Phòng Quản trị - Thiết bị',        'Phong'),
('DV012', 'Khoa Luật',                        'Khoa'),
('DV013', 'Khoa Y Dược',                      'Khoa'),
('DV014', 'Bộ môn Toán - Lý',                 'Bo mon'),
('DV015', 'Bộ môn Ngôn ngữ Anh',              'Bo mon'),
('DV016', 'Trung tâm Ngoại ngữ - Tin học',    'Trung tam');

-- ============================================================
-- PHẦN 2: CHỨC DANH QUẢN LÝ (id 1–6)
-- ============================================================
INSERT INTO chuc_danh_quan_ly (ma_chuc_danh, ten_chuc_danh, thoi_han_giu_chuc_vu, he_so_phu_cap) VALUES
('CD001', 'Trưởng khoa',       5, 0.65),
('CD002', 'Phó trưởng khoa',   5, 0.50),
('CD003', 'Trưởng bộ môn',     5, 0.45),
('CD004', 'Phó trưởng bộ môn', 5, 0.35),
('CD005', 'Trưởng phòng',      5, 0.65),
('CD006', 'Phó trưởng phòng',  5, 0.50);

-- ============================================================
-- PHẦN 3: VIÊN CHỨC (id 1–30)
-- ============================================================
INSERT INTO vien_chuc (ma_vien_chuc, don_vi_id, ho_va_ten, gioi_tinh, ngay_sinh, so_cccd,
    dan_toc, trinh_do_chuyen_mon, ngay_ket_nap, ngay_chinh_thuc, chuyen_nganh, ngach,
    nam_tot_nghiep, trinh_do_ly_luan_CT, trinh_do_ngoai_ngu, trinh_do_tin_hoc,
    so_dien_thoai, email, dia_chi) VALUES
-- Nhóm viên chức gốc (id 1-12)
('VC001',  1, 'Nguyễn Văn An',    1, '1980-05-15', '001080051501', 'Kinh', 'Tiến sĩ',
 '2005-03-01', '2006-03-01', 'Công nghệ thông tin',  'Giảng viên chính',    2010,
 'Cao cấp',   'B1', 'Tin học văn phòng', '0901111001', 'an.nv@dhag.edu.vn',     NULL),
('VC002',  1, 'Trần Thị Bình',    0, '1985-08-20', '001085082001', 'Kinh', 'Thạc sĩ',
 '2010-05-01', '2011-05-01', 'Khoa học máy tính',    'Giảng viên',          2008,
 'Trung cấp', 'B2', 'Tin học văn phòng', '0901111002', 'binh.tt@dhag.edu.vn',   NULL),
('VC003',  2, 'Lê Văn Cường',     1, '1978-11-30', '001078113001', 'Kinh', 'Tiến sĩ',
 '2003-01-01', '2004-01-01', 'Quản trị kinh doanh',  'Giảng viên chính',    2005,
 'Cao cấp',   'C1', 'Tin học văn phòng', '0901111003', 'cuong.lv@dhag.edu.vn',  NULL),
('VC004',  5, 'Phạm Thị Dung',    0, '1982-03-25', '001082032501', 'Kinh', 'Thạc sĩ',
 '2008-06-01', '2009-06-01', 'Hệ thống thông tin',   'Giảng viên',          2006,
 'Trung cấp', 'B1', 'Tin học văn phòng', '0901111004', 'dung.pt@dhag.edu.vn',   NULL),
('VC005',  2, 'Hoàng Văn Em',     1, '1975-07-10', '001075071001', 'Kinh', 'Tiến sĩ',
 '2000-02-01', '2001-02-01', 'Tài chính ngân hàng',  'Giảng viên cao cấp',  2003,
 'Cao cấp',   'C1', 'Tin học văn phòng', '0901111005', 'em.hv@dhag.edu.vn',     NULL),
('VC006',  1, 'Võ Thị Fương',     0, '1990-12-05', '001090120501', 'Kinh', 'Thạc sĩ',
 NULL,         NULL,         'Công nghệ phần mềm',   'Giảng viên',          2013,
 NULL,         'B1', 'Tin học văn phòng', '0901111006', 'fuong.vt@dhag.edu.vn',  NULL),
('VC007',  3, 'Đặng Văn Giang',   1, '1977-04-18', '001077041801', 'Kinh', 'Tiến sĩ',
 '2002-06-01', '2003-06-01', 'Giáo dục học',         'Giảng viên chính',    2004,
 'Cao cấp',   'B2', 'Tin học văn phòng', '0901111007', 'giang.dv@dhag.edu.vn',  NULL),
('VC008',  3, 'Nguyễn Thị Hoa',   0, '1983-09-12', '001083091201', 'Kinh', 'Thạc sĩ',
 '2009-03-01', '2010-03-01', 'Tâm lý giáo dục',      'Giảng viên',          2007,
 'Trung cấp', 'B1', 'Tin học văn phòng', '0901111008', 'hoa.nt@dhag.edu.vn',    NULL),
('VC009',  4, 'Trần Văn Khánh',   1, '1979-02-28', '001079022801', 'Kinh', 'Tiến sĩ',
 '2004-07-01', '2005-07-01', 'Nông học',              'Giảng viên chính',    2006,
 'Cao cấp',   'B2', 'Tin học văn phòng', '0901111009', 'khanh.tv@dhag.edu.vn',  NULL),
('VC010',  7, 'Lý Thị Lan',       0, '1981-06-15', '001081061501', 'Kinh', 'Thạc sĩ',
 '2007-01-01', '2008-01-01', 'Quản lý nhà nước',     'Chuyên viên chính',   2005,
 'Trung cấp', 'B2', 'Tin học văn phòng', '0901111010', 'lan.lt@dhag.edu.vn',    NULL),
('VC011',  7, 'Phạm Văn Minh',    1, '1976-11-20', '001076112001', 'Kinh', 'Thạc sĩ',
 '2001-05-01', '2002-05-01', 'Hành chính học',        'Chuyên viên chính',   2002,
 'Cao cấp',   'C1', 'Tin học văn phòng', '0901111011', 'minh.pv@dhag.edu.vn',   NULL),
('VC012',  8, 'Nguyễn Thị Ngọc',  0, '1984-03-08', '001084030801', 'Kinh', 'Thạc sĩ',
 '2010-08-01', '2011-08-01', 'Quản lý giáo dục',     'Chuyên viên',         2008,
 'Trung cấp', 'B1', 'Tin học văn phòng', '0901111012', 'ngoc.nt@dhag.edu.vn',   NULL),
-- Nhóm viên chức mở rộng (id 13-30)
('VC013',  1, 'Ngô Thị Phượng',   0, '1988-04-22', '001088042201', 'Kinh', 'Thạc sĩ',
 '2014-03-01', '2015-03-01', 'Mạng máy tính',         'Giảng viên',          2012,
 'Trung cấp', 'B1', 'Tin học văn phòng', '0901111013', 'phuong.nt@dhag.edu.vn',
 '12 Trần Hưng Đạo, TP. Long Xuyên, An Giang'),
('VC014',  1, 'Bùi Văn Quang',    1, '1986-07-14', '001086071401', 'Kinh', 'Tiến sĩ',
 '2012-06-01', '2013-06-01', 'Trí tuệ nhân tạo',     'Giảng viên chính',    2010,
 'Trung cấp', 'B2', 'Tin học văn phòng', '0901111014', 'quang.bv@dhag.edu.vn',
 '45 Nguyễn Huệ, TP. Long Xuyên, An Giang'),
('VC015',  2, 'Trịnh Thị Sương',  0, '1983-11-08', '001083110801', 'Kinh', 'Tiến sĩ',
 '2009-02-01', '2010-02-01', 'Kinh tế phát triển',   'Giảng viên chính',    2007,
 'Cao cấp',   'C1', 'Tin học văn phòng', '0901111015', 'suong.tt@dhag.edu.vn',
 '78 Lý Thái Tổ, TP. Long Xuyên, An Giang'),
('VC016',  2, 'Cao Văn Thịnh',    1, '1980-09-30', '001080093001', 'Kinh', 'Thạc sĩ',
 '2006-08-01', '2007-08-01', 'Kế toán - Kiểm toán',  'Giảng viên',          2004,
 'Trung cấp', 'B1', 'Tin học văn phòng', '0901111016', 'thinh.cv@dhag.edu.vn',
 '23 Đinh Tiên Hoàng, TP. Long Xuyên, An Giang'),
('VC017',  3, 'Lương Thị Uyên',   0, '1987-05-19', '001087051901', 'Kinh', 'Thạc sĩ',
 '2013-04-01', '2014-04-01', 'Sư phạm Toán',          'Giảng viên',          2011,
 'Trung cấp', 'B1', 'Tin học văn phòng', '0901111017', 'uyen.lt@dhag.edu.vn',
 '56 Hai Bà Trưng, TP. Long Xuyên, An Giang'),
('VC018',  3, 'Dương Văn Vũ',     1, '1975-12-25', '001075122501', 'Kinh', 'Tiến sĩ',
 '2001-07-01', '2002-07-01', 'Sư phạm Văn',           'Giảng viên cao cấp',  2000,
 'Cao cấp',   'C1', 'Tin học văn phòng', '0901111018', 'vu.dv@dhag.edu.vn',
 '90 Lê Lợi, TP. Long Xuyên, An Giang'),
('VC019',  4, 'Phan Thị Xuân',    0, '1982-02-14', '001082021401', 'Kinh', 'Tiến sĩ',
 '2008-05-01', '2009-05-01', 'Bảo vệ thực vật',       'Giảng viên chính',    2006,
 'Trung cấp', 'B2', 'Tin học văn phòng', '0901111019', 'xuan.pt@dhag.edu.vn',
 '34 Nguyễn Trãi, Châu Đốc, An Giang'),
('VC020',  4, 'Hồ Văn Yên',       1, '1979-08-03', '001079080301', 'Kinh', 'Thạc sĩ',
 '2005-03-01', '2006-03-01', 'Chăn nuôi thú y',       'Giảng viên',          2003,
 'Trung cấp', 'B1', 'Tin học văn phòng', '0901111020', 'yen.hv@dhag.edu.vn',
 '67 Phan Đình Phùng, Châu Đốc, An Giang'),
('VC021',  9, 'Vũ Thị Ánh',       0, '1984-06-28', '001084062801', 'Kinh', 'Thạc sĩ',
 '2010-09-01', '2011-09-01', 'Tài chính công',        'Chuyên viên chính',   2008,
 'Trung cấp', 'B1', 'Tin học văn phòng', '0901111021', 'anh.vt@dhag.edu.vn',
 '11 Trần Phú, TP. Long Xuyên, An Giang'),
('VC022',  9, 'Đinh Văn Bảo',     1, '1978-03-17', '001078031701', 'Kinh', 'Thạc sĩ',
 '2004-01-01', '2005-01-01', 'Kế toán tài chính',     'Chuyên viên chính',   2002,
 'Cao cấp',   'B2', 'Tin học văn phòng', '0901111022', 'bao.dv@dhag.edu.vn',
 '29 Lê Duẩn, TP. Long Xuyên, An Giang'),
('VC023', 10, 'Lê Thị Cẩm',       0, '1986-10-11', '001086101101', 'Kinh', 'Tiến sĩ',
 '2012-11-01', '2013-11-01', 'Quan hệ quốc tế',       'Chuyên viên chính',   2010,
 'Trung cấp', 'C1', 'Tin học văn phòng', '0901111023', 'cam.lt@dhag.edu.vn',
 '5 Hùng Vương, TP. Long Xuyên, An Giang'),
('VC024', 10, 'Nguyễn Văn Dũng',  1, '1981-01-22', '001081012201', 'Kinh', 'Thạc sĩ',
 '2007-06-01', '2008-06-01', 'Nghiên cứu khoa học',  'Chuyên viên',         2005,
 'Trung cấp', 'B1', 'Tin học văn phòng', '0901111024', 'dung.nv@dhag.edu.vn',
 '88 Võ Thị Sáu, TP. Long Xuyên, An Giang'),
('VC025',  5, 'Trần Thị Ể',       0, '1990-07-07', '001090070701', 'Kinh', 'Thạc sĩ',
 '2016-03-01', '2017-03-01', 'Hệ thống thông tin',   'Giảng viên',          2014,
 NULL,         'B1', 'Tin học văn phòng', '0901111025', 'e.tt@dhag.edu.vn',
 '14 Nguyễn Du, TP. Long Xuyên, An Giang'),
('VC026',  6, 'Mai Văn Phát',      1, '1985-09-16', '001085091601', 'Kinh', 'Thạc sĩ',
 '2011-04-01', '2012-04-01', 'Kế toán doanh nghiệp', 'Giảng viên',          2009,
 'Trung cấp', 'B2', 'Tin học văn phòng', '0901111026', 'phat.mv@dhag.edu.vn',
 '33 Phan Bội Châu, TP. Long Xuyên, An Giang'),
('VC027', 12, 'Phùng Thị Giao',   0, '1983-04-05', '001083040501', 'Kinh', 'Tiến sĩ',
 '2009-08-01', '2010-08-01', 'Luật Dân sự',           'Giảng viên chính',    2007,
 'Cao cấp',   'B2', 'Tin học văn phòng', '0901111027', 'giao.pt@dhag.edu.vn',
 '66 Trần Quang Khải, TP. Long Xuyên, An Giang'),
('VC028', 12, 'Đỗ Văn Hiếu',      1, '1980-06-20', '001080062001', 'Kinh', 'Thạc sĩ',
 '2006-09-01', '2007-09-01', 'Luật Kinh tế',          'Giảng viên',          2004,
 'Trung cấp', 'B1', 'Tin học văn phòng', '0901111028', 'hieu.dv@dhag.edu.vn',
 '22 Đinh Bộ Lĩnh, TP. Long Xuyên, An Giang'),
('VC029', 11, 'Lâm Thị Kiều',     0, '1987-02-09', '001087020901', 'Kinh', 'Đại học',
 '2013-01-01', '2014-01-01', 'Quản lý tài sản',       'Chuyên viên',         2011,
 'Sơ cấp',    'B1', 'Tin học văn phòng', '0901111029', 'kieu.lt@dhag.edu.vn',
 '9 Lý Tự Trọng, TP. Long Xuyên, An Giang'),
('VC030', 16, 'Tô Văn Long',      1, '1984-11-27', '001084112701', 'Kinh', 'Thạc sĩ',
 '2010-12-01', '2011-12-01', 'Giảng dạy tiếng Anh',  'Giảng viên',          2008,
 'Trung cấp', 'C1', 'Tin học văn phòng', '0901111030', 'long.tv@dhag.edu.vn',
 '77 Nguyễn Bỉnh Khiêm, TP. Long Xuyên, An Giang');

-- ============================================================
-- PHẦN 4: XẾP LOẠI VIÊN CHỨC
-- ============================================================
INSERT INTO xep_loai_vc (vien_chuc_id, nam_danh_gia, danh_gia, nhan_xet) VALUES
-- VC001 – Thầy An
(1, 2021, 'Hoàn thành xuất sắc', 'Xuất sắc trong giảng dạy và NCKH'),
(1, 2022, 'Hoàn thành xuất sắc', 'Có nhiều đóng góp trong nghiên cứu khoa học'),
(1, 2023, 'Hoàn thành xuất sắc', 'Tiếp tục dẫn đầu đơn vị'),
(1, 2024, 'Hoàn thành xuất sắc', 'Trưởng khoa mới, hoàn thành xuất sắc mọi chỉ tiêu năm đầu nhiệm kỳ'),
-- VC002 – Cô Bình
(2, 2021, 'Hoàn thành tốt', 'Hoàn thành tốt nhiệm vụ'),
(2, 2022, 'Hoàn thành tốt', 'Hoàn thành tốt nhiệm vụ được giao'),
(2, 2023, 'Hoàn thành tốt', 'Tích cực tham gia các hoạt động đơn vị'),
(2, 2024, 'Hoàn thành tốt', 'Hoàn thành tốt nhiệm vụ giảng dạy và phụ trách bộ môn'),
-- VC003 – Thầy Cường
(3, 2021, 'Hoàn thành xuất sắc', 'Lãnh đạo tốt công tác khoa'),
(3, 2022, 'Hoàn thành xuất sắc', 'Hoàn thành xuất sắc nhiệm vụ quản lý'),
(3, 2023, 'Hoàn thành xuất sắc', 'Nhiều sáng kiến cải tiến công tác đào tạo'),
(3, 2024, 'Hoàn thành xuất sắc', 'Bổ nhiệm lại TK Kinh tế, dẫn dắt khoa đạt nhiều thành tích'),
-- VC004 – Cô Dung
(4, 2022, 'Hoàn thành tốt', 'Hoàn thành tốt nhiệm vụ'),
(4, 2023, 'Hoàn thành tốt', 'Tích cực nghiên cứu khoa học'),
(4, 2024, 'Hoàn thành tốt', 'Nghiên cứu khoa học cấp trường về hệ thống thông tin'),
-- VC005 – Thầy Em
(5, 2021, 'Hoàn thành xuất sắc', 'Có nhiều công trình nghiên cứu cấp bộ'),
(5, 2022, 'Hoàn thành xuất sắc', 'Xuất sắc toàn diện'),
(5, 2023, 'Hoàn thành tốt',      'Hoàn thành tốt'),
(5, 2024, 'Hoàn thành xuất sắc', 'PTK Kinh tế, hoàn thành xuất sắc nhiệm kỳ đầu'),
-- VC006 – Cô Fương
(6, 2022, 'Hoàn thành tốt',      'Hoàn thành tốt nhiệm vụ giảng dạy'),
(6, 2023, 'Hoàn thành xuất sắc', 'Có sáng kiến đổi mới phương pháp giảng dạy'),
(6, 2024, 'Hoàn thành tốt',      'Tích cực ổn định sau khi hòa nhập đơn vị mới'),
-- VC007 – Thầy Giang
(7, 2022, 'Hoàn thành xuất sắc', 'Xuất sắc trong giảng dạy'),
(7, 2023, 'Hoàn thành xuất sắc', 'Đóng góp nhiều cho công tác khoa'),
(7, 2024, 'Hoàn thành xuất sắc', 'TK Sư phạm mới, nhiều sáng kiến đổi mới phương pháp dạy học'),
-- VC008 – Cô Hoa
(8, 2024, 'Hoàn thành tốt', 'Hoàn thành tốt nhiệm vụ giảng dạy và công tác đơn vị'),
-- VC009 – Thầy Khánh
(9, 2022, 'Hoàn thành tốt',      'Hoàn thành tốt nhiệm vụ'),
(9, 2023, 'Hoàn thành xuất sắc', 'Có đề tài NCKH cấp trường'),
(9, 2024, 'Hoàn thành xuất sắc', 'Chủ trì đề tài nghiên cứu cấp bộ, hội đồng chức danh GS'),
-- VC010 – Cô Lan
(10, 2021, 'Hoàn thành tốt',      'Hoàn thành tốt công tác hành chính'),
(10, 2024, 'Hoàn thành xuất sắc', 'TP TC-CT mới, xây dựng nhiều quy trình quản lý nhân sự hiệu quả'),
-- VC011 – Thầy Minh
(11, 2022, 'Hoàn thành tốt',      'Hoàn thành tốt công tác hành chính'),
(11, 2023, 'Hoàn thành xuất sắc', 'Cải tiến quy trình tổ chức hiệu quả'),
(11, 2024, 'Hoàn thành tốt',      'Hoàn thành tốt công việc sau khi thôi chức vụ'),
-- VC012 – Cô Ngọc
(12, 2023, 'Hoàn thành tốt', 'Hoàn thành tốt nhiệm vụ chuyên môn'),
(12, 2024, 'Hoàn thành tốt', 'Hoàn thành tốt công tác tại Phòng Đào tạo'),
-- VC013 – Cô Phượng
(13, 2021, 'Hoàn thành tốt',      'Hoàn thành tốt nhiệm vụ giảng dạy'),
(13, 2022, 'Hoàn thành tốt',      'Tích cực tham gia đề tài nghiên cứu khoa học cấp trường'),
(13, 2023, 'Hoàn thành xuất sắc', 'Đạt giải nhất hội thi giảng viên giỏi cấp trường'),
(13, 2024, 'Hoàn thành xuất sắc', 'Chủ nhiệm đề tài cấp bộ, xuất bản 2 bài báo quốc tế'),
-- VC014 – Thầy Quang
(14, 2021, 'Hoàn thành xuất sắc', 'Bảo vệ thành công luận án tiến sĩ loại xuất sắc'),
(14, 2022, 'Hoàn thành xuất sắc', 'Có 3 bài báo ISI, chủ trì đề tài NCKH cấp trường'),
(14, 2023, 'Hoàn thành xuất sắc', 'Nhận danh hiệu Chiến sĩ thi đua cấp cơ sở'),
(14, 2024, 'Hoàn thành xuất sắc', 'Được bổ nhiệm vào chức danh giảng viên chính'),
-- VC015 – Cô Sương
(15, 2021, 'Hoàn thành xuất sắc', 'Giảng dạy xuất sắc, hướng dẫn SV đạt giải cuộc thi kinh tế'),
(15, 2022, 'Hoàn thành xuất sắc', 'Chủ trì đề tài cấp tỉnh về phát triển kinh tế vùng ĐBSCL'),
(15, 2023, 'Hoàn thành tốt',      'Hoàn thành tốt công tác giảng dạy và nghiên cứu'),
(15, 2024, 'Hoàn thành xuất sắc', 'Hoàn thành xuất sắc, có bài báo đăng tạp chí Scopus'),
-- VC016 – Thầy Thịnh
(16, 2021, 'Hoàn thành tốt',      'Hoàn thành tốt nhiệm vụ được giao'),
(16, 2022, 'Hoàn thành tốt',      'Tích cực tham gia phong trào đơn vị'),
(16, 2023, 'Hoàn thành tốt',      'Hướng dẫn sinh viên NCKH đạt giải ba'),
(16, 2024, 'Hoàn thành xuất sắc', 'Bảo vệ thành công luận án tiến sĩ, nhiều đóng góp cho khoa'),
-- VC017 – Cô Uyên
(17, 2022, 'Hoàn thành tốt',      'Hoàn thành tốt nhiệm vụ năm đầu về trường'),
(17, 2023, 'Hoàn thành tốt',      'Tích cực tham gia phong trào thi đua'),
(17, 2024, 'Hoàn thành xuất sắc', 'Đạt giải nhì hội thi giáo viên dạy giỏi cấp trường'),
-- VC018 – Thầy Vũ
(18, 2021, 'Hoàn thành xuất sắc', 'Giảng viên cao cấp, nhiều năm liên tục hoàn thành xuất sắc'),
(18, 2022, 'Hoàn thành xuất sắc', 'Chủ trì biên soạn 2 giáo trình cấp trường'),
(18, 2023, 'Hoàn thành xuất sắc', 'Hướng dẫn nghiên cứu sinh bảo vệ thành công luận án tiến sĩ'),
(18, 2024, 'Hoàn thành xuất sắc', 'Nhận bằng khen của UBND tỉnh An Giang'),
-- VC019 – Cô Xuân
(19, 2021, 'Hoàn thành tốt',      'Hoàn thành tốt nhiệm vụ giảng dạy và nghiên cứu'),
(19, 2022, 'Hoàn thành xuất sắc', 'Có đề tài về sâu bệnh trên cây lúa được ứng dụng thực tế'),
(19, 2023, 'Hoàn thành tốt',      'Hoàn thành tốt các nhiệm vụ được phân công'),
(19, 2024, 'Hoàn thành xuất sắc', 'Nhận danh hiệu Chiến sĩ thi đua, chủ trì 1 đề tài cấp bộ'),
-- VC020 – Thầy Yên
(20, 2022, 'Hoàn thành tốt', 'Hoàn thành tốt nhiệm vụ'),
(20, 2023, 'Hoàn thành tốt', 'Tích cực phối hợp nghiên cứu thực địa với các doanh nghiệp'),
(20, 2024, 'Hoàn thành tốt', 'Hoàn thành tốt, tham gia hội đồng xét tốt nghiệp'),
-- VC021 – Cô Ánh
(21, 2021, 'Hoàn thành xuất sắc', 'Tham mưu hiệu quả công tác tài chính, tiết kiệm ngân sách'),
(21, 2022, 'Hoàn thành xuất sắc', 'Xây dựng quy trình quản lý tài chính được BGH khen ngợi'),
(21, 2023, 'Hoàn thành tốt',      'Hoàn thành tốt công tác kế hoạch tài chính'),
(21, 2024, 'Hoàn thành xuất sắc', 'Hoàn thành xuất sắc, được đề xuất vào quy hoạch lãnh đạo'),
-- VC022 – Thầy Bảo
(22, 2021, 'Hoàn thành tốt',      'Hoàn thành tốt nhiệm vụ kế toán'),
(22, 2022, 'Hoàn thành tốt',      'Kế toán tổng hợp nghiêm túc, không để sai sót'),
(22, 2023, 'Hoàn thành xuất sắc', 'Triển khai phần mềm kế toán mới, tiết kiệm thời gian xử lý'),
(22, 2024, 'Hoàn thành tốt',      'Hoàn thành tốt các nhiệm vụ được giao'),
-- VC023 – Cô Cẩm
(23, 2021, 'Hoàn thành xuất sắc', 'Ký kết 3 biên bản ghi nhớ hợp tác quốc tế'),
(23, 2022, 'Hoàn thành xuất sắc', 'Chủ trì tổ chức hội thảo khoa học quốc tế thành công'),
(23, 2023, 'Hoàn thành xuất sắc', 'Có nhiều đóng góp trong hợp tác với các trường ASEAN'),
(23, 2024, 'Hoàn thành xuất sắc', 'Nhận khen thưởng của Bộ GD&ĐT về công tác hợp tác quốc tế'),
-- VC024 – Thầy Dũng
(24, 2022, 'Hoàn thành tốt', 'Hoàn thành tốt công tác quản lý đề tài nghiên cứu'),
(24, 2023, 'Hoàn thành tốt', 'Hỗ trợ tốt các thủ tục hợp tác quốc tế'),
(24, 2024, 'Hoàn thành tốt', 'Hoàn thành tốt, tích cực tham gia phong trào thi đua'),
-- VC025 – Cô Ể
(25, 2022, 'Hoàn thành tốt', 'Hoàn thành tốt nhiệm vụ giảng dạy bộ môn'),
(25, 2023, 'Hoàn thành tốt', 'Tích cực nghiên cứu, tham gia hội thảo khoa học'),
(25, 2024, 'Hoàn thành tốt', 'Hoàn thành tốt, đang theo học nghiên cứu sinh tiến sĩ'),
-- VC026 – Thầy Phát
(26, 2022, 'Hoàn thành tốt',      'Hoàn thành tốt nhiệm vụ giảng dạy kế toán'),
(26, 2023, 'Hoàn thành xuất sắc', 'Hướng dẫn sinh viên NCKH đạt giải nhì'),
(26, 2024, 'Hoàn thành tốt',      'Hoàn thành tốt các nhiệm vụ giảng dạy và nghiên cứu'),
-- VC027 – Cô Giao
(27, 2021, 'Hoàn thành xuất sắc', 'Xuất sắc trong công tác giảng dạy và nghiên cứu pháp luật'),
(27, 2022, 'Hoàn thành xuất sắc', 'Chủ trì biên soạn giáo trình Luật Dân sự được xuất bản'),
(27, 2023, 'Hoàn thành xuất sắc', 'Có nhiều công trình nghiên cứu pháp luật được áp dụng thực tiễn'),
(27, 2024, 'Hoàn thành xuất sắc', 'Nhận bằng khen Bộ trưởng Bộ GD&ĐT'),
-- VC028 – Thầy Hiếu
(28, 2021, 'Hoàn thành tốt',      'Hoàn thành tốt nhiệm vụ giảng dạy luật'),
(28, 2022, 'Hoàn thành tốt',      'Tham gia tư vấn pháp lý cho sinh viên và cộng đồng'),
(28, 2023, 'Hoàn thành tốt',      'Hoàn thành tốt, tham gia hội thảo pháp luật'),
(28, 2024, 'Hoàn thành xuất sắc', 'Bảo vệ luận án tiến sĩ, chủ trì 1 đề tài nghiên cứu'),
-- VC029 – Cô Kiều
(29, 2022, 'Hoàn thành tốt', 'Hoàn thành tốt công tác quản lý tài sản thiết bị'),
(29, 2023, 'Hoàn thành tốt', 'Kiểm kê tài sản chính xác, đúng tiến độ'),
(29, 2024, 'Hoàn thành tốt', 'Hoàn thành tốt, hỗ trợ tốt công tác mua sắm trang thiết bị'),
-- VC030 – Thầy Long
(30, 2022, 'Hoàn thành tốt',      'Hoàn thành tốt công tác giảng dạy tiếng Anh'),
(30, 2023, 'Hoàn thành xuất sắc', 'Đạt điểm IELTS 7.5, hướng dẫn sinh viên đạt chứng chỉ quốc tế'),
(30, 2024, 'Hoàn thành xuất sắc', 'Xây dựng chương trình tiếng Anh chuyên ngành được áp dụng toàn trường');

-- ============================================================
-- PHẦN 5: XẾP LOẠI ĐẢNG VIÊN
-- ============================================================
INSERT INTO xep_loai_dang_vien (vien_chuc_id, nam_danh_gia, danh_gia, nhan_xet) VALUES
-- VC001 – Thầy An
(1, 2021, 'Hoàn thành xuất sắc', 'Gương mẫu thực hiện nhiệm vụ đảng viên'),
(1, 2022, 'Hoàn thành xuất sắc', 'Tiên phong trong hoạt động chi bộ'),
(1, 2023, 'Hoàn thành xuất sắc', 'Tiếp tục phát huy'),
(1, 2024, 'Hoàn thành xuất sắc', 'Bí thư chi bộ khoa CNTT, dẫn dắt chi bộ hoàn thành xuất sắc'),
-- VC003 – Thầy Cường
(3, 2021, 'Hoàn thành tốt',      'Thực hiện tốt nhiệm vụ đảng viên'),
(3, 2022, 'Hoàn thành tốt',      'Tích cực tham gia sinh hoạt chi bộ'),
(3, 2023, 'Hoàn thành xuất sắc', 'Có nhiều đóng góp cho chi bộ'),
(3, 2024, 'Hoàn thành xuất sắc', 'Tiếp tục gương mẫu đảng viên sau khi bổ nhiệm lại'),
-- VC005 – Thầy Em
(5, 2022, 'Hoàn thành xuất sắc', 'Gương mẫu, đi đầu trong thực hiện nghị quyết'),
(5, 2023, 'Hoàn thành tốt',      'Hoàn thành tốt nhiệm vụ'),
(5, 2024, 'Hoàn thành xuất sắc', 'Phó bí thư chi bộ khoa Kinh tế, tích cực hoạt động đảng'),
-- VC007 – Thầy Giang
(7, 2022, 'Hoàn thành xuất sắc', 'Xuất sắc trong sinh hoạt đảng'),
(7, 2023, 'Hoàn thành xuất sắc', 'Gương mẫu đảng viên'),
(7, 2024, 'Hoàn thành xuất sắc', 'Bí thư chi bộ khoa Sư phạm, hoàn thành xuất sắc nhiệm vụ đảng'),
-- VC009 – Thầy Khánh
(9, 2023, 'Hoàn thành tốt', 'Thực hiện tốt nghị quyết chi bộ'),
-- VC011 – Thầy Minh
(11, 2022, 'Hoàn thành tốt', 'Thực hiện tốt nhiệm vụ'),
(11, 2023, 'Hoàn thành tốt', 'Tích cực sinh hoạt chi bộ'),
-- VC014 – Thầy Quang
(14, 2022, 'Hoàn thành xuất sắc', 'Gương mẫu đảng viên trẻ xuất sắc trong sinh hoạt chi bộ'),
(14, 2023, 'Hoàn thành xuất sắc', 'Được kết nạp Ban chấp hành chi bộ khoa CNTT'),
(14, 2024, 'Hoàn thành xuất sắc', 'Hoàn thành xuất sắc nhiệm vụ đảng viên'),
-- VC015 – Cô Sương
(15, 2022, 'Hoàn thành tốt',      'Thực hiện tốt nhiệm vụ đảng viên'),
(15, 2023, 'Hoàn thành xuất sắc', 'Gương mẫu, tích cực trong các phong trào chi bộ'),
(15, 2024, 'Hoàn thành xuất sắc', 'Được giới thiệu vào cấp ủy nhiệm kỳ mới'),
-- VC018 – Thầy Vũ
(18, 2021, 'Hoàn thành xuất sắc', 'Đảng viên gương mẫu nhiều năm liên tục'),
(18, 2022, 'Hoàn thành xuất sắc', 'Tham gia tích cực các phong trào đảng bộ trường'),
(18, 2023, 'Hoàn thành xuất sắc', 'Được kết nạp vào Ban chấp hành chi bộ khoa Sư phạm'),
(18, 2024, 'Hoàn thành xuất sắc', 'Tiếp tục phát huy vai trò lãnh đạo chi bộ'),
-- VC019 – Cô Xuân
(19, 2022, 'Hoàn thành tốt',      'Thực hiện tốt sinh hoạt đảng'),
(19, 2023, 'Hoàn thành tốt',      'Tích cực tham gia các hoạt động chi bộ'),
(19, 2024, 'Hoàn thành xuất sắc', 'Gương mẫu, tích cực vận động quần chúng'),
-- VC021 – Cô Ánh
(21, 2021, 'Hoàn thành tốt',      'Thực hiện tốt nhiệm vụ đảng viên'),
(21, 2022, 'Hoàn thành xuất sắc', 'Được kết nạp vào cấp ủy chi bộ phòng KHTC'),
(21, 2023, 'Hoàn thành xuất sắc', 'Gương mẫu trong thực hiện nghị quyết chi bộ'),
(21, 2024, 'Hoàn thành xuất sắc', 'Hoàn thành xuất sắc nhiệm vụ đảng viên'),
-- VC023 – Cô Cẩm
(23, 2022, 'Hoàn thành xuất sắc', 'Đảng viên xuất sắc, tích cực trong công tác đối ngoại của Đảng'),
(23, 2023, 'Hoàn thành xuất sắc', 'Gương mẫu thực hiện 19 điều đảng viên không được làm'),
(23, 2024, 'Hoàn thành xuất sắc', 'Được đề nghị khen thưởng đảng viên xuất sắc cấp trường'),
-- VC027 – Cô Giao
(27, 2021, 'Hoàn thành xuất sắc', 'Đảng viên tiêu biểu, mẫu mực trong sinh hoạt và công tác'),
(27, 2022, 'Hoàn thành xuất sắc', 'Được tặng danh hiệu đảng viên xuất sắc cấp trường'),
(27, 2023, 'Hoàn thành xuất sắc', 'Bí thư chi bộ khoa Luật, dẫn dắt chi bộ hoàn thành xuất sắc NV'),
(27, 2024, 'Hoàn thành xuất sắc', 'Tiếp tục phát huy vai trò lãnh đạo chi bộ'),
-- VC030 – Thầy Long
(30, 2023, 'Hoàn thành tốt', 'Thực hiện tốt nhiệm vụ đảng viên mới'),
(30, 2024, 'Hoàn thành tốt', 'Tiếp tục phát huy trong sinh hoạt chi bộ');

-- ============================================================
-- PHẦN 6: NHIỆM KỲ CHỨC VỤ LỊCH SỬ (trước khi có quyết định mới)
-- ============================================================
-- Thầy Cường: TK Kinh tế nhiệm kỳ cũ (2022–2026-02-28, id=1)
INSERT INTO nhiem_ky_chuc_vu (ngay_bat_dau, ngay_ket_thuc, ly_do_ket_thuc, trang_thai, vien_chuc_id, chuc_danh_id, qd_bo_nhiem_id) VALUES
('2022-09-05', '2026-02-28', 'Hết nhiệm kỳ, được bổ nhiệm lại theo QĐ 801/QĐ-ĐHAG', 0, 3, 1, NULL);

-- ============================================================
-- PHẦN 7: ĐỢT QUY HOẠCH (id 1–10)
-- ============================================================
INSERT INTO dot_quy_hoach (ma_quy_hoach, ten_quy_hoach, loai_quy_hoach, nam_thuc_hien,
    nhiem_ky, so_qd_phe_duyet, ngay_qd_phe_duyet, trang_thai) VALUES
('QH001', 'Quy hoạch Cán bộ Lãnh đạo Khoa CNTT',              1, 2025, '2026-2031', '456/QĐ-ĐHAG', '2025-12-10', 1),
('QH002', 'Rà soát quy hoạch Khoa Kinh tế năm 2025',           2, 2025, '2026-2031', '512/QĐ-ĐHAG', '2025-11-20', 1),
('QH003', 'Quy hoạch Cán bộ Lãnh đạo Khoa Sư phạm',           1, 2025, '2026-2031', '530/QĐ-ĐHAG', '2025-12-01', 1),
('QH004', 'Quy hoạch Cán bộ Lãnh đạo Phòng TC-CT',            1, 2025, '2026-2031', '541/QĐ-ĐHAG', '2025-12-05', 1),
('QH005', 'Quy hoạch Cán bộ Lãnh đạo Khoa Nông nghiệp',       1, 2025, '2026-2031', '558/QĐ-ĐHAG', '2025-12-10', 1),
('QH006', 'Quy hoạch Cán bộ Lãnh đạo Phòng KH-HTQT',         1, 2025, '2026-2031', '565/QĐ-ĐHAG', '2025-12-15', 1),
('QH007', 'Rà soát quy hoạch Khoa CNTT năm 2026',              2, 2026, '2027-2031', '102/QĐ-ĐHAG', '2026-03-01', 1),
('QH008', 'Quy hoạch Cán bộ Lãnh đạo Khoa Luật',              1, 2025, '2026-2031', '572/QĐ-ĐHAG', '2025-12-20', 1),
('QH009', 'Rà soát quy hoạch Phòng Tổ chức - Công tác 2026',  2, 2026, '2027-2031', '115/QĐ-ĐHAG', '2026-03-10', 1),
('QH010', 'Quy hoạch Cán bộ Lãnh đạo Phòng Kế hoạch - TC',   1, 2025, '2026-2031', '580/QĐ-ĐHAG', '2025-12-28', 1);

-- ============================================================
-- PHẦN 8: CHI TIẾT QUY HOẠCH (id 1–21)
-- ============================================================
INSERT INTO chi_tiet_quy_hoach (dot_quy_hoach_id, vien_chuc_id, chuc_danh_id, ngay_vao_qh, trang_thai) VALUES
-- QH001: Khoa CNTT
(1,  1, 1, '2025-12-10', 1),  -- id=1  Thầy An    – TK CNTT (được chọn)
(1,  2, 1, '2025-12-10', 1),  -- id=2  Cô Bình    – TK CNTT (dự phòng)
-- QH002: Khoa Kinh tế
(2,  3, 1, '2025-11-20', 1),  -- id=3  Thầy Cường – TK Kinh tế
(2,  5, 2, '2025-11-20', 1),  -- id=4  Thầy Em    – PTK Kinh tế
-- QH003: Khoa Sư phạm
(3,  7, 1, '2025-12-01', 1),  -- id=5  Thầy Giang – TK Sư phạm
(3,  8, 2, '2025-12-01', 1),  -- id=6  Cô Hoa     – PTK Sư phạm
-- QH004: Phòng TC-CT
(4, 10, 5, '2025-12-05', 1),  -- id=7  Cô Lan     – TP TC-CT
(4, 11, 6, '2025-12-05', 1),  -- id=8  Thầy Minh  – PTP TC-CT
-- QH005: Khoa Nông nghiệp
(5,  9, 1, '2025-12-10', 1),  -- id=9  Thầy Khánh – TK Nông nghiệp
(5, 19, 2, '2025-12-10', 1),  -- id=10 Cô Xuân    – PTK Nông nghiệp
(5, 20, 2, '2025-12-10', 1),  -- id=11 Thầy Yên   – PTK NN (dự phòng)
-- QH006: Phòng KH-HTQT
(6, 23, 5, '2025-12-15', 1),  -- id=12 Cô Cẩm     – TP KH-HTQT
(6, 24, 6, '2025-12-15', 1),  -- id=13 Thầy Dũng  – PTP KH-HTQT
-- QH007: Rà soát CNTT
(7, 14, 3, '2026-03-01', 1),  -- id=14 Thầy Quang – TBM HTTT
(7, 13, 4, '2026-03-01', 1),  -- id=15 Cô Phượng  – PTBM HTTT
-- QH008: Khoa Luật
(8, 27, 1, '2025-12-20', 1),  -- id=16 Cô Giao    – TK Luật
(8, 28, 2, '2025-12-20', 1),  -- id=17 Thầy Hiếu  – PTK Luật
-- QH009: Phòng TC-CT rà soát
(9, 10, 5, '2026-03-10', 1),  -- id=18 Cô Lan     – TP TC-CT (đang giữ)
(9, 24, 6, '2026-03-10', 1),  -- id=19 Thầy Dũng  – PTP TC-CT (dự phòng)
-- QH010: Phòng KHTC
(10, 21, 5, '2025-12-28', 1), -- id=20 Cô Ánh     – TP KHTC
(10, 22, 6, '2025-12-28', 1); -- id=21 Thầy Bảo   – PTP KHTC

-- ============================================================
-- PHẦN 9: KẾT QUẢ QUY HOẠCH
-- ============================================================
-- QH001 – Thầy An (ctqh_id=1)
INSERT INTO ket_qua_quy_hoach (buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat, so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le, so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua, chi_tiet_qh_id) VALUES
(1, 20, 20, 20, 20, 20, 18,  2, 1, 1),
(2, 50, 48, 48, 48, 47, 44,  3, 1, 1),
(3, 20, 19, 19, 19, 19, 18,  1, 1, 1),
(4, 12, 12, 12, 12, 12, 11,  1, 1, 1);
-- QH001 – Cô Bình dự phòng (ctqh_id=2)
INSERT INTO ket_qua_quy_hoach (buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat, so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le, so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua, chi_tiet_qh_id) VALUES
(1, 20, 20, 20, 20, 20, 12,  8, 1, 2),
(2, 50, 48, 48, 48, 47, 26, 21, 0, 2);
-- QH002 – Thầy Cường TK (ctqh_id=3)
INSERT INTO ket_qua_quy_hoach (buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat, so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le, so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua, chi_tiet_qh_id) VALUES
(1, 18, 18, 18, 18, 18, 16, 2, 1, 3),
(2, 45, 44, 44, 44, 43, 40, 3, 1, 3),
(3, 18, 17, 17, 17, 17, 16, 1, 1, 3);
-- QH002 – Thầy Em PTK (ctqh_id=4)
INSERT INTO ket_qua_quy_hoach (buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat, so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le, so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua, chi_tiet_qh_id) VALUES
(1, 18, 17, 17, 17, 17, 15, 2, 1, 4),
(2, 45, 45, 45, 45, 44, 41, 3, 1, 4),
(3, 18, 18, 18, 18, 18, 17, 1, 1, 4);
-- QH003 – Thầy Giang TK (ctqh_id=5)
INSERT INTO ket_qua_quy_hoach (buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat, so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le, so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua, chi_tiet_qh_id) VALUES
(1, 22, 21, 21, 21, 21, 19, 2, 1, 5),
(2, 55, 53, 53, 53, 52, 49, 3, 1, 5),
(3, 22, 22, 22, 22, 22, 21, 1, 1, 5),
(4, 13, 13, 13, 13, 13, 12, 1, 1, 5);
-- QH003 – Cô Hoa PTK (ctqh_id=6, xin rút)
INSERT INTO ket_qua_quy_hoach (buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat, so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le, so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua, chi_tiet_qh_id) VALUES
(1, 22, 21, 21, 21, 21, 15,  6, 1, 6),
(2, 55, 53, 53, 53, 52, 31, 21, 0, 6);
-- QH004 – Cô Lan TP (ctqh_id=7)
INSERT INTO ket_qua_quy_hoach (buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat, so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le, so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua, chi_tiet_qh_id) VALUES
(1, 12, 12, 12, 12, 12, 11, 1, 1, 7),
(2, 30, 30, 30, 30, 30, 28, 2, 1, 7),
(3, 12, 12, 12, 12, 12, 11, 1, 1, 7);
-- QH004 – Thầy Minh PTP (ctqh_id=8)
INSERT INTO ket_qua_quy_hoach (buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat, so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le, so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua, chi_tiet_qh_id) VALUES
(1, 12, 11, 11, 11, 11, 10, 1, 1, 8),
(2, 30, 29, 29, 29, 29, 27, 2, 1, 8);
-- QH005 – Thầy Khánh TK NN (ctqh_id=9)
INSERT INTO ket_qua_quy_hoach (buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat, so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le, so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua, chi_tiet_qh_id) VALUES
(1, 16, 16, 16, 16, 16, 15, 1, 1,  9),
(2, 42, 40, 40, 40, 39, 37, 2, 1,  9),
(3, 16, 15, 15, 15, 15, 14, 1, 1,  9),
(4, 10, 10, 10, 10, 10, 10, 0, 1,  9);
-- QH005 – Cô Xuân PTK NN (ctqh_id=10)
INSERT INTO ket_qua_quy_hoach (buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat, so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le, so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua, chi_tiet_qh_id) VALUES
(1, 16, 15, 15, 15, 15, 13, 2, 1, 10),
(2, 42, 42, 42, 42, 41, 38, 3, 1, 10);
-- QH006 – Cô Cẩm TP KH-HTQT (ctqh_id=12)
INSERT INTO ket_qua_quy_hoach (buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat, so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le, so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua, chi_tiet_qh_id) VALUES
(1, 10, 10, 10, 10, 10,  9, 1, 1, 12),
(2, 25, 24, 24, 24, 24, 23, 1, 1, 12),
(3, 10, 10, 10, 10, 10, 10, 0, 1, 12);
-- QH008 – Cô Giao TK Luật (ctqh_id=16)
INSERT INTO ket_qua_quy_hoach (buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat, so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le, so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua, chi_tiet_qh_id) VALUES
(1, 14, 14, 14, 14, 14, 13, 1, 1, 16),
(2, 35, 34, 34, 34, 33, 31, 2, 1, 16),
(3, 14, 14, 14, 14, 14, 13, 1, 1, 16),
(4,  9,  9,  9,  9,  9,  9, 0, 1, 16);
-- QH010 – Cô Ánh TP KHTC (ctqh_id=20)
INSERT INTO ket_qua_quy_hoach (buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat, so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le, so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua, chi_tiet_qh_id) VALUES
(1, 11, 11, 11, 11, 11, 10, 1, 1, 20),
(2, 28, 27, 27, 27, 27, 25, 2, 1, 20),
(3, 11, 10, 10, 10, 10,  9, 1, 1, 20);

-- ============================================================
-- PHẦN 10: PHIẾU CHỦ TRƯƠNG (id 1–14, PCT001–PCT014)
-- ============================================================
INSERT INTO phieu_chu_truong (ma_phieu, so_to_trinh_chu_truong, tieu_de, ly_do_de_xuat,
    so_luong_de_xuat, nguon_nhan_su, trang_thai, dot_quy_hoach_id, don_vi_id, chuc_danh_id, nguoi_lap_id) VALUES
('PCT001', '12/TTr-CNTT',  'Đề xuất bổ nhiệm Trưởng khoa CNTT',
 'Kiện toàn bộ máy lãnh đạo khoa', 1, 1, 1, 1, 1, 1, 11),
('PCT002', '08/TTr-KT',    'Đề xuất bổ nhiệm lại Trưởng khoa Kinh tế',
 'Hết nhiệm kỳ, tiếp tục kiện toàn lãnh đạo', 1, 1, 1, 2, 2, 1, 11),
('PCT003', '09/TTr-KT',    'Đề xuất bổ nhiệm Phó Trưởng khoa Kinh tế',
 'Bổ sung nhân sự lãnh đạo còn thiếu', 1, 1, 1, 2, 2, 2, 11),
('PCT004', '11/TTr-SP',    'Đề xuất bổ nhiệm Trưởng khoa Sư phạm',
 'Trưởng khoa cũ nghỉ hưu, cần bổ sung kịp thời', 1, 1, 1, 3, 3, 1, 11),
('PCT005', '05/TTr-TCCT',  'Đề xuất bổ nhiệm Trưởng phòng Tổ chức - Công tác',
 'Kiện toàn bộ máy phòng, người cũ thôi chức do sức khoẻ', 1, 2, 1, 4, 7, 5, 10),
('PCT006', '06/TTr-TCCT',  'Đề xuất cho thôi chức Phó Trưởng phòng TC-CT',
 'Đương sự có đơn xin thôi chức vì lý do cá nhân', 1, NULL, 1, NULL, 7, 6, 10),
('PCT007', '14/TTr-NN',    'Đề xuất bổ nhiệm Trưởng khoa Nông nghiệp',
 'Trưởng khoa cũ nghỉ hưu theo chế độ, cần bổ sung nhân sự lãnh đạo', 1, 1, 1, 5, 4, 1, 11),
('PCT008', '15/TTr-NN',    'Đề xuất bổ nhiệm Phó Trưởng khoa Nông nghiệp',
 'Khoa có 3 ngành đào tạo, cần bổ sung thêm 1 phó trưởng khoa', 1, 1, 1, 5, 4, 2, 11),
('PCT009', '07/TTr-KHTC',  'Đề xuất bổ nhiệm Trưởng phòng Khoa học - Hợp tác quốc tế',
 'Kiện toàn bộ máy lãnh đạo phòng, đáp ứng yêu cầu hội nhập quốc tế', 1, 1, 1, 6, 10, 5, 10),
('PCT010', '16/TTr-CNTT',  'Đề xuất bổ nhiệm Trưởng bộ môn Hệ thống thông tin',
 'Bộ môn chưa có người đứng đầu chính thức, cần kiện toàn', 1, 1, 1, 7, 5, 3, 1),
('PCT011', '03/TTr-Luat',  'Đề xuất bổ nhiệm Trưởng khoa Luật',
 'Khoa Luật mới thành lập, cần bổ nhiệm trưởng khoa đầu tiên', 1, 1, 1, 8, 12, 1, 11),
('PCT012', '08/TTr-KHTC2', 'Đề xuất bổ nhiệm Trưởng phòng Kế hoạch - Tài chính',
 'Trưởng phòng cũ chuyển công tác, cần bổ sung nhân sự lãnh đạo kịp thời', 1, 1, 2, 10, 9, 5, 10),
('PCT013', '17/TTr-CNTT',  'Đề xuất bổ nhiệm kiêm nhiệm TK CNTT phụ trách BM HTTT',
 'Bộ môn HTTT chưa có trưởng bộ môn, TK kiêm nhiệm tạm thời', 1, 1, 1, 7, 5, 3, 1),
('PCT014', '16/TTr-NN',    'Đề xuất thôi chức Phó Trưởng khoa Nông nghiệp',
 'Đương sự được điều chuyển sang Khoa Y Dược theo quyết định của BGH', 1, NULL, 1, NULL, 4, 2, 11);

-- ============================================================
-- PHẦN 11: ĐỢT BỔ NHIỆM (id 1–14, BN001–BN014)
-- ============================================================
INSERT INTO dot_bo_nhiem (ma_dot_bo_nhiem, ten_dot_bo_nhiem, ngay_bat_dau, ngay_ket_thuc, ngay_phe_duyet, so_quyet_dinh, trang_thai, phieu_chu_truong_id) VALUES
('BN001', 'Bổ nhiệm Trưởng khoa CNTT nhiệm kỳ 2026-2031',           '2026-03-01', NULL,         NULL,         NULL,           1,  1),
('BN002', 'Bổ nhiệm lại Trưởng khoa Kinh tế nhiệm kỳ 2026-2031',    '2026-02-01', NULL,         NULL,         NULL,           1,  2),
('BN003', 'Bổ nhiệm Phó Trưởng khoa Kinh tế 2026',                  '2026-02-01', NULL,         NULL,         NULL,           1,  3),
('BN004', 'Bổ nhiệm Trưởng khoa Sư phạm nhiệm kỳ 2026-2031',        '2026-03-05', '2026-03-30', '2026-03-28', '802/QĐ-ĐHAG', 2,  4),
('BN005', 'Bổ nhiệm Trưởng phòng TC-CT 2026',                       '2026-03-10', '2026-03-28', '2026-03-25', '815/QĐ-ĐHAG', 2,  5),
('BN006', 'Thôi chức Phó Trưởng phòng TC-CT',                       '2026-03-15', '2026-03-20', '2026-03-20', '820/QĐ-ĐHAG', 2,  6),
('BN007', 'Bổ nhiệm Trưởng khoa Nông nghiệp nhiệm kỳ 2026-2031',    '2026-04-01', '2026-04-28', '2026-04-25', '903/QĐ-ĐHAG', 2,  7),
('BN008', 'Bổ nhiệm Phó Trưởng khoa Nông nghiệp',                   '2026-04-01', '2026-04-28', '2026-04-25', '904/QĐ-ĐHAG', 2,  8),
('BN009', 'Bổ nhiệm Trưởng phòng KH-HTQT 2026',                     '2026-04-05', '2026-04-30', '2026-04-28', '910/QĐ-ĐHAG', 2,  9),
('BN010', 'Bổ nhiệm Trưởng bộ môn HTTT',                            '2026-04-10', NULL,         NULL,         NULL,           1, 10),
('BN011', 'Bổ nhiệm Trưởng khoa Luật',                              '2026-04-15', '2026-05-10', '2026-05-08', '925/QĐ-ĐHAG', 2, 11),
('BN012', 'Bổ nhiệm Trưởng phòng Kế hoạch - Tài chính',            '2026-04-20', NULL,         NULL,         NULL,           1, 12),
('BN013', 'Bổ nhiệm kiêm nhiệm TK CNTT phụ trách BM HTTT',         '2026-04-10', '2026-04-15', '2026-04-12', '920/QĐ-ĐHAG', 2, 13),
('BN014', 'Thôi chức Phó Trưởng khoa Nông nghiệp',                  '2026-05-01', '2026-05-10', '2026-05-08', '930/QĐ-ĐHAG', 2, 14);

-- ============================================================
-- PHẦN 12: CHI TIẾT BỔ NHIỆM (id 1–17)
-- ============================================================
INSERT INTO chi_tiet_bo_nhiem (dot_bo_nhiem_id, vien_chuc_id, chi_tiet_qh_id, ly_do_vao, trang_thai) VALUES
-- BN001: Khoa CNTT
( 1,  1,  1, 'Kế thừa từ danh sách quy hoạch đạt chuẩn',                                          1), -- id=1
( 1,  6, NULL,'Thuyên chuyển từ đơn vị khác có năng lực phù hợp',                                 1), -- id=2
-- BN002: TK Kinh tế bổ nhiệm lại
( 2,  3,  3, 'Hoàn thành xuất sắc nhiệm kỳ trước, đủ điều kiện bổ nhiệm lại',                    1), -- id=3
-- BN003: PTK Kinh tế
( 3,  5,  4, 'Có năng lực quản lý, đủ tiêu chuẩn chức danh Phó Trưởng khoa',                     1), -- id=4
-- BN004: TK Sư phạm
( 4,  7,  5, 'Giảng viên xuất sắc liên tiếp 3 năm, có kinh nghiệm quản lý',                      1), -- id=5
( 4,  8,  6, 'Ứng viên dự phòng từ quy hoạch',                                                    0), -- id=6
-- BN005: TP TC-CT
( 5, 10,  7, 'Chuyên viên chính nhiều năm kinh nghiệm, đáp ứng đủ tiêu chuẩn',                   1), -- id=7
-- BN006: thôi chức PTP TC-CT
( 6, 11, NULL, NULL,                                                                               1), -- id=8
-- BN007: TK Nông nghiệp
( 7,  9,  9, 'Giảng viên chính xuất sắc, có kinh nghiệm quản lý bộ môn, đủ điều kiện bổ nhiệm', 1), -- id=9
-- BN008: PTK Nông nghiệp
( 8, 19, 10, 'Có bằng tiến sĩ, nhiều năm kinh nghiệm nghiên cứu thực địa, phù hợp chức danh PTK',1), -- id=10
( 8, 20, 11, 'Ứng viên dự phòng theo quy hoạch',                                                  0), -- id=11
-- BN009: TP KH-HTQT
( 9, 23, 12, 'Tiến sĩ quan hệ quốc tế, nhiều năm kinh nghiệm hợp tác đối ngoại, đủ tiêu chuẩn', 1), -- id=12
-- BN010: TBM HTTT
(10, 14, 14, 'Tiến sĩ Trí tuệ nhân tạo, có nhiều bài báo quốc tế, phù hợp lãnh đạo bộ môn',    1), -- id=13
-- BN011: TK Luật
(11, 27, 16, 'Tiến sĩ Luật Dân sự, bí thư chi bộ khoa, nhiều năm xuất sắc, đủ tiêu chuẩn TK',  1), -- id=14
-- BN012: TP KHTC
(12, 21, 20, 'Thạc sĩ tài chính công, chuyên viên chính nhiều năm, am hiểu công tác tài chính',  1), -- id=15
-- BN013: kiêm nhiệm
(13,  1,  1, 'Trưởng khoa kiêm nhiệm phụ trách bộ môn theo phân công BGH',                       1), -- id=16
-- BN014: thôi chức PTK NN
(14, 20, NULL, NULL,                                                                               1); -- id=17

-- ============================================================
-- PHẦN 13: KẾT QUẢ BỔ NHIỆM (hội nghị các bước)
-- ============================================================
-- BN001 – Thầy An TK CNTT (ctbn_id=1): 5 bước
-- ============================================================
-- DỮ LIỆU ket_qua_bo_nhiem – CÓ GHI CHÚ CHI TIẾT TỪNG BƯỚC
-- ============================================================
--
-- QUY TRÌNH HỘI NGHỊ BỔ NHIỆM (thông thường 5 bước):
--
--   Bước 1 – Hội nghị lãnh đạo quản lý đơn vị:
--             Thành phần: Trưởng/phó các đơn vị trực thuộc, cán bộ chủ chốt.
--             Mục đích: Lấy phiếu tín nhiệm giới thiệu nhân sự từ cấp lãnh đạo cơ sở.
--
--   Bước 2 – Hội nghị toàn thể viên chức đơn vị:
--             Thành phần: Toàn bộ viên chức thuộc đơn vị.
--             Mục đích: Lấy phiếu tín nhiệm giới thiệu nhân sự từ tập thể viên chức.
--
--   Bước 3 – Hội nghị cấp ủy chi bộ:
--             Thành phần: Toàn thể đảng viên chi bộ đơn vị.
--             Mục đích: Chi bộ biểu quyết, thể hiện vai trò lãnh đạo của Đảng trong công tác cán bộ.
--
--   Bước 4 – Tập thể lãnh đạo Ban Giám hiệu:
--             Thành phần: Hiệu trưởng, các Phó Hiệu trưởng.
--             Mục đích: BGH biểu quyết thông qua nhân sự trước khi ban hành quyết định.
--
--   Bước 5 – Hội đồng tư vấn bổ nhiệm (nếu có):
--             Thành phần: Hội đồng chuyên môn tư vấn (các chuyên gia, lãnh đạo cấp cao).
--             Mục đích: Xem xét năng lực chuyên môn, đưa ra kết luận cuối cùng.
--
-- Lưu ý quy trình rút gọn:
--   - Thôi chức vụ / Kiêm nhiệm: thường chỉ 1 bước xác nhận BGH.
--   - Bổ nhiệm cấp bộ môn / phòng nhỏ: có thể rút còn 3–4 bước.
--
-- Ý nghĩa cột ket_qua:
--   1 = ĐẠT – tỷ lệ đồng ý > 50% số phiếu hợp lệ → tiếp tục quy trình
--   0 = KHÔNG ĐẠT – tỷ lệ đồng ý ≤ 50% → dừng hoặc xem xét lại
--
-- Ý nghĩa tỷ lệ phiếu:
--   so_phieu_dong_y / so_phieu_hop_le * 100 = % tín nhiệm
--   Ngưỡng thông thường: > 50% là đạt, > 2/3 là đạt cao
-- ============================================================


-- ============================================================
-- BN001 – Bổ nhiệm Thầy An làm Trưởng khoa CNTT (chi_tiet_bn_id = 1)
-- Nguồn: tại chỗ, từ danh sách quy hoạch đã được phê duyệt
-- Kết quả tổng quát: ĐẠT cả 5 bước – tỷ lệ tín nhiệm cao đồng đều
-- ============================================================
INSERT INTO ket_qua_bo_nhiem (buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat,
    so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le,
    so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua, chi_tiet_bn_id)
VALUES
-- Bước 1: Hội nghị lãnh đạo quản lý Khoa CNTT (15 người triệu tập)
-- Tỷ lệ: 14/15 = 93.3% đồng ý → ĐẠT cao
(1, 15, 15, 15, 15, 15, 14, 1, 1, 1),

-- Bước 2: Hội nghị toàn thể viên chức Khoa CNTT (40 người triệu tập, 38 có mặt)
-- Tỷ lệ: 35/38 = 92.1% đồng ý → ĐẠT cao, 3 phiếu không đồng ý
(2, 40, 38, 38, 38, 38, 35, 3, 1, 1),

-- Bước 3: Hội nghị chi bộ Khoa CNTT (15 đảng viên)
-- Tỷ lệ: 15/15 = 100% đồng ý → ĐẠT tuyệt đối, chi bộ nhất trí hoàn toàn
(3, 15, 15, 15, 15, 15, 15, 0, 1, 1),

-- Bước 4: Tập thể lãnh đạo BGH (10 thành viên)
-- Tỷ lệ: 9/10 = 90% đồng ý → ĐẠT, 1 phiếu không đồng ý
(4, 10, 10, 10, 10, 10,  9, 1, 1, 1),

-- Bước 5: Hội đồng tư vấn bổ nhiệm (5 thành viên)
-- Tỷ lệ: 5/5 = 100% đồng ý → ĐẠT tuyệt đối, hội đồng nhất trí thông qua
(5,  5,  5,  5,  5,  5,  5, 0, 1, 1);


-- ============================================================
-- BN002 – Bổ nhiệm lại Thầy Cường làm Trưởng khoa Kinh tế (chi_tiet_bn_id = 3)
-- Nguồn: quy hoạch tại chỗ, bổ nhiệm lại sau khi hết nhiệm kỳ đầu
-- Kết quả tổng quát: ĐẠT cả 4 bước – tín nhiệm tốt
-- ============================================================
INSERT INTO ket_qua_bo_nhiem (buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat,
    so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le,
    so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua, chi_tiet_bn_id)
VALUES
-- Bước 1: Hội nghị lãnh đạo quản lý Khoa Kinh tế (18 người, đủ mặt)
-- Tỷ lệ: 16/18 = 88.9% đồng ý → ĐẠT, 2 phiếu không đồng ý
(1, 18, 18, 18, 18, 18, 16, 2, 1, 3),

-- Bước 2: Hội nghị toàn thể viên chức Khoa Kinh tế (45 người, 42 có mặt, 1 phiếu không hợp lệ)
-- Tỷ lệ: 38/41 = 92.7% đồng ý → ĐẠT cao
(2, 45, 42, 42, 42, 41, 38, 3, 1, 3),

-- Bước 3: Hội nghị chi bộ Khoa Kinh tế (18 đảng viên, 17 có mặt)
-- Tỷ lệ: 16/17 = 94.1% đồng ý → ĐẠT cao, 1 phiếu không đồng ý
(3, 18, 17, 17, 17, 17, 16, 1, 1, 3),

-- Bước 4: Tập thể lãnh đạo BGH (12 thành viên, đủ mặt)
-- Tỷ lệ: 11/12 = 91.7% đồng ý → ĐẠT, 1 phiếu không đồng ý
(4, 12, 12, 12, 12, 12, 11, 1, 1, 3);


-- ============================================================
-- BN003 – Bổ nhiệm Thầy Em làm Phó Trưởng khoa Kinh tế (chi_tiet_bn_id = 4)
-- Nguồn: quy hoạch tại chỗ, bổ nhiệm lần đầu chức danh PTK
-- Kết quả tổng quát: ĐẠT cả 3 bước – đặc biệt bước 3 nhất trí 100%
-- ============================================================
INSERT INTO ket_qua_bo_nhiem (buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat,
    so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le,
    so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua, chi_tiet_bn_id)
VALUES
-- Bước 1: Hội nghị lãnh đạo quản lý Khoa Kinh tế (18 người, 17 có mặt)
-- Tỷ lệ: 14/17 = 82.4% đồng ý → ĐẠT, 3 phiếu không đồng ý (1 số ý kiến về ứng viên khác)
(1, 18, 17, 17, 17, 17, 14, 3, 1, 4),

-- Bước 2: Hội nghị toàn thể viên chức Khoa Kinh tế (45 người, 44 có mặt, 1 phiếu không hợp lệ)
-- Tỷ lệ: 40/43 = 93.0% đồng ý → ĐẠT cao, tín nhiệm tốt từ toàn thể viên chức
(2, 45, 44, 44, 44, 43, 40, 3, 1, 4),

-- Bước 3: Tập thể lãnh đạo BGH (12 thành viên, đủ mặt)
-- Tỷ lệ: 12/12 = 100% đồng ý → ĐẠT tuyệt đối, BGH nhất trí thông qua
(3, 12, 12, 12, 12, 12, 12, 0, 1, 4);


-- ============================================================
-- BN004 – Bổ nhiệm Thầy Giang làm Trưởng khoa Sư phạm (chi_tiet_bn_id = 5)
-- Nguồn: quy hoạch tại chỗ, thay thế trưởng khoa cũ về hưu
-- Kết quả tổng quát: ĐẠT cả 5 bước – tín nhiệm rất cao, đặc biệt bước 5 nhất trí
-- ============================================================
INSERT INTO ket_qua_bo_nhiem (buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat,
    so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le,
    so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua, chi_tiet_bn_id)
VALUES
-- Bước 1: Hội nghị lãnh đạo quản lý Khoa Sư phạm (20 người, 19 có mặt)
-- Tỷ lệ: 18/19 = 94.7% đồng ý → ĐẠT cao
(1, 20, 19, 19, 19, 19, 18, 1, 1, 5),

-- Bước 2: Hội nghị toàn thể viên chức Khoa Sư phạm (50 người, 48 có mặt, 1 phiếu không hợp lệ)
-- Tỷ lệ: 44/47 = 93.6% đồng ý → ĐẠT cao, 3 phiếu không đồng ý
(2, 50, 48, 48, 48, 47, 44, 3, 1, 5),

-- Bước 3: Hội nghị chi bộ Khoa Sư phạm (20 đảng viên, đủ mặt)
-- Tỷ lệ: 19/20 = 95.0% đồng ý → ĐẠT cao, chi bộ hầu như nhất trí
(3, 20, 20, 20, 20, 20, 19, 1, 1, 5),

-- Bước 4: Tập thể lãnh đạo BGH (15 thành viên, đủ mặt)
-- Tỷ lệ: 14/15 = 93.3% đồng ý → ĐẠT
(4, 15, 15, 15, 15, 15, 14, 1, 1, 5),

-- Bước 5: Hội đồng tư vấn bổ nhiệm (7 thành viên, đủ mặt)
-- Tỷ lệ: 7/7 = 100% đồng ý → ĐẠT tuyệt đối, hội đồng nhất trí thông qua
(5,  7,  7,  7,  7,  7,  7, 0, 1, 5);


-- ============================================================
-- BN005 – Bổ nhiệm Cô Lan làm Trưởng phòng TC-CT (chi_tiet_bn_id = 7)
-- Nguồn: thuyên chuyển từ nơi khác, thay thế người cũ thôi chức do sức khoẻ
-- Kết quả tổng quát: ĐẠT cả 4 bước – bước 4 nhất trí 100%
-- ============================================================
INSERT INTO ket_qua_bo_nhiem (buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat,
    so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le,
    so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua, chi_tiet_bn_id)
VALUES
-- Bước 1: Hội nghị lãnh đạo quản lý Phòng TC-CT (12 người, đủ mặt)
-- Tỷ lệ: 11/12 = 91.7% đồng ý → ĐẠT, 1 phiếu không đồng ý (có ý kiến về nguồn nhân sự từ nơi khác)
(1, 12, 12, 12, 12, 12, 11, 1, 1, 7),

-- Bước 2: Hội nghị toàn thể viên chức Phòng TC-CT (30 người, 29 có mặt)
-- Tỷ lệ: 27/29 = 93.1% đồng ý → ĐẠT cao, viên chức phòng tín nhiệm cao
(2, 30, 29, 29, 29, 29, 27, 2, 1, 7),

-- Bước 3: Hội nghị chi bộ Phòng TC-CT (12 đảng viên, 11 có mặt)
-- Tỷ lệ: 10/11 = 90.9% đồng ý → ĐẠT, 1 phiếu không đồng ý
(3, 12, 11, 11, 11, 11, 10, 1, 1, 7),

-- Bước 4: Tập thể lãnh đạo BGH (8 thành viên, đủ mặt)
-- Tỷ lệ: 8/8 = 100% đồng ý → ĐẠT tuyệt đối, BGH nhất trí thông qua
(4,  8,  8,  8,  8,  8,  8, 0, 1, 7);


-- ============================================================
-- BN006 – Thầy Minh thôi chức Phó Trưởng phòng TC-CT (chi_tiet_bn_id = 8)
-- Lý do: bản thân có đơn xin thôi chức vì lý do cá nhân
-- Quy trình rút gọn: 1 bước xác nhận BGH
-- ============================================================
INSERT INTO ket_qua_bo_nhiem (buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat,
    so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le,
    so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua, chi_tiet_bn_id)
VALUES
-- Bước 1: Tập thể lãnh đạo BGH xem xét đơn xin thôi chức (12 thành viên, đủ mặt)
-- Tỷ lệ: 12/12 = 100% đồng ý chấp thuận đơn → Thôi chức được phê duyệt
(1, 12, 12, 12, 12, 12, 12, 0, 1, 8);


-- ============================================================
-- BN007 – Bổ nhiệm Thầy Khánh làm Trưởng khoa Nông nghiệp (chi_tiet_bn_id = 9)
-- Nguồn: quy hoạch tại chỗ, thay thế trưởng khoa nghỉ hưu
-- Kết quả tổng quát: ĐẠT cả 5 bước – bước 5 nhất trí tuyệt đối
-- ============================================================
INSERT INTO ket_qua_bo_nhiem (buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat,
    so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le,
    so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua, chi_tiet_bn_id)
VALUES
-- Bước 1: Hội nghị lãnh đạo quản lý Khoa Nông nghiệp (18 người, đủ mặt)
-- Tỷ lệ: 16/18 = 88.9% đồng ý → ĐẠT, 2 phiếu không đồng ý
(1, 18, 18, 18, 18, 18, 16, 2, 1,  9),

-- Bước 2: Hội nghị toàn thể viên chức Khoa Nông nghiệp (48 người, 46 có mặt, 1 phiếu không hợp lệ)
-- Tỷ lệ: 42/45 = 93.3% đồng ý → ĐẠT cao
(2, 48, 46, 46, 46, 45, 42, 3, 1,  9),

-- Bước 3: Hội nghị chi bộ Khoa Nông nghiệp (18 đảng viên, 17 có mặt)
-- Tỷ lệ: 16/17 = 94.1% đồng ý → ĐẠT cao, 1 phiếu không đồng ý
(3, 18, 17, 17, 17, 17, 16, 1, 1,  9),

-- Bước 4: Tập thể lãnh đạo BGH (12 thành viên, đủ mặt)
-- Tỷ lệ: 11/12 = 91.7% đồng ý → ĐẠT, 1 phiếu không đồng ý
(4, 12, 12, 12, 12, 12, 11, 1, 1,  9),

-- Bước 5: Hội đồng tư vấn bổ nhiệm (7 thành viên, đủ mặt)
-- Tỷ lệ: 7/7 = 100% đồng ý → ĐẠT tuyệt đối, hội đồng nhất trí thông qua
(5,  7,  7,  7,  7,  7,  7, 0, 1,  9);


-- ============================================================
-- BN008 – Bổ nhiệm Cô Xuân làm Phó Trưởng khoa Nông nghiệp (chi_tiet_bn_id = 10)
-- Nguồn: quy hoạch tại chỗ, bổ nhiệm lần đầu chức danh PTK
-- Kết quả tổng quát: ĐẠT cả 3 bước – bước 3 nhất trí 100%
-- ============================================================
INSERT INTO ket_qua_bo_nhiem (buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat,
    so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le,
    so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua, chi_tiet_bn_id)
VALUES
-- Bước 1: Hội nghị lãnh đạo quản lý Khoa Nông nghiệp (18 người, 17 có mặt)
-- Tỷ lệ: 15/17 = 88.2% đồng ý → ĐẠT, 2 phiếu không đồng ý (có ý kiến về Thầy Yên – ứng viên dự phòng)
(1, 18, 17, 17, 17, 17, 15, 2, 1, 10),

-- Bước 2: Hội nghị toàn thể viên chức Khoa Nông nghiệp (48 người, 47 có mặt, 1 phiếu không hợp lệ)
-- Tỷ lệ: 43/46 = 93.5% đồng ý → ĐẠT cao, toàn thể tín nhiệm tốt
(2, 48, 47, 47, 47, 46, 43, 3, 1, 10),

-- Bước 3: Tập thể lãnh đạo BGH (12 thành viên, đủ mặt)
-- Tỷ lệ: 12/12 = 100% đồng ý → ĐẠT tuyệt đối, BGH nhất trí thông qua
(3, 12, 12, 12, 12, 12, 12, 0, 1, 10);


-- ============================================================
-- BN009 – Bổ nhiệm Cô Cẩm làm Trưởng phòng KH-HTQT (chi_tiet_bn_id = 12)
-- Nguồn: quy hoạch tại chỗ, kiện toàn lãnh đạo phòng
-- Kết quả tổng quát: ĐẠT cả 4 bước – tín nhiệm cao, bước 4 nhất trí tuyệt đối
-- ============================================================
INSERT INTO ket_qua_bo_nhiem (buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat,
    so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le,
    so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua, chi_tiet_bn_id)
VALUES
-- Bước 1: Hội nghị lãnh đạo quản lý Phòng KH-HTQT (10 người, đủ mặt)
-- Tỷ lệ: 9/10 = 90.0% đồng ý → ĐẠT, 1 phiếu không đồng ý
(1, 10, 10, 10, 10, 10,  9, 1, 1, 12),

-- Bước 2: Hội nghị toàn thể viên chức Phòng KH-HTQT (25 người, 24 có mặt)
-- Tỷ lệ: 23/24 = 95.8% đồng ý → ĐẠT cao, viên chức tín nhiệm rất tốt
(2, 25, 24, 24, 24, 24, 23, 1, 1, 12),

-- Bước 3: Hội nghị chi bộ (10 đảng viên, đủ mặt)
-- Tỷ lệ: 9/10 = 90.0% đồng ý → ĐẠT, 1 phiếu không đồng ý
(3, 10, 10, 10, 10, 10,  9, 1, 1, 12),

-- Bước 4: Tập thể lãnh đạo BGH (7 thành viên, đủ mặt)
-- Tỷ lệ: 7/7 = 100% đồng ý → ĐẠT tuyệt đối, BGH nhất trí thông qua
(4,  7,  7,  7,  7,  7,  7, 0, 1, 12);


-- ============================================================
-- BN010 – Bổ nhiệm Thầy Quang làm Trưởng bộ môn HTTT (chi_tiet_bn_id = 13)
-- Nguồn: quy hoạch rà soát CNTT năm 2026
-- Trạng thái: ĐANG XỬ LÝ – mới hoàn thành 2/4 bước
-- ============================================================
INSERT INTO ket_qua_bo_nhiem (buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat,
    so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le,
    so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua, chi_tiet_bn_id)
VALUES
-- Bước 1: Hội nghị lãnh đạo quản lý Bộ môn HTTT và Khoa CNTT (15 người, đủ mặt)
-- Tỷ lệ: 14/15 = 93.3% đồng ý → ĐẠT cao
(1, 15, 15, 15, 15, 15, 14, 1, 1, 13),

-- Bước 2: Hội nghị toàn thể viên chức Bộ môn + Khoa CNTT (40 người, 38 có mặt)
-- Tỷ lệ: 35/38 = 92.1% đồng ý → ĐẠT cao, 3 phiếu không đồng ý
-- (Bước 3 – chi bộ và Bước 4 – BGH chưa thực hiện)
(2, 40, 38, 38, 38, 38, 35, 3, 1, 13);


-- ============================================================
-- BN011 – Bổ nhiệm Cô Giao làm Trưởng khoa Luật (chi_tiet_bn_id = 14)
-- Nguồn: quy hoạch Khoa Luật mới thành lập, trưởng khoa đầu tiên
-- Kết quả tổng quát: ĐẠT cả 5 bước – bước 3,4,5 nhất trí tuyệt đối
-- ============================================================
INSERT INTO ket_qua_bo_nhiem (buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat,
    so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le,
    so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua, chi_tiet_bn_id)
VALUES
-- Bước 1: Hội nghị lãnh đạo quản lý Khoa Luật (14 người, đủ mặt)
-- Tỷ lệ: 13/14 = 92.9% đồng ý → ĐẠT cao, 1 phiếu không đồng ý
(1, 14, 14, 14, 14, 14, 13, 1, 1, 14),

-- Bước 2: Hội nghị toàn thể viên chức Khoa Luật (35 người, 34 có mặt, 1 phiếu không hợp lệ)
-- Tỷ lệ: 31/33 = 93.9% đồng ý → ĐẠT cao, 2 phiếu không đồng ý
(2, 35, 34, 34, 34, 33, 31, 2, 1, 14),

-- Bước 3: Hội nghị chi bộ Khoa Luật (14 đảng viên, đủ mặt)
-- Tỷ lệ: 13/14 = 92.9% đồng ý → ĐẠT cao (Cô Giao là Bí thư chi bộ nên uy tín cao)
(3, 14, 14, 14, 14, 14, 13, 1, 1, 14),

-- Bước 4: Tập thể lãnh đạo BGH (9 thành viên, đủ mặt)
-- Tỷ lệ: 9/9 = 100% đồng ý → ĐẠT tuyệt đối, BGH nhất trí thông qua
(4,  9,  9,  9,  9,  9,  9, 0, 1, 14),

-- Bước 5: Hội đồng tư vấn bổ nhiệm (5 thành viên, đủ mặt)
-- Tỷ lệ: 5/5 = 100% đồng ý → ĐẠT tuyệt đối, hội đồng nhất trí thông qua
(5,  5,  5,  5,  5,  5,  5, 0, 1, 14);


-- ============================================================
-- BN012 – Bổ nhiệm Cô Ánh làm Trưởng phòng Kế hoạch - Tài chính (chi_tiet_bn_id = 15)
-- Nguồn: quy hoạch tại chỗ, thay thế trưởng phòng cũ chuyển công tác
-- Trạng thái: ĐANG XỬ LÝ – mới hoàn thành 1/3 bước
-- ============================================================
INSERT INTO ket_qua_bo_nhiem (buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat,
    so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le,
    so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua, chi_tiet_bn_id)
VALUES
-- Bước 1: Hội nghị lãnh đạo quản lý Phòng KHTC (11 người, đủ mặt)
-- Tỷ lệ: 10/11 = 90.9% đồng ý → ĐẠT, 1 phiếu không đồng ý
-- (Bước 2 – toàn thể viên chức và Bước 3 – BGH chưa thực hiện)
(1, 11, 11, 11, 11, 11, 10, 1, 1, 15);


-- ============================================================
-- BN013 – Thầy An kiêm nhiệm phụ trách Bộ môn HTTT (chi_tiet_bn_id = 16)
-- Hình thức: bổ nhiệm kiêm nhiệm theo phân công BGH (không qua hội nghị viên chức)
-- Quy trình rút gọn: 1 bước xác nhận BGH
-- ============================================================
INSERT INTO ket_qua_bo_nhiem (buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat,
    so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le,
    so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua, chi_tiet_bn_id)
VALUES
-- Bước 1: Tập thể lãnh đạo BGH phân công kiêm nhiệm (12 thành viên, đủ mặt)
-- Tỷ lệ: 12/12 = 100% đồng ý → Kiêm nhiệm được phê duyệt nhất trí
(1, 12, 12, 12, 12, 12, 12, 0, 1, 16);


-- ============================================================
-- BN014 – Thầy Yên thôi chức Phó Trưởng khoa Nông nghiệp (chi_tiet_bn_id = 17)
-- Lý do: điều chuyển sang Khoa Y Dược theo quyết định BGH
-- Quy trình rút gọn: 1 bước xác nhận BGH
-- ============================================================
INSERT INTO ket_qua_bo_nhiem (buoc_hoi_nghi, so_nguoi_trieu_tap, so_nguoi_co_mat,
    so_phieu_phat_ra, so_phieu_thu_ve, so_phieu_hop_le,
    so_phieu_dong_y, so_phieu_khong_dong_y, ket_qua, chi_tiet_bn_id)
VALUES
-- Bước 1: Tập thể lãnh đạo BGH xem xét điều chuyển (12 thành viên, đủ mặt)
-- Tỷ lệ: 12/12 = 100% đồng ý → Thôi chức / điều chuyển được phê duyệt nhất trí
(1, 12, 12, 12, 12, 12, 12, 0, 1, 17);

-- ============================================================
-- PHẦN 14: PHƯƠNG ÁN NHÂN SỰ (id 1–14, PA001–PA014)
-- ============================================================
INSERT INTO phuong_an_nhan_su (ma_phuong_an, so_to_trinh, ngay_to_trinh, ngay_lap, ghi_chu, trang_thai, dot_bo_nhiem_id) VALUES
('PA001', '45/TTr-TCCT',  '2026-03-15', '2026-03-15', 'Phương án bổ nhiệm TK CNTT',                1, 1),
('PA002', '50/TTr-TCCT',  '2026-02-10', '2026-02-10', 'Phương án bổ nhiệm lại TK Kinh tế',         1, 2),
('PA003', '51/TTr-TCCT',  '2026-02-10', '2026-02-10', 'Phương án bổ nhiệm PTK Kinh tế',            1, 3),
('PA004', '58/TTr-TCCT',  '2026-03-10', '2026-03-10', 'Phương án bổ nhiệm TK Sư phạm',             1, 4),
('PA005', '62/TTr-TCCT',  '2026-03-12', '2026-03-12', 'Phương án bổ nhiệm TP TC-CT (nơi khác)',    1, 5),
('PA006', '65/TTr-TCCT',  '2026-03-16', '2026-03-16', 'Phương án cho thôi chức PTP TC-CT',         1, 6),
('PA007', '70/TTr-TCCT',  '2026-04-05', '2026-04-05', 'Phương án bổ nhiệm TK Nông nghiệp',         1, 7),
('PA008', '71/TTr-TCCT',  '2026-04-05', '2026-04-05', 'Phương án bổ nhiệm PTK Nông nghiệp',        1, 8),
('PA009', '72/TTr-TCCT',  '2026-04-08', '2026-04-08', 'Phương án bổ nhiệm TP KH-HTQT',             1, 9),
('PA010', '73/TTr-TCCT',  '2026-04-12', '2026-04-12', 'Phương án bổ nhiệm TBM HTTT',               1, 10),
('PA011', '78/TTr-TCCT',  '2026-04-18', '2026-04-18', 'Phương án bổ nhiệm TK Luật',                1, 11),
('PA012', '80/TTr-TCCT',  '2026-04-22', '2026-04-22', 'Phương án bổ nhiệm TP Phòng KHTC',          1, 12),
('PA013', '74/TTr-TCCT',  '2026-04-10', '2026-04-10', 'Phương án bổ nhiệm kiêm nhiệm TK-BM HTTT', 1, 13),
('PA014', '82/TTr-TCCT',  '2026-05-02', '2026-05-02', 'Phương án thôi chức PTK Nông nghiệp',       1, 14);

-- ============================================================
-- PHẦN 15: CHI TIẾT PHƯƠNG ÁN (id 1–14)
-- ============================================================
INSERT INTO chi_tiet_phuong_an (loai_phuong_an, ghi_chu, trang_thai, phuong_an_id, chi_tiet_bn_id) VALUES
('Bổ nhiệm',      'Thầy An bổ nhiệm TK CNTT lần đầu',                                     1,  1,  1),
('Bổ nhiệm lại',  'Thầy Cường đủ điều kiện bổ nhiệm lại nhiệm kỳ 2',                      1,  2,  3),
('Bổ nhiệm',      'Thầy Em bổ nhiệm lần đầu chức PTK',                                    1,  3,  4),
('Bổ nhiệm',      'Thầy Giang bổ nhiệm TK Sư phạm nhiệm kỳ 2026-2031',                   1,  4,  5),
('Bổ nhiệm',      'Cô Lan bổ nhiệm TP TC-CT, nguồn thuyên chuyển',                        1,  5,  7),
('Thôi chức vụ',  'Thầy Minh chấp thuận đơn xin thôi giữ chức PTP',                      1,  6,  8),
('Bổ nhiệm',      'Thầy Khánh bổ nhiệm TK Nông nghiệp nhiệm kỳ 2026-2031',               1,  7,  9),
('Bổ nhiệm',      'Cô Xuân bổ nhiệm PTK Nông nghiệp nhiệm kỳ 2026-2031',                 1,  8, 10),
('Bổ nhiệm',      'Cô Cẩm bổ nhiệm TP Phòng KH-HTQT',                                    1,  9, 12),
('Bổ nhiệm',      'Thầy Quang bổ nhiệm TBM HTTT',                                         1, 10, 13),
('Bổ nhiệm',      'Cô Giao bổ nhiệm TK Luật khóa đầu tiên của khoa',                     1, 11, 14),
('Bổ nhiệm',      'Cô Ánh bổ nhiệm TP KHTC, nguồn tại chỗ',                              1, 12, 15),
('Thôi kiêm nhiệm','Thầy An thôi kiêm nhiệm sau khi BM HTTT có TBM chính thức',          1, 13, 16),
('Thôi chức vụ',  'Thầy Yên thôi chức PTK Nông nghiệp do điều chuyển công tác',          1, 14, 17);

-- ============================================================
-- PHẦN 16: HỒ SƠ BỔ NHIỆM (id 1–14, HSBN01–HSBN14)
-- ============================================================
INSERT INTO ho_so_bo_nhiem (ma_ho_so, ngay_lap, trang_thai, ghi_chu, chi_tiet_pa_id) VALUES
('HSBN01', '2026-03-16', 1, 'Hồ sơ bổ nhiệm Thầy An TK CNTT',              1),
('HSBN02', '2026-02-11', 1, 'Hồ sơ bổ nhiệm lại Thầy Cường TK KT',         2),
('HSBN03', '2026-02-11', 1, 'Hồ sơ bổ nhiệm Thầy Em PTK KT',               3),
('HSBN04', '2026-03-11', 1, 'Hồ sơ bổ nhiệm Thầy Giang TK SP',             4),
('HSBN05', '2026-03-13', 1, 'Hồ sơ bổ nhiệm Cô Lan TP TC-CT',              5),
('HSBN06', '2026-03-17', 1, 'Hồ sơ thôi chức Thầy Minh PTP TC-CT',         6),
('HSBN07', '2026-04-06', 1, 'Hồ sơ bổ nhiệm Thầy Khánh TK Nông nghiệp',   7),
('HSBN08', '2026-04-06', 1, 'Hồ sơ bổ nhiệm Cô Xuân PTK Nông nghiệp',     8),
('HSBN09', '2026-04-09', 1, 'Hồ sơ bổ nhiệm Cô Cẩm TP KH-HTQT',          9),
('HSBN10', '2026-04-13', 1, 'Hồ sơ bổ nhiệm Thầy Quang TBM HTTT',         10),
('HSBN11', '2026-04-19', 1, 'Hồ sơ bổ nhiệm Cô Giao TK Luật',             11),
('HSBN12', '2026-04-23', 1, 'Hồ sơ bổ nhiệm Cô Ánh TP KHTC',             12),
('HSBN13', '2026-04-11', 1, 'Hồ sơ kiêm nhiệm Thầy An phụ trách BM HTTT',13),
('HSBN14', '2026-05-03', 1, 'Hồ sơ thôi chức Thầy Yên PTK Nông nghiệp',  14);

-- ============================================================
-- PHẦN 17: CHI TIẾT HỒ SƠ (tài liệu đính kèm)
-- ============================================================
INSERT INTO chi_tiet_ho_so (ten_tai_lieu, loai_tai_lieu, file_dinh_kem, ngay_cap_nhat, trang_thai, ho_so_bn_id) VALUES
-- HSBN01 – Thầy An
('Sơ yếu lý lịch Thầy An',                      1, '/uploads/syll_an.pdf',          '2026-03-16', 1,  1),
('Bản kê khai tài sản',                          2, '/uploads/kkts_an.pdf',          '2026-03-16', 1,  1),
('Nhận xét đánh giá 3 năm gần nhất',             3, '/uploads/nxdg_an.pdf',          '2026-03-16', 1,  1),
('Xác nhận đủ sức khoẻ',                         4, '/uploads/sk_an.pdf',             '2026-03-16', 1,  1),
-- HSBN02 – Thầy Cường
('Sơ yếu lý lịch Thầy Cường',                   1, '/uploads/syll_cuong.pdf',       '2026-02-11', 1,  2),
('Bản kê khai tài sản',                          2, '/uploads/kkts_cuong.pdf',       '2026-02-11', 1,  2),
('Nhận xét đánh giá 3 năm gần nhất',             3, '/uploads/nxdg_cuong.pdf',       '2026-02-11', 1,  2),
('Xác nhận đủ sức khoẻ',                         4, '/uploads/sk_cuong.pdf',          '2026-02-11', 1,  2),
-- HSBN03 – Thầy Em
('Sơ yếu lý lịch Thầy Em',                      1, '/uploads/syll_em.pdf',           '2026-02-11', 1,  3),
('Bằng cấp chuyên môn Tiến sĩ',                 5, '/uploads/bang_ts_em.pdf',        '2026-02-11', 1,  3),
('Đơn đề nghị bổ nhiệm',                        6, '/uploads/don_bn_em.pdf',          '2026-02-11', 1,  3),
-- HSBN04 – Thầy Giang
('Sơ yếu lý lịch Thầy Giang',                   1, '/uploads/syll_giang.pdf',        '2026-03-11', 1,  4),
('Bản kê khai tài sản',                          2, '/uploads/kkts_giang.pdf',        '2026-03-11', 1,  4),
('Chứng chỉ bồi dưỡng quản lý nhà nước',        7, '/uploads/ccbd_giang.pdf',        '2026-03-11', 1,  4),
('Nghị quyết hội nghị viên chức khoa Sư phạm',  8, '/uploads/nq_sp_giang.pdf',       '2026-03-12', 1,  4),
-- HSBN05 – Cô Lan
('Sơ yếu lý lịch Cô Lan',                       1, '/uploads/syll_lan.pdf',           '2026-03-13', 1,  5),
('Quyết định thuyên chuyển công tác',            9, '/uploads/qd_tc_lan.pdf',         '2026-03-13', 1,  5),
('Bản kê khai tài sản',                          2, '/uploads/kkts_lan.pdf',           '2026-03-13', 1,  5),
-- HSBN06 – Thầy Minh thôi chức
('Đơn xin thôi chức của Thầy Minh',            10, '/uploads/don_tc_minh.pdf',        '2026-03-17', 1,  6),
('Biên bản họp chi bộ chấp thuận đơn',         11, '/uploads/bb_cb_minh.pdf',         '2026-03-17', 1,  6),
-- HSBN07 – Thầy Khánh
('Sơ yếu lý lịch Thầy Khánh',                   1, '/uploads/syll_khanh.pdf',        '2026-04-06', 1,  7),
('Bản kê khai tài sản',                          2, '/uploads/kkts_khanh.pdf',        '2026-04-06', 1,  7),
('Nhận xét đánh giá 3 năm gần nhất',             3, '/uploads/nxdg_khanh.pdf',        '2026-04-06', 1,  7),
('Xác nhận đủ sức khoẻ',                         4, '/uploads/sk_khanh.pdf',           '2026-04-06', 1,  7),
('Bằng cấp chuyên môn Tiến sĩ',                 5, '/uploads/bang_ts_khanh.pdf',     '2026-04-06', 1,  7),
('Chứng chỉ bồi dưỡng quản lý nhà nước',        7, '/uploads/ccbd_khanh.pdf',        '2026-04-06', 1,  7),
('Nghị quyết hội nghị viên chức khoa NN',        8, '/uploads/nq_nn_khanh.pdf',       '2026-04-07', 1,  7),
-- HSBN08 – Cô Xuân
('Sơ yếu lý lịch Cô Xuân',                      1, '/uploads/syll_xuan.pdf',          '2026-04-06', 1,  8),
('Bản kê khai tài sản',                          2, '/uploads/kkts_xuan.pdf',          '2026-04-06', 1,  8),
('Nhận xét đánh giá 3 năm gần nhất',             3, '/uploads/nxdg_xuan.pdf',          '2026-04-06', 1,  8),
('Bằng cấp chuyên môn Tiến sĩ',                 5, '/uploads/bang_ts_xuan.pdf',      '2026-04-06', 1,  8),
('Đơn đề nghị bổ nhiệm',                        6, '/uploads/don_bn_xuan.pdf',         '2026-04-06', 1,  8),
-- HSBN09 – Cô Cẩm
('Sơ yếu lý lịch Cô Cẩm',                       1, '/uploads/syll_cam.pdf',            '2026-04-09', 1,  9),
('Bản kê khai tài sản',                          2, '/uploads/kkts_cam.pdf',            '2026-04-09', 1,  9),
('Nhận xét đánh giá 3 năm gần nhất',             3, '/uploads/nxdg_cam.pdf',            '2026-04-09', 1,  9),
('Xác nhận đủ sức khoẻ',                         4, '/uploads/sk_cam.pdf',               '2026-04-09', 1,  9),
('Bằng cấp Tiến sĩ Quan hệ quốc tế',            5, '/uploads/bang_ts_cam.pdf',        '2026-04-09', 1,  9),
('Chứng chỉ ngoại ngữ quốc tế',                12, '/uploads/cc_nn_cam.pdf',           '2026-04-09', 1,  9),
('Nghị quyết hội nghị đơn vị',                  8, '/uploads/nq_kh_cam.pdf',            '2026-04-10', 1,  9),
-- HSBN10 – Thầy Quang
('Sơ yếu lý lịch Thầy Quang',                   1, '/uploads/syll_quang.pdf',          '2026-04-13', 1, 10),
('Bản kê khai tài sản',                          2, '/uploads/kkts_quang.pdf',          '2026-04-13', 1, 10),
('Nhận xét đánh giá 3 năm gần nhất',             3, '/uploads/nxdg_quang.pdf',          '2026-04-13', 1, 10),
('Bằng cấp Tiến sĩ',                            5, '/uploads/bang_ts_quang.pdf',      '2026-04-13', 1, 10),
('Danh mục công trình khoa học',                13, '/uploads/ctkhoa_quang.pdf',       '2026-04-13', 1, 10),
-- HSBN11 – Cô Giao
('Sơ yếu lý lịch Cô Giao',                      1, '/uploads/syll_giao.pdf',            '2026-04-19', 1, 11),
('Bản kê khai tài sản',                          2, '/uploads/kkts_giao.pdf',            '2026-04-19', 1, 11),
('Nhận xét đánh giá 3 năm gần nhất',             3, '/uploads/nxdg_giao.pdf',            '2026-04-19', 1, 11),
('Xác nhận đủ sức khoẻ',                         4, '/uploads/sk_giao.pdf',               '2026-04-19', 1, 11),
('Bằng cấp Tiến sĩ Luật',                       5, '/uploads/bang_ts_giao.pdf',        '2026-04-19', 1, 11),
('Chứng chỉ bồi dưỡng quản lý nhà nước',        7, '/uploads/ccbd_giao.pdf',           '2026-04-19', 1, 11),
('Nghị quyết hội nghị viên chức khoa Luật',      8, '/uploads/nq_luat_giao.pdf',        '2026-04-20', 1, 11),
('Quyết nghị chi bộ khoa Luật',                14, '/uploads/qn_cb_giao.pdf',           '2026-04-20', 1, 11),
-- HSBN12 – Cô Ánh
('Sơ yếu lý lịch Cô Ánh',                       1, '/uploads/syll_anh.pdf',              '2026-04-23', 1, 12),
('Bản kê khai tài sản',                          2, '/uploads/kkts_anh.pdf',              '2026-04-23', 1, 12),
('Nhận xét đánh giá 3 năm gần nhất',             3, '/uploads/nxdg_anh.pdf',              '2026-04-23', 1, 12),
('Xác nhận đủ sức khoẻ',                         4, '/uploads/sk_anh.pdf',                 '2026-04-23', 1, 12),
('Bằng tốt nghiệp Thạc sĩ Tài chính công',      5, '/uploads/bang_ths_anh.pdf',        '2026-04-23', 1, 12),
-- HSBN13 – Thầy An kiêm nhiệm
('Sơ yếu lý lịch Thầy An (bổ sung kiêm nhiệm)', 1, '/uploads/syll_an_kn.pdf',         '2026-04-11', 1, 13),
('Phân công kiêm nhiệm của BGH',                15, '/uploads/pc_kn_an.pdf',            '2026-04-11', 1, 13),
-- HSBN14 – Thầy Yên thôi chức
('Đơn xin thôi chức của Thầy Yên',             10, '/uploads/don_tc_yen.pdf',            '2026-05-03', 1, 14),
('Quyết định điều chuyển công tác',              9, '/uploads/qd_dc_yen.pdf',             '2026-05-03', 1, 14),
('Biên bản bàn giao công việc',                16, '/uploads/bb_bg_yen.pdf',              '2026-05-05', 1, 14);

-- ============================================================
-- PHẦN 18: QUYẾT ĐỊNH BỔ NHIỆM (id 1–14, QD001–QD014)
-- Lưu ý: BN010 và BN012 đang xử lý nên chưa có số QĐ chính thức,
--        nhưng vẫn cần bản ghi để nhiem_ky_chuc_vu tham chiếu.
-- Thứ tự insert = thứ tự id tự tăng:
--   id=1  → QD001 (ho_so_bn_id=1)
--   id=2  → QD002 (ho_so_bn_id=2)
--   id=3  → QD003 (ho_so_bn_id=3)
--   id=4  → QD004 (ho_so_bn_id=4)
--   id=5  → QD005 (ho_so_bn_id=5)
--   id=6  → QD006 (ho_so_bn_id=6)
--   id=7  → QD007 (ho_so_bn_id=7)
--   id=8  → QD008 (ho_so_bn_id=8)
--   id=9  → QD009 (ho_so_bn_id=9)
--   id=10 → QD010 (ho_so_bn_id=10) – BN010 đang xử lý (dự thảo)
--   id=11 → QD011 (ho_so_bn_id=11)
--   id=12 → QD012 (ho_so_bn_id=12) – BN012 đang xử lý (dự thảo)
--   id=13 → QD013 (ho_so_bn_id=13)
--   id=14 → QD014 (ho_so_bn_id=14)
-- ============================================================
INSERT INTO qd_bo_nhiem (ma_bo_nhiem, so_quyet_dinh, ngay_quyet_dinh, ngay_co_hieu_luc, thoi_han, loai_bo_nhiem, ho_so_bn_id) VALUES
('QD001', '789/QĐ-ĐHAG',  '2026-03-18', '2026-04-01', 5, 'Bổ nhiệm mới',    1),  -- id=1  Thầy An TK CNTT
('QD002', '801/QĐ-ĐHAG',  '2026-02-25', '2026-03-01', 5, 'Bổ nhiệm lại',    2),  -- id=2  Thầy Cường TK KT
('QD003', '802/QĐ-ĐHAG',  '2026-02-25', '2026-03-01', 5, 'Bổ nhiệm mới',    3),  -- id=3  Thầy Em PTK KT
('QD004', '810/QĐ-ĐHAG',  '2026-03-28', '2026-04-01', 5, 'Bổ nhiệm mới',    4),  -- id=4  Thầy Giang TK SP
('QD005', '816/QĐ-ĐHAG',  '2026-03-25', '2026-04-01', 5, 'Bổ nhiệm mới',    5),  -- id=5  Cô Lan TP TC-CT
('QD006', '821/QĐ-ĐHAG',  '2026-03-20', '2026-03-20', 0, 'Thôi chức vụ',    6),  -- id=6  Thầy Minh thôi chức
('QD007', '903/QĐ-ĐHAG',  '2026-04-25', '2026-05-01', 5, 'Bổ nhiệm mới',    7),  -- id=7  Thầy Khánh TK NN
('QD008', '904/QĐ-ĐHAG',  '2026-04-25', '2026-05-01', 5, 'Bổ nhiệm mới',    8),  -- id=8  Cô Xuân PTK NN
('QD009', '910/QĐ-ĐHAG',  '2026-04-28', '2026-05-01', 5, 'Bổ nhiệm mới',    9),  -- id=9  Cô Cẩm TP KH-HTQT
('QD010', NULL,             NULL,          NULL,         5, 'Bổ nhiệm mới',   10),  -- id=10 Thầy Quang TBM HTTT (đang xử lý)
('QD011', '925/QĐ-ĐHAG',  '2026-05-08', '2026-05-15', 5, 'Bổ nhiệm mới',   11),  -- id=11 Cô Giao TK Luật
('QD012', NULL,             NULL,          NULL,         5, 'Bổ nhiệm mới',   12),  -- id=12 Cô Ánh TP KHTC (đang xử lý)
('QD013', '920/QĐ-ĐHAG',  '2026-04-12', '2026-04-12', 0, 'Thôi kiêm nhiệm',13),  -- id=13 Thầy An thôi kiêm nhiệm
('QD014', '930/QĐ-ĐHAG',  '2026-05-08', '2026-05-08', 0, 'Thôi chức vụ',   14);  -- id=14 Thầy Yên thôi chức PTK NN

-- ============================================================
-- PHẦN 19: NHIỆM KỲ CHỨC VỤ ĐẦY ĐỦ (id 1–13)
-- ============================================================
-- id=1 đã insert ở trên (Thầy Cường nhiệm kỳ cũ 2022-2026, trang_thai=0)
INSERT INTO nhiem_ky_chuc_vu (ngay_bat_dau, ngay_ket_thuc, ly_do_ket_thuc, trang_thai, vien_chuc_id, chuc_danh_id, qd_bo_nhiem_id) VALUES
-- Ghi chú mapping qd_bo_nhiem id:
--   QD001=id1, QD002=id2, QD003=id3, QD004=id4, QD005=id5, QD006=id6
--   QD007=id7, QD008=id8, QD009=id9, QD010=id10, QD011=id11
--   QD012=id12, QD013=id13, QD014=id14
-- id=2: Thầy An – TK CNTT (mới, QD001=id1)
('2026-04-01', NULL,         NULL,                                                                  1,  1, 1,  1),
-- id=3: Thầy Cường – TK Kinh tế bổ nhiệm lại (QD002=id2)
('2026-03-01', NULL,         NULL,                                                                  1,  3, 1,  2),
-- id=4: Thầy Em – PTK Kinh tế (QD003=id3)
('2026-03-01', NULL,         NULL,                                                                  1,  5, 2,  3),
-- id=5: Thầy Giang – TK Sư phạm (QD004=id4)
('2026-04-01', NULL,         NULL,                                                                  1,  7, 1,  4),
-- id=6: Cô Lan – TP TC-CT (QD005=id5)
('2026-04-01', NULL,         NULL,                                                                  1, 10, 5,  5),
-- id=7: Thầy Minh – PTP TC-CT đã thôi chức (QD006=id6)
('2022-01-01', '2026-03-20', 'Theo đơn xin thôi chức được chấp thuận theo QĐ 821/QĐ-ĐHAG',       0, 11, 6,  6),
-- id=8: Thầy Khánh – TK Nông nghiệp (QD007=id7)
('2026-05-01', NULL,         NULL,                                                                  1,  9, 1,  7),
-- id=9: Cô Xuân – PTK Nông nghiệp (QD008=id8)
('2026-05-01', NULL,         NULL,                                                                  1, 19, 2,  8),
-- id=10: Cô Cẩm – TP KH-HTQT (QD009=id9)
('2026-05-01', NULL,         NULL,                                                                  1, 23, 5,  9),
-- id=11: Cô Giao – TK Luật (QD011=id11)
('2026-05-15', NULL,         NULL,                                                                  1, 27, 1, 11),
-- id=12: Thầy An – kiêm nhiệm BM HTTT đã kết thúc (QD013=id13)
('2026-04-12', '2026-04-12', 'Thôi kiêm nhiệm khi BM HTTT có TBM chính thức',                    0,  1, 3, 13),
-- id=13: Thầy Yên – PTK Nông nghiệp thôi chức/điều chuyển (QD014=id14)
('2020-03-01', '2026-05-08', 'Điều chuyển sang Khoa Y Dược theo quyết định BGH',                  0, 20, 2, 14);

-- ============================================================
-- PHẦN 20: YÊU CẦU THAY ĐỔI (id 1–20, YC001–YC020)
-- ============================================================
INSERT INTO yeu_cau_thay_doi (ma_yeu_cau, noi_dung, ngay_yeu_cau, ngay_xu_ly, trang_thai,
    loai_yeu_cau, ket_qua_xu_ly, chi_tiet_bn_id, chi_tiet_qh_id, nguoi_yeu_cau_id) VALUES
('YC001', 'Cập nhật bổ sung học vị Tiến sĩ được cấp năm 2024',
 '2026-03-17', '2026-03-17', 2, 'Cập nhật hồ sơ',
 'Đã cập nhật bằng Tiến sĩ mới trong chi tiết hồ sơ', 1, NULL, 11),
('YC002', 'Đề nghị xem xét lại tính hợp lệ phiếu bầu bước 2 đợt bổ nhiệm PTK Kinh tế',
 '2026-02-12', '2026-02-14', 2, 'Khiếu nại kết quả',
 'Ban kiểm phiếu xác nhận kết quả đúng quy trình, không thay đổi', 4, NULL, 3),
('YC003', 'Xin rút khỏi danh sách quy hoạch chức danh Phó Trưởng khoa Sư phạm vì lý do gia đình',
 '2026-02-20', '2026-02-22', 2, 'Rút khỏi quy hoạch',
 'Chấp thuận đơn xin rút; cập nhật trạng thái chi tiết quy hoạch', NULL, 6, 8),
('YC004', 'Xin gia hạn 5 ngày để bổ sung giấy xác nhận sức khoẻ',
 '2026-02-09', '2026-02-09', 2, 'Gia hạn hồ sơ',
 'Chấp thuận, hạn nộp hồ sơ dời đến 16/02/2026', 4, NULL, 5),
('YC005', 'Đề nghị xem xét bổ sung Chuyên viên Nguyễn Thị Ngọc vào quy hoạch TP Phòng Đào tạo',
 '2026-01-15', '2026-01-20', 2, 'Bổ sung quy hoạch',
 'Không đủ điều kiện do chưa đáp ứng thâm niên theo quy định', NULL, 7, 10),
('YC006', 'Sai ngày có hiệu lực trong dự thảo QĐ bổ nhiệm Thầy Giang (ghi 01/03 thay vì 01/04)',
 '2026-03-25', '2026-03-26', 2, 'Đính chính quyết định',
 'Đã đính chính ngày có hiệu lực thành 01/04/2026 trong QĐ 810/QĐ-ĐHAG', 5, NULL, 12),
('YC007', 'Đề nghị bổ nhiệm kiêm nhiệm Thầy An phụ trách thêm Bộ môn Hệ thống thông tin',
 '2026-03-19', NULL, 1, 'Bổ nhiệm kiêm nhiệm',
 NULL, 1, NULL, 11),
('YC008', 'Đề nghị cung cấp toàn bộ lịch sử quy hoạch của Thầy Cường từ năm 2020',
 '2026-03-10', '2026-03-11', 2, 'Tra cứu thông tin',
 'Đã cung cấp trích lục hồ sơ quy hoạch giai đoạn 2020-2025', NULL, 3, 3),
('YC009', 'Đề nghị bổ sung biên bản hội nghị khoa vào hồ sơ bổ nhiệm Thầy Khánh TK Nông nghiệp',
 '2026-04-06', '2026-04-07', 2, 'Cập nhật hồ sơ',
 'Đã bổ sung nghị quyết hội nghị viên chức khoa Nông nghiệp vào HSBN07', 9, NULL, 10),
('YC010', 'Đề nghị xem xét lại kết quả biểu quyết bước 2 quy hoạch PTK Sư phạm của Cô Hoa',
 '2025-12-05', '2025-12-08', 2, 'Khiếu nại kết quả',
 'Sau kiểm tra, kết quả bỏ phiếu đúng quy trình – tỷ lệ không đạt yêu cầu, không thay đổi', NULL, 6, 8),
('YC011', 'Yêu cầu cập nhật địa chỉ thường trú mới của Cô Phan Thị Xuân sau khi chuyển chỗ ở',
 '2026-04-10', '2026-04-10', 2, 'Cập nhật hồ sơ',
 'Đã cập nhật địa chỉ mới: 15 Nguyễn Thái Bình, TP. Châu Đốc, An Giang', 10, NULL, 19),
('YC012', 'Xin gia hạn 3 ngày để bổ sung quyết nghị chi bộ vào hồ sơ bổ nhiệm TK Luật',
 '2026-04-18', '2026-04-18', 2, 'Gia hạn hồ sơ',
 'Chấp thuận, hạn nộp dời đến ngày 22/04/2026', 14, NULL, 27),
('YC013', 'Đề nghị cung cấp danh sách nhân sự quy hoạch Phòng KHTC kèm kết quả bỏ phiếu',
 '2026-04-22', '2026-04-23', 2, 'Tra cứu thông tin',
 'Đã cung cấp trích lục đầy đủ danh sách và kết quả quy hoạch QH010', NULL, 20, 10),
('YC014', 'Phát hiện sai sót số quyết định bổ nhiệm Cô Cẩm: dự thảo ghi "019" thay vì "910/QĐ-ĐHAG"',
 '2026-04-29', '2026-04-29', 2, 'Đính chính quyết định',
 'Xác nhận số đúng là 910/QĐ-ĐHAG, đã chỉnh sửa dự thảo, phát hành lại', 12, NULL, 11),
('YC015', 'Đề nghị xem xét bổ sung Thầy Nguyễn Văn Dũng vào quy hoạch Phó TP Phòng KH-HTQT',
 '2026-03-20', '2026-03-25', 2, 'Bổ sung quy hoạch',
 'Chấp thuận, trình Hội đồng quy hoạch xem xét tại kỳ họp quý II/2026', NULL, 13, 23),
('YC016', 'Đề nghị xem xét lại kết quả xếp loại VC năm 2023 – Thầy Dương Văn Vũ (đề nghị nâng lên "Hoàn thành xuất sắc")',
 '2024-01-05', '2024-01-15', 2, 'Khiếu nại kết quả',
 'Sau xem xét hội đồng, giữ nguyên kết quả "Hoàn thành xuất sắc" (đã đúng)', NULL, 5, 18),
('YC017', 'Thầy Đỗ Văn Hiếu đã hoàn thành bảo vệ luận án tiến sĩ, đề nghị cập nhật trình độ trong hệ thống',
 '2026-03-15', '2026-03-16', 2, 'Cập nhật hồ sơ',
 'Đã cập nhật trình độ chuyên môn thành Tiến sĩ và chuyên ngành Luật Kinh tế cho VC028', NULL, 17, 28),
('YC018', 'Đề nghị xem xét chấm dứt kiêm nhiệm TK CNTT phụ trách BM HTTT khi BM có TBM chính thức',
 '2026-04-20', '2026-04-20', 2, 'Thôi kiêm nhiệm',
 'Chấp thuận, ban hành QĐ chấm dứt kiêm nhiệm khi QĐ bổ nhiệm TBM có hiệu lực', 16, NULL, 1),
('YC019', 'Đề nghị cung cấp báo cáo tổng hợp các đợt bổ nhiệm hoàn thành trong quý I năm 2026',
 '2026-04-01', '2026-04-02', 2, 'Tra cứu thông tin',
 'Đã cung cấp báo cáo: BN004 (TK SP), BN005 (TP TC-CT), BN006 (thôi chức PTP TC-CT) – tổng 3 đợt hoàn thành', NULL, 9, 10),
('YC020', 'Đề nghị xem xét bổ sung Thầy Cao Văn Thịnh vào danh sách quy hoạch Phó Trưởng khoa Kinh tế',
 '2026-05-01', NULL, 1, 'Bổ sung quy hoạch',
 NULL, NULL, 4, 16);
