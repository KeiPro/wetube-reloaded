import express from "express";
import { getEdit, postEdit, logout, see, startGithubLogin, finishGithubLogin, startKakaoLogin, finishKakaoLogin, startNaverLogin, finishNaverLogin } from "../controllers/userController";

const userRouter = express.Router();

userRouter.get("/logout", logout);
userRouter.route("/edit").get(getEdit).post(postEdit);
userRouter.get("/github/start", startGithubLogin);
userRouter.get("/github/finish", finishGithubLogin);
userRouter.get("/kakao/start", startKakaoLogin);
userRouter.get("/kakao/finish", finishKakaoLogin);
userRouter.get("/naver/start", startNaverLogin);
userRouter.get("/naver/finish", finishNaverLogin);
userRouter.get(":id", see);

export default userRouter;