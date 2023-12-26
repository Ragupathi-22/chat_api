const express = require("express")
const bodyParder = require("body-parser")
const mongoose = require("mongoose");
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const cors = require("cors");
const path = require('path');
const app = express();
const port = 8000;
const bodyParser = require("body-parser");
app.use(cors());


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());

const jwt = require("jsonwebtoken");

mongoose.connect(
    // "mongodb+srv://ragupathi:ragupathi06@cluster0.w57jrrs.mongodb.net/",
        //  "mongodb://127.0.0.1:27017/swiftchat",
        "mongodb+srv://ragupathi:ragupathi06@cluster0.w57jrrs.mongodb.net/?retryWrites=true&w=majority",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
).then(() => {
    console.log("Connected to mongo db");
}).catch((err) => {
    console.log("Error connected to mongo db", err);
})

app.listen(port, () => {
    console.log("server running on port 8000")
})

const User = require('./Models/user');
const Message = require('./Models/message');
const multer = require("multer");




// const stor=multer.diskStorage({
//     destination:function(req,file,cb){
//         cb(null,'dpImg/')  //specifies the desired destination folder
//     },
//     filename:function (req,file,cb){
//         //Generate the unique filename for the uploaded image
//         const uniqueSuffix=Date.now() +'-' + Math.round(Math.random() *1E9);
//         cb(null,uniqueSuffix+ '-'+ file.originalname) 
//     }
// })

// const dpImgLoad = multer({ storage: stor })

// const stor = multer.memoryStorage(); // Store file in memory as a buffer

// const dpImgLoad = multer({ storage: stor });


// end point for register the user

app.post('/register', async(req, res) => {

    const { name, email, password ,image} = req.body;
    
    //create the new user object
    const newUser = new User(
                      { name,
                        email,
                        password,   
                        image:image,
                    });
                        
    //save the user to the database
    newUser.save().then(() => {
        res.status(200).json({ Message: 'user Registered successfully' })
    }).catch((err) => {
        console.log("error register the user", err);
        res.status(500).json({ Message: 'error register the user' })
    })
})



app.use('/dpImg',express.static(path.join(__dirname, 'dpImg')));

//function for create the token for the user

const createToken = (userId) => {

    //set the token payload
    const payLoad = {
        userId: userId
    }

    //Generate the token with a secrete key and expiration time
    const token = jwt.sign(payLoad, "q$r2K6W8n!jCW%ZK", { expiresIn: "1h" });
    return token;
}

//end point for login the particular user
app.post("/login", (req, res) => {

    const { email, password } = req.body;

    //check if the email and password are provided
    if (!email && !password) {
        return res.status(404).json({ message: "Email and password are required" });
    }

    //check for the user in the database
    User.findOne({ email }).then((user) => {
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        //compare the password
        if (user.password != password) {
            return res.status(404).json({ message: "Invalid Password" })
        }

        const token = createToken(user._id);
        res.status(200).json({ token })
    }).catch((err) => {
        console.log("Error in finding the user", err);
        res.status(500).json({ message: "Internal server error" })
    })
})


//end point for get all the users except login user

app.get("/users/:userId", (req, res) => {
    const loggedInUserId = req.params.userId;

    User.find({ _id: { $ne: loggedInUserId } }).then((users) => {
        res.status(200).json(users)
    }).catch((err) => {
        console.log("Error Retrieve the users :", err);
        res.status(500).json({ message: "Error retrive users" })
    })
})

app.get("")

//end point to sent a request to a user
app.post('/friend-request', async (req, res) => {

    const { currentUserId, selectedUserId } = req.body;

    try {

        //update the recepient's friendRequest array
        await User.findByIdAndUpdate(selectedUserId, {
            $push: { friendRequest: currentUserId }
        })

        //update the senders sentRequest array

        await User.findByIdAndUpdate(currentUserId, {
            $push: { senrFriendRequest: selectedUserId }
        })
        res.sendStatus(200);
    }
    catch (err) {
        res.sendStatus(500);
    }
})

//end point to show all the friend request of particular user
app.get('/friend-request/:userId', async (req, res) => {

    try {
        const userId = req.params.userId;

        //fetch the user document based on the userId
        const user = await User.findById(userId).populate("friendRequest", "name email image").lean();

        const friendRequests = user.friendRequest;
        res.status(200).json(friendRequests)

    }
    catch (err) {
        res.status(500).json({ message: "Internal server error" })
    }
})


//end point for accept the friend request of the particular recipient
app.post("/friend-request/accept", async (req, res) => {

    try {
        const { senderId, recepientId } = req.body;

        //retrieve the document of the sender and the recepient
        const sender = await User.findById(senderId);
        const recepient = await User.findById(recepientId);

        sender.friends.push(recepientId);
        recepient.friends.push(senderId);

        recepient.friendRequest = recepient.friendRequest.filter((request) => { request.toString() !== senderId.toString() })

        sender.senrFriendRequest = sender.senrFriendRequest.filter((request) => { request.toString() !== recepientId.toString() })

        await sender.save();
        await recepient.save();
        res.status(200).json({ message: "Friend request accepted successfully" })
    }
    catch (err) {
        res.status(500).json("Internal server error")
    }
})

//end point to access all the friends  of the logged in user

app.get("/accepted-friends/:userId", async (req, res) => {

    try {
        const userId = req.params.userId;
        const user = await User.findById(userId).populate('friends', "name email image").lean();
        const acceptedFriends = user.friends;
        res.json(acceptedFriends)
    }
    catch (error) {
        console.log("accepted friends chat", error);
        res.status(500).json({ message: "Internal server error" })
    }
})
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'files/')  //specifies the desired destination folder
    },
    filename:function (req,file,cb){
        //Generate the unique filename for the uploaded image
        const uniqueSuffix=Date.now() +'-' + Math.round(Math.random() *1E9);
        cb(null,uniqueSuffix+ '-'+ file.originalname) 
    }
})

const upload = multer({ storage: storage })

//end point to post message and store it in the backend

app.post("/messages",upload.single('imageFile'), async(req,res) => {
    try {
        const { senderId, recepientId, messageType, message } = req.body;
        const newMessage = new Message({
                             senderId,
                             recepientId,
                             messageType,
                             message,
                             timestamp: new Date(),
                             imageUrl: messageType === 'image' ? req.file.path!=''?req.file.path:null :null
        })

        await newMessage.save();

        res.status(200).json({ message: "message sent successfully" })
    }
    catch (error) {
        console.log("message error :", error);
        res.status(500).json({ message: "internal server error" })
    }
})



// Serve static files from the 'files' folder
app.use('/files', express.static(path.join(__dirname, 'files')));



//end point to get the user detail to design the chat room header

app.get("/user/:userId", async (req, res) => {

    try {
        const userId = req.params.userId;

        const recepientId = await User.findById(userId);

        res.status(200).json(recepientId);
    }
    catch (error) {
        console.log("chat room header error ::", error)
        res.status(500).json({ message: "internal server error" })
    }
})

//end point to fetch the messages between the two user's  in the chat room
app.get("/messages/:senderId/:recepientId",async(req,res)=>{

    try{
         const {senderId,recepientId}=req.params;
         const messages=await Message.find({
            $or:[
                {senderId:senderId,recepientId:recepientId},
                {senderId:recepientId,recepientId:senderId}
            ]
         }).populate("senderId","_id name")

         res.json(messages);
    }

    catch(error){
         console.log("fetch message",error);
         res.status(500).json({message:"internal server error"})
    }

})


//end point for delete the messages
app.post('/deleteMessages',async(req,res)=>{

    try{
          const {messages}=req.body;
          if(!Array.isArray(messages) || messages.length===0){
            return res.status(400).json({messages:"invalid request body"})
          }
          await Message.deleteMany({_id:{$in:messages}});
          res.status(200).json({messages:"messages deleted successfully..."})
    }
    catch(error){
        console.log("delete message error",error          )
        res.status(500).json({message:"internal server error"})
    }
})


//end point to find the friend requests of the user

app.get("/friend-requests/sent/:userId",async(req,res)=>{
    try{
        const {userId}=req.params;
        const user= await User.findById(userId).populate("senrFriendRequest","name email image").lean();
        const sentFriendRequest=await user.senrFriendRequest || []
        res.json(sentFriendRequest);
    }
    catch(error){
        console.log("error getting friend-request",error)
        res.status(500).json({message:"error getting friend-requests"})
    }
})


//end point  for getting the friends list of the user
app.get("/friends/:userId",async(req,res)=>{
    try{
     const {userId}=req.params;

     User.findById(userId).populate("friends").then((user)=>{
        
        if(!user){
             return res.status(404).json({message:"user not found"})
        }
        else{
            const friendIds=user.friends.map((friend)=>friend._id);
            res.status(200).json(friendIds);
        }
     })

    }
    catch(error){
        console.log("error getting the friends list",error);
        res.status(500).json({message:"error getting the friends list"})
    }
})


//end point to get the log-in user detail for fetch in profileScreen

app.get("/log-user/:userId",async(req,res)=>{

    try{
        const {userId}=req.params;
        const response=await User.findById(userId)
        res.status(200).json(response)
    }
    catch(error){
        console.log("error in getting log-user",error)
        res.status(500).json({message:"error in getting log-user "})
    }
})