// Mobile worker: Pear runtime on iOS/Android via BareKit (react-native-bare-kit)
// Runs inside a BareKit Worklet. IPC is via BareKit.IPC (a streamx Duplex).
// argv layout is different on mobile — no executable path or worker entry path.
const PearRuntime = require('pear-runtime') // resolves to pear-mobile on mobile
const Corestore = require('corestore')
const Hyperswarm = require('hyperswarm')
const goodbye = require('graceful-goodbye')
const FramedStream = require('framed-stream')
const path = require('bare-path')
const dir = require('bare-storage')
const { isBareKit } = require('which-runtime')
const { createMarket } = require('./market')

// On mobile (BareKit), argv starts at index 0 with the updater args.
// On desktop, argv starts at index 2 (after executable + entry path).
const argv = (index) => Bare.argv[index + (isBareKit ? 0 : 2)]

const updaterConfig = {
  updates: argv(0) !== 'false',
  version: argv(1),
  upgrade: argv(2),
  name: argv(3),
  dir: argv(4) || dir.persistent(),
  app: argv(5), // undefined on mobile
}

// BareKit.IPC is the duplex stream connected to the React Native side
const pipe = new FramedStream(BareKit.IPC)
const store = new Corestore(path.join(updaterConfig.dir, 'pear-runtime', 'corestore'))
const swarm = new Hyperswarm()
const pear = new PearRuntime({ ...updaterConfig, swarm, store })

pear.updater.on('error', console.error)

if (updaterConfig.updates !== false) {
  swarm.on('connection', (connection) => store.replicate(connection))
  swarm.join(pear.updater.drive.core.discoveryKey, { client: true, server: false })
}

console.log('Application storage:', pear.storage)

const myPeerId = pear.updater.drive.core.key.toString('hex')

const market = createMarket({ pipe, store, swarm, peerId: myPeerId })

// OTA update events
pear.updater.on('updating', () => pipe.write('updating'))
pear.updater.on('updated', () => pipe.write('updated'))

// Handle applyUpdate from the React Native app
pipe.on('data', async (data) => {
  const message = data.toString()
  if (message === 'pear:applyUpdate') {
    await pear.ready()
    await pear.updater.applyUpdate()
    pipe.write('pear:updateApplied')
  }
})

goodbye(async () => {
  market.destroy()
  await swarm.destroy()
  await pear.close()
  await store.close()
})

pipe.write(Buffer.from(JSON.stringify({ type: 'workerStarted' }), 'utf8'))

market.init().catch((err) => {
  console.error('Market init failed:', err)
  market.sendIPC({ type: 'error', message: err.message })
})
