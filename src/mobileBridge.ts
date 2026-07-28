// Mobile bridge adapter for react-native-bare-kit Worklet IPC.
// This file is imported by the React Native app (not the web Vite build).
// It wraps the BareKit Worklet's IPC stream and provides the same interface
// as the Electron bridge so MarketClient can use either one transparently.
import { Worklet } from 'react-native-bare-kit'
import b4a from 'b4a'
import { Duplex } from 'streamx'
import FramedStream from 'framed-stream'

export class MobileBridge {
  private worklet: any = null
  private framedPipe: any = null
  private ipcListeners: ((data: Uint8Array) => void)[] = []
  private stdoutListeners: ((data: Uint8Array) => void)[] = []
  private stderrListeners: ((data: Uint8Array) => void)[] = []
  private exitListeners: ((code: number) => void)[] = []
  private started = false

  async startWorker(specifier: string): Promise<boolean> {
    if (this.started) return true
    this.started = true

    this.worklet = new Worklet()

    // The Worklet's IPC is a streamx Duplex. We wrap it in a FramedStream
    // so messages are length-prefixed (matching the desktop worker).
    this.framedPipe = new FramedStream(this.worklet.IPC)

    this.framedPipe.on('data', (data: Uint8Array) => {
      for (const l of this.ipcListeners) l(data)
    })

    // Start the mobile worker bundle
    this.worklet.start(specifier, [
      'true',       // updates
      '1.0.0',      // version
      'pear://',    // upgrade
      'PearMarket', // name
      '',           // dir (uses default persistent storage)
      '',           // app path (undefined on mobile)
    ])

    return true
  }

  onWorkerIPC(specifier: string, listener: (data: Uint8Array) => void): () => void {
    this.ipcListeners.push(listener)
    return () => {
      this.ipcListeners = this.ipcListeners.filter((l) => l !== listener)
    }
  }

  onWorkerStdout(specifier: string, listener: (data: Uint8Array) => void): () => void {
    this.stdoutListeners.push(listener)
    return () => {
      this.stdoutListeners = this.stdoutListeners.filter((l) => l !== listener)
    }
  }

  onWorkerStderr(specifier: string, listener: (data: Uint8Array) => void): () => void {
    this.stderrListeners.push(listener)
    return () => {
      this.stderrListeners = this.stderrListeners.filter((l) => l !== listener)
    }
  }

  onWorkerExit(specifier: string, listener: (code: number) => void): () => void {
    this.exitListeners.push(listener)
    return () => {
      this.exitListeners = this.exitListeners.filter((l) => l !== listener)
    }
  }

  async writeWorkerIPC(specifier: string, data: Uint8Array): Promise<void> {
    if (this.framedPipe) {
      this.framedPipe.write(Buffer.from(data))
    }
  }

  async applyUpdate(): Promise<void> {
    if (this.framedPipe) {
      this.framedPipe.write(Buffer.from('pear:applyUpdate', 'utf8'))
    }
  }

  async appAfterUpdate(): Promise<void> {
    // On mobile, the app will be relaunched by the OS after update
  }

  pkg(): { name: string; productName: string; version: string } {
    return { name: 'pearmarket', productName: 'PearMarket', version: '1.0.0' }
  }

  suspend(): void {
    if (this.worklet) this.worklet.suspend()
  }

  resume(): void {
    if (this.worklet) this.worklet.resume()
  }

  terminate(): void {
    if (this.worklet) this.worklet.terminate()
  }
}
