# 💎 Jewelry Shop - E-Commerce Platform

Một nền tảng thương mại điện tử đầy đủ tính năng để bán trang sức trực tuyến. Dự án được xây dựng với **Spring Boot** (Backend) và **React** (Frontend), cung cấp trải nghiệm mua sắm hoàn chỉnh với quản lý sản phẩm, đơn hàng, thanh toán và trang admin.

> **Phiên bản:** 0.0.1-SNAPSHOT | **Java:** 21 | **Spring Boot:** 3.2.6

---

## 📑 Mục lục

1. [✨ Tính năng](#-tính-năng)
2. [🛠️ Công nghệ](#️-công-nghệ-sử-dụng)
3. [📦 Cấu trúc dự án](#-cấu-trúc-dự-án)
4. [⚙️ Yêu cầu hệ thống](#️-yêu-cầu-hệ-thống)
5. [🚀 Cài đặt và chạy](#-cài-đặt-và-chạy-dự-án)
6. [📚 API Documentation](#-api-documentation)
7. [🧪 Testing](#-testing)
8. [🐳 Docker](#-docker)
9. [📝 License](#-license)

---

## ✨ Tính năng

### 🛍️ Chức năng khách hàng
- ✅ **Đăng ký & Đăng nhập:** Xác thực an toàn với JWT, đăng nhập qua email
- ✅ **Duyệt sản phẩm:** Xem danh sách sản phẩm, lọc theo danh mục, tìm kiếm
- ✅ **Chi tiết sản phẩm:** Xem ảnh, mô tả, giá, đánh giá và nhận xét
- ✅ **Giỏ hàng:** Thêm, sửa, xóa sản phẩm, tính toán tổng tiền
- ✅ **Đặt hàng:** Tạo đơn hàng, chọn địa chỉ giao hàng
- ✅ **Thanh toán:** Tích hợp VNPAY để thanh toán trực tuyến
- ✅ **Lịch sử đơn hàng:** Xem trạng thái, chi tiết đơn hàng
- ✅ **Danh sách yêu thích:** Lưu sản phẩm yêu thích

### 👨‍💼 Chức năng quản trị viên
- ✅ **Quản lý sản phẩm:** CRUD sản phẩm, tải ảnh, quản lý kho
- ✅ **Quản lý danh mục:** Tạo, sửa, xóa danh mục sản phẩm
- ✅ **Quản lý đơn hàng:** Xem, cập nhật trạng thái đơn hàng
- ✅ **Quản lý khuyến mại:** Tạo mã giảm giá, khuyến mại
- ✅ **Dashboard thống kê:** Xem doanh thu, số đơn hàng, sản phẩm bán chạy
- ✅ **Quản lý người dùng:** Xem danh sách, quản lý quyền hạn
- ✅ **Xuất báo cáo:** Xuất dữ liệu ra Excel

### ⚡ Tính năng khác
- ✅ **Hình ảnh sản phẩm:** Tải lên, lưu trữ, phục vụ hình ảnh
- ✅ **API Documentation:** Swagger UI cho dễ dàng test API
- ✅ **Ghi nhật ký:** Logging chi tiết cho debugging
- ✅ **Quản lý lỗi:** Xử lý exception toàn cục
- ✅ **CORS:** Hỗ trợ cross-origin requests

---

## 🛠️ Công nghệ sử dụng

### Backend
| Công nghệ | Phiên bản | Mục đích |
|-----------|---------|---------|
| **Java** | 21 | Ngôn ngữ lập trình |
| **Spring Boot** | 3.2.6 | Framework chính |
| **Spring Security** | 6.x | Xác thực & phân quyền |
| **Spring Data JPA** | 3.2.x | ORM, truy vấn database |
| **Spring HATEOAS** | 3.x | RESTful links |
| **JWT (JJWT)** | 0.11.5 | Token-based authentication |
| **MySQL** | 8.0+ | Cơ sở dữ liệu |
| **Maven** | 3.9+ | Build tool |
| **Swagger/OpenAPI** | 2.5.0 | API documentation |

### Frontend
| Công nghệ | Mục đích |
|-----------|---------|
| **React** | JavaScript library |
| **React Bootstrap** | UI components |
| **Axios** | HTTP client |
| **React Router** | Navigation |
| **React Icons** | Icons |
| **React Toastify** | Notifications |
| **i18n** | Đa ngôn ngữ (tiếng Việt/Anh) |

### DevOps & Testing
| Công nghệ | Mục đích |
|-----------|---------|
| **Docker** | Container hóa ứng dụng |
| **JUnit 5** | Unit testing |
| **Mockito** | Mocking trong tests |
| **JaCoCo** | Code coverage report |

---

## 📦 Cấu trúc dự án

```
jewelry-shop/
├── jewelery-shop-backend/          # Backend Spring Boot
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/jeweleryshop/backend/
│   │   │   │   ├── controller/        # REST Controllers
│   │   │   │   ├── service/          # Business logic
│   │   │   │   ├── repository/       # Data access
│   │   │   │   ├── entity/           # JPA entities
│   │   │   │   ├── dto/              # Data Transfer Objects
│   │   │   │   ├── security/         # Security config & JWT
│   │   │   │   ├── exception/        # Custom exceptions
│   │   │   │   ├── config/           # Application config
│   │   │   │   ├── utils/            # Utility classes
│   │   │   │   ├── payload/          # Request/Response payloads
│   │   │   │   └── mapper/           # DTO mappers
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/java/               # Unit tests
│   ├── pom.xml                      # Maven dependencies
│   ├── Dockerfile                   # Docker configuration
│   └── mvnw                         # Maven wrapper
│
├── react-shop/                      # Frontend React
│   ├── src/
│   │   ├── components/              # React components
│   │   ├── pages/                   # Page components
│   │   ├── services/                # API services
│   │   ├── context/                 # Context API
│   │   ├── api/                     # API configuration
│   │   ├── utils/                   # Utilities
│   │   ├── locales/                 # i18n translations
│   │   └── App.js
│   ├── public/
│   └── package.json
│
├── database_setup.sql               # Database initialization
├── package.json                     # Root package.json
└── README.md                        # This file
```

---

## ⚙️ Yêu cầu hệ thống

### Bắt buộc
- **Java:** JDK 21 trở lên
- **Maven:** 3.9.0 trở lên (hoặc sử dụng Maven wrapper)
- **Node.js:** 16.0.0 trở lên
- **npm:** 7.0.0 trở lên
- **MySQL:** 8.0 trở lên
- **Docker:** (tùy chọn, cho triển khai container)

### Kiểm tra phiên bản
```bash
# Java
java -version

# Maven
mvn -version

# Node.js & npm
node -v
npm -v

# MySQL (nếu có)
mysql --version
```

---

## 🚀 Cài đặt và chạy dự án

### 📋 Step 1: Clone Repository

```bash
git clone https://github.com/ngannguyen03/jewelry-shop.git
cd jewelry-shop
```

### 🗄️ Step 2: Cài đặt & Cấu hình Database

#### 2.1 Tạo Database

```sql
-- Tạo database mới
CREATE DATABASE IF NOT EXISTS jewelry_shop_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE jewelry_shop_db;
```

#### 2.2 Khởi tạo dữ liệu

```bash
# Import dữ liệu mẫu từ file SQL
mysql -u root -p jewelry_shop_db < database_setup.sql
```

#### 2.3 Cấu hình kết nối (Backend)

Mở file `jewelery-shop-backend/src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/jewelry_shop_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# JWT Secret (nên thay đổi cho production)
app.jwt.secret=your-super-secret-key-that-is-long-and-secure-at-least-64-characters
app.jwt.expiration=900000
app.jwt.refresh-token.expiration=604800000

# File Upload
app.upload.dir=./uploads/

# VNPAY Payment Gateway
vnpay.url=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
vnpay.return_url=http://localhost:8080/api/payment/vnpay-return
vnpay.tmn_code=YOUR_TMN_CODE
```

### 🔧 Step 3: Cài đặt Backend

```bash
cd jewelery-shop-backend

# Trên Windows (PowerShell/CMD)
mvnw clean install

# Hoặc trên macOS/Linux
./mvnw clean install
```

### 🌐 Step 4: Cài đặt Frontend

```bash
cd react-shop

# Cài đặt dependencies
npm install

# Tạo file .env nếu cần
echo "REACT_APP_API_URL=http://localhost:8080/api" > .env
```

### 🚀 Step 5: Chạy ứng dụng

#### **Chạy Backend**

```bash
cd jewelery-shop-backend

# Windows (PowerShell/CMD)
mvnw spring-boot:run

# macOS/Linux
./mvnw spring-boot:run
```

Backend sẽ chạy tại: **http://localhost:8080**

#### **Chạy Frontend**

Mở terminal mới:

```bash
cd react-shop

npm start
```

Frontend sẽ chạy tại: **http://localhost:3000**

---

## 📚 API Documentation

### 🔐 Xác thực & Phân quyền

API sử dụng **JWT Bearer Token**. Để truy cập các endpoint bảo vệ, thêm header:

```
Authorization: Bearer <your_jwt_token>
```

### 👤 Quyền truy cập

- **Public:** Không cần token
- **User:** Cần token của user đã đăng nhập
- **Admin:** Cần token của admin

---

### 🔐 Authentication (Xác thực)

#### Register - Đăng ký tài khoản

```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "0901234567"
}
```

#### Login - Đăng nhập

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Refresh Token - Làm mới token

```
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<refresh_token>"
}
```

#### Logout - Đăng xuất

```
POST /api/auth/logout
Authorization: Bearer <your_jwt_token>
```

---

### 📂 Categories (Danh mục)

#### Lấy tất cả danh mục - PUBLIC

```
GET /api/categories
```

#### Lấy chi tiết danh mục - PUBLIC

```
GET /api/categories/{id}
```

#### Tạo danh mục - ADMIN

```
POST /api/categories
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Dây chuyền",
  "description": "Các loại dây chuyền",
  "image": "necklace.jpg"
}
```

#### Cập nhật danh mục - ADMIN

```
PUT /api/categories/{id}
Authorization: Bearer <admin_token>
```

#### Xóa danh mục - ADMIN

```
DELETE /api/categories/{id}
Authorization: Bearer <admin_token>
```

---

### 🛍️ Products (Sản phẩm)

#### Lấy danh sách sản phẩm - PUBLIC

```
GET /api/products?page=0&size=10&category=1&search=vàng&sort=name,asc
```

**Query Parameters:**
- `page`: Trang (mặc định: 0)
- `size`: Số sản phẩm trên trang
- `category`: Lọc theo ID danh mục
- `search`: Tìm kiếm theo tên
- `sort`: Sắp xếp (ví dụ: price,desc)

#### Lấy chi tiết sản phẩm - PUBLIC

```
GET /api/products/{id}
```

#### Tạo sản phẩm - ADMIN

```
POST /api/products
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

{
  "name": "Nhẫn vàng 18K",
  "description": "Mô tả sản phẩm",
  "price": 5000000,
  "quantity": 50,
  "categoryId": 1,
  "images": [file1, file2]
}
```

#### Cập nhật sản phẩm - ADMIN

```
PUT /api/products/{id}
Authorization: Bearer <admin_token>
```

#### Xóa sản phẩm - ADMIN

```
DELETE /api/products/{id}
Authorization: Bearer <admin_token>
```

---

### 🛒 Cart (Giỏ hàng)

#### Lấy giỏ hàng - USER

```
GET /api/cart
Authorization: Bearer <user_token>
```

#### Thêm sản phẩm vào giỏ - USER

```
POST /api/cart/add
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "productId": 1,
  "quantity": 2
}
```

#### Cập nhật số lượng - USER

```
PUT /api/cart/update/{itemId}
Authorization: Bearer <user_token>
```

#### Xóa sản phẩm khỏi giỏ - USER

```
DELETE /api/cart/remove/{itemId}
Authorization: Bearer <user_token>
```

#### Xóa toàn bộ giỏ hàng - USER

```
DELETE /api/cart/clear
Authorization: Bearer <user_token>
```

---

### 📦 Orders (Đơn hàng)

#### Lấy danh sách đơn hàng - USER/ADMIN

```
GET /api/orders?page=0&size=10&status=PENDING
Authorization: Bearer <token>
```

#### Lấy chi tiết đơn hàng - USER/ADMIN

```
GET /api/orders/{id}
Authorization: Bearer <token>
```

#### Tạo đơn hàng - USER

```
POST /api/orders/create
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "shippingAddressId": 1,
  "paymentMethod": "VNPAY",
  "note": "Giao trong giờ hành chính"
}
```

#### Cập nhật trạng thái - ADMIN

```
PUT /api/orders/{id}/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "SHIPPED"
}
```

---

### 💳 Payment (Thanh toán)

#### Tạo URL thanh toán VNPAY - USER

```
POST /api/payment/create-payment
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "orderId": 1,
  "amount": 10000000,
  "bankCode": "NCB"
}
```

#### Callback VNPAY

```
GET /api/payment/vnpay-return?vnp_ResponseCode=00&vnp_TxnId=...
```

---

### 👤 User Profile (Hồ sơ người dùng)

#### Lấy thông tin cá nhân - USER

```
GET /api/users/profile
Authorization: Bearer <user_token>
```

#### Cập nhật thông tin - USER

```
PUT /api/users/profile
Authorization: Bearer <user_token>
```

#### Thay đổi mật khẩu - USER

```
POST /api/users/change-password
Authorization: Bearer <user_token>
```

---

### 📍 Address (Địa chỉ)

#### Lấy danh sách địa chỉ - USER

```
GET /api/addresses
Authorization: Bearer <user_token>
```

#### Tạo địa chỉ mới - USER

```
POST /api/addresses
Authorization: Bearer <user_token>
```

#### Cập nhật địa chỉ - USER

```
PUT /api/addresses/{id}
Authorization: Bearer <user_token>
```

#### Xóa địa chỉ - USER

```
DELETE /api/addresses/{id}
Authorization: Bearer <user_token>
```

---

### ⭐ Reviews (Đánh giá & Bình luận)

#### Lấy đánh giá - PUBLIC

```
GET /api/reviews/product/{productId}?page=0&size=10
```

#### Tạo đánh giá - USER

```
POST /api/reviews
Authorization: Bearer <user_token>
```

#### Cập nhật đánh giá - USER

```
PUT /api/reviews/{id}
Authorization: Bearer <user_token>
```

#### Xóa đánh giá - USER

```
DELETE /api/reviews/{id}
Authorization: Bearer <user_token>
```

---

### 📊 Dashboard (Thống kê Admin)

#### Lấy thống kê - ADMIN

```
GET /api/dashboard/stats
Authorization: Bearer <admin_token>
```

#### Lấy doanh thu theo ngày - ADMIN

```
GET /api/dashboard/revenue?from=2025-01-01&to=2025-01-31
Authorization: Bearer <admin_token>
```

#### Sản phẩm bán chạy - ADMIN

```
GET /api/dashboard/products/bestsellers
Authorization: Bearer <admin_token>
```

---

### 📄 Swagger/OpenAPI

Truy cập tài liệu API tương tác:

```
http://localhost:8080/swagger-ui.html
```

hoặc

```
http://localhost:8080/v3/api-docs
```

---

## 🧪 Testing

### Chạy Unit Tests

```bash
cd jewelery-shop-backend

# Windows
mvnw clean test

# macOS/Linux
./mvnw clean test
```

### Chạy với Coverage Report

```bash
# Windows
mvnw clean test jacoco:report

# macOS/Linux
./mvnw clean test jacoco:report
```

### Xem báo cáo

- **Test Report:** `jewelery-shop-backend/target/surefire-reports/`
- **Coverage Report:** `jewelery-shop-backend/target/site/jacoco/index.html`

### Test Files
- `CategoryControllerTest`
- `ProductControllerTest`
- `CartServiceTest`
- `OrderServiceTest`
- `AuthServiceTest`
- `UserServiceTest`
- `DashboardServiceTest`

---

## 🐳 Docker

### Build Docker Image

```bash
cd jewelery-shop-backend
docker build -t jewelery-shop-backend:latest .
```

### Chạy Container

```bash
docker run -d \
  --name jewelery-shop-app \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://host.docker.internal:3306/jewelry_shop_db \
  -e SPRING_DATASOURCE_USERNAME=root \
  -e SPRING_DATASOURCE_PASSWORD=your_password \
  -e APP_JWT_SECRET=your-super-secret-key \
  jewelery-shop-backend:latest
```

### Docker Compose

Tạo file `docker-compose.yml` và chạy:

```bash
docker-compose up -d
```

Xem logs:

```bash
docker logs -f jewelry_backend
```

---

## 🔐 Bảo mật

### JWT Configuration

```properties
# Development
app.jwt.secret=190TtO7REwKtDrEAAQRPIOmUewCMvu7IrWroOsbi0o4

# Production - Tạo secret key mạnh
# openssl rand -base64 64
app.jwt.secret=YOUR_VERY_LONG_AND_SECURE_SECRET_KEY_MIN_64_CHARS
```

### Password Security

- Passwords được hash bằng BCrypt
- Salt rounds: 10

---

## 🛠️ Troubleshooting

### Backend không kết nối database

**Lỗi:** `SQLException: Access denied`

**Giải pháp:**
1. Kiểm tra MySQL đang chạy
2. Cập nhật credentials trong `application.properties`
3. Kiểm tra port MySQL (default: 3306)

### Frontend không kết nối API

**Lỗi:** `CORS error` hoặc `Network error`

**Giải pháp:**
1. Kiểm tra backend chạy (http://localhost:8080)
2. Cập nhật `REACT_APP_API_URL` trong `.env`
3. Clear cache browser

### Port đã được sử dụng

**Windows PowerShell:**
```powershell
Get-NetTCPConnection -LocalPort 8080
Stop-Process -Id <PID> -Force
```

**macOS/Linux:**
```bash
lsof -i :8080
kill -9 <PID>
```

---

## 📚 Tài liệu thêm

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Security](https://spring.io/projects/spring-security)
- [React Documentation](https://react.dev)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [JWT Introduction](https://jwt.io/)

---

## 👥 Đóng góp

Chúng tôi hoan nghênh các đóng góp từ cộng đồng!

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

---

## 📝 License

Dự án này được phép sử dụng theo giấy phép MIT.

---

## 📞 Liên hệ

**Tác giả:** Ngân Nguyễn

**GitHub:** [ngannguyen03](https://github.com/ngannguyen03)

**Repository:** [jewelry-shop](https://github.com/ngannguyen03/jewelry-shop)

---

## 🙏 Cảm ơn

Cảm ơn tất cả những người đã đóng góp và hỗ trợ dự án này!
