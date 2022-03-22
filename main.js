// modules
var http = require("http");
var fs = require("fs");
var url = require("url");

function templateHTML(title, list, body) {
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

  if (pathname === "/") {
    if (queryData.id === undefined) {
      fs.readdir("./data/", function (error, filelist) {
        var title = "Welcome";
        var data = "Hello, Node.js";
        var template = templateHTML(title, templateList(filelist), `<h2>${title}</h2>${data}`);
        response.writeHead(200); // Success
        response.end(template);
      });
    } else {
      fs.readdir("./data/", function (error, filelist) {
        fs.readFile(`./data/${queryData.id}`, "utf-8", (err, data) => {
          var title = queryData.id;
          var template = templateHTML(title, templateList(filelist), `<h2>${title}</h2>${data}`);
          response.writeHead(200); // Success
          response.end(template);
        });
      });
    }
  } else {
    response.writeHead(404); // Fail
    response.end("Not Found");
  }
});
app.listen(3000);
