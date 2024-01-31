import mongoose from "mongoose";
require("dotenv").config();

mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});

const db = mongoose.connection;

const handleOpen = () => console.log("✔ Connected to DB");
const handleError = (error)=>console.log("🚫 DB Error", error);

db.on('error', handleError); 
db.once("open", handleOpen);