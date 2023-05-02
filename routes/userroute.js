const express = require("express")
const {UserModel} = require("../models/usermodel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {authenticate} = require("../middleware/authorization")
const {PostModel} = require("../models/postsmodel")
require("dotenv").config()

const userRoute = express.Router();

userRoute.post("/register",async(req,res)=>{
    const { name,email,password,dob,bio} = req.body;
    try {
        let all_data = await UserModel.find({email});
        if(all_data.length === 0){
            bcrypt.hash(password, 5,async(err,val)=>{
                if(err){
                    res.status(201).send({"err":"login is not working"})
                }else{
                    let obj = {
                        name: name,
                        email: email,
                        password: val,
                        dob: dob,
                        bio: bio,
                        posts: [],
                        friends: [],
                        friendRequests: []
                    }
                    const user = new UserModel(obj);
                    await user.save()
                    res.send("User registered Successfully")
                }
            })
        }else{
            res.send({"msg":"User already Regester"})
        }
    } catch (error) {
        res.send({"msg":"Error in registering the user"})
        console.log(error)
    }
})

userRoute.get("/users",async(req,res)=>{
    let all_data = await UserModel.find({});
    try {
        res.send(all_data)
    } catch (error) {
        res.send({"msg":"Some thing went wrong in user route"})
    }
})


userRoute.post("/login",async(req,res)=>{
    const {email,password}=req.body;
    
    try {
        const user = await UserModel.find({email});
        const hashed_pass = user[0].password;
        if(user.length>0){
            bcrypt.compare(password,hashed_pass,(err,result)=>{
                if(result){
                    const token = jwt.sign({userid:user[0]._id},process.env.KEY);
                    res.status(201).send({"msg":"Login Successfull","username":user[0].name,"email":user[0].email,"Access_Token":token})
                }else{
                    res.send({"msg":"Wrong Credntials"})
                }
            })
        }else{
            res.send({"msg":"User Not registered"})
        }
    } catch (error) {
        res.send({"msg":"some thing went wrong in login"})
    }
})


userRoute.get("/users/:id/friends",async(req,res)=>{
    let id = req.params.id
    let all_data = await UserModel.findOne({_id:id});
    try {
        res.send(all_data.friends)
    } catch (error) {
        res.send({"msg":"User Not found with the given id"})
    }
})




userRoute.use(authenticate);

userRoute.post("/users/:id/friends",async(req,res)=>{
    let reqid = req.params.id;
    let mainid = req.body.userid
    let friend = await UserModel.findOne({_id:reqid});
    let requests = friend.friendRequests
    try {
        if(requests.length===0){
            requests.push(mainid);
            await UserModel.findByIdAndUpdate({_id:reqid},{friendRequests:requests})
            res.send({"msg":"Friend request send"})
        }else{
            let status = false;
            for(let i = 0;i<requests.length;i++){
                if(requests[i] == mainid){
                    status = true;
                    break;
                }
            }
            if(status){
                res.send({"msg":"Friend request already send"});
            }else{
                requests.push(mainid);
                await UserModel.findByIdAndUpdate({_id:reqid},{friendRequests:requests})
                res.send({"msg":"Friend request send"})
            }
        }
    } catch (error) {
        console.log(error)
    }
})



userRoute.patch("/users/:id/friends/:friendId",async(req,res)=>{
    let id = req.params.friendId
    let user = await UserModel.findOne({_id:req.body.userid});
    let friends = user.friends
    let requests = user.friendRequests
    try {
        if(req.body.accept){
            friends.push(id);
            await UserModel.findByIdAndUpdate({_id:req.body.userid},{friends:friends});
            for(let i = 0;i<requests.length;i++){
                if(requests[i] == id){
                    requests.splice(i,1);
                    break;
                }
            }
            await UserModel.findByIdAndUpdate({_id:req.body.userid},{friendRequests:requests});
            res.send({"msg":"Friend request accepted"})
        }else{
            for(let i = 0;i<requests.length;i++){
                if(requests[i] == id){
                    requests.splice(i,1);
                    break;
                }
            }
            await UserModel.findByIdAndUpdate({_id:req.body.userid},{friendRequests:requests});
            res.send({"msg":"Friend request denied"})
        }
    } catch (error) {
        console.log(error)
    }
})

userRoute.get("/posts",async(req,res)=>{
    let id = req.body.userid
    try {
        let user = await UserModel.findOne({_id:id});
        let posts = await PostModel.find({userid : id});
        let post = user.posts
        post.push(posts)
        await UserModel.findByIdAndUpdate({_id:req.body.userid},{posts:posts});
        res.send(posts)
        
    } catch (error) {
        console.log(error)
    }
})





module.exports={
    userRoute
}