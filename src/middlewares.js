import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
    region: "ap-northeast-2",
    credentials: {
        accessKeyId: process.env.AWS_ID,
        secretAccessKey: process.env.AWS_SECRET,
    }
});

const s3ImageUploader = multerS3({
    s3: s3,
    bucket: 'wetube-ai/images',
    acl: 'public-read',
});

const s3VideoUploader = multerS3({
    s3: s3,
    bucket: 'wetube-ai/videos',
    acl: 'public-read',
});

export const localsMiddleware = (req, res, next) => {
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.siteName = "Wetube";
    res.locals.loggedInUser = req.session.user || {};
    next();
}

export const protectorMiddleware = (req, res, next) => {
    if(req.session.loggedIn){
        return next();
    }
    else
    {
        req.flash("error", "Log in first");
        return res.redirect('/login');
    }
}

export const publicOnlyMiddleware = (req, res, next) => {
    if(!req.session.loggedIn){
        return next();
    } else {
        req.flash("error", "Not authorized");
        return res.redirect("/");
    }
}

export const avatarUpload = multer({dest:"uploads/avatars/",
    limits: {
        fileSize: 3 * 1000 * 1000, //3 megabyte
    },
    storage: s3ImageUploader,
});

export const videoUpload = multer({dest:"uploads/videos/",
    limits: {
    fileSize: 10 * 1000 * 1000, //10 megabyte
    },
    storage: s3VideoUploader,
});
