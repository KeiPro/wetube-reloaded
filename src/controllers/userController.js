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
    const tokenRequest = await(await fetch(finalUrl, {
        method:"POST",
        headers:{
            Accept: "application/json",
        }
    })).json();
    // const json = await data.json();
    //res.send(JSON.stringify(json));

    if("access_token" in tokenRequest)
    {
        // access api
        const {access_token} = tokenRequest;
        const apiUrl = "https://api.github.com";
        const userData = await (
            await fetch(`${apiUrl}/user`, {
            headers:{
                Authorization: `token ${access_token}`,
            },
        })
        ).json();
        console.log(userData);
        const emailData = await (
            await fetch(`${apiUrl}/user/emails`, {
            headers:{
                Authorization: `token ${access_token}`,
            },
        })
        ).json();
        const emailObj = emailData.find
        (email => email.primary === true && email.verified === true);
        if(!emailObj){
            return res.redirect("/login");    
        }

        let user = await User.findOne({email: emailObj.email});
        if(!user){
            // create an account
            user = await User.create({
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


export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Remove User");
export const logout = (req, res) => res.send("Log out");
export const see = (req, res) => res.send("See User");