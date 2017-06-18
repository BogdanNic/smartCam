
var Record = require('../models/recordSchema');
var moment = require('moment');

function insert(user, location, size, duration, createAt, callback){



var record =new Record({user:user._id, location:location, duration:duration, size:size, createAt:createAt});
 record.save(e=>console.log(e));
 console.log(record);

 console.log('save Record');
 callback(true);
}


function getRecents(callback)
{
  Record.find().sort({'createAt':-1}).limit(10).exec(function(err,recents){
      //console.log(recents);
      if (!err){
        callback(recents);
      }
  })
}

function get(callback)
{
  moment.locale('ro');
    Record.collection.aggregate([
    {
        $project: {year:{ "$year": "$createdAt"},"createdAt":1,"size":1, "month":{"$month": "$createdAt" },"location":1,"duration":1}
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
                var sizeTotal=0; 
                var recordSS = el.records;
                recordSS.forEach(function (item) {
                var recordSS2 = item.record;
                recordSS2.forEach(function (item2) {
                    item2.createdAt = moment(item2.createdAt).fromNow(false);
                    duration = moment.duration(item2.duration);
                    item2.duration =duration.hours()+":"+ duration.seconds()+":"+ duration.milliseconds(); 
                    sizeTotal+=item2.size;
                }, this);
                console.log(sizeTotal);
              el.sizeTotal = sizeTotal;
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
    getRecents:getRecents
   
};