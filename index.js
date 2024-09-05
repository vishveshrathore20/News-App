const express = require("express");
const color = require("colors");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");

const app = express();
dotenv.config();

const bodyParser = require("express").json;

//middlewares
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

//routes
//1. Authentication
app.use("/api/auth", require("./Routes/authRoutes"));
//2. News Crud
app.use("/api/masterAdmin", require("./Routes/NewsCRUD"));
//3. Create Admin
app.use("/api", require("./Routes/AdminCRUD"));

//Server Listening
const port = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Welcome To News App");
});
app.listen(port, () => {
  console.log(`The Local Server is Running at ${port}`.bgWhite.blue.bold);
});

//Databse Connectivity
connectDB(process.env.MONGO_URL);
