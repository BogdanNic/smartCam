var mongoose=require("mongoose");
var bcrypt=require("bcrypt-nodejs");
var uuid=require("node-uuid");
var userSchema=mongoose.Schema({
    name:{type:String ,require:true},
    email:{type:String},
    password:String,
    createdAt:{ type : Date, default: Date.now },
    age:Number,
    api:String
});
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password2) {
    console.log(password2,"pas");
    console.log(this.password,"pas2");
    return bcrypt.compareSync(password2, this.password);
};


userSchema.methods.setApi=function(){
    return this.api=uuid.v4();
};
userSchema.methods.validApi=function(api){
    return this.password.trim(20)===api;
};
module.exports=mongoose.model("User",userSchema);