/* ============================================================================
   DỮ LIỆU TIẾN ĐỘ — Đề tài NAFOSTED 108.05-2023.20
   NGUỒN DỮ LIỆU DUY NHẤT cho NAFOSTED-PROGRESS.html.

   ★ MÔ HÌNH HỢP NHẤT (1 nguồn): mọi công việc/phiếu giao việc/công bố/việc tài
     chính đều là MỘT bản ghi trong `congViec`. Gantt, bảng việc, khối Công bố,
     khối Tài chính, tab Giao việc, bộ giám sát… đều LÀ VIEW đọc từ đây →
     cập nhật 1 chỗ, mọi nơi đồng bộ (không còn lệch số liệu).

   Mỗi mục congViec:
     ma            : mã ổn định (CV-xx)
     nd            : nội dung gắn (ND1..6 / ND1+ND2 / TC / QL)
     loai          : "nc" nghiên cứu · "cb" công bố (bài báo) · "ht" hội thảo
                     · "tc" tài chính · "dt" đào tạo · "ql" quản lý
     ten           : tên công việc
     mucTieu/hoatDong/ketQuaCanDat : nội dung phiếu giao việc (gắn mục tiêu–hoạt động đề tài)
     chuTri        : 1 NGƯỜI CHỊU TRÁCH NHIỆM CHÍNH (RACI)
     hoTro         : [danh sách người hỗ trợ]
     batDau,deadline : "YYYY-MM" | "YYYY-MM-DD"
     tienDo        : 0..100 ; trangThai: "xong"|"dangLam"|"chuaBatDau"
     uuTien        : "Cao" | "Trung bình" | "Thấp"
     vongDoi       : VÒNG ĐỜI PHIẾU — "giao" → "nhan" → "dangLam" → "nop" → "nghiemThu"
                     (giao=đã giao · nhan=NS đã nhận · nop=NS nộp kết quả · nghiemThu=CN duyệt đạt)
     tapChi,capDo,quy : chỉ cho loai "cb"/"ht"
     snooze        : {lyDo, denNgay} — CN duyệt/hoãn cảnh báo giám sát đến ngày này (tùy chọn)

   → Cập nhật: sửa Ở ĐÂY → mở lại HTML. Mỗi lần đổi: thêm 1 dòng nhatKy + đổi capNhat.
   ========================================================================== */
window.NAFOSTED_PROGRESS = {
  capNhat: "2026-06-30c",
  moc: { batDau: "2024-08-01", ketThuc: "2027-08-31" },

  meta: {
    ten: "Sàng lọc cây thuốc điều trị sa sút trí tuệ của dân tộc Dao ở Việt Nam và nghiên cứu thành phần hóa học, tác dụng cải thiện trí nhớ của một số dược liệu điển hình",
    tenEn: "Ethno-herbal medicine screening for dementia treatment among the Dao ethnic group in Vietnam and evaluation of chemical composition, memory-enhancing effects of selected promising plants",
    maSo: "108.05-2023.20",
    chuNhiem: "TS. Phạm Hà Thanh Tùng",
    toChuc: "Trường Đại học Phenikaa",
    donViQuanLy: "Quỹ Phát triển KH&CN Quốc gia (NAFOSTED) — Bộ Khoa học & Công nghệ",
    coVan: "PGS.TS. Trần Văn Ơn (cố vấn dân tộc học)",
    loai: "Nghiên cứu cơ bản trong KHTN & KT (NAFOSTED)",
    thoiGian: "36 tháng · 08/2024 – 08/2027",
    kinhPhi: "1.037.000.000 đồng",
    mucTieuTongQuat: "Sàng lọc cây thuốc người Dao điều trị sa sút trí tuệ; nghiên cứu thành phần hóa học và tác dụng cải thiện trí nhớ của một số dược liệu điển hình.",
    bandoHref: "NAFOSTED-MAP.html"
  },

  /* ---- Nhân sự (theo đề cương M2 ký 26/8/2024; moi:true = bổ sung) ---- */
  nhanSu: [
    { ten: "TS. Phạm Hà Thanh Tùng", vaiTro: "Chủ nhiệm đề tài (CNDT)", phuTrach: "Điều phối · thực vật dân tộc học · hóa TN · công bố · nghiệm thu — ND1, ND3, ND6", moi: false },
    { ten: "TS. Nguyễn Ngọc Hiếu", vaiTro: "Thư ký khoa học (TKKH) · TVC", phuTrach: "Hóa thực vật, dược liệu — ND3, ND5, ND6", moi: false },
    { ten: "TS. Nguyễn Thu Hằng", vaiTro: "Thành viên chính (TVC)", phuTrach: "Đánh giá tác dụng sinh học — ND2, ND4 (AChE, HT-22, in vivo)", moi: false },
    { ten: "TS. Vũ Văn Tuấn", vaiTro: "Thành viên nghiên cứu (TVNC)", phuTrach: "Hóa thực vật, định tính/định lượng — ND1, ND5, ND6", moi: false },
    { ten: "ThS. Lê Thiên Kim", vaiTro: "Thành viên (TV) — hiện là NCS", phuTrach: "Thực vật dân tộc học — ND1, ND5, ND6 · file master sàng lọc", moi: false },
    { ten: "ThS. Lê Hồng Oanh", vaiTro: "Thành viên (TV/TVNC)", phuTrach: "Tác dụng sinh học — ND2, ND4", moi: false },
    { ten: "ThS. Mai Thu Phương", vaiTro: "Thành viên (TV)", phuTrach: "Tác dụng sinh học — ND4", moi: false },
    { ten: "ThS. Phạm Thị Linh Giang", vaiTro: "Kỹ thuật viên (KTV)", phuTrach: "Hỗ trợ kỹ thuật xuyên suốt ND1–ND6", moi: false },
    { ten: "PGS.TS. Trần Văn Ơn", vaiTro: "Cố vấn dân tộc học", phuTrach: "Tư vấn ND1 · chuyên gia cây thuốc người Dao", moi: false },
    { ten: "HV Phạm Thị Xuân Quỳnh", vaiTro: "Học viên cao học (đào tạo)", phuTrach: "Luận văn Củ dòm — ND5 (metabolomics + phân lập)", moi: false },
    { ten: "HV Bùi Trà My", vaiTro: "Học viên cao học ĐH Phenikaa (MHV 24800103) — đào tạo thứ 2", phuTrach: "Luận văn: cao chuẩn hóa Củ dòm giàu oxostephanin + ức chế AChE in vitro (ND5/ND6/ND2) · GVHD: TS. Phạm Hà Thanh Tùng · đề cương chốt 08/01/2025", moi: true },
    { ten: "Khánh Mai", vaiTro: "NCV hóa thực vật — FULLTIME bổ sung", phuTrach: "Hỗ trợ ND5: phân lập, chạy cột, xử lý phổ NMR/MS · ngân hàng cao chiết", moi: true },
    { ten: "Khánh Linh", vaiTro: "NCV dược lý + điều phối — FULLTIME bổ sung", phuTrach: "Hỗ trợ ND4: in vivo, AChE, HT-22 · quản trị dashboard · hỗ trợ bản thảo", moi: true }
  ],

  /* ---- Sản phẩm đăng ký (YCCS) — bảng tóm tắt mục tiêu sản phẩm ---- */
  sanPham: [
    { ten: "Bài báo ISI uy tín", soLuong: 1, trangThai: "dangLam", tienDo: 25, han: "2027-03", ghiChu: "Dự kiến từ ND5 — xem CV-07" },
    { ten: "Bài báo quốc tế uy tín", soLuong: 1, trangThai: "dangLam", tienDo: 45, han: "2026-09", ghiChu: "JEP (ND1+ND2) — xem CV-06; bản thảo 12/12 tiêu chí, chờ ⏳ số liệu" },
    { ten: "Tạp chí quốc gia uy tín", soLuong: 2, trangThai: "dangLam", tienDo: 30, han: "2027-06", ghiChu: "CV-08, CV-09" },
    { ten: "Báo cáo hội nghị/hội thảo", soLuong: 2, trangThai: "chuaBatDau", tienDo: 0, han: "2027-06", ghiChu: "CV-10, CV-11" },
    { ten: "Học viên cao học", soLuong: 2, trangThai: "dangLam", tienDo: 55, han: "2027-06", ghiChu: "Quỳnh (CV-12) + Trà My (CV-13)" }
  ],

  /* ---- Tài chính (khoán từng phần) — checklist thủ tục giải ngân ---- */
  taiChinh: {
    tong: "1.037.000.000 đồng",
    khoan: "737.000.000 đ (khoán từng phần)",
    khongKhoan: "300.000.000 đ (không khoán)",
    nhaThau: "Liên danh Minh Việt – 3B6 — mua hóa chất/NVL (HĐ 03/6/2025, nghiệm thu 18/8/2025)",
    hoSo: "Triển khai/Giải ngân/",
    thuTuc: [
      { ten: "Tờ trình phê duyệt kế hoạch đấu thầu (KHĐT)", trangThai: "xong" },
      { ten: "QĐ thành lập Ban đấu thầu", trangThai: "xong" },
      { ten: "Thư mời thầu + dự thảo hợp đồng", trangThai: "xong" },
      { ten: "QĐ phê duyệt kết quả chỉ định thầu rút gọn", trangThai: "xong" },
      { ten: "Hợp đồng liên danh Minh Việt–3B6 (03/6/2025)", trangThai: "xong" },
      { ten: "Biên bản nghiệm thu & thanh lý hợp đồng (18/8/2025)", trangThai: "xong" },
      { ten: "Biên bản giải trình (18/8/2025)", trangThai: "xong" },
      { ten: "Giấy đề nghị thanh toán (BM01.KT) — NVL", trangThai: "xong" },
      { ten: "Danh sách chuyển tiền tạm ứng khoán việc (BM21)", trangThai: "xong" },
      { ten: "Quyết toán tài chính Năm 1", trangThai: "xong" },
      { ten: "Báo cáo tài chính & quyết toán Năm 2", trangThai: "dangLam" },
      { ten: "Hồ sơ tạm ứng + mua sắm NVL/hóa chất Năm 3", trangThai: "chuaBatDau" },
      { ten: "Quyết toán cuối + hồ sơ tài chính nghiệm thu", trangThai: "chuaBatDau" }
    ],
    tongKinhPhi: 1037000000,
    daCap: 518500000,
    daSuDung: 393065000,
    chuaDung: 125435000,
    chuaCap: 518500000,
    capNhat: "2026-06-19",
    dotGiaiNgan: [
      { dot: 1, soTien: 518500000, phanTram: 50, trangThai: "xong", ngay: "18/9/2024" },
      { dot: 2, soTien: 311100000, phanTram: 30, trangThai: "chuaBatDau", duKien: "7/2026", ghiChu: "Điều kiện đã đạt (đã dùng 75,8% đợt 1)" },
      { dot: 3, soTien: 207400000, phanTram: 20, trangThai: "chuaBatDau", duKien: "Năm 3", ghiChu: "Phụ lục 01/PLHĐ 01/6/2026 gộp đợt 3+4" }
    ],
    khoanChi: [
      { ten: "1. Nhân công lao động khoa học",   duToan: 600000000, nam1: 169235000, nam2: 238045000, nam3: 192720000, daDung: 106240000 },
      { ten: "2. Nguyên vật liệu, hóa chất",     duToan: 300000000, nam1: 300000000, nam2: 0, nam3: 0, daDung: 260900000 },
      { ten: "3. Thiết bị",                       duToan: 0, nam1: 0, nam2: 0, nam3: 0, daDung: 0 },
      { ten: "4. Đi lại, công tác phí",           duToan: 23340000,  nam1: 23340000,  nam2: 0, nam3: 0, daDung: 0 },
      { ten: "5. Phí dịch vụ thuê ngoài",         duToan: 57500000,  nam1: 0, nam2: 57500000, nam3: 0, daDung: 0 },
      { ten: "6. Chi phí trực tiếp khác",         duToan: 4310000,   nam1: 0, nam2: 0, nam3: 4310000, daDung: 0 },
      { ten: "7. Chi phí quản lý (gián tiếp)",    duToan: 51850000,  nam1: 25925000,  nam2: 15555000, nam3: 10370000, daDung: 25925000 }
    ],
    giaoDich: [
      { ten: "Thù lao chủ nhiệm đề tài (TS. Phạm Hà Thanh Tùng)", chungTu: "UNC.2025.153", ngay: "2025-05-15", soTien: 77440000 },
      { ten: "Thù lao thư ký khoa học (TS. Nguyễn Ngọc Hiếu)",     chungTu: "UNC.2025.154", ngay: "2025-05-15", soTien: 28800000 },
      { ten: "Mua nguyên vật liệu, hóa chất (Minh Việt)",          chungTu: "UNC.2025.273", ngay: "2025-09-10", soTien: 225070000 },
      { ten: "Mua nguyên vật liệu, hóa chất (3B6)",                chungTu: "UNC.2025.306", ngay: "2025-09-10", soTien: 35830000 },
      { ten: "Chi quản lý chung (trích điện nước)",                 chungTu: "74.2025.UNC",  ngay: "2025-02-17", soTien: 25925000 }
    ]
  },

  /* ---- Công kế hoạch theo công việc (person-month, theo phân bổ M2) ----
     Khóa = mã công việc n.n.n; mỗi mục [tên người, số tháng kế hoạch].
     Công THỰC TẾ nhập trên tab "Tính công" (lưu localStorage → xuất hợp nhất).
     Đơn giá khoán: tổng KP khoán 737.000.000 đ chia theo tỷ trọng công thực tế. */
  khoanCong: 737000000,
  congKeHoach: {
    "1.1.1": [["ThS. Lê Thiên Kim",0.2],["ThS. Phạm Thị Linh Giang",0.3],["TS. Phạm Hà Thanh Tùng",0.1]],
    "1.2.1": [["TS. Phạm Hà Thanh Tùng",0.1],["ThS. Lê Thiên Kim",0.3],["ThS. Phạm Thị Linh Giang",0.3]],
    "1.3.1": [["ThS. Phạm Thị Linh Giang",0.3],["TS. Vũ Văn Tuấn",0.2],["TS. Phạm Hà Thanh Tùng",0.1]],
    "2.1.1": [["TS. Nguyễn Thu Hằng",0.2],["ThS. Lê Hồng Oanh",0.3],["ThS. Phạm Thị Linh Giang",0.4]],
    "3.1.1": [["TS. Nguyễn Ngọc Hiếu",0.1],["ThS. Lê Thiên Kim",0.1],["ThS. Phạm Thị Linh Giang",0.1]],
    "4.1.1": [["TS. Nguyễn Thu Hằng",0.2],["ThS. Lê Hồng Oanh",0.6],["ThS. Phạm Thị Linh Giang",0.8]],
    "4.2.1": [["TS. Nguyễn Thu Hằng",0.2],["ThS. Lê Hồng Oanh",0.4],["ThS. Phạm Thị Linh Giang",0.6]],
    "4.3.1": [["TS. Nguyễn Thu Hằng",0.1],["ThS. Lê Hồng Oanh",0.2],["ThS. Phạm Thị Linh Giang",0.4]],
    "4.4.1": [["ThS. Lê Hồng Oanh",0.5],["TS. Nguyễn Thu Hằng",0.2],["ThS. Phạm Thị Linh Giang",0.5]],
    "4.5.1": [["TS. Nguyễn Thu Hằng",0.2],["Khánh Linh",0.4]],
    "5.1.1": [["TS. Vũ Văn Tuấn",0.5],["Khánh Mai",0.5]],
    "5.2.1": [["Khánh Mai",0.4],["HV Phạm Thị Xuân Quỳnh",0.3]],
    "5.3.1": [["TS. Nguyễn Ngọc Hiếu",0.3],["Khánh Mai",0.3],["ThS. Lê Thiên Kim",0.6]],
    "5.4.1": [["Khánh Mai",0.2],["ThS. Lê Thiên Kim",0.3]],
    "6.1.1": [["TS. Vũ Văn Tuấn",0.3],["Khánh Mai",0.4]],
    "6.2.1": [["TS. Vũ Văn Tuấn",0.5],["TS. Nguyễn Ngọc Hiếu",0.8],["ThS. Lê Thiên Kim",0.8]],
    "7.1.1": [["TS. Phạm Hà Thanh Tùng",0.3],["TS. Nguyễn Thu Hằng",0.2]],
    "7.2.1": [["TS. Nguyễn Ngọc Hiếu",0.3],["TS. Phạm Hà Thanh Tùng",0.2]],
    "7.3.1": [["TS. Phạm Hà Thanh Tùng",0.2]],
    "7.3.2": [["TS. Phạm Hà Thanh Tùng",0.2]],
    "7.4.1": [["TS. Phạm Hà Thanh Tùng",0.1]],
    "7.4.2": [["TS. Phạm Hà Thanh Tùng",0.1]],
    "8.1.1": [["TS. Phạm Hà Thanh Tùng",0.3]],
    "8.2.1": [["TS. Phạm Hà Thanh Tùng",0.3]],
    "9.1.1": [["TS. Phạm Hà Thanh Tùng",0.1]],
    "9.1.2": [["TS. Phạm Hà Thanh Tùng",0.1]],
    "9.1.3": [["TS. Phạm Hà Thanh Tùng",0.1]],
    "9.1.4": [["TS. Phạm Hà Thanh Tùng",0.1]],
    "9.2.1": [["TS. Phạm Hà Thanh Tùng",0.1],["Khánh Linh",0.2]],
    "9.2.2": [["TS. Phạm Hà Thanh Tùng",0.2],["Khánh Linh",0.3]]
  },

  /* ===========================================================================
     WBS — CÂY CÔNG VIỆC 4 CẤP (nguồn duy nhất cho bảng công việc)
       n.        Mục tiêu  (loai: nc/cb/dt/tc — nc = nội dung nghiên cứu ND)
       n.n.      Hoạt động (kèm kết quả tương ứng)
       n.n.n.    Công việc  → ĐƠN VỊ GIÁM SÁT & BÁO CÁO (chuTri, deadline, vòng đời)
       GV n.n.n.n  Giao việc → chi tiết trong công việc, có MARK theo dõi (xong/tienDo)
     noiDung (thẻ ND) & congViec (Gantt/giám sát/Giao việc) được DERIVE từ wbs.
     =========================================================================== */
  wbs: [
    { ma: "1", code: "ND1", loai: "nc", ten: "Điều tra dân tộc học cây thuốc SSTT của người Dao", han: "2025-08", tienDo: 100, trangThai: "xong", phuTrach: "TS. Phạm Hà Thanh Tùng · PGS.TS. Trần Văn Ơn · ThS. Lê Thiên Kim · ThS. Phạm Thị Linh Giang",
      mucTieu: "Thu thập tri thức bản địa người Dao (Ba Vì, Sa Pa, Quản Bạ) về cây thuốc trị SSTT; giám định, lưu tiêu bản, lập ngân hàng dược liệu + CSDL.",
      hoatDong: [
        { ma: "1.1", ten: "Điều tra thực địa 3 xã (Ba Vì, Sa Pa, Nậm Đăm)", ketQua: "Bộ công cụ + dữ liệu khảo sát 3 xã (SP 1.1–1.2)",
          congViec: [ { ma: "1.1.1", ten: "Xây bộ công cụ + triển khai điều tra thực địa", chuTri: "ThS. Lê Thiên Kim", hoTro: ["ThS. Phạm Thị Linh Giang"], batDau: "2024-08", deadline: "2024-12", tienDo: 100, trangThai: "xong", vongDoi: "nghiemThu", uuTien: "Cao", ketQuaCanDat: "Báo cáo điều tra thực địa 3 xã",
            giaoViec: [ { ma: "1.1.1.1", ten: "Phỏng vấn + thu mẫu tại 3 xã", nguoiNhan: "ThS. Lê Thiên Kim", deadline: "2024-12", tienDo: 100, xong: true } ] } ] },
        { ma: "1.2", ten: "Giám định tên khoa học, lưu tiêu bản", ketQua: "Danh mục tên KH + bộ tiêu bản (BC 1.3)",
          congViec: [ { ma: "1.2.1", ten: "Giám định tên khoa học + lưu tiêu bản (HNIP)", chuTri: "TS. Phạm Hà Thanh Tùng", hoTro: [], batDau: "2024-08", deadline: "2025-01", tienDo: 100, trangThai: "xong", vongDoi: "nghiemThu", uuTien: "Trung bình", ketQuaCanDat: "Danh mục tên KH + tiêu bản", giaoViec: [] } ] },
        { ma: "1.3", ten: "Ngân hàng dược liệu khô + cao chiết + CSDL", ketQua: "Ngân hàng mẫu + CSDL quản lý (SP 1.4)",
          congViec: [ { ma: "1.3.1", ten: "Xây ngân hàng mẫu khô/cao chiết + CSDL", chuTri: "ThS. Phạm Thị Linh Giang", hoTro: ["TS. Vũ Văn Tuấn"], batDau: "2024-09", deadline: "2025-03", tienDo: 100, trangThai: "xong", vongDoi: "nghiemThu", uuTien: "Trung bình", ketQuaCanDat: "Ngân hàng mẫu + CSDL", giaoViec: [] } ] }
      ] },

    { ma: "2", code: "ND2", loai: "nc", ten: "Sàng lọc ức chế acetylcholinesterase (AChE) in vitro", han: "2025-08", tienDo: 100, trangThai: "xong", phuTrach: "TS. Nguyễn Thu Hằng · ThS. Lê Hồng Oanh · ThS. Phạm Thị Linh Giang",
      mucTieu: "Sàng lọc khả năng ức chế AChE của dịch chiết và đánh giá bảo vệ tế bào.",
      hoatDong: [
        { ma: "2.1", ten: "Thử ức chế AChE in vitro (Ellman) + bảo vệ tế bào", ketQua: "Báo cáo % ức chế AChE + bảo vệ tế bào (chuyên đề 2.1)",
          congViec: [ { ma: "2.1.1", ten: "Sàng lọc AChE + bảo vệ tế bào các cao chiết", chuTri: "TS. Nguyễn Thu Hằng", hoTro: ["ThS. Lê Hồng Oanh"], batDau: "2024-12", deadline: "2025-06", tienDo: 100, trangThai: "xong", vongDoi: "nghiemThu", uuTien: "Cao", ketQuaCanDat: "Báo cáo ức chế AChE + bảo vệ tế bào", giaoViec: [] } ] }
      ] },

    { ma: "3", code: "ND3", loai: "nc", ten: "Bộ tiêu chí → chọn 03 cây thuốc tiềm năng", han: "2025-08", tienDo: 100, trangThai: "xong", phuTrach: "TS. Nguyễn Ngọc Hiếu · TS. Phạm Hà Thanh Tùng",
      mucTieu: "Xây bộ tiêu chí và chọn 03 cây tiềm năng để nghiên cứu sâu (ND4 + ND5).",
      hoatDong: [
        { ma: "3.1", ten: "Xây bộ tiêu chí + chấm điểm chọn cây", ketQua: "Bộ tiêu chí + danh sách 03 cây (gồm Củ dòm) — chuyên đề 3.1",
          congViec: [ { ma: "3.1.1", ten: "Xây bộ tiêu chí, chấm điểm, chốt 03 cây", chuTri: "TS. Nguyễn Ngọc Hiếu", hoTro: ["TS. Phạm Hà Thanh Tùng"], batDau: "2025-01", deadline: "2025-07", tienDo: 100, trangThai: "xong", vongDoi: "nghiemThu", uuTien: "Cao", ketQuaCanDat: "Danh sách 03 cây được chọn", giaoViec: [] } ] }
      ] },

    { ma: "4", code: "ND4", loai: "nc", ten: "Đánh giá cải thiện trí nhớ in vivo", han: "2026-12", tienDo: 55, trangThai: "dangLam", phuTrach: "TS. Nguyễn Thu Hằng · ThS. Lê Hồng Oanh · Khánh Linh",
      mucTieu: "Đánh giá tác dụng cải thiện trí nhớ in vivo của các cây được chọn.",
      hoatDong: [
        { ma: "4.1", ten: "Mô hình né tránh thụ động (passive avoidance)", ketQua: "Báo cáo tác dụng mô hình né tránh thụ động",
          congViec: [ { ma: "4.1.1", ten: "Thí nghiệm né tránh thụ động + thu số liệu", chuTri: "TS. Nguyễn Thu Hằng", hoTro: ["ThS. Lê Hồng Oanh", "Khánh Linh"], batDau: "2025-09", deadline: "2026-08", tienDo: 75, trangThai: "dangLam", vongDoi: "dangLam", uuTien: "Cao", ketQuaCanDat: "Bộ số liệu né tránh thụ động",
            giaoViec: [ { ma: "4.1.1.1", ten: "Chạy lô chuột + ghi số liệu", nguoiNhan: "Khánh Linh", deadline: "2026-07", tienDo: 85, xong: false },
                        { ma: "4.1.1.2", ten: "Nhập + làm sạch số liệu", nguoiNhan: "ThS. Lê Hồng Oanh", deadline: "2026-08", tienDo: 60, xong: false } ] } ] },
        { ma: "4.2", ten: "Mô hình mê lộ chữ Y (Y-maze)", ketQua: "Báo cáo tác dụng mô hình Y-maze",
          congViec: [ { ma: "4.2.1", ten: "Thí nghiệm Y-maze + thu số liệu", chuTri: "TS. Nguyễn Thu Hằng", hoTro: ["ThS. Lê Hồng Oanh", "Khánh Linh"], batDau: "2025-09", deadline: "2026-08", tienDo: 70, trangThai: "dangLam", vongDoi: "dangLam", uuTien: "Cao", ketQuaCanDat: "Bộ số liệu Y-maze",
            giaoViec: [ { ma: "4.2.1.1", ten: "Chạy thí nghiệm Y-maze", nguoiNhan: "Khánh Linh", deadline: "2026-08", tienDo: 70, xong: false } ] } ] },
        { ma: "4.3", ten: "Định lượng AChE in vivo (mô não)", ketQua: "Số liệu hoạt độ AChE mô não toàn phần",
          congViec: [ { ma: "4.3.1", ten: "Định lượng AChE mô não toàn phần", chuTri: "TS. Nguyễn Thu Hằng", hoTro: ["Khánh Linh"], batDau: "2025-09", deadline: "2026-08", tienDo: 40, trangThai: "dangLam", vongDoi: "dangLam", uuTien: "Trung bình", ketQuaCanDat: "Số liệu AChE in vivo", giaoViec: [] } ] },
        { ma: "4.4", ten: "Bảo vệ tế bào HT-22 (độc glutamate)", ketQua: "Dữ liệu bảo vệ tế bào HT-22",
          congViec: [ { ma: "4.4.1", ten: "Thử bảo vệ tế bào HT-22", chuTri: "ThS. Lê Hồng Oanh", hoTro: ["Khánh Linh"], batDau: "2025-09", deadline: "2026-08", tienDo: 35, trangThai: "dangLam", vongDoi: "dangLam", uuTien: "Trung bình", ketQuaCanDat: "Dữ liệu HT-22", giaoViec: [] } ] },
        { ma: "4.5", ten: "Khóa số liệu, thống kê & báo cáo ND4", ketQua: "Báo cáo ND4 hoàn chỉnh + thống kê",
          congViec: [ { ma: "4.5.1", ten: "Khóa số liệu + xử lý thống kê + viết báo cáo ND4", chuTri: "TS. Nguyễn Thu Hằng", hoTro: ["Khánh Linh", "ThS. Lê Hồng Oanh"], batDau: "2026-07", deadline: "2026-12", tienDo: 20, trangThai: "dangLam", vongDoi: "dangLam", uuTien: "Cao", ketQuaCanDat: "Báo cáo ND4 + bộ số liệu thống kê",
            giaoViec: [ { ma: "4.5.1.1", ten: "Tổng hợp + thống kê (ANOVA/Tukey)", nguoiNhan: "Khánh Linh", deadline: "2026-09", tienDo: 30, xong: false },
                        { ma: "4.5.1.2", ten: "Viết báo cáo nội dung ND4", nguoiNhan: "TS. Nguyễn Thu Hằng", deadline: "2026-12", tienDo: 10, xong: false } ] } ] }
      ] },

    { ma: "5", code: "ND5", loai: "nc", ten: "Hóa thực vật: phân lập & xác định cấu trúc", han: "2027-03", tienDo: 45, trangThai: "dangLam", phuTrach: "TS. Nguyễn Ngọc Hiếu · TS. Vũ Văn Tuấn · Khánh Mai · HV Phạm Thị Xuân Quỳnh",
      mucTieu: "Phân lập & xác định cấu trúc 10–15 hợp chất/dược liệu bằng NMR + MS (đường găng).",
      hoatDong: [
        { ma: "5.1", ten: "Chiết, phân đoạn, chạy cột", ketQua: "Các phân đoạn (HAU_R*, HAU_TL*) đã làm giàu",
          congViec: [ { ma: "5.1.1", ten: "Chiết + phân đoạn + chạy cột 2 cây còn lại", chuTri: "TS. Vũ Văn Tuấn", hoTro: ["Khánh Mai"], batDau: "2026-07", deadline: "2026-11", tienDo: 55, trangThai: "dangLam", vongDoi: "dangLam", uuTien: "Cao", ketQuaCanDat: "Các phân đoạn sạch",
            giaoViec: [ { ma: "5.1.1.1", ten: "Chạy cột phân đoạn rễ (HAU_R*)", nguoiNhan: "Khánh Mai", deadline: "2026-10", tienDo: 60, xong: false } ] } ] },
        { ma: "5.2", ten: "Phân lập hợp chất", ketQua: "Các đơn chất phân lập (oxostephanin, crebanine…)",
          congViec: [ { ma: "5.2.1", ten: "Phân lập đơn chất từ các phân đoạn", chuTri: "Khánh Mai", hoTro: ["HV Phạm Thị Xuân Quỳnh"], batDau: "2026-08", deadline: "2026-12", tienDo: 40, trangThai: "dangLam", vongDoi: "dangLam", uuTien: "Cao", ketQuaCanDat: "≥10 đơn chất/dược liệu", giaoViec: [] } ] },
        { ma: "5.3", ten: "Xác định cấu trúc (NMR/MS)", ketQua: "Bộ phổ + cấu trúc 10–15 chất/dược liệu",
          congViec: [ { ma: "5.3.1", ten: "Đo & biện giải phổ NMR/MS xác định cấu trúc", chuTri: "TS. Nguyễn Ngọc Hiếu", hoTro: ["Khánh Mai"], batDau: "2026-10", deadline: "2027-02", tienDo: 10, trangThai: "dangLam", vongDoi: "nhan", uuTien: "Cao", ketQuaCanDat: "Cấu trúc 10–15 chất có phổ đầy đủ",
            giaoViec: [ { ma: "5.3.1.1", ten: "Đo phổ NMR (HAU)", nguoiNhan: "Khánh Mai", deadline: "2026-12", tienDo: 15, xong: false },
                        { ma: "5.3.1.2", ten: "Biện giải cấu trúc + đối chiếu TLTK", nguoiNhan: "TS. Nguyễn Ngọc Hiếu", deadline: "2027-02", tienDo: 5, xong: false } ] } ] },
        { ma: "5.4", ten: "Dựng CSDL hợp chất", ketQua: "CSDL hợp chất phân lập",
          congViec: [ { ma: "5.4.1", ten: "Số hóa phổ + cấu trúc vào CSDL", chuTri: "Khánh Mai", hoTro: ["ThS. Lê Thiên Kim"], batDau: "2027-01", deadline: "2027-03", tienDo: 0, trangThai: "chuaBatDau", vongDoi: "giao", uuTien: "Trung bình", ketQuaCanDat: "CSDL hợp chất", giaoViec: [] } ] }
      ] },

    { ma: "6", code: "ND6", loai: "nc", ten: "Xây dựng hồ sơ tiêu chuẩn các cây được chọn", han: "2027-07", tienDo: 0, trangThai: "chuaBatDau", phuTrach: "TS. Vũ Văn Tuấn · TS. Nguyễn Ngọc Hiếu · Khánh Mai",
      mucTieu: "Hoàn thiện hồ sơ tiêu chuẩn (định tính, định lượng marker, chỉ tiêu) cho các cây được chọn.",
      hoatDong: [
        { ma: "6.1", ten: "Thu mẫu chuẩn + xây bộ chỉ tiêu", ketQua: "Mẫu chuẩn + bộ chỉ tiêu chất lượng",
          congViec: [ { ma: "6.1.1", ten: "Thu mẫu chuẩn + xây bộ chỉ tiêu định tính/định lượng", chuTri: "TS. Vũ Văn Tuấn", hoTro: ["Khánh Mai"], batDau: "2026-11", deadline: "2027-03", tienDo: 0, trangThai: "chuaBatDau", vongDoi: "giao", uuTien: "Trung bình", ketQuaCanDat: "Bộ chỉ tiêu + mẫu chuẩn", giaoViec: [] } ] },
        { ma: "6.2", ten: "Định lượng marker + hoàn thiện hồ sơ", ketQua: "Hồ sơ tiêu chuẩn cơ sở (TCCS)",
          congViec: [ { ma: "6.2.1", ten: "Định lượng marker + soạn TCCS", chuTri: "TS. Vũ Văn Tuấn", hoTro: ["TS. Nguyễn Ngọc Hiếu", "Khánh Mai"], batDau: "2027-03", deadline: "2027-07", tienDo: 0, trangThai: "chuaBatDau", vongDoi: "giao", uuTien: "Trung bình", ketQuaCanDat: "Hồ sơ TCCS hoàn chỉnh", giaoViec: [] } ] }
      ] },

    { ma: "7", code: "Công bố", loai: "cb", ten: "Công bố khoa học (bài báo + hội thảo)", han: "2027-06", tienDo: 15, trangThai: "dangLam", phuTrach: "TS. Phạm Hà Thanh Tùng",
      mucTieu: "01 ISI + 01 quốc tế uy tín + 02 quốc gia uy tín + 02 báo cáo hội nghị (YCCS).",
      hoatDong: [
        { ma: "7.1", ten: "Bài quốc tế uy tín — JEP (ND1+ND2)", ketQua: "Bản thảo submit Journal of Ethnopharmacology",
          congViec: [ { ma: "7.1.1", ten: "Hoàn thành & nộp bài JEP", loai: "cb", tapChi: "Journal of Ethnopharmacology", capDo: "Quốc tế uy tín (SCIE, Q1)", quy: "Q3/2026", chuTri: "TS. Phạm Hà Thanh Tùng", hoTro: ["TS. Nguyễn Thu Hằng"], batDau: "2026-07", deadline: "2026-09", tienDo: 45, trangThai: "dangLam", vongDoi: "dangLam", uuTien: "Cao", ketQuaCanDat: "Bản thảo submit JEP Q3/2026 (artifact: _NAFOSTED.OS/.ai-review/MANIFEST.md)",
            giaoViec: [ { ma: "7.1.1.1", ten: "Viết Results + Discussion", nguoiNhan: "TS. Phạm Hà Thanh Tùng", deadline: "2026-08", tienDo: 70, xong: false },
                        { ma: "7.1.1.2", ten: "Hoàn thiện + submit", nguoiNhan: "TS. Phạm Hà Thanh Tùng", deadline: "2026-09", tienDo: 20, xong: false },
                        { ma: "7.1.1.3", ten: "Dựng Bảng/Hình + Supplementary S1 + tra cứu PubMed 138 taxon + xuất DOCX (loop AI-review)", nguoiNhan: "TS. Phạm Hà Thanh Tùng", deadline: "2026-08", tienDo: 60, xong: false } ] } ] },
        { ma: "7.2", ten: "Bài ISI uy tín (ND4+ND5)", ketQua: "Bản thảo submit ISI",
          congViec: [ { ma: "7.2.1", ten: "Tổng hợp ND4+ND5 → bản thảo ISI", loai: "cb", tapChi: "(chưa chốt)", capDo: "ISI uy tín", quy: "Q4/2026–Q1/2027", chuTri: "TS. Nguyễn Ngọc Hiếu", hoTro: ["TS. Phạm Hà Thanh Tùng"], batDau: "2026-11", deadline: "2027-02", tienDo: 0, trangThai: "chuaBatDau", vongDoi: "giao", uuTien: "Cao", ketQuaCanDat: "Bản thảo ISI submit", giaoViec: [] } ] },
        { ma: "7.3", ten: "Tạp chí quốc gia uy tín (×2)", ketQua: "02 bản thảo quốc gia submit",
          congViec: [ { ma: "7.3.1", ten: "Quốc gia #1 (ND1–ND3)", loai: "cb", tapChi: "(chưa chốt)", capDo: "Quốc gia uy tín", quy: "Q4/2026", chuTri: "TS. Phạm Hà Thanh Tùng", hoTro: [], batDau: "2026-10", deadline: "2026-12", tienDo: 0, trangThai: "chuaBatDau", vongDoi: "giao", uuTien: "Trung bình", ketQuaCanDat: "Bản thảo QG #1", giaoViec: [] },
                       { ma: "7.3.2", ten: "Quốc gia #2 (ND4/ND5)", loai: "cb", tapChi: "(chưa chốt)", capDo: "Quốc gia uy tín", quy: "Q2/2027", chuTri: "TS. Phạm Hà Thanh Tùng", hoTro: [], batDau: "2027-01", deadline: "2027-06", tienDo: 0, trangThai: "chuaBatDau", vongDoi: "giao", uuTien: "Trung bình", ketQuaCanDat: "Bản thảo QG #2", giaoViec: [] } ] },
        { ma: "7.4", ten: "Báo cáo hội thảo/hội nghị (×2)", ketQua: "02 báo cáo hội nghị",
          congViec: [ { ma: "7.4.1", ten: "Hội thảo #1 (ND1–ND3)", loai: "ht", tapChi: "(chưa chốt hội nghị)", capDo: "Hội nghị quốc tế/quốc gia", quy: "Q3–Q4/2026", chuTri: "TS. Phạm Hà Thanh Tùng", hoTro: [], batDau: "2026-08", deadline: "2026-10", tienDo: 0, trangThai: "chuaBatDau", vongDoi: "giao", uuTien: "Trung bình", ketQuaCanDat: "Abstract + đăng ký", giaoViec: [] },
                       { ma: "7.4.2", ten: "Hội thảo #2 (ND4/ND5)", loai: "ht", tapChi: "(chưa chốt hội nghị)", capDo: "Hội nghị quốc tế/quốc gia", quy: "Q2/2027", chuTri: "TS. Phạm Hà Thanh Tùng", hoTro: [], batDau: "2027-04", deadline: "2027-06", tienDo: 0, trangThai: "chuaBatDau", vongDoi: "giao", uuTien: "Trung bình", ketQuaCanDat: "Báo cáo hội nghị", giaoViec: [] } ] }
      ] },

    { ma: "8", code: "Đào tạo", loai: "dt", ten: "Đào tạo sau đại học (02 học viên cao học)", han: "2027-06", tienDo: 40, trangThai: "dangLam", phuTrach: "TS. Phạm Hà Thanh Tùng (GVHD)",
      mucTieu: "02 học viên cao học (YCCS): Quỳnh + Trà My.",
      hoatDong: [
        { ma: "8.1", ten: "HV Phạm Thị Xuân Quỳnh — Củ dòm metabolomics", ketQua: "Luận văn bảo vệ đạt",
          congViec: [ { ma: "8.1.1", ten: "Hoàn thiện + bảo vệ luận văn ThS Quỳnh", loai: "dt", chuTri: "HV Phạm Thị Xuân Quỳnh", hoTro: ["TS. Phạm Hà Thanh Tùng"], batDau: "2026-06", deadline: "2027-03", tienDo: 55, trangThai: "dangLam", vongDoi: "dangLam", uuTien: "Trung bình", ketQuaCanDat: "Luận văn bảo vệ đạt", giaoViec: [] } ] },
        { ma: "8.2", ten: "HV Bùi Trà My — cao chuẩn hóa Củ dòm + AChE", ketQua: "PP HPLC thẩm định + cao chuẩn hóa + TCCS",
          congViec: [ { ma: "8.2.1", ten: "Thẩm định HPLC oxostephanin + tối ưu chiết/làm giàu (D101)", loai: "dt", chuTri: "HV Bùi Trà My", hoTro: ["TS. Phạm Hà Thanh Tùng"], batDau: "2025-01", deadline: "2026-10", tienDo: 25, trangThai: "dangLam", vongDoi: "dangLam", uuTien: "Cao", ketQuaCanDat: "PP HPLC thẩm định + cao chuẩn hóa",
            giaoViec: [ { ma: "8.2.1.1", ten: "Xây + thẩm định PP HPLC định lượng oxostephanin", nguoiNhan: "HV Bùi Trà My", deadline: "2026-08", tienDo: 35, xong: false },
                        { ma: "8.2.1.2", ten: "Tối ưu quy trình chiết/làm giàu nhựa D101", nguoiNhan: "HV Bùi Trà My", deadline: "2026-10", tienDo: 15, xong: false } ] } ] }
      ] },

    { ma: "9", code: "Tài chính & QL", loai: "tc", ten: "Tài chính & Quản lý đề tài", han: "2027-08", tienDo: 55, trangThai: "dangLam", phuTrach: "TS. Phạm Hà Thanh Tùng",
      mucTieu: "Giải ngân khoán từng phần đúng tiến độ; quyết toán & nghiệm thu đề tài 2027.",
      hoatDong: [
        { ma: "9.1", ten: "Giải ngân & quyết toán theo năm", ketQua: "Hồ sơ giải ngân/quyết toán N1–N3",
          congViec: [ { ma: "9.1.1", ten: "Tạm ứng N1 + chỉ định thầu hóa chất (Minh Việt–3B6)", loai: "tc", chuTri: "TS. Phạm Hà Thanh Tùng", hoTro: [], batDau: "2025-04", deadline: "2025-08", tienDo: 100, trangThai: "xong", vongDoi: "nghiemThu", uuTien: "Trung bình", ketQuaCanDat: "Tạm ứng + thầu hoàn tất", giaoViec: [] },
                       { ma: "9.1.2", ten: "Quyết toán tài chính Năm 1", loai: "tc", chuTri: "TS. Phạm Hà Thanh Tùng", hoTro: [], batDau: "2025-08", deadline: "2025-10", tienDo: 100, trangThai: "xong", vongDoi: "nghiemThu", uuTien: "Trung bình", ketQuaCanDat: "Quyết toán N1 duyệt", giaoViec: [] },
                       { ma: "9.1.3", ten: "Báo cáo tài chính & quyết toán Năm 2", loai: "tc", chuTri: "TS. Phạm Hà Thanh Tùng", hoTro: [], batDau: "2026-05", deadline: "2026-09", tienDo: 60, trangThai: "dangLam", vongDoi: "dangLam", uuTien: "Trung bình", ketQuaCanDat: "Quyết toán N2 nộp Quỹ",
                         giaoViec: [ { ma: "9.1.3.1", ten: "Tập hợp chứng từ + lập báo cáo tài chính N2", nguoiNhan: "TS. Phạm Hà Thanh Tùng", deadline: "2026-09", tienDo: 60, xong: false } ] },
                       { ma: "9.1.4", ten: "Tạm ứng N3 + mua sắm NVL bổ sung", loai: "tc", chuTri: "TS. Phạm Hà Thanh Tùng", hoTro: [], batDau: "2026-09", deadline: "2026-12", tienDo: 0, trangThai: "chuaBatDau", vongDoi: "giao", uuTien: "Trung bình", ketQuaCanDat: "Tạm ứng N3 + NVL", giaoViec: [] } ] },
        { ma: "9.2", ten: "Nghiệm thu đề tài 2027", ketQua: "Hồ sơ nghiệm thu + quyết toán cuối",
          congViec: [ { ma: "9.2.1", ten: "Quyết toán cuối + hồ sơ tài chính nghiệm thu", loai: "tc", chuTri: "TS. Phạm Hà Thanh Tùng", hoTro: ["Khánh Linh"], batDau: "2027-06", deadline: "2027-08", tienDo: 0, trangThai: "chuaBatDau", vongDoi: "giao", uuTien: "Cao", ketQuaCanDat: "Hồ sơ tài chính nghiệm thu", giaoViec: [] },
                       { ma: "9.2.2", ten: "Tổng hợp báo cáo tổng kết + hồ sơ nghiệm thu đề tài", loai: "ql", chuTri: "TS. Phạm Hà Thanh Tùng", hoTro: ["Khánh Linh"], batDau: "2027-06", deadline: "2027-08", tienDo: 0, trangThai: "chuaBatDau", vongDoi: "giao", uuTien: "Cao", ketQuaCanDat: "Bộ hồ sơ nghiệm thu nộp Quỹ", giaoViec: [] } ] }
      ] }
  ],

  /* ---- Nhật ký cập nhật (append đầu mảng) ---- */
  nhatKy: [
    { ngay: "2026-06-30", noiDung: "Loop AI-review đưa bản thảo JEP (ND1+ND2, mục 7.1.1) đạt 12/12 tiêu chí cấu trúc: IMRAD + 4 hình thật + Bảng 2 megatable 12 cột (điền tên giám định + voucher + IC₅₀ Sa Pa thật; sửa Đìa ùi=Alyxia balansae, Huyết đằng=Spatholobus sp.) + Supplementary S1 (PubMed 138 taxon) + 44 TLTK + so sánh Yao/Mien + bàn luận chi Stephania/alkaloid + định hướng bảo tồn qua phát triển. Xuất DOCX (megatable khổ ngang, vá lỗi footnote). Còn 27 ⏳ chờ số liệu lab/HC. Sổ artifact: _NAFOSTED.OS/.ai-review/MANIFEST.md." },
    { ngay: "2026-06-30", noiDung: "CẬP NHẬT GIAO DIỆN — áp phương án thiết kế 'B · Đường nét' (từ Claude design): chỉ thay khối <style> (bảng màu mới, shadow/ring/rad, tiêu đề khối dạng dải nền surface + thanh cam, nav bo góc, hover thẻ, focus ring nhất quán, scrollbar). GIỮ NGUYÊN 100% nội dung + JS đã làm (dual-scope Hành chính, ngày giao, badge đỏ, dual renderGS, toYMD, nowD địa phương). Sao lưu: NAFOSTED-PROGRESS.backup-pre-styleB.html." },
    { ngay: "2026-06-30", noiDung: "GIAO VIỆC CHO NHÓM HÀNH CHÍNH (song song Chuyên môn): engine giao việc nay 2 phạm vi theo loai công việc — Chuyên môn (nc/cb/dt: ND1–6, Công bố, Đào tạo) · Hành chính (tc/ql: Tài chính & QL mục 9). Thêm 2 tab '📋 Giao việc' + '👤 Tiến độ cá nhân' trong nhóm Hành chính (đủ tạo phiếu, giám sát tuần, chờ duyệt, theo dõi cá nhân, đã hoàn thành — lọc riêng theo phạm vi). Bổ sung trường NGÀY GIAO VIỆC (mặc định hôm nay) + deadline (auto-fill từ WBS, chuẩn hóa YYYY-MM-DD) — hiện trên thẻ + phiếu in + xuất JSON. Thêm BADGE SỐ ĐỎ trên nút nhóm Chuyên môn/Hành chính = số công việc chậm tiến độ cần thúc đẩy (quá hạn / chậm kỳ vọng >15%). Sửa nowD dùng ngày địa phương." },
    { ngay: "2026-06-29", noiDung: "Tab Tiến độ cá nhân — SẮP XẾP LẠI: bộ lọc cá nhân (chọn người + view + chip thời hạn) đưa LÊN TRÊN CÙNG; tiếp đến banner tuần → '⚠️ Cần khẩn trương — công việc chậm tiến độ' → chờ duyệt → '📋 Công việc đang trong tiến độ' → lịch tuần (thu gọn). Luồng đọc: lọc → việc chậm → việc đang chạy." },
    { ngay: "2026-06-29", noiDung: "Tab Tiến độ cá nhân — GIÁM SÁT TUẦN LỌC THEO NGƯỜI: khối 'Cần khẩn trương' + banner đếm + lịch tuần nay đồng bộ với bộ lọc người ở 'Theo dõi công việc'. 'Mọi người' → toàn cảnh; chọn 1 cá nhân → chỉ cảnh báo chậm tiến độ của người đó (việc họ chủ trì/hỗ trợ/nhận giao việc), banner đếm lại theo người, sub ghi '👤 lọc theo <tên>'." },
    { ngay: "2026-06-29", noiDung: "TÁCH TAB: 'Giao việc' nay CHỈ để tạo & giao phiếu (panel mở sẵn). Thêm tab mới '👤 Tiến độ cá nhân' gom toàn bộ phần theo dõi/đánh giá: giám sát tuần + cần khẩn trương + lịch tuần · chờ CNĐT duyệt · theo dõi công việc theo cá nhân (Theo người/Theo hoạt động) · đã hoàn thành · cấu hình nộp báo cáo Raw. Hết trùng lặp đánh giá kết quả giữa 2 tab; sau khi giao việc có dẫn link sang tab mới." },
    { ngay: "2026-06-29", noiDung: "RESPONSIVE đa thiết bị: rà soát + sửa hiển thị cho desktop · tablet (iPad 768/1024) · điện thoại dọc-ngang (360/375/812). Panel tạo phiếu (Người giao/nhận, Deadline/nút) xếp dọc ở phone (.fld2); bảng rộng (Tính công rollup, khoản chi, giao dịch) cuộn ngang trong khung thay vì tràn trang; thu gọn padding/cỡ chữ tab + bảng ở ≤560px; Gantt cuộn ngang trong khung. Đã verify 0 tràn ngang ở mọi tab × mọi kích thước." },
    { ngay: "2026-06-29", noiDung: "Tab Giao việc — TĂNG TƯƠNG PHẢN thẻ việc: mỗi thẻ có VIỀN TRÁI MÀU theo độ khẩn (đỏ quá hạn/trả lại · hổ phách ≤7 ngày · xanh khi 100% · navy bình thường) + đổ bóng + giãn cách + hover nhấc nhẹ; dark mode nền thẻ sáng hơn nền trang để nổi khối. Dễ phân biệt từng nhiệm vụ trong danh sách." },
    { ngay: "2026-06-29", noiDung: "Tab Giao việc — DUYỆT 2 CẤP, 2 MÀU: tiểu mục/việc khi đủ (đánh dấu xong hết tiểu mục, hoặc hệ thống chấm digest 'dat') TỰ chuyển 🟡 chờ duyệt → vào hàng chờ; CNĐT là CHỐT CUỐI duyệt từng tiểu mục (✓ Duyệt / Duyệt tất cả → 🟢) rồi duyệt công việc (nút ✅ Đạt bị KHÓA tới khi mọi tiểu mục 🟢) → 🟢 hoàn thành. % tiến độ = tỷ lệ tiểu mục đã duyệt; bỏ chữ 'AI' khỏi nhãn (✅ Đạt / ↩ Chưa đạt). Phiếu in + xuất JSON phản ánh 3 trạng thái tiểu mục." },
    { ngay: "2026-06-29", noiDung: "Tab Giao việc — VÒNG LẶP BÁO CÁO (Phương án 1, offline-first): mỗi thẻ việc thêm nút '📤 Nộp báo cáo' → copy tên chuẩn 'mã - tên việc' + mở thư mục Raw (00 RAW-NAFOSTED/Báo cáo giao việc/, link cấu hình trên tab) để thả file. Bộ não AI quét Raw, chấm 'Đạt/Chưa đạt' ghi ra nafosted-digest.js → verdict 🧠 hiện trên thẻ việc + thẻ chờ duyệt (AI đề xuất, CNĐT quyết). Đặc tả: _NAFOSTED.OS/AI_DIGEST_GIAO_VIEC.md. Khung Phương án 2 (upload thật qua /api/upload khi deploy Vercel) đã sẵn — tự nhận biết hosted." },
    { ngay: "2026-06-29", noiDung: "Tab Giao việc: mỗi việc được giao thêm CHECKLIST TIỂU MỤC do CNĐT tự nhập (Enter để thêm, ✕ để xóa); nguyên tắc hoàn thành hết tiểu mục = đủ điều kiện nộp (chặn nút 'Gửi nộp' tới khi đủ). % tiến độ TỰ TÍNH từ tỷ lệ tiểu mục đã xong (ô % thành chỉ-đọc). Việc không cần chia nhỏ: tích 'Không cần chia tiểu mục' → hoàn thành việc là đủ. Tiểu mục in trong phiếu + xuất kèm hồ sơ JSON chính thức. Chuẩn hóa tên đầy đủ mọi nhân sự; gộp tab Giám sát tuần vào đầu tab Giao việc; lọc cố vấn/kế toán khỏi dropdown giao việc." },
    { ngay: "2026-06-29", noiDung: "Bổ sung phương án đồng bộ công qua VERCEL + Drive API: dashboard tự nhận biết chạy hosted (https) → đọc/ghi công qua /api/cong (đăng nhập Google, realtime, ghi nhận người sửa) thay localStorage/Apps Script. Khung web-progress thêm lib getCong/saveCong, app/api/cong, NAFOSTED_FOLDER_ID, script sync-dashboard → public/. MỘT dashboard chạy cả file:// (offline) lẫn Vercel." },
    { ngay: "2026-06-29", noiDung: "Đồng bộ tự động tab Tính công qua Google Apps Script Web App: dashboard POST chỉnh sửa công → Apps Script ghi nafosted-cong-thucte.json + sidecar .js vào thư mục Nafosted (Drive sync về mọi máy); dashboard nạp sidecar khi mở để đọc đa thiết bị (né CORS file://). Cấu hình URL Web App ngay trên tab; chưa cấu hình thì giữ localStorage + xuất tay." },
    { ngay: "2026-06-29", noiDung: "Thêm tab '💰 Tính công': nạp công kế hoạch theo phân bổ M2 (congKeHoach theo mã công việc); cho phép SỬA công thực tế + THÊM người trên từng công việc (lưu localStorage, nút Xuất JSON để hợp nhất HITL); tổng hợp công theo người (kế hoạch vs thực tế) + ước tính khoán = tỷ trọng công thực tế × 737.000.000 đ — căn cứ thanh toán khi nghiệm thu." },
    { ngay: "2026-06-29", noiDung: "Thêm tab '📅 Giám sát tuần': banner tuần triển khai (tuần n/tổng) + đếm ngược nghiệm thu; khối '⚠️ Cần khẩn trương' HIGHLIGHT công việc chậm tiến độ (quá hạn đỏ / chậm kỳ vọng cam) kèm GV còn lại để đẩy nhanh; lịch công việc theo tuần (quá hạn · tuần này · 2–4 tuần · 1–2 tháng · xa hơn) theo hạn hoàn thành." },
    { ngay: "2026-06-29", noiDung: "Tổ chức lại bảng công việc theo CÂY WBS 4 cấp: Mục tiêu n → Hoạt động n.n → Công việc n.n.n (đơn vị giám sát/báo cáo) → Giao việc GV n.n.n.n (mark theo dõi tiến độ). `wbs` thành nguồn duy nhất (9 mục tiêu: ND1–6 + Công bố + Đào tạo + Tài chính&QL); noiDung/congViec nay DERIVE từ wbs. Giám sát chạy ở cấp Công việc; GV có ô đánh dấu ✓/% trong cây + phiếu." },
    { ngay: "2026-06-29", noiDung: "Thêm tab 'Tổng quan' (thông tin chính đề tài: tên, mã số, đơn vị quản lý NAFOSTED, chủ nhiệm, cố vấn, thời gian, ngân sách, mục tiêu, nội dung–hoạt động, sản phẩm); đổi tab Tổng quan cũ → 'Triển khai'. Mỗi hoạt động của ND1–ND6 nay kèm KẾT QUẢ tương ứng (hoatDong: {ten, ketQua})." },
    { ngay: "2026-06-29", noiDung: "Refactor quản lý: GỘP 1 NGUỒN DỮ LIỆU — hợp nhất congViec + congBo + giaoViec thành một mảng congViec (19 mục CV-01→19); mọi khối/giám sát/Gantt/Công bố/Tài chính/Giao việc nay là VIEW đọc từ đây. Thêm 1 CHỦ TRÌ/việc (chuTri) + hỗ trợ (hoTro), VÒNG ĐỜI phiếu (giao→nhận→đang làm→nộp→nghiệm thu), hỗ trợ snooze cảnh báo." },
    { ngay: "2026-06-29", noiDung: "Thêm tab 'Giao việc' (6 phiếu) + checklist thủ tục giải ngân + đủ bộ 4 bài báo/2 hội thảo (trước khi gộp nguồn)." },
    { ngay: "2026-06-29", noiDung: "Bổ sung hồ sơ HV Bùi Trà My (MHV 24800103) + bộ não giám sát tiến độ tuần + thông tin thành viên theo đề cương M2." },
    { ngay: "2026-06-29", noiDung: "Khởi tạo dashboard tiến độ + nạp ND1–ND6, sản phẩm YCCS, lộ trình, nhân sự + 2 fulltime Khánh Linh & Khánh Mai." }
  ]
};
