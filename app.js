"use strict";

var connect = require('connect');
var serveStatic = require('serve-static');
var bodyParser = require('body-parser');
var request = require('request');
var config = require('./config');
var app = connect();

app
    .use(bodyParser.urlencoded({
        extended: false
    }))
    .use(function(req, res, next) {
        if (req.url !== '/suite') {
            return next();
        }
        if (!req.body.suite) {
            res.status(400);
            res.send('Bad Request: no suite parameter found');
        }
        request.get(req.body.suite).pipe(res);
    })
    .use(function(req, res, next) {
        if (req.url !== '/config.json') {
            return next();
        }
        res.end(JSON.stringify(config));
    })
    .use(serveStatic(__dirname + '/public'))
    .use(serveStatic(__dirname + '/bower_components'))
    .listen(config.port);

console.log('Server running at http://127.0.0.1:' + config.port + '/');
