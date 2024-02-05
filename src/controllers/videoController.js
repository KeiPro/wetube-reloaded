import User from "../models/User";
import Video from "../models/Video"

//Video.find({}, (error, videos) => {});    

export const home = async (req, res) => {
    const videos = await Video.find({}).sort({createdAt:"desc"});
    return res.render("home", {pageTitle:"Home", videos});

}
export const watch = async(req, res) => {
    const {id} = req.params; // ES6
    const video = await Video.findById(id).populate("owner");

    if(video === null){
        return res.status(404).render("404", {pageTitle:"Video not found."});
    }

    return res.render("watch", {pageTitle:video.title, video});
}

export const getEdit = async(req, res) => {
    const {id} = req.params; // ES6
    const {user: {_id}} = req.session;
    const video = await Video.findById(id);
    if(video === null){
        return res.status(404).render("404", {pageTitle:"Video not found."});
    }
    if(String(video.owner) !== String(_id)) {
        return res.status(403).redirect("/");
    }
    return res.render("edit", {pageTitle:`Edit: ${video.title}`, video});
}

export const postEdit = async(req, res) => {
    const {user: {_id}} = req.session;
    const {id} = req.params; // ES6
    const {title, description, hashtags} = req.body;
    const video = await Video.exists({_id:id});
    if(video === null){
        return res.render("404", {pageTitle:"Video not found."});
    }
    if(String(video.owner) !== String(_id)) {
        return res.status(403).redirect("/");
    }
    await Video.findByIdAndUpdate(id, {
        title,
        description,
        hashtags: Video.formatHashtags(hashtags),
    });

    return res.redirect(`/videos/${id}`);
}

export const getUpload = (req, res) => {
    return res.render("upload", {pageTitle:`Upload Video`});
}

export const postUpload = async (req, res) => {
    const {user: {_id}} = req.session;
    const {path} = req.file;
    const {title, description, hashtags} = req.body;
    try{
        const newVideo = await Video.create({
            title, 
            description,
            fileUrl:path,
            owner:_id,
            hashtags: Video.formatHashtags(hashtags),
        });
        const user = await User.findById(_id);
        user.videos.push(newVideo._id);
        user.save();
        return res.redirect("/");
    }
    catch(error){
        return res.status(400).render("upload", {pageTitle:`Upload Video`, errorMessage: error._message,});
    }
}

export const deleteVideo = async (req, res) => {
    const {id} = req.params;
    const {user: {_id}} = req.session;
    const video = await Video.findById(id);
    const user = await User.findById(_id);
    if(!video)
    {
        res.render("404", {pageTitle:"Video not found."});
    }
    
    if(String(video.owner) !== String(_id)) {
        console.log("예외처리");
        return res.status(403).redirect("/");
    }

    await Video.findByIdAndDelete(id);
    user.videos.splice(user.videos.indexOf(id), 1);
    user.save();
    return res.redirect("/");
}

export const search = async (req, res) => {
    const {keyword} = req.query;
    let videos = [];
    if(keyword) {
        videos = await Video.find({
            title: {
                $regex: new RegExp(`^${keyword}`, "i"), //i는 대소문자 구분 x
            }, 
        });
    }
    return res.render("search", {pageTitle:"Search", videos});
}