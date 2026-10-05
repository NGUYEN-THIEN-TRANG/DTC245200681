const express = require("express");
const router = express.Router();

const pool = require("../config/database");

// ================================
// DANH SÁCH + TÌM KIẾM SẢN PHẨM
// ================================
router.get("/", async (req, res) => {
    try {
        const keyword = req.query.keyword || "";

        const [products] = await pool.query(
            `
            SELECT 
                products.id,
                products.name,
                products.price,
                products.stock,
                categories.name AS category_name
            FROM products
            LEFT JOIN categories 
                ON products.category_id = categories.id
            WHERE products.name LIKE ?
            ORDER BY products.id DESC
            `,
            [`%${keyword}%`]
        );

        const [categories] = await pool.query(
            "SELECT * FROM categories ORDER BY name"
        );

        res.render("products", {
            products,
            categories,
            keyword
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi khi lấy danh sách sản phẩm");
    }
});


// ================================
// FORM THÊM SẢN PHẨM
// ================================
router.get("/add", async (req, res) => {
    try {
        const [categories] = await pool.query(
            "SELECT * FROM categories ORDER BY name"
        );

        res.render("product-form", {
            product: null,
            categories,
            title: "Thêm sản phẩm"
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi");
    }
});


// ================================
// XỬ LÝ THÊM SẢN PHẨM
// ================================
router.post("/add", async (req, res) => {
    try {
        const {
            name,
            category_id,
            price,
            stock
        } = req.body;

        await pool.query(
            `
            INSERT INTO products
            (name, category_id, price, stock)
            VALUES (?, ?, ?, ?)
            `,
            [
                name,
                category_id || null,
                price,
                stock
            ]
        );

        res.redirect("/products");

    } catch (error) {
        console.error(error);
        res.status(500).send("Không thể thêm sản phẩm");
    }
});


// ================================
// FORM SỬA SẢN PHẨM
// ================================
router.get("/edit/:id", async (req, res) => {
    try {
        const id = req.params.id;

        const [products] = await pool.query(
            "SELECT * FROM products WHERE id = ?",
            [id]
        );

        if (products.length === 0) {
            return res.status(404).send("Không tìm thấy sản phẩm");
        }

        const [categories] = await pool.query(
            "SELECT * FROM categories ORDER BY name"
        );

        res.render("product-form", {
            product: products[0],
            categories,
            title: "Sửa sản phẩm"
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi");
    }
});


// ================================
// XỬ LÝ SỬA SẢN PHẨM
// ================================
router.post("/edit/:id", async (req, res) => {
    try {
        const id = req.params.id;

        const {
            name,
            category_id,
            price,
            stock
        } = req.body;

        await pool.query(
            `
            UPDATE products
            SET
                name = ?,
                category_id = ?,
                price = ?,
                stock = ?
            WHERE id = ?
            `,
            [
                name,
                category_id || null,
                price,
                stock,
                id
            ]
        );

        res.redirect("/products");

    } catch (error) {
        console.error(error);
        res.status(500).send("Không thể cập nhật sản phẩm");
    }
});


// ================================
// XÓA SẢN PHẨM
// ================================
router.post("/delete/:id", async (req, res) => {
    try {
        const id = req.params.id;

        await pool.query(
            "DELETE FROM products WHERE id = ?",
            [id]
        );

        res.redirect("/products");

    } catch (error) {
        console.error(error);

        res.status(500).send(
            "Không thể xóa sản phẩm. Có thể sản phẩm đã được sử dụng trong hóa đơn."
        );
    }
});


module.exports = router;