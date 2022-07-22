// modules
var http = require("http");
var fs = require("fs");
var url = require("url");
var qs = require("querystring");

function templateHTML(title, list, body, control) {
  return `
  <!doctype html>
  <html>
    <head>
      <title>WEB2 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">WEB</a></h1>
      ${list}
      ${control}
      ${body}
    </body>
  </html>
  `;
}

function templateList(filelist) {
  var list = "<ol>";
  for (var i = 0; i < filelist.length; i++) {
    list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
  }
  list = list + "</ol>";
    return list;
}

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
        var template = templateHTML(title, templateList(filelist),
        `<h2>${title}</h2>${data}`,
        `<a href="/create">create</a>`);
        response.writeHead(200); // Success
        response.end(template);
      });
    } else {
      fs.readdir("./data/", function (error, filelist) {
        fs.readFile(`./data/${queryData.id}`, "utf-8", (err, data) => { // 읽기 끝난 후 부르는 함수 (Callback function)
          var title = queryData.id;
          var template = templateHTML(title, templateList(filelist),
          `<h2>${title}</h2>${data}`,
          `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
          response.writeHead(200); // Success
          response.end(template);
        });
      });
    }
  } else if(pathname === '/create') {
    fs.readdir("./data/", function (error, filelist) {
      var title = "WEB - create";
      var list = templateList(filelist);
      var template = templateHTML(title, templateList(filelist), `
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
      response.end(template);
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
      fs.readFile(`./data/${queryData.id}`, "utf-8", function(err, data) { // 읽기 끝난 후 부르는 함수 (Callback function)
        var title = queryData.id;
        var template = templateHTML(title, templateList(filelist), `
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
        response.end(template);
      });
    });
  } else if (pathname === '/update_process'){
    var body = '';
    request.on('data', function(data){ // data가 많은 경우 조각조각 들어옴
      body += data;
    });
    request.on('end', function(){
      var post = qs.parse(body);
      console.log(post);
    });
    response.writeHead(200);
    response.end("Check Log")
  } else {
    response.writeHead(404); // Fail
    response.end("Not Found");
  }
});


app.listen(3000);
