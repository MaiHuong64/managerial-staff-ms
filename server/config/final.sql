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
    loai_don_vi VARCHAR(50), 
    don_vi_cha_id INT,
    so_dien_thoai VARCHAR(12),
    email VARCHAR(100),
    dia_chi TEXT,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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