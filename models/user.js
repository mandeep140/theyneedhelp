const mongoose = require("mongoose");
const Schema = mongoose.Schema
const passportMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        require: true,
        unique: true
    },
    name: {
        type: String,
        require: true
    },
    admin: {
        type: Boolean,
        default: false
    },
    ngo:{
        type: Boolean,
        default: false
    },
    address: {
        type: String,
        default: "Not given"
    },
    otp: { type: String }, 
    otpExpires: { type: Date }, 
    verified: {
        type: Boolean,
        default: false
    },
    change:{
        type:Boolean,
        default:false
    }
});

userSchema.plugin(passportMongoose);
module.exports = mongoose.model("User", userSchema);