import express from "express";
import morgan from "morgan";
import session from "express-session";
import flash from "express-flash"
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";
import apiRouter from "./routers/apiRouter";
import { localsMiddleware } from "./middlewares";

const app = express();
const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(logger);

app.use((req, res, next) => {
    res.header("Cross-Origin-Embedder-Policy", "require-corp");
    res.header("Cross-Origin-Opener-Policy", "same-origin");
    next();
    });

// express application이 form의 value들을 이해할 수 있도록 하고, 
// 우리가 쓸 수 있는 자바스크립트 형식으로 변형시켜 줄 수 있다.
app.use(express.urlencoded({extended:true})); 
app.use(express.json()); 

app.use(session({
    secret: process.env.COOKEI_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl:process.env.DB_URL}),
}));
app.use(flash());
app.use(localsMiddleware);
app.use("/uploads", express.static("uploads"));
app.use("/static", express.static("assets"));
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);
app.use("/api", apiRouter);

export default app;
