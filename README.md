# socket-helper

Send Protocol Buffers data with socket's helper.

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Gratipay][licensed-image]][licensed-url]

## Installation

```bash
$ npm install kenote-socket-helper
#
$ yarn add kenote-socket-helper
```

## Usages

```ts
import { Protobuffer, Socket, PB, PBSetting, ReflectionObject } from 'kenote-socket-helper'

const client: Socket = new Socket('127.0.0.1:8000')
const setting: PBSetting = {
  path     : './pb',
  socket   : 'socket.proto',
  gmPB     : 'gm.proto',
  prefix   : 'com.autorun',
  game     : 'game'
}

async function send (code: number, req: string, res: string, body: any): Promise<void> {
  let protobuffer: Protobuffer = new Protobuffer(setting)
  let { createPBBuffer, makeData, decode, gameMessage } = protobuffer
  let data: Buffer = makeData(createPBBuffer(code, req, body))
  let messageQuery: ReflectionObject = <ReflectionObject> gameMessage(res)
  try {
    let buffer: Buffer = await client.send(data)
    let msgBase: PB.Message = <PB.Message> decode(buffer, messageQuery)
    let { msghead, msgbody } = msgBase
    console.log(msgbody, msghead)
  } catch (error) {
    console.error(error)
  }
}

send(2001, 'CS_GM_QUERY', 'SC_GM_QUERY', {})
```

## License

this repo is released under the [MIT License](https://github.com/kenote/socket-helper/blob/master/LICENSE).

[npm-image]: https://img.shields.io/npm/v/kenote-socket-helper.svg
[npm-url]: https://www.npmjs.com/package/kenote-socket-helper
[downloads-image]: https://img.shields.io/npm/dm/kenote-socket-helper.svg
[downloads-url]: https://www.npmjs.com/package/kenote-socket-helper
[licensed-image]: https://img.shields.io/badge/license-MIT-blue.svg
[licensed-url]: https://github.com/kenote/socket-helper/blob/master/LICENSE