# 🚀 Giai đoạn 1: MVP – Chức năng cốt lõi

Mục tiêu: Xây dựng phiên bản đầu tiên của hệ thống quản lý học trực tuyến, tập trung vào các chức năng **must-have** cho giáo viên và học sinh.

---

## ✅ User Stories – Giai đoạn 1

### 🧾 User Story #1: Đăng ký tài khoản

**User Story**: Là người dùng mới, tôi muốn đăng ký tài khoản với vai trò học sinh hoặc giáo viên để có thể sử dụng hệ thống.

**Acceptance Criteria**:

* [x] Cho phép chọn vai trò: Học sinh / Giáo viên
* [x] Nhập họ tên, email, mật khẩu
* [x] Email không được trùng lặp
* [x] Mật khẩu tối thiểu 8 ký tự
* [x] Gửi email xác nhận sau khi đăng ký

**Priority**: High

**Story Points**: 5

**Notes/UI**: Form đăng ký đơn giản, có dropdown chọn vai trò

---

### 🔐 User Story #2: Đăng nhập hệ thống

**User Story**: Là người dùng đã đăng ký, tôi muốn đăng nhập để sử dụng các chức năng phù hợp với vai trò của mình.

**Acceptance Criteria**:

* [x] Nhập email và mật khẩu hợp lệ
* [x] Thông báo lỗi nếu thông tin không đúng
* [x] Redirect về dashboard theo vai trò (GV hoặc HS)
* [x] Duy trì đăng nhập với JWT Token

**Priority**: High

**Story Points**: 3

---

### 🏫 User Story #3: Giáo viên tạo và quản lý lớp học

**User Story**: Là giáo viên, tôi muốn tạo lớp học để có thể quản lý học sinh và giao bài tập.

**Acceptance Criteria**:

* [x] Tạo lớp học mới: tên, mô tả
* [x] Hệ thống sinh mã lớp tự động
* [x] Hiển thị danh sách lớp đã tạo
* [x] Xem danh sách học sinh tham gia lớp

**Priority**: High

**Story Points**: 5

---

### 👨‍🎓 User Story #4: Học sinh tham gia lớp học

**User Story**: Là học sinh, tôi muốn nhập mã lớp để tham gia lớp học cùng giáo viên.

**Acceptance Criteria**:

* [x] Nhập mã lớp hợp lệ
* [x] Báo lỗi nếu mã sai hoặc đã tham gia
* [x] Sau khi tham gia, lớp được hiển thị trong dashboard của học sinh

**Priority**: High

**Story Points**: 3

---

### 📂 User Story #5: Giáo viên giao bài tập

**User Story**: Là giáo viên, tôi muốn tạo bài tập với hạn nộp để học sinh có thể nộp đúng thời hạn.

**Acceptance Criteria**:

* [x] Tạo bài tập với tiêu đề, mô tả, hạn nộp
* [x] Liên kết bài tập với lớp học cụ thể
* [x] Hiển thị danh sách bài tập đã giao

**Priority**: High

**Story Points**: 5

---

### 🧑‍🎓 User Story #6: Học sinh nộp bài tập

**User Story**: Là học sinh, tôi muốn nộp bài tập bằng cách tải lên tệp tin để giáo viên có thể chấm bài.

**Acceptance Criteria**:

* [x] Chọn file để nộp (PDF, ảnh, Word,...)
* [x] Không cho phép nộp sau hạn nộp
* [x] Hiển thị trạng thái: Đã nộp / Chưa nộp

**Priority**: High

**Story Points**: 5

---

### ✅ User Story #7: Giáo viên chấm bài

**User Story**: Là giáo viên, tôi muốn chấm điểm và nhận xét bài tập để học sinh biết kết quả.

**Acceptance Criteria**:

* [x] Xem danh sách bài đã nộp
* [x] Nhập điểm số (0–10) và nhận xét
* [x] Học sinh có thể xem điểm sau khi chấm

**Priority**: High

**Story Points**: 3

---

### 📝 User Story #8: Làm bài trắc nghiệm

**User Story**: Là giáo viên, tôi muốn tạo bài kiểm tra trắc nghiệm để học sinh làm và được hệ thống chấm tự động.

**Acceptance Criteria**:

* [x] Tạo bài trắc nghiệm: câu hỏi, 4 đáp án, chọn đáp án đúng
* [x] Thiết lập thời gian làm bài
* [x] Học sinh vào làm → hiển thị kết quả cuối bài

**Priority**: Medium

**Story Points**: 8 (phức tạp hơn các story khác)

---

## 🧩 Tổng kết MVP Sprint

| Sprint   | Nội dung                    | Ưu tiên |
| -------- | --------------------------- | ------- |
| Sprint 1 | Auth, đăng ký/đăng nhập     | High    |
| Sprint 2 | Quản lý lớp, tham gia lớp   | High    |
| Sprint 3 | Giao – Nộp – Chấm bài       | High    |
| Sprint 4 | Bài trắc nghiệm + UI tuning | Medium  |

---

# 🚀 Giai đoạn 2: Chức năng nâng cao

Mục tiêu: Nâng cao trải nghiệm người dùng và tăng tính tự động hóa của hệ thống học trực tuyến.


### 📚 User Story #9: Tải lên tài liệu học tập

**User Story**: Là giáo viên, tôi muốn tải lên tài liệu PDF, Word,... để học sinh có thể đọc trước khi học.

**Acceptance Criteria**:

* [x] Upload file tài liệu (PDF, DOCX,...)
* [x] Gắn tài liệu vào lớp học cụ thể
* [x] Học sinh xem hoặc tải tài liệu từ dashboard lớp

**Priority**: Medium

**Story Points**: 3

---

### 📈 User Story #10: Theo dõi kết quả học tập

**User Story**: Là học sinh, tôi muốn xem bảng điểm và kết quả bài tập của mình để đánh giá tiến độ học tập.

**Acceptance Criteria**:

* [x] Hiển thị danh sách bài đã làm, điểm số
* [x] Hiển thị trung bình điểm theo từng lớp
* [x] Có thể xem nhận xét giáo viên nếu có

**Priority**: Medium

**Story Points**: 5

---


# 🚀 Giai đoạn 3: Chức năng nâng cao và tương tác

Mục tiêu: Tăng cường tính cộng tác, quản lý và giao tiếp trong hệ thống học trực tuyến.

---

### 🗓️ User Story #11: Xem thời khoá biểu

**User Story**: Là học sinh, tôi muốn xem lịch học theo tuần để theo dõi buổi học và bài kiểm tra.

**Acceptance Criteria**:

* [ ] Hiển thị thời khoá biểu theo tuần
* [ ] Cho biết môn học, giáo viên, thời gian
* [ ] Giao diện responsive cho mobile/tablet

**Priority**: Medium

**Story Points**: 5

---

### 🏆 User Story #12: Bảng xếp hạng học sinh

**User Story**: Là giáo viên, tôi muốn xem bảng xếp hạng học sinh theo điểm trung bình để đánh giá sự tiến bộ.

**Acceptance Criteria**:

* [ ] Tính trung bình điểm theo lớp
* [ ] Hiển thị danh sách top học sinh theo điểm
* [ ] Giao diện trực quan với biểu đồ/thứ hạng

**Priority**: Low

**Story Points**: 5

---

### 💬 User Story #13: Bình luận trong bài tập

**User Story**: Là học sinh, tôi muốn bình luận trong phần bài tập để hỏi bài hoặc trao đổi với giáo viên.

**Acceptance Criteria**:

* [ ] Cho phép comment dưới mỗi bài tập
* [ ] Giáo viên có thể trả lời bình luận
* [ ] Có thông báo khi có phản hồi mới

**Priority**: Low

**Story Points**: 3

---

# ✅ User Stories – Giai đoạn 1 (Tiếp theo: Chức năng cho Admin)

### 👑 User Story #14: Admin quản lý người dùng

**User Story**: Là admin, tôi muốn xem, tìm kiếm và quản lý danh sách tài khoản người dùng để đảm bảo hệ thống hoạt động ổn định.

**Acceptance Criteria**:

 * [ ] Hiển thị danh sách người dùng (học sinh, giáo viên)
 * [ ] Tìm kiếm theo tên, email, vai trò
 * [ ] Khoá/mở tài khoản người dùng
 * [ ] Xem thông tin chi tiết tài khoản

**Priority**: High

**Story Points**: 5

---


### ⚙️ User Story #15: Admin phân quyền người dùng

**User Story**: Là admin, tôi muốn thay đổi vai trò tài khoản (VD: từ học sinh sang giáo viên) để cập nhật đúng quyền sử dụng.

**Acceptance Criteria**:

 * [ ] Chọn người dùng từ danh sách

 * [ ] Thay đổi vai trò (Học sinh <-> Giáo viên)

 * [ ] Ghi lại lịch sử thay đổi vai trò

**Priority**: Medium

**Story Points**: 3

---

### 📊 User Story #16: Admin theo dõi thống kê hệ thống

**User Story**: Là admin, tôi muốn xem thống kê tổng quan hệ thống để theo dõi số lượng người dùng, lớp học, bài tập, hoạt động.

**Acceptance Criteria**:

 * [ ] Biểu đồ số lượng người dùng theo vai trò

 * [ ] Số lượng lớp học và bài tập đang hoạt động

 * [ ] Biểu đồ tăng trưởng người dùng theo thời gian

**Priority**: Medium

**Story Points**: 5

---

### 🚨 User Story #18: Admin giám sát hoạt động hệ thống

**User Story**: Là admin, tôi muốn theo dõi nhật ký hoạt động của người dùng để đảm bảo an toàn và phát hiện hành vi bất thường.

**Acceptance Criteria**:

 * [ ] Ghi log: đăng nhập, tạo lớp, nộp bài, chấm điểm,...

 * [ ] Hiển thị log theo ngày, người dùng

 * [ ] Tìm kiếm và lọc theo hành động cụ thể

**Priority**: Medium

**Story Points**: 5

---
