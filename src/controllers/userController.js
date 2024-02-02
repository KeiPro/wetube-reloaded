import User from "../models/User";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => res.render("join", {pageTitle:"Join"});
export const postJoin = async (req, res) => {
    const {name, username, email, password, password2, location} = req.body;
    const pageTitle = "Join";
    if(password !== password2){
        return res.status(400).render("join", {pageTitle, errorMessage:"Password confirmation does not match."});       
    }
    const exists = await User.exists({$or: [{username}, {email}] });
    if(exists){
        return res.status(400).render("join", {pageTitle, errorMessage:"This username/email is already taken."});
    }

    try{
        await User.create({
            name, username, email, password, location
        });
        return res.redirect("/login");
    }catch(error){
        res.status(400).render("join", {pageTitle, errorMessage:error._message});
    }
}

export const getLogin = (req, res) => res.render("login", {pageTitle:"Login"});

export const postLogin = async(req, res) => {
    const {username, password} = req.body;
    const pageTitle = "Login";
    const user = await User.findOne({username, socialOnly:false});
    if(!user){
        return res.status(400).render("login", {pageTitle, errorMessage:"An Account with this username dest not exists."})
    }
    // Check if account exists
    // check if password correct
    const ok = await bcrypt.compare(password, user.password);
    if(!ok){
        return res.status(400).render("login", {pageTitle, errorMessage:"Wrong password"})
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
}

export const startGithubLogin = (req, res) => {

    const baseUrl = 'https://github.com/login/oauth/authorize';
    
    // 해당 key값들은 github에서 요구하는 key들로 구성되어 있어야 한다.
    const config = {
        client_id : process.env.GH_CLIENT,
        allow_signup:false,
        scope:"read:user user:email",
    }

    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;

    return res.redirect(finalUrl);
}

/*
  깃헙 리 디렉션 사용 가이드 : https://docs.github.com/ko/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#2-users-are-redirected-back-to-your-site-by-github
 */
export const finishGithubLogin = async (req, res) => {
    
    const baseUrl = 'https://github.com/login/oauth/access_token';
    
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code,
    }

    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`
    const tokenRequest = await(
        await fetch(finalUrl, {
        method:"POST",
        headers:{
            Accept: "application/json",
        }
    })
    ).json();

    if("access_token" in tokenRequest)
    {
        const {access_token} = tokenRequest;
        const apiUrl = "https://api.github.com";
        const userData = await (
            await fetch(`${apiUrl}/user`, {
            headers:{
                Authorization: `token ${access_token}`,
            },
        })
        ).json();
        const emailData = await (
            await fetch(`${apiUrl}/user/emails`, {
            headers:{
                Authorization: `token ${access_token}`,
            },
        })
        ).json();
        const emailObj = emailData.find(email => email.primary === true && email.verified === true);
        if(!emailObj){
            return res.redirect("/login");    
        }

        let user = await User.findOne({email: emailObj.email});
        if(!user){
            // create an account
            user = await User.create({
                avatarUrl: userData.avatar_url,
                name:userData.name, 
                username: userData.login, 
                email:emailObj.email,
                password:"", 
                socialOnly: true,
                location:userData.location
            });
        } 
        req.session.loggedIn = true;
        req.session.user = user;
        return res.redirect("/");
        
    }else {
        return res.redirect("/login");
    }
};

export const startKakaoLogin = (req, res) => {
    const baseUrl = "https://kauth.kakao.com/oauth/authorize";

    const config = {
        response_type: "code",
        client_id : process.env.KAKAO_CLIENT,
        redirect_uri:"http://localhost:4000/users/kakao/finish",
    }

    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;

    return res.redirect(finalUrl);
}

export const finishKakaoLogin = async (req, res) => {
    const baseUrl = "https://kauth.kakao.com/oauth/token";

    let config = {
        grant_type: "authorization_code",
        client_id: process.env.KAKAO_CLIENT,
        redirect_uri: "http://localhost:4000/users/kakao/finish",
        code: req.query.code
    }

    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;

    const tokenRequest = await(await fetch(finalUrl, {
        method: "POST",
        headers: {
            'Content-Type' : 'application/x-www-form-urlencoded'
        }
    })).json();

    if("access_token" in tokenRequest)
    {
        const {access_token} = tokenRequest;
        const apiUrl = "https://kapi.kakao.com/v2/user/me";
        
        // property_keys를 JSON 배열로 준비
        const propertyKeys = JSON.stringify(["kakao_account.email"]);

        const emailData = await (await fetch(apiUrl, {
            method: 'POST', // 명시적으로 POST 요청을 사용
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Bearer ${access_token}`,
            },
            body: `property_keys=${encodeURIComponent(propertyKeys)}` // 데이터를 URL 인코딩하여 body에 추가
        })).json();
        
        const kakaoAccount = emailData.kakao_account;
        const isValidEmail = kakaoAccount.is_email_valid &&
                             kakaoAccount.is_email_verified
        
        if(!isValidEmail){
            return res.redirect('/login');
        }

        let user = await User.findOne({email:kakaoAccount.email});
        if(!user)
        {
            const userData = await(await fetch(apiUrl, {
                headers:{
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Bearer ${access_token}`,
                }
            })).json();
            
            user = await User.create({
                email: kakaoAccount.email,
                avatarUrl: userData.kakao_account.profile.profile_image_url,
                socialOnly: true, //유저가 Github로 로그인했는지 여부를 알기 위해서
                username: userData.kakao_account.profile.nickname,
                password: "",
                name:userData.kakao_account.profile.nickname,
                location: "",
            });
        }
        
        req.session.loggedIn = true;
        req.session.user = user;
        return res.redirect('/');
    }
    else
    {
        return res.redirect("/login");
    }
}

export const logout = (req, res) => {
    req.session.destroy();
    return res.redirect("/");
};
export const edit = (req, res) => res.send("Edit User");
export const see = (req, res) => res.send("See User");