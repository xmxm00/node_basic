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
      fs.readdir("./data/", function (error, filelist) {
        var title = "Welcome";
        var data = "Hello, Node.js";
        var html = template.HTML(title, template.list(filelist),
        `<h2>${title}</h2>${data}`,
        `<a href="/create">create</a>`);
        response.writeHead(200); // Success
        response.end(html);
      });
    } else {
      fs.readdir("./data/", function (error, filelist) {
        var filteredId = path.parse(queryData.id).base;
        fs.readFile(`./data/${filteredId}`, "utf-8", (err, data) => { // 읽기 끝난 후 부르는 함수 (Callback function)
          var title = queryData.id;
          var html = template.HTML(title, template.list(filelist),
          `<h2>${title}</h2>${data}`,
          `<a href="/create">create</a>
           <a href="/update?id=${title}">update</a>
           <form action="delete_process" method="post" onsubmit="">
            <input type="hidden" name="id" value="${title}">
            <input type="submit" value="delete"> 
           </form>`);
          response.writeHead(200); // Success
          response.end(html);
        });
      });
    }
  } else if(pathname === '/create') {
    fs.readdir("./data/", function (error, filelist) {
      var title = "WEB - create";
      var list = template.list(filelist);
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
      response.writeHead(200); // Success
      response.end(html);
    });
  } else if(pathname === '/create_process') {
    var body = '';
    request.on('data', function(data){ // data가 많은 경우 조각조각 들어옴
      body += data;
    });
    request.on('end', function(){
      var post = qs.parse(body);
      var title = post.title;
      var description = post.description;
      fs.writeFile(`data/${title}`, description, 'utf8', function(err){
        response.writeHead(302, {Location: `/?id=${title}`});
        response.end();
      })
    });
  } else if (pathname === '/update') {
    fs.readdir("./data/", function (error, filelist) {
      var filteredId = path.parse(queryData.id).base;
      fs.readFile(`./data/${filteredId}`, "utf-8", function(err, data) { // 읽기 끝난 후 부르는 함수 (Callback function)
        var title = queryData.id;
        var html = template.HTML(title, template.list(filelist), `
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
        `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
        response.writeHead(200); // Success
        response.end(html);
      });
    });
  } else if (pathname === '/update_process'){
    var body = '';
    request.on('data', function(data){ // data가 많은 경우 조각조각 들어옴
      body += data;
    });
    request.on('end', function(){
      var post = qs.parse(body);
      var id = post.id;
      var title = post.title;
      var description = post.description;
      fs.rename(`data/${id}`, `data/${title}`, function(error) {
        fs.writeFile(`data/${title}`, description, 'utf8', function(err){
          response.writeHead(302, {Location: `/?id=${title}`});
          response.end();
        });
      });
      console.log(post);
    });
  } else if(pathname === '/delete_process'){
    var body = '';
    request.on('data', function(data){ // data가 많은 경우 조각조각 들어옴
      body += data;
    });
    request.on('end', function(){
      var post = qs.parse(body);
      var id = post.id;
      var filteredId = path.parse(id).base;
      fs.unlink(`data/${filteredId}`, function(error){
        response.writeHead(302, {Location: `/`});
        response.end();
      });
    });
  } else {
    response.writeHead(404); // Fail
    response.end("Not Found");
  }
});


app.listen(3000);
