var mongoose=require("mongoose");
var Schema=mongoose.Schema;

var recordSchema = mongoose.Schema({
    user:{type:Schema.Types.ObjectId,ref:"User"},
    record_id:String,
    createdAt: {type: Date, default: Date.now},
    duration:{type:Number,default:0},
    size:{type:Number,default:0},
    imageUrl:String,
    videoUrl:String,
});
module.exports = mongoose.model("Record", recordSchema);