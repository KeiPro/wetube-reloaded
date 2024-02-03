import express from "express";
import { getEdit, postEdit, logout, see, startGithubLogin, finishGithubLogin, startKakaoLogin, finishKakaoLogin, startNaverLogin, finishNaverLogin } from "../controllers/userController";
import {protectorMiddleware, publicOnlyMiddleware} from "../middlewares";

const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware, logout);
userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(postEdit);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);
userRouter.get("/kakao/start", publicOnlyMiddleware, startKakaoLogin);
userRouter.get("/kakao/finish", publicOnlyMiddleware, finishKakaoLogin);
userRouter.get("/naver/start", publicOnlyMiddleware, startNaverLogin);
userRouter.get("/naver/finish", publicOnlyMiddleware, finishNaverLogin);
userRouter.get(":id", see);

export default userRouter;