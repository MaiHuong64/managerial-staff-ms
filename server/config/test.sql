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

    -- ① Bảng mới: phiếu đề xuất từ đơn vị/khoa
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
        CONSTRAINT fk_pdxqh_dv  FOREIGN KEY (don_vi_id) REFERENCES don_vi(id),
        CONSTRAINT fk_pdxqh_cd  FOREIGN KEY (chuc_danh_id) REFERENCES chuc_danh_quan_ly(id)
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
        trang_thai SMALLINT,
        dot_goc_id SMALLINT, 
        CONSTRAINT fk_dqh FOREIGN KEY (dot_goc_id) REFERENCES dot_quy_hoach(id),
    );

    CREATE TABLE chi_tiet_quy_hoach (
        id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        ngay_vao_qh DATE,
        ngay_ra_qh DATE,
        buoc_hien_tai SMALLINT DEFAULT 2, -- 2: HN lãnh đạo lần 1, 3: HN CB chủ chốt, 4: HN lãnh đạo mở rộng, 5: HN lãnh đạo lần 2, 6: hoàn thành, 0: không đạt
        so_qd_ra_khoi_quy_hoach VARCHAR(50),
        ngay_qd_ra_khoi_quy_hoach DATE,
        ly_do_ra_khoi_quy_hoach TEXT,
        trang_thai SMALLINT,
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
        trang_thai SMALLINT DEFAULT 0,
        -- 0: chưa đủ, 1: đầy đủ, 2: cần bổ sung
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
        nguoi_lap VARCHAR(50),
        trang_thai SMALLINT DEFAULT 1; --1: Đang soạn thảo (chưa bắt đầu vote), 2: Đang bỏ phiếu (bước 2-5), 6: Hoàn thành, 0: Dừng
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
        buoc_hoi_nghi SMALLINT NOT NULL,	-- lịch sử phiếu của các ứng viên
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
        CONSTRAINT fk_hs_ctpa FOREIGN KEY (chi_tiet_pa_id) REFERENCES chi_tiet_phuong_an(id)
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



    INSERT INTO don_vi (ma_don_vi, ten_don_vi, loai_don_vi) VALUES
    ('DV001', 'Phòng Tổ chức - Chính trị', 'Phòng ban'),
    ('DV002', 'Phòng Hành chính - Tổng hợp', 'Phòng ban'),
    ('DV003', 'Phòng Kế hoạch - Tài vụ', 'Phòng ban'),
    ('DV004', 'Phòng Đào tạo', 'Phòng ban'),
    ('DV005', 'Phòng Công tác sinh viên', 'Phòng ban'),
    ('DV006', 'Khoa Nông nghiệp và Tài nguyên Thiên nhiên', 'Khoa'),
    ('DV007', 'Khoa Kỹ thuật - Công nghệ - Môi trường', 'Khoa'),
    ('DV008', 'Khoa Sư phạm', 'Khoa'),
    ('DV009', 'Khoa Kinh tế và Quản trị kinh doanh', 'Khoa'),
    ('DV010', 'Khoa Lý luận chính trị', 'Khoa'),
    ('DV011', 'Khoa Ngoại ngữ', 'Khoa'),
    ('DV012', 'Bộ môn Toán - Tin học', 'Bộ môn'),
    ('DV013', 'Bộ môn Giáo dục thể chất', 'Bộ môn');

   INSERT INTO vien_chuc (
  ma_vien_chuc, ho_va_ten, gioi_tinh, so_cccd, so_dien_thoai, email,
  dia_chi, ngay_sinh, dan_toc, trinh_do_chuyen_mon,
  ngay_ket_nap, ngay_chinh_thuc, chuyen_nganh, ngach, nam_tot_nghiep,
  trinh_do_ly_luan_ct, trinh_do_ngoai_ngu, trinh_do_tin_hoc, trang_thai, don_vi_id
) VALUES
('001', 'Nguyễn Văn An', 1, '086001234501', '0901234501', 'an.nv@agu.edu.vn',
  '123 Trần Hưng Đạo, Long Xuyên, An Giang',
  '1975-03-10', 'Kinh', 'Tiến sĩ', '2000-02-01', '2001-02-01',
  'Quản trị nhân sự', 'Giảng viên cao cấp', 2000,
  'Cao cấp', 'C1', 'IC3', 1, 1),

('002', 'Trần Thị Bích', 0, '086001234502', '0901234502', 'bich.tt@agu.edu.vn',
  '45 Ngô Gia Tự, Long Xuyên, An Giang',
  '1980-07-22', 'Kinh', 'Thạc sĩ', '2005-09-01', '2006-09-01',
  'Kế toán', 'Chuyên viên chính', 2004,
  'Trung cấp', 'B2', 'IC3', 1, 3),

('003', 'Lê Minh Khoa', 1, '086001234503', '0901234503', 'khoa.lm@agu.edu.vn',
  '78 Lý Thái Tổ, Long Xuyên, An Giang',
  '1978-11-05', 'Kinh', 'Tiến sĩ', '2003-04-01', '2004-04-01',
  'Công nghệ thông tin', 'Giảng viên cao cấp', 2002,
  'Cao cấp', 'C1', 'IC3', 1, 7),

('004', 'Phạm Thị Dung', 0, '086001234504', '0901234504', 'dung.pt@agu.edu.vn',
  '22 Hùng Vương, Long Xuyên, An Giang',
  '1985-04-18', 'Kinh', 'Thạc sĩ', '2008-07-01', '2009-07-01',
  'Sư phạm Toán', 'Giảng viên chính', 2007,
  'Trung cấp', 'B1', 'IC3', 1, 8),

('005', 'Hoàng Văn Em', 1, '086001234505', '0901234505', 'em.hv@agu.edu.vn',
  '56 Trần Quốc Toản, Long Xuyên, An Giang',
  '1982-09-30', 'Kinh', 'Tiến sĩ', '2006-03-01', '2007-03-01',
  'Kinh tế nông nghiệp', 'Giảng viên cao cấp', 2005,
  'Cao cấp', 'C1', 'IC3', 1, 6),

('006', 'Võ Thị Phương', 0, '086001234506', '0901234506', 'phuong.vt@agu.edu.vn',
  '10 Đinh Tiên Hoàng, Long Xuyên, An Giang',
  '1990-01-14', 'Kinh', 'Thạc sĩ', '2014-06-01', '2015-06-01',
  'Ngôn ngữ Anh', 'Giảng viên', 2013,
  'Sơ cấp', 'B2', 'IC3', 1, 11),

('007', 'Đỗ Quốc Hùng', 1, '086001234507', '0901234507', 'hung.dq@agu.edu.vn',
  '34 Nguyễn Huệ, Long Xuyên, An Giang',
  '1983-06-20', 'Kinh', 'Thạc sĩ', '2007-01-01', '2008-01-01',
  'Lý luận chính trị', 'Giảng viên chính', 2006,
  'Cao cấp', 'B1', 'IC3', 1, 10),

('008', 'Nguyễn Thị Kim Loan', 0, '086001234508', '0901234508', 'loan.ntk@agu.edu.vn',
  '67 Hai Bà Trưng, Long Xuyên, An Giang',
  '1987-12-03', 'Kinh', 'Thạc sĩ', '2011-08-01', '2012-08-01',
  'Kỹ thuật môi trường', 'Giảng viên', 2010,
  'Sơ cấp', 'B1', 'IC3', 1, 7),

('009', 'Phan Văn Tài', 1, '086001234509', '0901234509', 'tai.pv@agu.edu.vn',
  '89 Lê Lợi, Long Xuyên, An Giang',
  '1979-05-25', 'Kinh', 'Tiến sĩ', '2004-10-01', '2005-10-01',
  'Quản trị kinh doanh', 'Giảng viên cao cấp', 2003,
  'Cao cấp', 'C1', 'IC3', 1, 9),

('010', 'Lâm Thị Hồng', 0, '086001234510', '0901234510', 'hong.lt@agu.edu.vn',
  '12 Phạm Hồng Thái, Long Xuyên, An Giang',
  '1988-08-17', 'Kinh', 'Thạc sĩ', '2012-05-01', '2013-05-01',
  'Giáo dục tiểu học', 'Giảng viên', 2011,
  'Sơ cấp', 'A2', 'IC3', 1, 8);

    INSERT INTO chuc_danh_quan_ly (ma_chuc_danh, ten_chuc_danh, thoi_han_giu_chuc_vu, he_so_phu_cap) VALUES
    ('CD001', 'Trưởng phòng',       5, 0.50),
    ('CD002', 'Phó trưởng phòng',   5, 0.35),
    ('CD003', 'Trưởng khoa',        5, 0.50),
    ('CD004', 'Phó trưởng khoa',    5, 0.35),
    ('CD005', 'Trưởng bộ môn',      5, 0.25),
    ('CD006', 'Phó trưởng bộ môn',  5, 0.20);

    INSERT INTO xep_loai_vc (nam_danh_gia, danh_gia, nhan_xet, vien_chuc_id) VALUES
    (2022, 'Hoàn thành xuất sắc nhiệm vụ', 'Tích cực, có nhiều đóng góp cho đơn vị',         1),
    (2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Gương mẫu, trách nhiệm cao',                     1),
    (2022, 'Hoàn thành tốt nhiệm vụ',      'Chấp hành tốt nội quy, quy định',                2),
    (2023, 'Hoàn thành tốt nhiệm vụ',      'Năng lực chuyên môn ổn định',                    2),
    (2022, 'Hoàn thành xuất sắc nhiệm vụ', 'Nghiên cứu khoa học đạt kết quả xuất sắc',       3),
    (2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Xuất bản nhiều công trình khoa học',              3),
    (2022, 'Hoàn thành tốt nhiệm vụ',      'Giảng dạy tốt, sinh viên đánh giá cao',          4),
    (2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Tiến bộ rõ rệt, hoàn thành vượt chỉ tiêu',      4),
    (2022, 'Hoàn thành xuất sắc nhiệm vụ', 'Dẫn đầu trong nghiên cứu nông nghiệp',           5),
    (2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Chủ nhiệm đề tài cấp tỉnh thành công',           5),
    (2022, 'Hoàn thành tốt nhiệm vụ',      'Giảng dạy ngoại ngữ hiệu quả',                   6),
    (2023, 'Hoàn thành tốt nhiệm vụ',      'Tích cực đổi mới phương pháp giảng dạy',         6),
    (2022, 'Hoàn thành tốt nhiệm vụ',      'Nhiệt tình trong công tác tư tưởng',              7),
    (2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Hoàn thành tốt nhiệm vụ chính trị được giao',    7),
    (2022, 'Hoàn thành tốt nhiệm vụ',      'Nghiên cứu môi trường đạt kết quả tốt',          8),
    (2023, 'Hoàn thành tốt nhiệm vụ',      'Có nhiều sáng kiến trong giảng dạy',              8),
    (2022, 'Hoàn thành xuất sắc nhiệm vụ', 'Quản lý đào tạo hiệu quả, uy tín cao',           9),
    (2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Dẫn đầu khoa trong hoạt động nghiên cứu',        9),
    (2022, 'Hoàn thành tốt nhiệm vụ',      'Tận tâm với nghề, được sinh viên yêu quý',       10),
    (2023, 'Hoàn thành tốt nhiệm vụ',      'Hoàn thành đúng hạn các nhiệm vụ được giao',    10);

    INSERT INTO xep_loai_dang_vien (nam_danh_gia, danh_gia, nhan_xet, vien_chuc_id) VALUES
    (2022, 'Hoàn thành xuất sắc nhiệm vụ', 'Tiên phong, gương mẫu trong chi bộ',             1),
    (2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Phát huy tốt vai trò đảng viên',                 1),
    (2022, 'Hoàn thành tốt nhiệm vụ',      'Tham gia sinh hoạt chi bộ đầy đủ',               2),
    (2023, 'Hoàn thành tốt nhiệm vụ',      'Chấp hành tốt Điều lệ Đảng',                     2),
    (2022, 'Hoàn thành xuất sắc nhiệm vụ', 'Đóng góp tích cực cho hoạt động chi bộ',         3),
    (2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Giữ vững lập trường, phẩm chất đảng viên',       3),
    (2022, 'Hoàn thành tốt nhiệm vụ',      'Thực hiện tốt nghị quyết chi bộ',                5),
    (2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Nêu cao tinh thần trách nhiệm đảng viên',        5),
    (2022, 'Hoàn thành tốt nhiệm vụ',      'Nhiệt tình tham gia công tác đảng',               7),
    (2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Hoàn thành xuất sắc nhiệm vụ đảng giao',         7),
    (2022, 'Hoàn thành tốt nhiệm vụ',      'Gương mẫu trong lối sống, tác phong',             9),
    (2023, 'Hoàn thành xuất sắc nhiệm vụ', 'Tích cực đấu tranh bảo vệ nền tảng tư tưởng',   9);
