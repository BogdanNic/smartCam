
var Record = require('../models/recordSchema');
var moment = require('moment');

function insert(user, name, size, duration, createAt, callback){



var record =new Record({user:user._id, record_id:name, duration:duration, size:size, createAt:createAt});
 record.save(e=>console.log(e));
 console.log(record);

 console.log('save Record');
 callback(true);
}


function get(callback)
{
  moment.locale('ro');
    Record.collection.aggregate([
    {
        $project: {year:{ "$year": "$createdAt"},"createdAt":1,"size":1, "month":{"$month": "$createdAt" },"iamge":"s"}
    }
    ,{
       "$group": 
         {
           "_id": {"month":{ "$month": "$createdAt"},"createdAt":"$createdAt"},
           "record":{"$push": "$$ROOT"},
          

         },
     },{$sort: {'_id.month':1}},
     
      {
       "$group": 
         {
           "_id": {"year":{ "$year": "$_id.createdAt"},"month":{"$month":"$_id.createdAt"}},
           "records":{"$push": "$$ROOT"},
           

         },
     },{$sort: {'_id.month':1}},
          {
       "$group": 
         {
           "_id": {"year":{ "year": "$_id.year"}},
           "months":{"$push": "$$ROOT"},

         },
     },
      {
        $project: {_id:0,"year": "$_id.year.year",'months':1}
      },
      {
        $sort: {'year':1}
      }
   
   ],function(err,arr){
     var monthsName= ['Ianuarie','Februrie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie'];
        arr.forEach(function (element) {
        if (element.months)
          myM = element.months;
          myM.forEach(function (el) {
            el._id.month = monthsName[el._id.month];
            if (el.records) {
                var recordSS = el.records;
                recordSS.forEach(function (item) {
                var recordSS2 = item.record;
                recordSS2.forEach(function (item2) {
                    item2.createdAt = moment(item2.createdAt).fromNow(true);
                }, this);
              }, this);
            }
          }, this)
      }, this);
      callback(arr);
   });




}
module.exports={
    insert:insert,
    get:get,
   
};