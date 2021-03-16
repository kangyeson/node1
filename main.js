const http = require('http');
const app = http.createServer(function(request,response){
    console.log(__dirname+request.url)
    response.writeHead(200);
    response.end("hello minjeong");

});
app.listen(3010);