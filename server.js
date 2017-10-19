// 导入模块
// 
var http = require('http');
var path = require('path');
var fs = require('fs');
var mime = require('mime');

var querystring = require('querystring');


// 存放缓冲数据
var cache = {};

// 发送文件数据及响应错误
// 
// 响应错误

function send404(response){
	response.writeHead(404,{'Content-Type':'text/plain'});
	response.write('Error 404 : response not foud');
	response.end();
}

// 提供文件数据
// 
function sendFile(response,filePath,fileContents){
	response.writeHead(200,{'Content-Type':mime.getType(path.basename(filePath))});
	response.end(fileContents);
}

//提供静态文件服务
//
function serveStatic(response,cache,absPath){
	if(cache[absPath]){
		sendFile(response,absPath,cache[absPath]);
	}else{
		fs.exists(absPath,function(exists){
			if(exists){
				fs.readFile(absPath,function(err,data){
					if(err){
						send404(response);
					}else{
						cache[absPath] = data;
						sendFile(response,absPath,data)
					}

				});
			}else{
				send404(response);
			}
		});
	}
}

// 创建http服务器
var server = http.createServer(function(request,response){
	var filePath = false;

	if(request.method === 'POST'){
		if(request.url === '/up'){
			var info = '';
			request.on('data',function(chunk){
				info += chunk;
			})
			request.on('end',function(){
				info = querystring.parse(info);
				console.log('提交的数据：');
				console.log(info);
				
				response.end('post success');
			})
		}
		
	}else if(request.method === 'GET'){
		// 确认请求路径
		if(request.url == '/'){
			filePath = 'public/index.html';
		}else{

			filePath = 'public' + request.url
			console.log(request.url);
			// filePath = request.url;
		}
		// 文件存储路径，相对于server.js
		var absPath = './' + filePath;
		// 返回静态文件，响应请求
		serveStatic(response,cache,absPath);
	}	
})




// 监听端口
// 
server.listen(3300,function(){
	console.log('Server linsten on port 3300');
})




// 设置Socket.io服务器
// 
// 

// var chatServer = require('./lib/chat_server');

// chatServer.listen(server); 

