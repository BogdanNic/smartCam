var User = require('../models/userSchema');
var Record = require('../models/recordSchema');

function insert(user, callback) {
    console.log(user.name + ' is inserting');

    var user = new User({ name: user.name });
    user.save(e => console.log(e));
    console.log(user);

    //console.log('save');
    callback(true);
}
function login(user,callback){
    var user = User.findOne({name:user.name},function(err,user){
        //console.log(user);
        if (!err && user)
         callback(user);
         else console.log(err);
    });
}


module.exports = {
    insert: insert,
     login:login
};