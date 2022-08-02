var express = require('express');
var app = express();
var template = require('./lib/template.js');
var fs = require('fs');
var path = require("path");
var qs = require("querystring");
var bodyParser = require("body-parser");
var compression = require("compression");

const port = 3000

app.use(bodyParser.urlencoded({extended: false}));
app.use(compression());
app.use(express.static('public'));

app.get('*', function(request, response, next){
  fs.readdir("./data/", function (error, filelist) {
    request.list = filelist;
    next();
  });
})

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })
// route, routing
app.get('/', function(request, response) {
    var title = "Welcome";
    var data = "Hello, Node.js";
    var html = template.HTML(title, template.list(request.list),
    `<h2>${title}</h2>${data}
    <img src="/images/hello.jpg" style="width: 300px; display: block; margin-top: 5px" />`,
    `<a href="/create">create</a>`);
    response.send(html);
});

app.get('/page/:pageId', function(request, response, next) {
  var filteredId = path.parse(request.params.pageId).base;
  fs.readFile(`./data/${filteredId}`, "utf-8", (err, data) => { // 읽기 끝난 후 부르는 함수 (Callback function)
    if(err){
      next(err);
    }
    else{
      var title = request.params.pageId;
      var html = template.HTML(title, template.list(request.list),
      `<h2>${title}</h2>${data}`,
      `<a href="/create">create</a>
        <a href="/update/${title}">update</a>
        <form action="/delete_process" method="post" onsubmit="">
        <input type="hidden" name="id" value="${title}">
        <input type="submit" value="delete"> 
        </form>`);
      response.send(html);
    }
  });
});

app.get('/create', function(request, response){
    var title = "WEB - create";
    var list = template.list(request.list);
    var html = template.HTML(title, list, `
    <form action="/create_process" method="post">
    <p><input type="text" name="title" placeholder="title"></p>
    <p>
        <textarea name="description" placeholder="description"></textarea>
    </p>
    <p>
        <input type="submit">
    </p>
    </form>
    `,
    '');
    response.send(html);
})

app.post('/create_process', function(request, response) {
  /*
  var body = '';
    request.on('data', function(data){ // data가 많은 경우 조각조각 들어옴
      body += data;
    });
    request.on('end', function(){
    });
  */
  var post = request.body; // using bodyParser
  var title = post.title;
  var description = post.description;
  fs.writeFile(`data/${title}`, description, 'utf8', function(err){
    response.redirect(302, `/page/${title}`);
  })
  
})

app.get('/update/:pageId', function(request, response){
    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`./data/${filteredId}`, "utf-8", function(err, data) { // 읽기 끝난 후 부르는 함수 (Callback function)
      var title = request.params.pageId;
      var html = template.HTML(title, template.list(request.list), `
        <form action="/update_process" method="post">
        <input type="hidden" name="id" value="${title}">
        <p><input type="text" name="title" placeholder="title" value="${title}"></p>
        <p>
            <textarea name="description" placeholder="description" style="width: 300px; height: 300px">${data}</textarea>
        </p>
        <p>
            <input type="submit">
        </p>
        </form>
      `,
      `<a href="/create">create</a> <a href="/update/${title}">update</a>`);
      response.send(html);
    });
})

app.post('/update_process', function(request, response){
  var post = request.body;
  var id = post.id;
  var title = post.title;
  var description = post.description;
  fs.rename(`data/${id}`, `data/${title}`, function(error) {
    fs.writeFile(`data/${title}`, description, 'utf8', function(err){
      response.redirect(302, `/page/${title}`);
    });
  });
  // console.log(post);
})

app.post('/delete_process', function(request, response){
  var post = request.body;
  var id = post.id;
  var filteredId = path.parse(id).base;
  fs.unlink(`data/${filteredId}`, function(error){
    response.redirect(302, '/');
  });
})

app.use(function(request, response, next){
  response.status(404).send("Sorry! Cannot find that");
})

app.use(function(err, request, response, next){
  console.log(err.stack);
  response.status(500).send("something broke!");
})

app.listen(port, () => {
  // console.log(`Example app listening on port ${port}`)
});

/*
// modules
var http = require("http");
var fs = require("fs");
var url = require("url");
var qs = require("querystring");
var path = require("path");
var template = require("./lib/template.js");

var app = http.createServer(function (request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var title = queryData.id;
  var pathname = url.parse(_url, true).pathname;

  // console.log(pathname);
  if (pathname === "/") {
    if (queryData.id === undefined) {
      
    } else {
      
    }
  } else if(pathname === '/create') {
    
  } else if(pathname === '/create_process') {
    
  } else if (pathname === '/update') {
    
  } else if (pathname === '/update_process'){
    
  } else if(pathname === '/delete_process'){
    
  } else {
    response.writeHead(404); // Fail
    response.end("Not Found");
  }
});


app.listen(3000);
*/