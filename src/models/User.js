import bcrypt from "bcrypt";
import mongoose, { mongo } from "mongoose";

const userSchema = new mongoose.Schema({
    email: {type:String, required:true, unique:true},
    avatarUrl: String,
    socialOnly: {type:Boolean, default:false}, //유저가 Github로 로그인했는지 여부를 알기 위해서
    username: {type:String, required:true, unique:true},
    password: {type:String},
    name:{type:String, required:true},
    location: String,
    comments: [{type: mongoose.Schema.Types.ObjectId, ref:"Comment" }],
    videos: [
        {type:mongoose.Schema.Types.ObjectId, ref:"Video" },
    ]
});

userSchema.pre('save', async function(){
    // property가 하나라도 수정되면 isModified가 true.
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 5);
    }
})

const User = mongoose.model('User', userSchema);
export default User;