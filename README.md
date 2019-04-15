# socket-helper
Socket's Helper.

## Installation

```bash
$ yarn add kenote-socket-helper
```

## Usages

```ts
import { Socket, PBSetting, ReflectionObject, PB } from 'kenote-socket-helper'

const setting: PBSetting = {
  path     : './pb',
  socket   : 'socket.proto',
  gmPB     : 'gm.proto',
  prefix   : 'com.autorun',
  game     : 'game'
}

async send (code: number, req: string, res: string, body: any): Promise<any> => {
  let socket: Socket = new Socket('127.0.0.1:8000')
  let protobuffer: Protobuffer = new Protobuffer(setting)
  let { createPBBuffer, makeData, decode, gameMessage } = protobuffer
  let data: Buffer = makeData(createPBBuffer(<number>code, req, body))
  let messageQuery: ReflectionObject = <ReflectionObject> gameMessage(res)
  try {
    let buffer: Buffer = await socket.send(data)
    let msgBase: PB.Message = <PB.Message> decode(buffer, messageQuery)
    let { msghead, msgbody } = msgBase
    console.log(msgbody && msgbody.data)
    return msgbody && msgbody.data
  } catch (error) {
    console.error(error)
  }
}

send(2001, 'CS_GM_QUERY', 'SC_GM_QUERY', {})

// return
{
  msghead: {
    msgcode: 2001
    msgtype: 1
  },
  msgbody: {
    data: {}
  }
}
```

## License

this repo is released under the [MIT License](https://github.com/kenote/socket-helper/blob/master/LICENSE).