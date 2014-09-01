var _ = require('lodash');


var logwrangler = require('logwrangler');
var logger = logwrangler.create({
	level: logwrangler.levels.DEBUG,
	logOptions: {
		ns: 'logwrangler-http'
	}
}, true);

var makeRequest = function(httpOptions, data){
	var http = httpOptions.secure ? require('https') : require('http');

	delete httpOptions.secure;

	httpOptions.headers = httpOptions.headers || {};
	httpOptions.headers['Content-Type'] = 'application/json';

	var req = http.request(httpOptions, function(res){

		var data = '';
		res.on('data', function(d){
			data += d.toString();
		});

		res.on('end', function(){

			var code = ~~(res.statusCode / 100);
			if(code != 2 && code != 3){
				logger.warn({
					message: 'Error making request',
					data: {
						responseMessage: data,
						statusCode: res.statusCode
					}
				})
			}
		});
	});

	req.on('error', function(err){
		logger.error({
			message: 'http error',
			data: err
		});
	});

	var payload = JSON.stringify(data);

	req.write(payload);
	req.end();

};

/**
	options: {
		batchSize: 5 (default),
		httpOptions: {
			host: '',
			port: '',
			secure: false || true,
			headers: {},
			method: 'POST'
		}
	}

*/
function LogQueue(options){
	this.queue = [];

	this.lastSent = Date.now();
	this.processTimer = null;

	this.options = _.defaults(options, {
		batchSize: 5
	});

	if(this.options.batchSize < 5){
		logger.warn({
			message: 'WARNING - small batch sizes could result in decreased performance'
		});
	}
};
LogQueue.prototype.enqueue = function(logData){
	this.queue.push(logData);
	this.process();
};
LogQueue.prototype.process = function(){
	var self = this;
	var now = Date.now();
	var timeDelta = (now - self.lastSent) / 1000;
	clearTimeout(self.processTimer);

	if(self.queue.length >= self.options.batchSize || timeDelta > 2){
		var batch = self.queue.slice(0, self.options.batchSize);
		self.queue = self.queue.slice(self.options.batchSize);

		makeRequest(self.options.httpOptions, { logs: batch });
		self.lastSent = Date.now();
	}

	if(self.queue.length){
		self.processTimer = setTimeout(function(){
			self.process();
		}, 1000);
	}
};



function LogwranglerHTTP(initOptions){
	var self = this;

	initOptions = initOptions || {};

	initOptions = _.defaults(initOptions, {
		host: 'localhost',
		port: 80,
		secure: false,
		headers: {},
		method: 'POST'
	});

	var queue = new LogQueue({
		batchSize: initOptions.batchSize,
		httpOptions: {
			host: initOptions.host,
			port: initOptions.port,
			path: '/log',
			method: 'post',
			headers: {},
			secure: !!initOptions.secure
		}
	});



	self.sendLog = function(data){
		queue.enqueue(data);
	};

	return self;
};

LogwranglerHTTP.prototype = Object.create(logwrangler.LogwranglerModule.prototype);
LogwranglerHTTP.prototype.log = function(initOptions, data){
	this.sendLog(data);
};

module.exports = LogwranglerHTTP;
