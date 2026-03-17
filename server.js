const express = require("express");
const path = require("path");
const session = require("express-session");
const mongoose = require("mongoose");
const User = require("./models/User");
const Course = require("./models/Course");

const app = express();

const PORT = process.env.PORT || 3000;


/* ---------------- MIDDLEWARE ---------------- */

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(session({
secret:"secret123",
resave:false,
saveUninitialized:true
}));

app.use(express.static(path.join(__dirname,"public")));

const viewsPath = path.join(__dirname,"views");

mongoose.connect("mongodb+srv://neilrego3_db_user:1jaqQmuk7O5VCY5h@cluster0.mg1s55s.mongodb.net/courseRegSystem?retryWrites=true&w=majority")
.then(()=>{
    console.log("MongoDB Connected");
})
.catch(err=>{
    console.log(err);
});


/* ---------------- DATA (IN MEMORY) ---------------- */

let users=[];

let courses=[
{
_id:"1",
code:"CS101",
title:"Introduction to Computer Science",
instructor:"Dr Smith",
schedule:"Mon 10:00",
credits:3,
capacity:30,
enrolled:0,
description:"Basic programming and algorithms"
},
{
_id:"2",
code:"MATH201",
title:"Calculus",
instructor:"Dr John",
schedule:"Tue 11:00",
credits:4,
capacity:25,
enrolled:0,
description:"Differential calculus and limits"
},
{
_id:"3",
code:"PHY202",
title:"Physics",
instructor:"Dr Brown",
schedule:"Wed 09:00",
credits:3,
capacity:20,
enrolled:0,
description:"Mechanics and thermodynamics"
}
];


/* ---------------- PAGE ROUTES ---------------- */

app.get("/",(req,res)=>{
res.sendFile(path.join(viewsPath,"login.html"));
});

app.get("/login",(req,res)=>{
res.sendFile(path.join(viewsPath,"login.html"));
});

app.get("/register",(req,res)=>{
res.sendFile(path.join(viewsPath,"register.html"));
});

app.get("/home",(req,res)=>{
if(!req.session.user){
return res.redirect("/login");
}
res.sendFile(path.join(viewsPath,"home.html"));
});

app.get("/courses",(req,res)=>{
if(!req.session.user){
return res.redirect("/login");
}
res.sendFile(path.join(viewsPath,"courses.html"));
});

app.get("/my-courses",(req,res)=>{
if(!req.session.user){
return res.redirect("/login");
}
res.sendFile(path.join(viewsPath,"my-courses.html"));
});


/* ---------------- AUTH ---------------- */

app.post("/register", async (req,res)=>{

const {username,email,phone,password,confirmPassword} = req.body;

if(password!==confirmPassword){
return res.status(400).json({error:"Passwords do not match"});
}

const userExists = await User.findOne({email});

if(userExists){
return res.status(400).json({error:"User already exists"});
}

const newUser = new User({
username,
email,
phone,
password,
courses:[]
});

await newUser.save();

res.json({message:"Registration successful"});

});


app.post("/login", async (req,res)=>{

const {email,password} = req.body;

const user = await User.findOne({email,password});

if(!user){
return res.status(401).json({error:"Invalid credentials"});
}

req.session.user = user;

res.json({message:"Login successful"});

});


app.get("/logout",(req,res)=>{

req.session.destroy(()=>{
res.redirect("/login");
});

});


/* ---------------- USER ---------------- */

app.get("/api/user",(req,res)=>{

if(!req.session.user){
return res.status(401).json({error:"Not logged in"});
}

res.json(req.session.user);

});


/* ---------------- COURSES ---------------- */

app.get("/api/courses", async (req,res)=>{

const courses = await Course.find();

res.json(courses);

});


app.get("/api/user/courses", async (req,res)=>{

if(!req.session.user){
return res.status(401).json({error:"Unauthorized"});
}

const user = await User.findById(req.session.user._id).populate("courses");

res.json(user.courses);

});


app.post("/api/courses/register", async (req,res)=>{

const {courseId} = req.body;

const user = await User.findById(req.session.user._id);

if(user.courses.includes(courseId)){
return res.status(400).json({error:"Already registered"});
}

user.courses.push(courseId);

await user.save();

await Course.findByIdAndUpdate(courseId,{
$inc:{enrolled:1}
});

res.json({message:"Registered successfully"});

});


app.delete("/api/courses/drop/:id", async (req,res)=>{

const courseId = req.params.id;

const user = await User.findById(req.session.user._id);

user.courses = user.courses.filter(c=>c.toString()!==courseId);

await user.save();

await Course.findByIdAndUpdate(courseId,{
$inc:{enrolled:-1}
});

res.json({message:"Course dropped"});

});


/* ---------------- SERVER ---------------- */

app.listen(PORT,()=>{
console.log("Server running on port "+PORT);
});