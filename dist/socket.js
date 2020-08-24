"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var net = require("net");
var ExBuffer_1 = require("./ExBuffer");
var Url = require("url");
var Socket = (function () {
    function Socket(Uri, Port) {
        var uri = /^((https|http|ftp|rtsp|mms)?:\/\/)/.test(Uri) ? Uri : "rtsp://" + Uri;
        this.__Href = Url.parse(uri);
        if (Port)
            this.__Href.port = Port;
    }
    Socket.prototype.send = function (data) {
        var _a = this.__Href, hostname = _a.hostname, port = _a.port;
        var socket = new net.Socket();
        var exBuffer = new ExBuffer_1.default().uint32Head().bigEndian();
        return new Promise(function (resolve, reject) {
            socket.connect(Number(port), hostname || '127.0.0.1', function () {
                try {
                    socket.write(data);
                }
                catch (error) {
                    reject(error);
                }
            });
            socket.on('data', function (buffer) {
                exBuffer.put(buffer);
            });
            exBuffer.on('data', function (buffer) {
                if (buffer.length > 0) {
                    try {
                        resolve(buffer);
                    }
                    catch (error) {
                        reject(error);
                    }
                    socket.destroy();
                }
            });
            socket.on('error', function (error) {
                reject(error);
            });
            socket.on('close', function () {
                console.log('Socket is closed.');
            });
        });
    };
    return Socket;
}());
exports.default = Socket;
