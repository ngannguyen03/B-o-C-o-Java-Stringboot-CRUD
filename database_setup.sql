-- Database: jewelry_shop_db
-- Host: localhost
-- Username: root
-- Password:

-- Tạo cơ sở dữ liệu mới nếu chưa tồn tại
CREATE DATABASE IF NOT EXISTS jewelry_shop_db;
USE jewelry_shop_db;

-- --------------------------------------------------------
-- Table structure for `roles`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `roles` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default roles
INSERT INTO `roles` (`name`) VALUES ('ROLE_USER'), ('ROLE_ADMIN');

-- --------------------------------------------------------
-- Table structure for `users`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `first_name` VARCHAR(50),
  `last_name` VARCHAR(50),
  `phone_number` VARCHAR(20),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `enabled` BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `user_roles`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_roles` (
  `user_id` BIGINT NOT NULL,
  `role_id` BIGINT NOT NULL,
  PRIMARY KEY (`user_id`, `role_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `categories`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT,
  `parent_id` BIGINT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `products`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `products` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `base_price` DECIMAL(10, 2) NOT NULL,
  `discount_price` DECIMAL(10, 2) DEFAULT NULL,
  `category_id` BIGINT NOT NULL,
  `sku_prefix` VARCHAR(50),
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `product_variants`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `product_variants` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `product_id` BIGINT NOT NULL,
  `sku` VARCHAR(100) UNIQUE NOT NULL,
  `name` VARCHAR(255),
  `material` VARCHAR(100),
  `gemstone` VARCHAR(100),
  `size` VARCHAR(50),
  `color` VARCHAR(50),
  `weight` DECIMAL(10, 2),
  `price_modifier` DECIMAL(10, 2) DEFAULT 0,
  `image_url` VARCHAR(255),
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `inventories`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `inventories` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `variant_id` BIGINT NOT NULL UNIQUE,
  `quantity` INT NOT NULL DEFAULT 0,
  `last_restock_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `low_stock_threshold` INT DEFAULT 5,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `product_images`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `product_images` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `product_id` BIGINT NOT NULL,
  `variant_id` BIGINT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  `is_main` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `addresses`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `addresses` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `phone_number` VARCHAR(20) NOT NULL,
  `street_address` VARCHAR(255) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `district` VARCHAR(100) NOT NULL,
  `ward` VARCHAR(100),
  `is_default` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `orders`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT NOT NULL,
  `order_number` VARCHAR(50) UNIQUE NOT NULL,
  `order_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `total_amount` DECIMAL(10, 2) NOT NULL,
  `shipping_fee` DECIMAL(10, 2) DEFAULT 0,
  `shipping_address_id` BIGINT NOT NULL,
  `status` ENUM('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
  `payment_method` VARCHAR(50),
  `payment_status` ENUM('PENDING', 'PAID', 'REFUNDED') DEFAULT 'PENDING',
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`shipping_address_id`) REFERENCES `addresses`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `order_details`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_details` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `order_id` BIGINT NOT NULL,
  `variant_id` BIGINT NOT NULL,
  `quantity` INT NOT NULL,
  `price_at_purchase` DECIMAL(10, 2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `transactions`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `order_id` BIGINT NOT NULL,
  `transaction_code` VARCHAR(100) NOT NULL UNIQUE,
  `amount` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'VND',
  `payment_method` VARCHAR(50),
  `status` ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
  `transaction_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `gateway_response` TEXT,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `reviews`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `variant_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `order_id` BIGINT NOT NULL,
  `rating` INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  `comment` TEXT,
  `review_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `is_approved` BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `carts`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `carts` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `cart_items`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cart_items` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `cart_id` BIGINT NOT NULL,
  `variant_id` BIGINT NOT NULL,
  `quantity` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (`cart_id`, `variant_id`),
  FOREIGN KEY (`cart_id`) REFERENCES `carts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `wishlists`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `wishlists` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT NOT NULL,
  `variant_id` BIGINT NOT NULL,
  `added_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (`user_id`, `variant_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `promotions`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `promotions` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `description` TEXT,
  `discount_type` ENUM('PERCENTAGE', 'FIXED_AMOUNT') NOT NULL,
  `discount_value` DECIMAL(10, 2) NOT NULL,
  `min_order_amount` DECIMAL(10, 2) DEFAULT NULL,
  `start_date` TIMESTAMP NOT NULL,
  `end_date` TIMESTAMP NOT NULL,
  `usage_limit` INT DEFAULT NULL,
  `per_user_limit` INT DEFAULT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `user_promotion_usage`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_promotion_usage` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT NOT NULL,
  `promotion_id` BIGINT NOT NULL,
  `usage_count` INT DEFAULT 1,
  `last_used_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (`user_id`, `promotion_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`promotion_id`) REFERENCES `promotions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `blog_categories`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `blog_categories` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `blogs`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `blogs` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `content` LONGTEXT NOT NULL,
  `thumbnail_url` VARCHAR(255),
  `author_id` BIGINT,
  `category_id` BIGINT NULL,
  `published_at` TIMESTAMP,
  `is_published` BOOLEAN DEFAULT FALSE,
  `views_count` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`category_id`) REFERENCES `blog_categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `contacts`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contacts` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `subject` VARCHAR(255),
  `message` TEXT NOT NULL,
  `sent_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `is_read` BOOLEAN DEFAULT FALSE,
  `replied_at` TIMESTAMP NULL,
  `admin_reply` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `banners`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `banners` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255),
  `subtitle` VARCHAR(255),
  `image_url` VARCHAR(255) NOT NULL,
  `target_url` VARCHAR(255),
  `order_display` INT DEFAULT 0,
  `is_active` BOOLEAN DEFAULT TRUE,
  `start_date` TIMESTAMP,
  `end_date` TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `user_activities`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_activities` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT NOT NULL,
  `activity_type` ENUM('VIEW_PRODUCT', 'ADD_TO_CART', 'PURCHASE', 'ADD_TO_WISHLIST', 'SEARCH') NOT NULL,
  `variant_id` BIGINT,
  `product_id` BIGINT,
  `search_query` VARCHAR(255),
  `activity_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for `payment_gateways`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `payment_gateways` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `api_key` VARCHAR(255),
  `secret_key` VARCHAR(255),
  `merchant_code` VARCHAR(255),
  `return_url` VARCHAR(255),
  `status` ENUM('ACTIVE', 'INACTIVE') DEFAULT 'INACTIVE',
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Indexes for better performance
-- --------------------------------------------------------
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_active ON product_variants(is_active);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_details_order ON order_details(order_id);
CREATE INDEX idx_order_details_variant ON order_details(variant_id);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_cart_items_variant ON cart_items(variant_id);
CREATE INDEX idx_wishlists_user ON wishlists(user_id);
CREATE INDEX idx_user_activities_user ON user_activities(user_id);
CREATE INDEX idx_user_activities_type ON user_activities(activity_type);

-- --------------------------------------------------------
-- Sample data for testing (ĐÃ SỬA LỖI)
-- --------------------------------------------------------

-- Thêm dữ liệu mẫu cho users
INSERT INTO `users` (`username`, `password`, `email`, `first_name`, `last_name`, `phone_number`, `enabled`) VALUES
('admin', '$2a$10$rOzZz5J5y5y5y5y5y5y5yO5y5y5y5y5y5y5y5y5y5y5y5y5y5y', 'admin@jewelryshop.com', 'Admin', 'System', '0901234567', TRUE),
('customer1', '$2a$10$rOzZz5J5y5y5y5y5y5y5yO5y5y5y5y5y5y5y5y5y5y5y5y5y5y', 'customer1@gmail.com', 'Minh', 'Nguyễn', '0912345678', TRUE),
('customer2', '$2a$10$rOzZz5J5y5y5y5y5y5y5yO5y5y5y5y5y5y5y5y5y5y5y5y5y5y', 'customer2@gmail.com', 'Lan', 'Trần', '0923456789', TRUE),
('customer3', '$2a$10$rOzZz5J5y5y5y5y5y5y5yO5y5y5y5y5y5y5y5y5y5y5y5y5y5y', 'customer3@gmail.com', 'Hùng', 'Lê', '0934567890', TRUE);

-- Gán roles cho users
INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES
(1, 2), -- admin có role ADMIN
(2, 1), -- customer1 có role USER
(3, 1), -- customer2 có role USER
(4, 1); -- customer3 có role USER

-- Thêm dữ liệu mẫu cho categories
INSERT INTO `categories` (`name`, `description`, `parent_id`) VALUES
('Nhẫn', 'Các loại nhẫn trang sức cao cấp', NULL),
('Nhẫn kim cương', 'Nhẫn gắn kim cương tự nhiên và nhân tạo', 1),
('Nhẫn vàng', 'Nhẫn làm từ vàng 18K, 24K', 1),
('Nhẫn bạc', 'Nhẫn làm từ bạc Sterling', 1),
('Dây chuyền', 'Các loại dây chuyền trang sức', NULL),
('Dây chuyền vàng', 'Dây chuyền vàng cao cấp', 5),
('Dây chuyền bạc', 'Dây chuyền bạc tinh xảo', 5),
('Bông tai', 'Các loại bông tai trang sức', NULL),
('Bông tai vàng', 'Bông tai vàng đẳng cấp', 8),
('Bông tai bạc', 'Bông tai bạc thời trang', 8),
('Lắc tay', 'Vòng tay trang sức cao cấp', NULL),
('Lắc tay vàng', 'Lắc tay vàng sang trọng', 11),
('Lắc tay bạc', 'Lắc tay bạc tinh tế', 11);

-- Thêm dữ liệu mẫu cho products
INSERT INTO `products` (`name`, `description`, `base_price`, `discount_price`, `category_id`, `sku_prefix`, `is_active`) VALUES
('Nhẫn kim cương vĩnh cửu', 'Nhẫn kim cương tự nhiên, thiết kế tinh xảo, phù hợp cho cặp đôi', 25000000.00, 23000000.00, 2, 'NKCV', TRUE),
('Nhẫn cưới vàng trắng 18K', 'Nhẫn cưới vàng trắng 18K, thiết kế đơn giản nhưng thanh lịch', 8500000.00, NULL, 3, 'NCTV18', TRUE),
('Dây chuyền vàng 18K đá topaz', 'Dây chuyền vàng 18K kết hợp đá topaz xanh cao cấp', 12000000.00, 11000000.00, 6, 'DCVT18', TRUE),
('Bông tai vàng 18K kim cương', 'Bông tai vàng 18K gắn kim cương nhỏ tinh tế', 7500000.00, 7000000.00, 9, 'BTVKC', TRUE),
('Lắc tay vàng 18K charm', 'Lắc tay vàng 18K có charm đi kèm, thiết kế trẻ trung', 9500000.00, 8900000.00, 12, 'LTV18', TRUE),
('Nhẫn bạc nam', 'Nhẫn bạc Sterling dành cho nam giới, thiết kế mạnh mẽ', 2500000.00, 2200000.00, 4, 'NBNS', TRUE),
('Dây chuyền bạc đá sapphire', 'Dây chuyền bạc Sterling kết hợp đá sapphire tự nhiên', 4500000.00, NULL, 7, 'DCBS', TRUE);

-- Thêm dữ liệu mẫu cho product_variants
INSERT INTO `product_variants` (`product_id`, `sku`, `name`, `material`, `gemstone`, `size`, `color`, `weight`, `price_modifier`, `image_url`, `is_active`) VALUES
-- Variants cho nhẫn kim cương vĩnh cửu
(1, 'NKCV-WG-6-D05', 'Nhẫn kim cương vàng trắng size 6', 'Vàng trắng 18K', 'Kim cương 0.5ct', '6', 'Trắng', 3.5, 0, '/images/nckvc-6.jpg', TRUE),
(1, 'NKCV-YG-7-D05', 'Nhẫn kim cương vàng vàng size 7', 'Vàng vàng 18K', 'Kim cương 0.5ct', '7', 'Vàng', 3.5, 500000, '/images/nckvc-7.jpg', TRUE),
(1, 'NKCV-WG-8-D08', 'Nhẫn kim cương vàng trắng size 8', 'Vàng trắng 18K', 'Kim cương 0.8ct', '8', 'Trắng', 4.2, 3000000, '/images/nckvc-8.jpg', TRUE),

-- Variants cho nhẫn cưới vàng trắng
(2, 'NCTV18-WG-5', 'Nhẫn cưới vàng trắng size 5', 'Vàng trắng 18K', NULL, '5', 'Trắng', 2.8, 0, '/images/nc-vang-trang-9.jpg', TRUE),
(2, 'NCTV18-WG-6', 'Nhẫn cưới vàng trắng size 6', 'Vàng trắng 18K', NULL, '6', 'Trắng', 2.8, 0, '/images/nc-vang-trang-10.jpg', TRUE),
(2, 'NCTV18-WG-7', 'Nhẫn cưới vàng trắng size 7', 'Vàng trắng 18K', NULL, '7', 'Trắng', 2.8, 0, '/images/nc-vang-trang-11.jpg', TRUE),

-- Variants cho dây chuyền vàng
(3, 'DCVT18-YG-45CM-TZ', 'Dây chuyền vàng topaz 45cm', 'Vàng vàng 18K', 'Topaz xanh 1.2ct', '45cm', 'Vàng', 8.2, 0, '/images/dc-vang-topaz.jpg', TRUE),
(3, 'DCVT18-YG-50CM-TZ', 'Dây chuyền vàng topaz 50cm', 'Vàng vàng 18K', 'Topaz xanh 1.2ct', '50cm', 'Vàng', 8.5, 500000, '/images/dc-vang-topaz-50.jpg', TRUE),

-- Variants cho bông tai vàng kim cương
(4, 'BTVKC-YG-KC02', 'Bông tai vàng kim cương', 'Vàng vàng 18K', 'Kim cương 0.1ct', NULL, 'Vàng', 2.1, 0, '/images/bong-tai-kc.jpg', TRUE),

-- Variants cho lắc tay vàng
(5, 'LTV18-YG-16CM', 'Lắc tay vàng 16cm', 'Vàng vàng 18K', NULL, '16cm', 'Vàng', 6.5, 0, '/images/lac-tay-vang.jpg', TRUE),
(5, 'LTV18-YG-18CM', 'Lắc tay vàng 18cm', 'Vàng vàng 18K', NULL, '18cm', 'Vàng', 7.2, 300000, '/images/lac-tay-vang-nt.jpg', TRUE);

-- Thêm dữ liệu mẫu cho inventories
INSERT INTO `inventories` (`variant_id`, `quantity`, `low_stock_threshold`) VALUES
(1, 8, 2),
(2, 5, 2),
(3, 3, 1),
(4, 12, 3),
(5, 10, 3),
(6, 7, 2),
(7, 6, 2),
(8, 4, 1),
(9, 15, 4),
(10, 8, 2),
(11, 9, 2);

-- Thêm dữ liệu mẫu cho product_images
INSERT INTO `product_images` (`product_id`, `variant_id`, `image_url`, `is_main`) VALUES
-- Hình ảnh cho nhẫn kim cương
(1, NULL, '/images/nhan-bac-y.jpg', TRUE),
(1, 1, '/images/nhan-kim-cuong1.jpg', FALSE),
(1, 1, '/images/nhan-kim-cuong2.jpg', FALSE),
(1, 2, '/images/nhan-kim-cuong3.jpg', FALSE),

-- Hình ảnh cho nhẫn cưới
(2, NULL, '/images/nhan-cuoi3.jpg', TRUE),
(2, 4, '/images/nhan-cuoi1.jpg', FALSE),
(2, 5, '/images/nhan-cuoi2.jpg', FALSE),

-- Hình ảnh cho dây chuyền vàng
(3, NULL, '/images/day-chuyen-vang.jpg', TRUE),
(3, 7, '/images/day-chuyen-vang1.jpg', FALSE),
(3, 7, '/images/day-chuyen-vang3.jpg', FALSE);

-- Thêm dữ liệu mẫu cho addresses
INSERT INTO `addresses` (`user_id`, `full_name`, `phone_number`, `street_address`, `city`, `district`, `ward`, `is_default`) VALUES
(2, 'Nguyễn Văn Minh', '0912345678', '123 Đường Lê Lợi', 'Hồ Chí Minh', 'Quận 1', 'Phường Bến Nghé', TRUE),
(2, 'Nguyễn Văn Minh', '0912345678', '456 Đường Nguyễn Huệ', 'Hồ Chí Minh', 'Quận 1', 'Phường Bến Thành', FALSE),
(3, 'Trần Thị Lan', '0923456789', '789 Đường Hai Bà Trưng', 'Hà Nội', 'Quận Hoàn Kiếm', 'Phường Hàng Bài', TRUE),
(4, 'Lê Văn Hùng', '0934567890', '321 Đường Lý Thường Kiệt', 'Đà Nẵng', 'Quận Hải Châu', 'Phường Thạc Gián', TRUE);

-- Thêm dữ liệu mẫu cho carts
INSERT INTO `carts` (`user_id`) VALUES
(2), (3), (4);

-- Thêm dữ liệu mẫu cho cart_items
INSERT INTO `cart_items` (`cart_id`, `variant_id`, `quantity`) VALUES
(1, 1, 1),
(1, 7, 2),
(2, 4, 1),
(3, 9, 1);

-- Thêm dữ liệu mẫu cho wishlists
INSERT INTO `wishlists` (`user_id`, `variant_id`) VALUES
(2, 3),
(2, 8),
(3, 1),
(4, 5);

-- Thêm dữ liệu mẫu cho promotions
INSERT INTO `promotions` (`code`, `description`, `discount_type`, `discount_value`, `min_order_amount`, `start_date`, `end_date`, `usage_limit`, `per_user_limit`, `is_active`) VALUES
('WELCOME10', 'Giảm 10% cho đơn hàng đầu tiên', 'PERCENTAGE', 10.00, 5000000.00, '2024-01-01 00:00:00', '2024-12-31 23:59:59', 1000, 1, TRUE),
('FREESHIP', 'Miễn phí vận chuyển', 'FIXED_AMOUNT', 50000.00, 3000000.00, '2024-01-01 00:00:00', '2024-12-31 23:59:59', NULL, 3, TRUE),
('SALE20', 'Giảm 20% cho đơn hàng từ 10 triệu', 'PERCENTAGE', 20.00, 10000000.00, '2024-06-01 00:00:00', '2024-06-30 23:59:59', 500, 2, TRUE);

-- Thêm dữ liệu mẫu cho orders
INSERT INTO `orders` (`user_id`, `order_number`, `total_amount`, `shipping_fee`, `shipping_address_id`, `status`, `payment_method`, `payment_status`, `notes`) VALUES
(2, 'ORD001', 23500000.00, 50000.00, 1, 'DELIVERED', 'BANK_TRANSFER', 'PAID', 'Giao hàng giờ hành chính'),
(3, 'ORD002', 8500000.00, 50000.00, 3, 'PROCESSING', 'CREDIT_CARD', 'PAID', NULL),
(2, 'ORD003', 11000000.00, 0.00, 1, 'PENDING', 'COD', 'PENDING', 'Áp dụng mã FREESHIP');

-- Thêm dữ liệu mẫu cho order_details
INSERT INTO `order_details` (`order_id`, `variant_id`, `quantity`, `price_at_purchase`) VALUES
(1, 1, 1, 23000000.00),
(1, 7, 1, 11000000.00),
(2, 4, 1, 8500000.00),
(3, 7, 1, 11000000.00);

-- Thêm dữ liệu mẫu cho transactions
INSERT INTO `transactions` (`order_id`, `transaction_code`, `amount`, `payment_method`, `status`, `gateway_response`) VALUES
(1, 'TRANS001', 23550000.00, 'BANK_TRANSFER', 'SUCCESS', '{"bank_code":"VCB","account_number":"1234567890"}'),
(2, 'TRANS002', 8550000.00, 'CREDIT_CARD', 'SUCCESS', '{"card_type":"VISA","last4":"1234"}');

-- Thêm dữ liệu mẫu cho reviews
INSERT INTO `reviews` (`variant_id`, `user_id`, `order_id`, `rating`, `comment`, `is_approved`) VALUES
(1, 2, 1, 5, 'Nhẫn rất đẹp, kim cương lấp lánh. Rất hài lòng!', TRUE),
(7, 2, 1, 4, 'Dây chuyền đẹp, nhưng hơi ngắn so với mong đợi', TRUE);

-- Thêm dữ liệu mẫu cho blog_categories
INSERT INTO `blog_categories` (`name`, `slug`, `description`) VALUES
('Chăm sóc trang sức', 'cham-soc-trang-suc', 'Mẹo và hướng dẫn chăm sóc trang sức'),
('Xu hướng', 'xu-huong', 'Xu hướng trang sức mới nhất'),
('Kiến thức', 'kien-thuc', 'Kiến thức về trang sức và đá quý');

-- Thêm dữ liệu mẫu cho blogs
INSERT INTO `blogs` (`title`, `slug`, `content`, `thumbnail_url`, `author_id`, `category_id`, `published_at`, `is_published`, `views_count`) VALUES
('Cách bảo quản trang sức vàng đúng cách', 'cach-bao-quan-trang-suc-vang', 'Nội dung hướng dẫn bảo quản trang sức vàng...', '/images/blog-bao-quan-vang.jpg', 1, 1, '2024-01-15 10:00:00', TRUE, 156),
('Xu hướng nhẫn cưới 2024', 'xu-huong-nhan-cuoi-2024', 'Nội dung về xu hướng nhẫn cưới năm 2024...', '/images/blog-nhan-cuoi-2024.jpg', 1, 2, '2024-02-01 14:30:00', TRUE, 289),
('Phân biệt kim cương tự nhiên và nhân tạo', 'phan-biet-kim-cuong-tu-nhien-va-nhan-tao', 'Nội dung hướng dẫn phân biệt kim cương...', '/images/blog-kim-cuong.jpg', 1, 3, '2024-01-20 09:15:00', TRUE, 432);

-- Thêm dữ liệu mẫu cho contacts
INSERT INTO `contacts` (`name`, `email`, `subject`, `message`, `is_read`, `replied_at`, `admin_reply`) VALUES
('Lê Thị Mai', 'maile@gmail.com', 'Hỏi về chính sách bảo hành', 'Tôi muốn hỏi về chính sách bảo hành trang sức tại cửa hàng?', TRUE, '2024-01-18 16:20:00', 'Cảm ơn bạn đã liên hệ. Chúng tôi có chính sách bảo hành 12 tháng cho tất cả sản phẩm.'),
('Phạm Văn Đức', 'ducpham@gmail.com', 'Đặt hàng số lượng lớn', 'Tôi muốn đặt 50 chiếc nhẫn làm quà tặng, có được giảm giá không?', FALSE, NULL, NULL);

-- Thêm dữ liệu mẫu cho banners
INSERT INTO `banners` (`title`, `subtitle`, `image_url`, `target_url`, `order_display`, `is_active`) VALUES
('Khuyến mãi đặc biệt', 'Giảm đến 30% cho bộ sưu tập mới', '/images/banner1.jpg', '/collections/new', 1, TRUE),
('Kim cương vĩnh cửu', 'Tình yêu tỏa sáng như kim cương', '/images/banner2.jpg', '/collections/diamond', 2, TRUE),
('Vàng 18K cao cấp', 'Sang trọng và đẳng cấp', '/images/banner3.jpg', '/collections/gold', 3, TRUE);

-- Thêm dữ liệu mẫu cho user_activities
INSERT INTO `user_activities` (`user_id`, `activity_type`, `variant_id`, `product_id`, `search_query`, `activity_time`) VALUES
(2, 'VIEW_PRODUCT', 1, 1, NULL, '2024-03-01 10:30:00'),
(2, 'ADD_TO_CART', 1, 1, NULL, '2024-03-01 10:35:00'),
(2, 'VIEW_PRODUCT', 7, 3, NULL, '2024-03-01 11:20:00'),
(3, 'SEARCH', NULL, NULL, 'nhẫn cưới', '2024-03-01 14:15:00'),
(3, 'VIEW_PRODUCT', 4, 2, NULL, '2024-03-01 14:20:00');

-- Thêm dữ liệu mẫu cho payment_gateways
INSERT INTO `payment_gateways` (`name`, `api_key`, `secret_key`, `merchant_code`, `return_url`, `status`, `description`) VALUES
('VNPay', 'vnpay_api_key_123', 'vnpay_secret_456', 'JEWELRYSHOP001', 'https://jewelryshop.com/payment/vnpay/return', 'ACTIVE', 'Cổng thanh toán VNPay'),
('Momo', 'momo_api_key_789', 'momo_secret_012', NULL, 'https://jewelryshop.com/payment/momo/return', 'ACTIVE', 'Ví điện tử Momo'),
('OnePay', 'onepay_api_key_345', 'onepay_secret_678', 'JEWELRYSHOP002', 'https://jewelryshop.com/payment/onepay/return', 'INACTIVE', 'Cổng thanh toán OnePay');