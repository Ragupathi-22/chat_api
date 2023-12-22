const mongoose=require('mongoose');
const userSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
       
    },
    friendRequest:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }],
    friends:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }],
    senrFriendRequest:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }]
});

const user=mongoose.model("user",userSchema);

module.exports=user;