
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
  Record.find().sort({'createdAt':-1}).limit(10).exec(function(err,recents){
      console.log(recents);
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
     },{$sort: {'_id.month':-1}},
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
if(err) console.log(err);
     var monthsName= ['Test','Ianuarie','Februrie','Martie','Aprilie','Mai','Iunie','Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie'];
        arr.forEach(function (element) {
        if (element.months)
          myM = element.months;
          myM.forEach(function (recordingMonth) {
            recordingMonth._id.month = monthsName[recordingMonth._id.month];
            if (recordingMonth.records) {
                var sizeTotal=0,count=0; 
                var recordSS = recordingMonth.records;
                recordSS.forEach(function (item) {
                var recordSS2 = item.record;
                recordSS2.forEach(function (record) {
                    record.createdAt = moment(record.createdAt).fromNow(false);
                    duration = moment.duration(record.duration);
                    record.duration =duration.hours()+":"+ duration.seconds()+":"+ duration.milliseconds(); 
                    record.size =parseInt(record.size/1024);
                    sizeTotal+=record.size;
                    count++;
                }, this);
                console.log(sizeTotal);
              recordingMonth.sizeTotal = sizeTotal;
              recordingMonth.count = count;
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