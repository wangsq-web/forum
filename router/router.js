var ObjectId = require("mongodb").ObjectId;
var hash = require("../model/hash");
var db = require("../model/main.js");

// 首页
exports.showIndex = function(req,res){
  let result = {};
  if(req.session.login && req.session.login == "1"){
    result = {
      login: true,
      name: req.session.username,
      msg: ""
    }
  }else{
    result = {
      login: false,
      name: "",
      msg: "你没有登录"
    }
  }
  res.render("index",result)
}

// 登录
exports.showLogin = function(req,res){
  res.render("login")
}
exports.doLogin = function(req,res){
  var name = req.body.username;
  var psd = req.body.password;
  db.find("forum","users",{"username": name},function(err, result){
    if(err){
      res.json({success: false, msg: err});
      return;
    }
    if(result.list.length == 0){
      res.json({success: false,msg: "没有该用户"});
      return;
    }
    var sjkpsd = result.list[0].password;
    if(hash(psd) == sjkpsd){
      req.session.login = "1";
      req.session.username = result.list[0].username;
      res.json({success: true});
    }else{
      res.json({success: false,msg: "密码错误"});
    }
  })
}

// 注册
exports.showRegister = function(req,res){
  res.render("register")
}
exports.doRegister = function(req,res){
  let name = req.body.username;
  // 查找用户是否存在
  db.find("forum","users",{"username": name},function(err, result){
    if(err || result.list.length == 0){
      // 不存在
      db.insertOne("forum","users",{
        "username": req.body.username,
        "password": hash(req.body.password),
        "avatar": 'default.jpg',
        "dateTime": new Date().getTime(),
      },function(err2,result2){
        if(err2){
          res.json({success: false, msg: '添加用户失败'});
          return;
        }
        req.session.login = "1";
        req.session.username = req.body.username;
        req.session.id = result2.ops[0]._id
        res.json({success: true});
      })
    }else{
      res.json({success: false, msg: '用户名已存在'});
    }
  });
}

// 获取说说列表
exports.getForum = function(req,res){
  if(req.session.login != "1"){
    res.json({success: false, msg: '未登录异常'});
    return;
  }
  let pageamount = req.body.limit||10;
  let page = req.body.page||0;
  let paging = {pageamount: pageamount,page: page}
  db.find("forum","comments",{},paging,function(err, result){
    if(err){
      res.json({success: false, msg: err});
      return;
    }
    res.json({success: true, data: result})
  });
}

// 发送说说
exports.addForum = function(req,res){
  if(req.session.login != "1"){
    res.json({success: false, msg: '未登录异常'});
    return;
  }
  let data = {
    "author": req.body.author,
    "title": req.body.title,
    "content": req.body.content,
    "dateTime": new Date().getTime(),
  }
  db.insertOne("forum","comments",data,function(err, result){
    if(err){
      res.json({success: false, msg: err});
      return;
    }
    res.json({success: true})
  });
}

// 评论、点赞
exports.doupdate = function(req,res){
  if(req.session.login != "1"){
    res.json({success: false, msg: '未登录异常'});
    return;
  }
  let data = {
    "_id": ObjectId(req.body.id)
  }
  let obj = {};
  db.find("forum","comments",data,function(err, result){
    if(err){
      console.log('没找到要评论的说说')
      return;
    }
    obj = result.list[0];
    obj.reply = obj.reply||[];
    obj.thumbs = obj.thumbs||[];

    let data2 = {};

    if(req.body.type == "reply"){
      data2 = {
        $set:{
          reply: obj.reply.push({
            author: req.body.author,
            content: req.body.content,
            dateTime: new Date().getTime(),
          })
        }
      }
    }else if(req.body.type == "zan"){
      if(obj.thumbs.indexOf(req.body.author) == -1){
        data2 = {
          $set: {
            thumbs: obj.thumbs.push(req.body.author)
          }
        }
      }else{
        console.log('已经点赞不能重复点赞');
        return
      }
    }

    db.update("forum","comments",data,data2,function(err2, result){
      if(err2){
        res.json({success: false, msg: err2});
        return;
      }
      res.json({success: true})
    });
  });
}