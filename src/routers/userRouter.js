import express from "express";
import { getEdit, postEdit, logout, see, startGithubLogin, finishGithubLogin, startKakaoLogin, finishKakaoLogin, startNaverLogin, finishNaverLogin, getChangePassword, postChangePassword, handleProxy, getGemini, postGemini } from "../controllers/userController";
import {protectorMiddleware, publicOnlyMiddleware, avatarUpload} from "../middlewares";

const userRouter = express.Router();

userRouter.get('/image-proxy', handleProxy);
userRouter.get("/logout", protectorMiddleware, logout);
userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(avatarUpload.single("avatar"), postEdit);
userRouter.route("/change-password").all(protectorMiddleware).get(getChangePassword).post(postChangePassword);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);
userRouter.get("/kakao/start", publicOnlyMiddleware, startKakaoLogin);
userRouter.get("/kakao/finish", publicOnlyMiddleware, finishKakaoLogin);
userRouter.get("/naver/start", publicOnlyMiddleware, startNaverLogin);
userRouter.get("/naver/finish", publicOnlyMiddleware, finishNaverLogin);
userRouter.route("/gemini").all(protectorMiddleware).get(getGemini).post(postGemini);

userRouter.get("/:id", see);

export default userRouter;
