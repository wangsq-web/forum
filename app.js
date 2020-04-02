var session = require("express-session");
var bodyParser = require('body-parser');
var express = require("express");
var app = express();
var router = require("./router/router");

// 静态文件夹
app.use(express.static("./public"));
// 设置模板引擎
app.set("view engine","ejs");

// post json解析
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  cookie: {maxAge: 14400000},
  saveUninitialized: true,
}));


// 首页
app.get("/",router.showIndex);
// 获取说说列表接口
app.post("/getForum",router.getForum);
// 发表新说说接口
app.post("/addForum",router.addForum);
// 评论、点赞接口
app.post("/doupdate",router.doupdate);


// 登录页
app.get("/login",router.showLogin);
// 登录接口
app.post("/doLogin",router.doLogin);


// 注册页
app.get("/register",router.showRegister);
// 注册接口
app.post("/doRegister",router.doRegister);


app.listen(3000);