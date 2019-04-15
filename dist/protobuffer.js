"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var protobuf = require("protobufjs");
var fs = require("fs-extra");
var zlib = require("zlib");
var struct = require("python-struct");
var protobuffer = (function () {
    function protobuffer(setting) {
        var _this = this;
        this.gameMessage = function (name) {
            var GMRoot = _this.__ProtoBuffer.GMRoot;
            return GMRoot && GMRoot.root.lookup(_this.__setting.prefix + "." + _this.__game + "." + name);
        };
        this.makeData = function (buffer) {
            var zlibBuffer = compressData(buffer);
            var head = struct.pack('!i', zlibBuffer.length);
            return Buffer.concat([head, zlibBuffer]);
        };
        this.decode = function (buffer, CMsg) {
            var CMsgBase = _this.__ProtoBuffer.CMsgBase;
            var ungzipBuffer = decompressData(buffer);
            var message = CMsgBase && CMsgBase.decode(ungzipBuffer);
            if (message.msgbody) {
                var msgbody = CMsg.decode(message.msgbody);
                message.msgbody = msgbody;
                return message;
            }
            return ungzipBuffer;
        };
        this.createPBBuffer = function (msgtype, csMsg, params) {
            var CMsgBase = _this.__ProtoBuffer.CMsgBase;
            var msghead = _this.createHeadMessage(msgtype);
            var pbRealHead = CMsgBase.create({ msghead: msghead });
            var buffer_head = CMsgBase.encode(pbRealHead).finish();
            if (!csMsg)
                return buffer_head;
            var socket_Root = _this.getCsMsgInfo(_this.__game + "." + csMsg).socket_Root;
            var CMsgBody = socket_Root && socket_Root.root.lookup(_this.__setting.prefix + "." + _this.__game + "." + csMsg);
            var pbBody = _this.createBodyMessage(_this.__game + "." + csMsg, params);
            var msgbody = CMsgBody.encode(pbBody).finish();
            var pbMessage = CMsgBase && CMsgBase.create({ msghead: msghead, msgbody: msgbody });
            var buffer_message = CMsgBase.encode(pbMessage).finish();
            return buffer_message;
        };
        this.__setting = setting;
        this.__game = setting.game || 'game';
        this.__ProtoBuffer = this.getProtoBuffer(setting);
        var _a = this.__ProtoBuffer, socketRoot = _a.socketRoot, GMRoot = _a.GMRoot;
        this.__Root = new Map();
        this.__Root.set('socket', socketRoot);
        this.__Root.set('game', GMRoot);
    }
    protobuffer.prototype.getProtoBuffer = function (setting) {
        var pbDir = path.resolve(process.cwd(), setting.path).replace(/([^ \/])$/, '$1/');
        var socketPB = path.resolve(pbDir, setting.socket);
        var socketRoot;
        var CMsgBase;
        var CMsgHead;
        var GMRoot;
        if (fs.existsSync(socketPB)) {
            socketRoot = protobuf.loadSync(socketPB);
            CMsgBase = socketRoot.root.lookup(setting.prefix + ".socket.CMsgBase");
            CMsgHead = socketRoot.root.lookup(setting.prefix + ".socket.CMsgHead");
        }
        var gmPB = path.resolve(pbDir, setting.gmPB);
        if (fs.existsSync(gmPB)) {
            GMRoot = protobuf.loadSync(gmPB);
        }
        return { socketRoot: socketRoot, CMsgBase: CMsgBase, CMsgHead: CMsgHead, GMRoot: GMRoot };
    };
    protobuffer.prototype.createHeadMessage = function (msgtype) {
        var CMsgHead = this.__ProtoBuffer.CMsgHead;
        return CMsgHead && CMsgHead.create({ msgtype: msgtype, msgcode: 1 });
    };
    protobuffer.prototype.createBodyMessage = function (csMsg, params) {
        var socket_Root = this.getCsMsgInfo(csMsg).socket_Root;
        var CMsgBody = socket_Root && socket_Root.root.lookup(this.__setting.prefix + "." + csMsg);
        return CMsgBody.create(params);
    };
    protobuffer.prototype.getCsMsgInfo = function (csMsg) {
        var _a = __read(csMsg.split('.'), 1), csMsgKey = _a[0];
        var socket_Root = this.__Root.get(csMsgKey) ? this.__Root.get(csMsgKey) : this.__ProtoBuffer.socketRoot;
        return { csMsgKey: csMsgKey, socket_Root: socket_Root };
    };
    return protobuffer;
}());
exports.default = protobuffer;
var compressData = function (buffer) {
    return zlib.gzipSync(buffer, {
        windowBits: 15,
        memLevel: 8
    });
};
var decompressData = function (buffer) {
    return zlib.unzipSync(buffer, {
        windowBits: 15,
        memLevel: 8
    });
};
