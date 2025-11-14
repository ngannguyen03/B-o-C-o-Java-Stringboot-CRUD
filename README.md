# Jewelry Shop Backend

Đây là dự án backend cho một nền tảng thương mại điện tử bán trang sức, được xây dựng bằng Spring Boot. Dự án cung cấp một bộ API RESTful hoàn chỉnh để quản lý sản phẩm, danh mục, người dùng, đơn hàng, và nhiều hơn nữa.

## ✨ Tính năng

- **Quản lý Sản phẩm & Danh mục:** Cung cấp API để thực hiện các thao tác CRUD (Tạo, Đọc, Cập nhật, Xóa) cho sản phẩm và danh mục. Cho phép tìm kiếm và lọc sản phẩm.
- **Xác thực & Phân quyền Người dùng:** Sử dụng Spring Security và JWT để quản lý việc đăng ký, đăng nhập và phân quyền truy cập (người dùng thường và quản trị viên).
- **Quản lý Giỏ hàng:** API cho phép người dùng thêm, xem, cập nhật số lượng và xóa sản phẩm khỏi giỏ hàng của họ.
- **Quản lý Đơn hàng:** Cho phép người dùng đặt hàng từ giỏ hàng và xem lịch sử đơn hàng. Quản trị viên có thể cập nhật trạng thái đơn hàng.
- **Trang quản trị (Dashboard):** Cung cấp các API thống kê (ví dụ: tổng doanh thu, số lượng đơn hàng) để phục vụ cho trang dashboard của admin.
- **Tải ảnh:** Chức năng tải lên và phục vụ ảnh cho sản phẩm, lưu trữ ảnh trên server.
- **Container hóa:** Sẵn sàng để triển khai dưới dạng một Docker container, đảm bảo tính nhất quán trên các môi trường.

## 🛠️ Công nghệ sử dụng

- **Backend:** Java 17+, Spring Boot, Spring Data JPA, Spring Security
- **Cơ sở dữ liệu:** SQL (MySQL, PostgreSQL)
- **Build & Quản lý:** Maven
- **Kiểm thử:** JUnit 5, Mockito, JaCoCo
- **Triển khai:** Docker

## 🚀 Hướng dẫn cài đặt và chạy dự án

### 1. Clone Repository

Đầu tiên, clone repository này về máy của bạn:
```bash
git clone https://github.com/ngannguyen03/B-o-C-o-Java-Stringboot-CRUD.git
cd B-o-C-o-Java-Stringboot-CRUD
```

### 2. Cài đặt Cơ sở dữ liệu

1.  Tạo một database mới trong CSDL SQL của bạn.
2.  Thực thi file `database_setup.sql` (nằm ở thư mục gốc của project) để tạo các bảng và dữ liệu mẫu.

### 3. Cấu hình ứng dụng

Mở file `jewelery-shop-backend/src/main/resources/application.properties` và cập nhật thông tin kết nối CSDL và khóa bí mật JWT.

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/your_database_name
spring.datasource.username=your_username
spring.datasource.password=your_password
jwt.secret=your-super-secret-key-that-is-long-and-secure
```

### 4. Chạy ứng dụng

**Quan trọng:** Các lệnh sau đây phải được chạy từ bên trong thư mục `jewelery-shop-backend`.

```bash
cd jewelery-shop-backend
```

- **Trên Windows (Command Prompt / PowerShell):**
  ```bash
  mvnw spring-boot:run
  ```

- **Trên macOS/Linux (hoặc Git Bash trên Windows):**
  ```bash
  ./mvnw spring-boot:run
  ```

Ứng dụng sẽ khởi động tại địa chỉ `http://localhost:8080`.

### 5. Chạy bằng Docker

Để chạy bằng Docker, bạn cần ở trong thư mục `jewelery-shop-backend`.

1.  **Build Docker image:**
    ```bash
    docker build -t jewelery-shop-backend .
    ```

2.  **Chạy Docker container:**
    ```bash
    docker run -p 8080:8080 \
      -e SPRING_DATASOURCE_URL=jdbc:mysql://your_database_host:3306/your_database_name \
      -e SPRING_DATASOURCE_USERNAME=your_username \
      -e SPRING_DATASOURCE_PASSWORD=your_password \
      -e JWT_SECRET=your-super-secret-key \
      --name jewelery-shop-app \
      jewelery-shop-backend
    ```

## 🧪 Kiểm thử (Testing)

Để chạy các bài test, hãy đảm bảo bạn đang ở trong thư mục `jewelery-shop-backend`.

- **Trên Windows:**
  ```bash
  mvnw clean test
  ```

- **Trên macOS/Linux:**
  ```bash
  ./mvnw clean test
  ```

-   Báo cáo test sẽ nằm tại `target/surefire-reports`.
-   Báo cáo độ bao phủ của mã nguồn có thể xem tại `target/site/jacoco/index.html`.

---

## 📄 Tài liệu API chi tiết

*(Lưu ý: Các endpoint có đánh dấu `(Admin)` yêu cầu quyền quản trị viên, `(User)` yêu cầu người dùng đã đăng nhập.)*

### Xác thực (Authentication)
- `POST /auth/register`: Đăng ký tài khoản người dùng mới.
- `POST /auth/login`: Đăng nhập và nhận về JWT token.

### Danh mục (Categories)
- `GET /categories`: Lấy danh sách tất cả danh mục.
- `GET /categories/{id}`: Lấy thông tin chi tiết một danh mục.
- `POST /categories`: **(Admin)** Tạo một danh mục mới.
- `PUT /categories/{id}`: **(Admin)** Cập nhật thông tin danh mục.
- `DELETE /categories/{id}`: **(Admin)** Xóa một danh mục.

### Sản phẩm (Products)
- `GET /products`: Lấy danh sách sản phẩm (hỗ trợ phân trang, lọc theo danh mục, tìm kiếm theo tên).
- `GET /products/{id}`: Lấy thông tin chi tiết một sản phẩm.
- `POST /products`: **(Admin)** Tạo một sản phẩm mới (bao gồm cả tải ảnh).
- `PUT /products/{id}`: **(Admin)** Cập nhật thông tin sản phẩm.
- `DELETE /products/{id}`: **(Admin)** Xóa một sản phẩm.

### Giỏ hàng (Cart)
- `GET /cart`: **(User)** Lấy thông tin giỏ hàng của người dùng hiện tại.
- `POST /cart/add`: **(User)** Thêm một sản phẩm vào giỏ hàng.
- `PUT /cart/update/{itemId}`: **(User)** Cập nhật số lượng của một sản phẩm trong giỏ hàng.
- `DELETE /cart/remove/{itemId}`: **(User)** Xóa một sản phẩm khỏi giỏ hàng.

### Đơn hàng (Orders)
- `GET /orders`: **(User)** Lấy lịch sử đơn hàng của người dùng. | **(Admin)** Lấy tất cả đơn hàng.
- `GET /orders/{id}`: **(User/Admin)** Lấy thông tin chi tiết một đơn hàng.
- `POST /orders/create`: **(User)** Tạo đơn hàng từ giỏ hàng hiện tại.
- `PUT /orders/{id}/status`: **(Admin)** Cập nhật trạng thái của một đơn hàng (ví dụ: đang xử lý, đã giao).

### Trang quản trị (Dashboard)
- `GET /dashboard/stats`: **(Admin)** Lấy các số liệu thống kê cho trang quản trị.