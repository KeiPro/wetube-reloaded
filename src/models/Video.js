import mongoose from "mongoose";

//모델의 형태를 정의해주기.
const videoSchema = new mongoose.Schema({
    title: String,
    description: String,
    createdAt: Date,
    hashtags: [{type:String}],
    meta: {
        views:Number,
        rating:Number,
    },
});

const Video = mongoose.model("Video", videoSchema);
export default Video;