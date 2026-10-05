const express = require("express");
const router = express.Router();

const pool = require("../config/database");

// =====================================================
// TRANG BÁN HÀNG
// =====================================================
router.get("/sale", async (req, res) => {
    try {
        const [products] = await pool.query(`
            SELECT
                products.id,
                products.name,
                products.price,
                products.stock,
                categories.name AS category_name
            FROM products
            LEFT JOIN categories
                ON products.category_id = categories.id
            WHERE products.stock > 0
            ORDER BY products.name
        `);

        const cart = req.session.cart || [];

        const total = cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        res.render("sale", {
            products,
            cart,
            total
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi trang bán hàng");
    }
});


// =====================================================
// THÊM SẢN PHẨM VÀO GIỎ
// =====================================================
router.post("/cart/add", async (req, res) => {
    try {
        const productId = Number(req.body.product_id);
        const quantity = Number(req.body.quantity);

        if (!productId || !quantity || quantity <= 0) {
            return res.status(400).send("Số lượng không hợp lệ");
        }

        const [products] = await pool.query(
            "SELECT * FROM products WHERE id = ?",
            [productId]
        );

        if (products.length === 0) {
            return res.status(404).send("Không tìm thấy sản phẩm");
        }

        const product = products[0];

        if (product.stock < quantity) {
            return res.status(400).send(
                `Không đủ hàng. Tồn kho hiện tại: ${product.stock}`
            );
        }

        if (!req.session.cart) {
            req.session.cart = [];
        }

        const cart = req.session.cart;

        const existingItem = cart.find(
            item => item.product_id === productId
        );

        if (existingItem) {

            const newQuantity =
                existingItem.quantity + quantity;

            if (newQuantity > product.stock) {
                return res.status(400).send(
                    `Số lượng vượt quá tồn kho. Tồn kho: ${product.stock}`
                );
            }

            existingItem.quantity = newQuantity;

        } else {

            cart.push({
                product_id: product.id,
                name: product.name,
                price: Number(product.price),
                quantity: quantity
            });

        }

        res.redirect("/orders/sale");

    } catch (error) {
        console.error(error);
        res.status(500).send("Không thể thêm vào giỏ hàng");
    }
});


// =====================================================
// XÓA SẢN PHẨM KHỎI GIỎ
// =====================================================
router.post("/cart/remove", (req, res) => {

    const productId = Number(req.body.product_id);

    if (req.session.cart) {

        req.session.cart =
            req.session.cart.filter(
                item => item.product_id !== productId
            );
    }

    res.redirect("/orders/sale");
});


// =====================================================
// XÓA TOÀN BỘ GIỎ
// =====================================================
router.post("/cart/clear", (req, res) => {

    req.session.cart = [];

    res.redirect("/orders/sale");
});


// =====================================================
// THANH TOÁN
// =====================================================
router.post("/checkout", async (req, res) => {

    const cart = req.session.cart || [];

    if (cart.length === 0) {
        return res.status(400).send(
            "Giỏ hàng đang trống"
        );
    }

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();

        let totalAmount = 0;

        // -------------------------------------------------
        // Kiểm tra lại tồn kho
        // -------------------------------------------------

        for (const item of cart) {

            const [rows] = await connection.query(
                `
                SELECT *
                FROM products
                WHERE id = ?
                FOR UPDATE
                `,
                [item.product_id]
            );

            if (rows.length === 0) {

                throw new Error(
                    `Không tìm thấy sản phẩm ${item.name}`
                );
            }

            const product = rows[0];

            if (product.stock < item.quantity) {

                throw new Error(
                    `Sản phẩm "${product.name}" không đủ tồn kho`
                );
            }

            totalAmount +=
                Number(product.price) * item.quantity;
        }


        // -------------------------------------------------
        // Tạo hóa đơn
        // -------------------------------------------------

        const [orderResult] = await connection.query(
            `
            INSERT INTO orders
            (total_amount)
            VALUES (?)
            `,
            [totalAmount]
        );

        const orderId = orderResult.insertId;


        // -------------------------------------------------
        // Thêm chi tiết hóa đơn + trừ kho
        // -------------------------------------------------

        for (const item of cart) {

            const [rows] = await connection.query(
                `
                SELECT *
                FROM products
                WHERE id = ?
                `,
                [item.product_id]
            );

            const product = rows[0];

            const price = Number(product.price);

            const subtotal =
                price * item.quantity;


            // Thêm chi tiết hóa đơn
            await connection.query(
                `
                INSERT INTO order_items
                (
                    order_id,
                    product_id,
                    quantity,
                    price,
                    subtotal
                )
                VALUES (?, ?, ?, ?, ?)
                `,
                [
                    orderId,
                    item.product_id,
                    item.quantity,
                    price,
                    subtotal
                ]
            );


            // Trừ tồn kho
            await connection.query(
                `
                UPDATE products
                SET stock = stock - ?
                WHERE id = ?
                `,
                [
                    item.quantity,
                    item.product_id
                ]
            );
        }


        // -------------------------------------------------
        // Commit
        // -------------------------------------------------

        await connection.commit();

        // Xóa giỏ hàng
        req.session.cart = [];

        res.redirect(
            `/orders/${orderId}`
        );

    } catch (error) {

        await connection.rollback();

        console.error(error);

        res.status(400).send(
            `Thanh toán thất bại: ${error.message}`
        );

    } finally {

        connection.release();
    }
});


// =====================================================
// XEM CHI TIẾT HÓA ĐƠN
// =====================================================
router.get("/:id", async (req, res) => {

    try {

        const orderId = Number(req.params.id);

        const [orders] = await pool.query(
            `
            SELECT *
            FROM orders
            WHERE id = ?
            `,
            [orderId]
        );

        if (orders.length === 0) {
            return res.status(404).send(
                "Không tìm thấy hóa đơn"
            );
        }

        const [items] = await pool.query(
            `
            SELECT
                order_items.*,
                products.name AS product_name
            FROM order_items
            JOIN products
                ON order_items.product_id = products.id
            WHERE order_items.order_id = ?
            `,
            [orderId]
        );

        res.render("order-detail", {
            order: orders[0],
            items
        });

    } catch (error) {

        console.error(error);

        res.status(500).send(
            "Lỗi khi xem hóa đơn"
        );
    }
});


module.exports = router;