const express = require("express")
const {UserModel} = require("../models/usermodel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {authenticate} = require("../middleware/authorization")
const {PostModel} = require("../models/postsmodel")
require("dotenv").config()

const postRoute = express.Router();

postRoute.post("/posts",async(req,res)=>{
    const {text,image} = req.body;
    let id = req.body.userid
    let user = await UserModel.findOne({_id:id})
    let createdAt = new Date()
    let obj = {
        user: user,
        text: text,
        image: image,
        createdAt: createdAt,
        likes: [],
        comments: [],
        userid : id
    }
    const post = new PostModel(obj);
     await post.save()
     res.send("Post created Successfully")
})

postRoute.patch("/posts/:id",async(req,res)=>{
    try {
        await PostModel.findByIdAndUpdate({_id:req.params.id},req.body);
        res.send("Post Updaed successfully")
        
    } catch (error) {
        res.send("NOthing found wiht the given id")
    }
})

postRoute.delete("/posts/:id",async(req,res)=>{
    try {
        await PostModel.findByIdAndDelete({_id:req.params.id});
        res.send("Post deleted successfully")
    } catch (error) {
        res.send("NO post availabve with the given id")
    }
})

postRoute.post("/posts/:id/like",async(req,res)=>{
    let id = req.params.id;
    try {
        let post = await PostModel.findOne({_id:id});
        let likes = post.likes
        likes.push(req.body.userid)
        await PostModel.findByIdAndUpdate({_id:id},{likes:likes});
        res.send("liked ❤️")
    } catch (error) {
        res.send("NO id is present")
    }
});

postRoute.post("/posts/:id/comment",async(req,res)=>{
    let id = req.params.id;
    try {
        let post = await PostModel.findOne({_id:id});
        let comments = post.comments;
        comments.push(req.body.msg);
        await PostModel.findByIdAndUpdate({_id:id},{comments:comments});
        res.send("Commented successfully")
    } catch (error) {
        res.send("some thing went wrong")
    }
})

postRoute.get("/posts/:id",async(req,res)=>{
    try {
        let post = await PostModel.findOne({_id:req.params.id});
        res.send(post)
        
    } catch (error) {
        
    }
})


module.exports={
    postRoute
}