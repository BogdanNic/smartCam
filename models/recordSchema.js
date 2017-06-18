var mongoose=require("mongoose");
var Schema=mongoose.Schema;

var recordSchema = mongoose.Schema({
    user:{type:Schema.Types.ObjectId,ref:"User"},
    location:String,
    createdAt: {type: Date, default: Date.now},
    duration:{type:Number,default:0},
    size:{type:Number,default:0},
});
module.exports = mongoose.model("Record", recordSchema);