const express = require("express");

const path = require("path");

const session = require("express-session");

const pool = require("./config/database");

const productRoutes = require("./routes/products");

const orderRoutes = require("./routes/orders");

const app = express();

const PORT = process.env.PORT || 3000;


// ==========================================
// CẤU HÌNH EJS
// ==========================================

app.set("view engine", "ejs");

app.set(
    "views",
    path.join(__dirname, "views")
);


// ==========================================
// STATIC FILE
// ==========================================

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// ==========================================
// ĐỌC FORM
// ==========================================

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(
    express.json()
);


// ==========================================
// SESSION
// ==========================================

app.use(
    session({
        secret: "pos-tk21-secret",

        resave: false,

        saveUninitialized: false
    })
);

//===========================================
// ROUTES
//===========================================
app.use("/products", productRoutes);

app.use("/orders", orderRoutes);

// ==========================================
// TRANG CHỦ
// ==========================================

app.get("/", async (req, res) => {

    try {

        const [products] = await pool.query(
            "SELECT * FROM products ORDER BY id DESC"
        );

        const [orders] = await pool.query(
            "SELECT * FROM orders ORDER BY id DESC LIMIT 10"
        );

        res.render(
            "index",
            {
                products,
                orders
            }
        );

    } catch (error) {

        console.error(error);

        res.status(500).send(
            "Lỗi kết nối cơ sở dữ liệu"
        );
    }

});


// ==========================================
// KIỂM TRA DATABASE
// ==========================================

app.get("/health", async (req, res) => {

    try {

        await pool.query("SELECT 1");

        res.json({
            status: "OK",
            database: "connected"
        });

    } catch (error) {

        res.status(500).json({
            status: "ERROR",
            database: "disconnected"
        });

    }

});


// ==========================================
// SERVER
// ==========================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `POS Server running on port ${PORT}`
        );

    }
);