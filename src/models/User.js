import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {type:String, required:true, unique:true},
    username: {type:String, required:true, unique:true},
    password: {type:String, required:true},
    name:{type:String, required:true},
    location: String,
});

userSchema.pre('save', async function(){
    console.log("입력한 비밀번호 : ", this.password);
    // 5의 의미는 5번 해싱을 진행한다는 뜻.
    this.password = await bcrypt.hash(this.password, 5);
    console.log("해시된 : ", this.password);
})

const User = mongoose.model('User', userSchema);
export default User;