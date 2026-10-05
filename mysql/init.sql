CREATE DATABASE IF NOT EXISTS pos_db;

USE pos_db;

-- ==========================================
-- BẢNG DANH MỤC
-- ==========================================

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================
-- BẢNG SẢN PHẨM
-- ==========================================

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,

    category_id INT,

    name VARCHAR(255) NOT NULL,

    price DECIMAL(12,2) NOT NULL,

    stock INT NOT NULL DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_product_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE SET NULL
);


-- ==========================================
-- BẢNG HÓA ĐƠN
-- ==========================================

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,

    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================
-- CHI TIẾT HÓA ĐƠN
-- ==========================================

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,

    order_id INT NOT NULL,

    product_id INT NOT NULL,

    quantity INT NOT NULL,

    price DECIMAL(12,2) NOT NULL,

    subtotal DECIMAL(12,2) NOT NULL,

    CONSTRAINT fk_order_item_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_order_item_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
);


-- ==========================================
-- DỮ LIỆU DANH MỤC MẪU
-- ==========================================

INSERT INTO categories (name)
VALUES
('Nước uống'),
('Bánh kẹo'),
('Mì ăn liền'),
('Sữa');


-- ==========================================
-- DỮ LIỆU SẢN PHẨM MẪU
-- ==========================================

INSERT INTO products
(category_id, name, price, stock)
VALUES

(1, 'Coca Cola', 10000, 50),

(1, 'Pepsi', 10000, 40),

(1, 'Nước suối', 7000, 100),

(2, 'Bánh Oreo', 15000, 30),

(2, 'Snack khoai tây', 12000, 40),

(3, 'Mì Hảo Hảo', 5000, 100),

(4, 'Sữa tươi', 8000, 60);