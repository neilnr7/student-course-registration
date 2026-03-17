const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({

code:String,
title:String,
instructor:String,
schedule:String,
credits:Number,
capacity:Number,
enrolled:Number,
description:String

});

module.exports = mongoose.model("Course",courseSchema);