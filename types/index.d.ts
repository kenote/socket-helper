import * as protobuf from 'protobufjs'

export { Protobuffer, Socket } from '../src'

export interface PBSetting {
  path               : string
  socket             : string
  prefix             : string
  gmPB               : string
  game              ?: string
  CMsgBase          ?: string
  CMsgHead          ?: string
}

export interface ProtoBuffer {
  socketRoot        ?: protobuf.Root
  CMsgBase          ?: protobuf.ReflectionObject | null
  CMsgHead          ?: protobuf.ReflectionObject | null
  GMRoot            ?: protobuf.Root
}

export type ReflectionObject = protobuf.ReflectionObject

export declare namespace PB {

  interface Message {
    msghead            : msgHead | undefined
    msgbody            : msgBody | undefined
  }

  interface msgHead {
    msgcode            : number
    msgtype            : number
  }

  interface msgBody {
    data               : Array<string | string[]> | {}
  }

  interface CsMsgInfo {
    csMsgKey           : string
    socket_Root       ?: protobuf.Root
  }
}