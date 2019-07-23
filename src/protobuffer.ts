import * as path from 'path'
import * as protobuf from 'protobufjs'
import * as fs from 'fs'
import * as zlib from 'zlib'
import * as struct from 'python-struct'
import { PBSetting, ProtoBuffer, PB } from '../types'

export default class Protobuffer {

  private __setting: PBSetting
  private __ProtoBuffer: ProtoBuffer
  private __Root: Map<any, any>
  private __game: string
  private __CMsgBase: string
  private __CMsgHead: string

  constructor (setting: PBSetting) {
    this.__setting = setting
    this.__game = setting.game || 'game'
    this.__CMsgBase = setting.CMsgBase || 'CMsgBase'
    this.__CMsgHead = setting.CMsgHead || 'CMsgHead'
    this.__ProtoBuffer = this.getProtoBuffer(setting)
    let { socketRoot, GMRoot } = this.__ProtoBuffer
    this.__Root = new Map()
    this.__Root.set('socket', socketRoot)
    this.__Root.set('game', GMRoot)
  }

  public gameMessage = (name: string): protobuf.ReflectionObject | null | undefined => {
    let { GMRoot } = this.__ProtoBuffer
    return GMRoot && GMRoot.root.lookup(`${this.__setting.prefix}.${this.__game}.${name}`)
  }

  public makeData = (buffer: zlib.InputType): Buffer => {
    let zlibBuffer: Buffer = compressData(buffer)
    let head: Buffer = struct.pack('!i', zlibBuffer.length)
    return Buffer.concat([head, zlibBuffer])
  }

  public decode = (buffer: zlib.InputType, CMsg: protobuf.ReflectionObject): PB.Message | Buffer => {
    let { CMsgBase } = this.__ProtoBuffer
    let ungzipBuffer: Buffer = decompressData(buffer)
    let message: PB.Message = CMsgBase && (<any> CMsgBase).decode(ungzipBuffer)
    if (message.msgbody) {
      let msgbody = (<any> CMsg).decode(message.msgbody)
      message.msgbody = msgbody
      return message
    }
    return ungzipBuffer
  }

  public createPBBuffer = (msgtype: number, csMsg: string, params: any): zlib.InputType => {
    let { CMsgBase } = this.__ProtoBuffer
    let msghead: protobuf.Message<object> = this.createHeadMessage(msgtype)
    let pbRealHead: protobuf.Message<object> = (<any> CMsgBase).create({ msghead })
    let buffer_head: zlib.InputType = (<any> CMsgBase).encode(pbRealHead).finish()
    if (!csMsg) return buffer_head
    let { socket_Root } = this.getCsMsgInfo(`${this.__game}.${csMsg}`)
    let CMsgBody: protobuf.ReflectionObject | null | undefined = socket_Root && socket_Root.root.lookup(`${this.__setting.prefix}.${this.__game}.${csMsg}`)
    let pbBody = this.createBodyMessage(`${this.__game}.${csMsg}`, params)
    let msgbody: protobuf.Message<object> = (<any> CMsgBody).encode(pbBody).finish()
    let pbMessage: protobuf.Message<object> = CMsgBase && (<any> CMsgBase).create({ msghead, msgbody })
    let buffer_message: zlib.InputType = (<any> CMsgBase).encode(pbMessage).finish()
    return buffer_message
  }

  private getProtoBuffer (setting: PBSetting): ProtoBuffer {
    let pbDir: string = path.resolve(process.cwd(), setting.path).replace(/([^ \/])$/, '$1/')
    let socketPB: string = path.resolve(pbDir, setting.socket)
    let socketRoot: protobuf.Root | undefined
    let CMsgBase: protobuf.ReflectionObject | null | undefined
    let CMsgHead: protobuf.ReflectionObject | null | undefined
    let GMRoot: protobuf.Root | undefined
    if (fs.existsSync(socketPB)) {
      socketRoot = protobuf.loadSync(socketPB)
      CMsgBase = socketRoot.root.lookup(`${setting.prefix}.socket.${this.__CMsgBase}`)
      CMsgHead = socketRoot.root.lookup(`${setting.prefix}.socket.${this.__CMsgHead}`)
    }
    let gmPB: string = path.resolve(pbDir, setting.gmPB)
    if (fs.existsSync(gmPB)) {
      GMRoot = protobuf.loadSync(gmPB)
    }
    return { socketRoot, CMsgBase, CMsgHead, GMRoot }
  }

  private createHeadMessage (msgtype: number): protobuf.Message<object> {
    let { CMsgHead } = this.__ProtoBuffer
    return CMsgHead && (<any> CMsgHead).create({ msgtype, msgcode: 1 })
  }

  private createBodyMessage (csMsg: any, params: any): protobuf.Message<object> {
    let { socket_Root } = this.getCsMsgInfo(csMsg)
    let CMsgBody = socket_Root && socket_Root.root.lookup(`${this.__setting.prefix}.${csMsg}`)
    return (<any> CMsgBody).create(params)
  }

  private getCsMsgInfo (csMsg: string): PB.CsMsgInfo {
    let [csMsgKey] = csMsg.split('.')
    let socket_Root: protobuf.Root | undefined = this.__Root.get(csMsgKey) ? this.__Root.get(csMsgKey) : this.__ProtoBuffer.socketRoot
    return { csMsgKey, socket_Root }
  }
}

const compressData = (buffer: zlib.InputType): Buffer => 
  zlib.gzipSync(buffer, {
    windowBits: 15, 
    memLevel: 8
  })

const decompressData = (buffer: zlib.InputType): Buffer => 
  zlib.unzipSync(buffer, {
    windowBits: 15, 
    memLevel: 8
  })
