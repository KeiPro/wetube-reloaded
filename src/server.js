import "./db";
import Video from "./models/Video";
import express from "express";
import morgan from "morgan";
import globalRouter from "./routers/globalRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";

const PORT = 4000;

const app = express();
const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(logger);

// express application이 form의 value들을 이해할 수 있도록 하고, 
// 우리가 쓸 수 있는 자바스크립트 형식으로 변형시켜 줄 수 있다.
app.use(express.urlencoded({extended:true})); 

app.use("/", globalRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

const handleListening = () => console.log(`Server listening on port http://localhost:${PORT}`);

//서버에게 어떤 port를 listening할 지 얘기해줘야 된다.
app.listen(PORT, handleListening);