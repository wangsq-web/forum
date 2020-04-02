
var MongoClient = require('mongodb').MongoClient;

function _connectDB(callback){
  var url = 'mongodb://127.0.0.1:27017';
  MongoClient.connect(url, function(err,client){
    if(err){
      console.log('链接数据库失败'); 
      return;
    }
    console.log('链接数据库成功');
    callback(err,client);
  })
}

// 插入数据
exports.insertOne = function(dbname,collectionName,json,callback){
  _connectDB(function(err,client){
    const db = client.db(dbname);
    db.collection(collectionName).insertOne(json,function(err,result){
      callback(err,result);
      client.close();
    })
  })
}

// 查找数据
exports.find = function(dbname,collectionName,json,c,d){
  var list = [];
  if(arguments.length == 4){
    var callback = c ;
    var skipnumber = 0;
    var limit = 0;
  }else if(arguments.length == 5){
    var callback = d;
    var args = c;
    var skipnumber = args.pageamount * args.page;
    var limit = args.pageamount
  }else{
    throw new Error("find函数参数不对");
    client.close();
    return;
  }
  // if(arguments.length != 5){
  //   callback("需要五个参数", null);
  //   return
  // }
  _connectDB(function(err,client){
    var db = client.db(dbname);
    var result = {};
    // var skipnumber = args.pageamount * args.page;
    // var limit = args.pageamount
    var cursor = db.collection(collectionName).find(json).skip(skipnumber).limit(limit).sort({"dateTime": -1});
    cursor.each( (err,doc) => {
      if(err){
        console.log("查找失败")
        callback(err,null);
        client.close();
        return;
      }
      if(doc != null){
        list.push(doc);
      }else{
        var count = 0
        db.collection(collectionName).stats().then( (stats)=> {
          if(stats != null){
            count = stats.count
          }
          result = {
            "count": count,
            "list": list
          }
          callback(null,result);
          client.close();
        }).catch( err =>{
          console.log(err)
          callback("获取数据总条数",null);
          client.close();
        });
        
      }
    })
  })
}

// 插入数据
exports.update = function(dbname,collectionName,json,json2,callback){
  _connectDB(function(err,client){
    const db = client.db(dbname);
    db.collection(collectionName).update(json,json2,function(err,result){
      callback(err,result);
      client.close();
    })
  })
}