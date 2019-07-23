import * as net from 'net'
import ExBuffer from './ExBuffer'
import * as Url from 'url'

export default class Socket {

  private __Href: Url.UrlWithStringQuery

  constructor (Uri: string, Port?: number | string) {
    let uri: string = /^((https|http|ftp|rtsp|mms)?:\/\/)/.test(Uri) ? Uri : `rtsp://${Uri}`
    this.__Href = Url.parse(uri)
    if (Port) this.__Href.port = <string> Port
  }

  public send (data: string | Buffer | Uint8Array): Promise<Buffer> {
    let { hostname, port } = this.__Href
    let socket: net.Socket = new net.Socket()
    let exBuffer: ExBuffer = new ExBuffer().uint32Head().bigEndian()
    return new Promise((resolve: (value?: any) => void, reject: (reason?: any) => void) => {
      socket.connect(Number(port), hostname || '127.0.0.1', (): void => {
        try {
          socket.write(data)
        } catch (error) {
          reject(error)
        }
      })
      socket.on('data', (buffer: Buffer): void => {
        exBuffer.put(buffer)
      })
      exBuffer.on('data', (buffer: Buffer): void => {
        if (buffer.length > 0) {
          try {
            resolve(buffer)
          } catch (error) {
            reject(error)
          }
          socket.destroy()
        }
      })
      socket.on('error', (error): void => {
        reject(error)
      })
      socket.on('close', (): void => {
        console.log('Socket is closed.')
      })
    })
  }

}
