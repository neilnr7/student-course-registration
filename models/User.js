const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

username:String,
email:String,
phone:String,
password:String,

courses:[
{
type:mongoose.Schema.Types.ObjectId,
ref:"Course"
}
]

});

module.exports = mongoose.model("User",userSchema);