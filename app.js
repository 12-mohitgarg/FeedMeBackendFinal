const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const cors = require("cors");
const packageJson = require("./package.json");


app.use(cors());

app.use(cookieParser());

app.use(bodyParser.json({ limit: "50mb" }));

app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.set("view engine", "ejs");
app.use("/uploads", express.static("uploads"));


const adminRoutes = require("./routes/adminRoutes.js");
app.use("/api", adminRoutes);

app.get("/version", (req, res) => {
  res.json({ version: packageJson.version });
});

//app.use("/api/admin", adminRoutes);
module.exports = app;





