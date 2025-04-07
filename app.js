// require all necessary packages, libraries, files and data
if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}
const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const methOverride = require("method-override");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const mongo_url = process.env.MONGO_URL;
const wrapAsync = require("./utils/wrapAsync.js");
const Post = require("./models/post.js");
const User = require("./models/user.js");
const Comment = require("./models/comment.js");
const strategy = require("passport-local");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const multer = require("multer");
const bodyParser = require("body-parser");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const cors = require("cors");
const states = require("./public/data_file/states.js");
const { url } = require('inspector');
const sendOtpEmail = require("./utils/sendOtp.js");
const crypto = require("crypto");


// setting up project
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public"))); // extra files like .css, .js and other resouces files will come from public folder  
app.set("views", path.join(__dirname, "views"));  // all ejs files will be come from views folder
app.use(express.urlencoded({ extended: true }));
app.use(methOverride("_method"));
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejsMate);
app.use(express.json({ limit: "210mb" }));
app.use(express.urlencoded({ limit: "210mb", extended: true }));

// connecting to db
main().then(() => {
    console.log("Connected to db");
}).catch(err => {
    console.log("ERROR!!!!!!!!!!!", err)
})

async function main() {
    await mongoose.connect(mongo_url);
}

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET,
});

const upload = multer({
    storage: multer.diskStorage({}),
    limits: {
        fieldSize: 200 * 1024 * 1024, // 200MB for form fields (not files)
    },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === "post_image" && file.mimetype.startsWith("image/")) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit for images
                return cb(new Error("Image file size must be less than 10MB"), false);
            }
        } else if (file.fieldname === "post_video" && file.mimetype.startsWith("video/")) {
            if (file.size > 200 * 1024 * 1024) { // 200MB limit for videos
                return cb(new Error("Video file size must be less than 200MB"), false);
            }
        }
        cb(null, true);
    }
});

// Upload File to Cloudinary function
async function uploadToCloudinary(filePath, resourceType) {
    try {
        const result = await cloudinary.uploader.upload(filePath, { resource_type: resourceType });
        fs.unlinkSync(filePath); // Delete local file after upload
        return { url: result.secure_url, publicId: result.public_id }; // Return public_id
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        throw error;
    }
}

const sessionOption = {
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 10 * 24 * 60 * 60 * 1000,
        maxAge: 10 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
}


//setting up project part 2
app.use(session(sessionOption));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new strategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(flash());
app.use((req, res, next) => {
    res.locals.currUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});


// All ports
// Home 
app.get("/", (req, res) => {
    res.render("paths/home.ejs");
});

app.get("/admin", wrapAsync(async(req,res)=>{
    if (!req.isAuthenticated()) {
        req.flash("error", "Login First");
        return res.redirect("/login");
    }
    if (req.user.admin == false){
        req.flash("error", "You are not authorised for this path!");
        return res.redirect("/");
    }
    let users = await User.find({});
    res.render("paths/admin.ejs", {users});
}));

app.post("/admin", wrapAsync(async(req, res)=>{
    if (!req.isAuthenticated()) {
        req.flash("error", "Login First");
        return res.redirect("/login");
    }
    if (req.user.admin == false){
        req.flash("error", "You are not authorised for this path!");
        return res.redirect("/");
    }
    let {userId, state} = req.body;
    let user = await User.findById(userId);
    if(user.ngo == false){
        user.address = state;
    }
    user.ngo = !user.ngo;
    await user.save();
    req.flash("success", "Type changed!");
    res.redirect("/admin");
}));

//Sign-up
app.get("/signup", (req, res) => {
    res.render("paths/sign-up.ejs");
});

app.post("/signup", wrapAsync(async (req, res) => {
        let { username, email, password, name } = req.body;
        const user_mail = await User.findOne({ email });
        username = username.toLowerCase();
        if(user_mail){
            req.flash("error", "this e-mail is already registered");
            return res.redirect("/signup");
        }
        if(username.includes(" ")){
            req.flash("error", "spaces are not allowed in username!");
            return res.redirect("/signup");
        }
        let newUser = new User({ email, username, name });
        let registeredUser = await User.register(newUser, password);
        req.flash("success", "Sign-Up Successfull, now you can login");
        req.login(registeredUser, (err) => {
            if (err) {
                next(err)
            }
            req.flash("success", "Login success, verify your e-mail to upload case!");
            res.redirect("/verify");
        });
}));


//login
app.get("/login", (req, res) => {
    res.render("paths/login.ejs");
});

app.post("/login", passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), wrapAsync(async (req, res) => {
    if(req.user.verified == false){
        req.flash("error", "your e-mail is not verified yet... Verify now to upload case");
        return res.redirect("/verify");
    }
    req.flash("success", "Login success, Welcome to TheyNeedHelp");
    res.redirect("/case");
}));


//log-out
app.get("/logout", (req, res, next) => {
    req.logOut((err) => {
        if (err) {
            next(err)
        }
    });
    req.flash("success", "User Logged-out");
    res.redirect("/case");
});


//forgot your password
app.get("/forgot", (req, res)=>{
    res.render("paths/forgot.ejs");
});

app.get("/forgot-otp", wrapAsync(async(req, res)=>{
    let {username, email} = req.query;
    let user = await User.findOne({username});
    if(!user){
        req.flash("error", `this user @${username} is not exits`);
        return res.redirect("/signup");
    }
    if(user.email != email){
        req.flash("error", `given e-mail is invalid`);
        return res.redirect("/forgot");
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60000); // OTP expires in 5 minutes

    await user.save();
    await sendOtpEmail(email, otp);
    req.session.email = email;

    res.render("paths/forgot_otp.ejs");
}));

app.post("/forgot-otp", wrapAsync(async(req, res)=>{
    let {otp} = req.body;
    let OTP = otp.join("");
    let email = req.session.email;
    let user = await User.findOne({ email })
    if (OTP == user.otp){
        user.verified = true;
        user.otp = null;
        user.otpExpires = null;
        user.change = true;
        await user.save();
        res.json({ success: true, message: "OTP verified successfully!" }); 
    } else{
        res.json({ success: false, message: "invalid or expired OTP" }); 
    }
}));

app.get("/change-password", wrapAsync(async(req, res)=>{
    if(!req.session.email){
        req.flash("error", "some error happened while fetching email");
        return res.redirect("/login");
    }
    res.render("paths/new_password.ejs");
}));

app.post("/change-password", wrapAsync(async(req, res)=>{
    if(!req.session.email){
        req.flash("error", "some error happened while fetching email");
        return res.redirect("/login");
    }
    let email = req.session.email;
    let {password} = req.body;
    let user = await User.findOne({ email });
    if(user.change == false){
        req.flash("error", "you are not allowed to change password for now");
        return res.redirect("/login");
    }
    await user.setPassword(password);
    user.change = false;
    req.session.email = null;
    await user.save();
    req.flash("success", "Password change successfully, now you can login");
    res.redirect("/login");
}));


//Search autocomplete
app.get("/search", (req, res) => {
    const query = req.query.q;
    if (!query) return res.json([]);

    const filteredStates = states.filter(state =>
        state.toLowerCase().startsWith(query.toLowerCase())
    );
    res.json(filteredStates);
});


//search case by state name
app.post("/search", wrapAsync(async (req, res) => {
    const searchQuery = req.body.search.trim().toLowerCase().replace(/\s+/g, '');
    const search = req.body.search;
    let posts = await Post.find({ state: new RegExp(`^${searchQuery}$`, "i") });
    res.render("components/search.ejs", { posts, search });
}));


//case in my-state
app.get("/my-state", async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You need to login to see my-state cases");
        return res.redirect("/login");
    }
    if (req.user.ngo != true) {
        req.flash("error", "this path is currently not available for everyone.");
        return res.redirect("/case");
    }
    let state = req.user.address;
    let posts = await Post.find({ state: new RegExp(`^${state}$`, "i") });
    res.render("paths/my_state.ejs", { posts, search: state });
});


// OTP authentication for e-mail
app.get("/verify", wrapAsync(async(req, res)=>{
    if (!req.isAuthenticated()) {
        req.flash("error", "You need to login to verify email");
        return res.redirect("/login");
    }
    if (req.user.verified == true){
        req.flash("success", "your e-mail already verified");
        return res.redirect("/case");
    }

    const email = req.user.email;
    let user = await User.findOne({ email });

    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60000); // OTP expires in 5 minutes

    await user.save();
    await sendOtpEmail(email, otp);

    res.render("paths/verify.ejs");
}));

app.post("/verify", wrapAsync(async(req, res)=>{
    if (!req.isAuthenticated()) {
        req.flash("error", "You need to login to verify email");
        return res.redirect("/login");
    }
    if (req.user.verified == true){
        req.flash("success", "your e-mail is already verified");
        return res.redirect("/case");
    }

    let {otp} = req.body;
    let OTP = otp.join("");
    let email = req.user.email;
    let user = await User.findOne({ email });

    if (OTP == user.otp){
        user.verified = true;
        user.otp = null;
        user.otpExpires = null;
        await user.save();
        res.json({ success: true, message: "OTP verified successfully!" }); 
    } else{
        res.json({ success: false, message: "invalid or expired OTP" }); 
    }
}));


// about 
app.get("/about", (req, res) => {
    res.render("paths/about.ejs");
});


// ALL Cases 
app.get("/case", wrapAsync(async (req, res) => {
    let all = await Post.find({});
    res.render("paths/case.ejs", { all });
}));


//Create new case
app.get("/new-case", (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You need to login to upload new case");
        return res.redirect("/login");
    }
    if(req.user.verified == false){
        req.flash("error", "your e-mail is not verified... Verify now to upload case");
        return res.redirect("/verify");
    }
    res.render("paths/new_case.ejs");
});

app.post("/case", upload.fields([{ name: "post_image" }, { name: "post_video" }]), wrapAsync(async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You need to login to upload new case");
        return res.redirect("/login");
    }
    if(req.user.verified == false){
        req.flash("error", "your e-mail is not verified yet... Verify now to upload case");
        return res.redirect("/verify");
    }

    if (!req.files["post_image"] || !req.files["post_video"]) {
        req.flash("error", "Some files are missing, try again.");
        return res.redirect("/new-case");
    }

    // Check file size before Cloudinary upload
    const imageFile = req.files["post_image"][0];
    const videoFile = req.files["post_video"][0];

    if (imageFile.size > 10 * 1024 * 1024) {
        req.flash("error", "image should be less then 10 MB!");
        return res.redirect("/new-case");
    }
    if (videoFile.size > 199 * 1024 * 1024) {
        req.flash("error", "Video should be less then 199 MB!");
        return res.redirect("/new-case");
    }

    const imageUpload = await uploadToCloudinary(req.files["post_image"][0].path, "image");
    const videoUpload = await uploadToCloudinary(req.files["post_video"][0].path, "video");

    let post = req.body.post;
    let new_post = new Post(post);
    new_post.owner = req.user._id;
    new_post.image = imageUpload.url;
    new_post.video = videoUpload.url;
    new_post.imagePublicId = imageUpload.publicId;
    new_post.videoPublicId = videoUpload.publicId;
    new_post.updatedBy = req.user.username
    await new_post.save();
    req.flash("success", "Case uploaded successfully.");
    res.redirect("/case");
}));


// more info about case
app.get("/case/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let post = await Post.findById(id).populate({ path: "comments", populate: { path: "owner" }, }).populate("owner");

    if (!post) {
        req.flash("error", "Case not found.");
        return res.redirect("/case");
    }
    res.render("paths/more-info.ejs", { post });
}));


// update case info
app.get("/case/:id/edit", wrapAsync(async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You need to login to Update the case");
        return res.redirect("/login");
    }
    let { id } = req.params;
    let post = await Post.findById(id);
    res.render("paths/update.ejs", { post });
}));

app.put("/case/:id", wrapAsync(async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You need to login to Update the case");
        return res.redirect("/login");
    }
    let post = req.body.post
    let { id } = req.params;
    let updatedpost = await Post.findById(id);
    updatedpost.updatedBy = req.user.username;
    updatedpost.update = post.update;
    await Post.findByIdAndUpdate(id, { ...updatedpost });
    res.redirect(`/case/${id}`);
}));


// delete case 
app.delete("/case/:id", wrapAsync(async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You need to login to delete the case");
        return res.redirect("/login");
    }
    let { id } = req.params;
    let post = await Post.findById(id);
    if (!post.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the owner of this case to delete it");
        return res.redirect(`/case/${id}`)
    }
    await cloudinary.uploader.destroy(post.imagePublicId); // Delete image
    await cloudinary.uploader.destroy(post.videoPublicId, { resource_type: "video" }); // Delete video
    await Post.findByIdAndDelete(id);
    res.redirect("/case");
}));


// Comments for case
app.post("/case/:id/comment", wrapAsync(async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You need to login to add comment");
        return res.redirect("/login");
    }
    let post = await Post.findById(req.params.id);
    let newComment = new Comment(req.body.comment);
    newComment.owner = req.user._id;

    post.comments.push(newComment);

    await newComment.save();
    await post.save();
    req.flash("success", "Comment Added");
    res.redirect(`/case/${req.params.id}`);
}));

app.delete("/case/:id/comment/:commentId", wrapAsync(async (req, res) => {
    let { id, commentId } = req.params;
    if (!req.isAuthenticated()) {
        req.flash("error", "You need to login to delete comment");
        return res.redirect("/login");
    }

    let comment = await Comment.findById(commentId);
    if (!comment.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You can't delete because you are not owner of that comment");
        return res.redirect(`/case/${id}`);
    }

    await Post.findByIdAndUpdate(id, { $pull: { comments: commentId } });
    await Comment.findByIdAndDelete(commentId);
    req.flash("success", "Comment Deleted");

    res.redirect(`/case/${id}`);
}));


//mark as solved
app.put("/case/:id/solved", wrapAsync(async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You need to login to mark this case as solve");
        return res.redirect("/login");
    }
    let { id } = req.params;
    let post = await Post.findById(id);

    if (req.user.ngo != true || req.user.admin != true) {
        req.flash("error", "you are not authorised to mark this case as solved");
        return res.redirect(`/case/${id}`);
    }
    if (post.isSolved == true) {
        req.flash("success", `Already marked as solved by @${post.solvedBy}`);
        return res.redirect(`/case/${id}`);
    }
 
    post.isSolved = true;
    post.solvedBy = req.user.username;
    await Post.findByIdAndUpdate(id, { ...post });
    req.flash("success", "Successfully marked as solved.");
    res.redirect(`/case/${id}`);
}));


//Page not found
app.all("*", (req, res) => {
    res.render("paths/not_found.ejs");
});


// middleware for errors
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Somethong went wrong!" } = err;
    message = "Error: " + message;
    res.status(statusCode).render("components/error.ejs", { message });
});


// final listning  
app.listen(port, (req, res) => {
    console.log(`app is started at ${port}`);
});