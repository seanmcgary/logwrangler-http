var logwrangler = require('logwrangler');
var logger = logwrangler.create();

var express = require('express');
var bodyParser = require('body-parser');
var server = express();

server.use(bodyParser());

server.post('/log', function(req, res){
	console.log(req.body);
	console.log(req.headers);
	res.send(200);
});

server.listen(8000);

setTimeout(function(){
	var logwranglerHttp = require('../');

	logger.use(new logwranglerHttp({
		host: 'localhost',
		port: 8000,
		authToken: 'example-token'
	}));

	logger.log({
		message: 'test'
	});

	logger.log({
		message: 'test'
	});

	logger.log({
		message: 'test'
	});

	logger.log({
		message: 'test'
	});

	logger.log({
		message: 'test'
	});

	logger.log({
		message: 'test'
	});

	logger.log({
		message: 'test'
	});

	logger.log({
		message: 'test'
	});

}, 1000);
