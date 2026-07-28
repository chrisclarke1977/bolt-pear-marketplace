// Shared marketplace P2P logic — used by both desktop and mobile workers.
// Receives a framed duplex `pipe`, a Corestore `store`, a Hyperswarm `swarm`,
// and a `peerId` string. Handles listing, event, and contact CRUD and broadcasts state over the pipe.

const MARKET_TOPIC = Buffer.from('pearmarket-v1', 'utf8')

function createMarket({ pipe, store, swarm, peerId }) {
  const marketCore = store.get({ name: 'market-listings' })
  const eventCore = store.get({ name: 'market-events' })
  const contactCore = store.get({ name: 'market-contacts' })
  const taskCore = store.get({ name: 'market-tasks' })
  const noteCore = store.get({ name: 'market-notes' })
  const messageCore = store.get({ name: 'market-messages' })
  const interactionCore = store.get({ name: 'market-interactions' })

  function sendIPC(msg) {
    pipe.write(Buffer.from(JSON.stringify(msg), 'utf8'))
  }

  async function broadcastListings() {
    const listings = []
    for (let i = 0; i < marketCore.length; i++) {
      try {
        const buf = await marketCore.get(i)
        const entry = JSON.parse(buf.toString('utf8'))
        if (entry.deleted) continue
        listings.push({ ...entry, index: i })
      } catch (e) {
        // skip corrupt entries
      }
    }
    sendIPC({ type: 'listings', listings })
  }

  async function broadcastEvents() {
    const events = []
    for (let i = 0; i < eventCore.length; i++) {
      try {
        const buf = await eventCore.get(i)
        const entry = JSON.parse(buf.toString('utf8'))
        if (entry.deleted) continue
        events.push({ ...entry, index: i })
      } catch (e) {
        // skip corrupt entries
      }
    }
    sendIPC({ type: 'events', events })
  }

  async function broadcastContacts() {
    const contacts = []
    for (let i = 0; i < contactCore.length; i++) {
      try {
        const buf = await contactCore.get(i)
        const entry = JSON.parse(buf.toString('utf8'))
        if (entry.deleted) continue
        contacts.push({ ...entry, index: i })
      } catch (e) {
        // skip corrupt entries
      }
    }
    sendIPC({ type: 'contacts', contacts })
  }

  async function broadcastTasks() {
    const tasks = []
    for (let i = 0; i < taskCore.length; i++) {
      try {
        const buf = await taskCore.get(i)
        const entry = JSON.parse(buf.toString('utf8'))
        if (entry.deleted) continue
        tasks.push({ ...entry, index: i })
      } catch (e) {
        // skip corrupt entries
      }
    }
    sendIPC({ type: 'tasks', tasks })
  }

  async function broadcastNotes() {
    const notes = []
    for (let i = 0; i < noteCore.length; i++) {
      try {
        const buf = await noteCore.get(i)
        const entry = JSON.parse(buf.toString('utf8'))
        if (entry.deleted) continue
        notes.push({ ...entry, index: i })
      } catch (e) {
        // skip corrupt entries
      }
    }
    sendIPC({ type: 'notes', notes })
  }

  async function broadcastMessages() {
    const messages = []
    for (let i = 0; i < messageCore.length; i++) {
      try {
        const buf = await messageCore.get(i)
        const entry = JSON.parse(buf.toString('utf8'))
        if (entry.deleted) continue
        messages.push({ ...entry, index: i })
      } catch (e) {
        // skip corrupt entries
      }
    }
    sendIPC({ type: 'messages', messages })
  }

  async function broadcastInteractions() {
    const interactions = []
    for (let i = 0; i < interactionCore.length; i++) {
      try {
        const buf = await interactionCore.get(i)
        const entry = JSON.parse(buf.toString('utf8'))
        if (entry.deleted) continue
        interactions.push({ ...entry, index: i })
      } catch (e) {
        // skip corrupt entries
      }
    }
    sendIPC({ type: 'interactions', interactions })
  }

  async function init() {
    await marketCore.ready()
    await eventCore.ready()
    await contactCore.ready()
    await taskCore.ready()
    await noteCore.ready()
    await messageCore.ready()
    await interactionCore.ready()

    swarm.join(MARKET_TOPIC, { client: true, server: true })

    swarm.on('connection', (connection) => {
      store.replicate(connection)
    })

    marketCore.on('append', async () => {
      await broadcastListings()
    })

    marketCore.on('peer-open', async () => {
      await broadcastListings()
    })

    eventCore.on('append', async () => {
      await broadcastEvents()
    })

    eventCore.on('peer-open', async () => {
      await broadcastEvents()
    })

    contactCore.on('append', async () => {
      await broadcastContacts()
    })

    contactCore.on('peer-open', async () => {
      await broadcastContacts()
    })

    taskCore.on('append', async () => {
      await broadcastTasks()
    })

    taskCore.on('peer-open', async () => {
      await broadcastTasks()
    })

    noteCore.on('append', async () => {
      await broadcastNotes()
    })

    noteCore.on('peer-open', async () => {
      await broadcastNotes()
    })

    messageCore.on('append', async () => {
      await broadcastMessages()
    })

    messageCore.on('peer-open', async () => {
      await broadcastMessages()
    })

    interactionCore.on('append', async () => {
      await broadcastInteractions()
    })

    interactionCore.on('peer-open', async () => {
      await broadcastInteractions()
    })

    await broadcastListings()
    await broadcastEvents()
    await broadcastContacts()
    await broadcastTasks()
    await broadcastNotes()
    await broadcastMessages()
    await broadcastInteractions()
    sendIPC({ type: 'ready', peerId, peerCount: swarm.connections.size })
  }

  function onMessage(data) {
    const message = data.toString()
    try {
      const msg = JSON.parse(message)
      if (msg.type === 'addListing') {
        const listing = {
          id: `${peerId}-${Date.now()}`,
          title: msg.title,
          description: msg.description,
          price: msg.price,
          currency: msg.currency || 'USD',
          category: msg.category || 'general',
          image: msg.image || '',
          sellerPeerId: peerId,
          createdAt: Date.now(),
        }
        marketCore.append(Buffer.from(JSON.stringify(listing), 'utf8'))
      } else if (msg.type === 'deleteListing') {
        marketCore.get(msg.index).then((buf) => {
          const entry = JSON.parse(buf.toString('utf8'))
          entry.deleted = true
          marketCore.append(Buffer.from(JSON.stringify(entry), 'utf8')).then(broadcastListings)
        })
      } else if (msg.type === 'requestListings') {
        broadcastListings()
      } else if (msg.type === 'addEvent') {
        const event = {
          id: `${peerId}-${Date.now()}`,
          title: msg.title,
          description: msg.description,
          date: msg.date,
          location: msg.location,
          category: msg.category || 'general',
          image: msg.image || '',
          hostPeerId: peerId,
          attendees: [],
          createdAt: Date.now(),
        }
        eventCore.append(Buffer.from(JSON.stringify(event), 'utf8'))
      } else if (msg.type === 'deleteEvent') {
        eventCore.get(msg.index).then((buf) => {
          const entry = JSON.parse(buf.toString('utf8'))
          entry.deleted = true
          eventCore.append(Buffer.from(JSON.stringify(entry), 'utf8')).then(broadcastEvents)
        })
      } else if (msg.type === 'joinEvent') {
        eventCore.get(msg.index).then((buf) => {
          const entry = JSON.parse(buf.toString('utf8'))
          if (!entry.attendees.includes(peerId)) {
            entry.attendees.push(peerId)
          }
          eventCore.append(Buffer.from(JSON.stringify(entry), 'utf8')).then(broadcastEvents)
        })
      } else if (msg.type === 'leaveEvent') {
        eventCore.get(msg.index).then((buf) => {
          const entry = JSON.parse(buf.toString('utf8'))
          entry.attendees = entry.attendees.filter((a) => a !== peerId)
          eventCore.append(Buffer.from(JSON.stringify(entry), 'utf8')).then(broadcastEvents)
        })
      } else if (msg.type === 'requestEvents') {
        broadcastEvents()
      } else if (msg.type === 'addContact') {
        const contact = {
          id: `${peerId}-${Date.now()}`,
          name: msg.name,
          peerId: msg.contactPeerId,
          note: msg.note || '',
          avatar: msg.avatar || '',
          addedAt: Date.now(),
        }
        contactCore.append(Buffer.from(JSON.stringify(contact), 'utf8'))
      } else if (msg.type === 'deleteContact') {
        contactCore.get(msg.index).then((buf) => {
          const entry = JSON.parse(buf.toString('utf8'))
          entry.deleted = true
          contactCore.append(Buffer.from(JSON.stringify(entry), 'utf8')).then(broadcastContacts)
        })
      } else if (msg.type === 'updateContact') {
        contactCore.get(msg.index).then((buf) => {
          const entry = JSON.parse(buf.toString('utf8'))
          if (msg.name !== undefined) entry.name = msg.name
          if (msg.note !== undefined) entry.note = msg.note
          if (msg.avatar !== undefined) entry.avatar = msg.avatar
          contactCore.append(Buffer.from(JSON.stringify(entry), 'utf8')).then(broadcastContacts)
        })
      } else if (msg.type === 'requestContacts') {
        broadcastContacts()
      } else if (msg.type === 'addTask') {
        const task = {
          id: `${peerId}-${Date.now()}`,
          title: msg.title,
          notes: msg.notes || '',
          done: false,
          dueDate: msg.dueDate || null,
          priority: msg.priority || 'medium',
          ownerPeerId: peerId,
          createdAt: Date.now(),
        }
        taskCore.append(Buffer.from(JSON.stringify(task), 'utf8'))
      } else if (msg.type === 'toggleTask') {
        taskCore.get(msg.index).then((buf) => {
          const entry = JSON.parse(buf.toString('utf8'))
          entry.done = !entry.done
          taskCore.append(Buffer.from(JSON.stringify(entry), 'utf8')).then(broadcastTasks)
        })
      } else if (msg.type === 'deleteTask') {
        taskCore.get(msg.index).then((buf) => {
          const entry = JSON.parse(buf.toString('utf8'))
          entry.deleted = true
          taskCore.append(Buffer.from(JSON.stringify(entry), 'utf8')).then(broadcastTasks)
        })
      } else if (msg.type === 'updateTask') {
        taskCore.get(msg.index).then((buf) => {
          const entry = JSON.parse(buf.toString('utf8'))
          if (msg.title !== undefined) entry.title = msg.title
          if (msg.notes !== undefined) entry.notes = msg.notes
          if (msg.dueDate !== undefined) entry.dueDate = msg.dueDate
          if (msg.priority !== undefined) entry.priority = msg.priority
          taskCore.append(Buffer.from(JSON.stringify(entry), 'utf8')).then(broadcastTasks)
        })
      } else if (msg.type === 'requestTasks') {
        broadcastTasks()
      } else if (msg.type === 'addNote') {
        const note = {
          id: `${peerId}-${Date.now()}`,
          title: msg.title,
          body: msg.body || '',
          color: msg.color || 'yellow',
          pinned: false,
          ownerPeerId: peerId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        noteCore.append(Buffer.from(JSON.stringify(note), 'utf8'))
      } else if (msg.type === 'updateNote') {
        noteCore.get(msg.index).then((buf) => {
          const entry = JSON.parse(buf.toString('utf8'))
          if (msg.title !== undefined) entry.title = msg.title
          if (msg.body !== undefined) entry.body = msg.body
          if (msg.color !== undefined) entry.color = msg.color
          if (msg.pinned !== undefined) entry.pinned = msg.pinned
          entry.updatedAt = Date.now()
          noteCore.append(Buffer.from(JSON.stringify(entry), 'utf8')).then(broadcastNotes)
        })
      } else if (msg.type === 'deleteNote') {
        noteCore.get(msg.index).then((buf) => {
          const entry = JSON.parse(buf.toString('utf8'))
          entry.deleted = true
          noteCore.append(Buffer.from(JSON.stringify(entry), 'utf8')).then(broadcastNotes)
        })
      } else if (msg.type === 'togglePinNote') {
        noteCore.get(msg.index).then((buf) => {
          const entry = JSON.parse(buf.toString('utf8'))
          entry.pinned = !entry.pinned
          entry.updatedAt = Date.now()
          noteCore.append(Buffer.from(JSON.stringify(entry), 'utf8')).then(broadcastNotes)
        })
      } else if (msg.type === 'requestNotes') {
        broadcastNotes()
      } else if (msg.type === 'sendMessage') {
        const message = {
          id: `${peerId}-${Date.now()}`,
          fromPeerId: peerId,
          toPeerId: msg.toPeerId,
          text: msg.text,
          createdAt: Date.now(),
        }
        messageCore.append(Buffer.from(JSON.stringify(message), 'utf8'))
      } else if (msg.type === 'requestMessages') {
        broadcastMessages()
      } else if (msg.type === 'addInteraction') {
        const interaction = {
          id: `${peerId}-${Date.now()}`,
          kind: msg.kind,
          targetType: msg.targetType,
          targetId: msg.targetId,
          targetIndex: msg.targetIndex,
          peerId: peerId,
          text: msg.text || '',
          createdAt: Date.now(),
        }
        interactionCore.append(Buffer.from(JSON.stringify(interaction), 'utf8'))
      } else if (msg.type === 'removeInteraction') {
        interactionCore.get(msg.index).then((buf) => {
          const entry = JSON.parse(buf.toString('utf8'))
          entry.deleted = true
          interactionCore.append(Buffer.from(JSON.stringify(entry), 'utf8')).then(broadcastInteractions)
        })
      } else if (msg.type === 'requestInteractions') {
        broadcastInteractions()
      } else if (msg.type === 'requestPeerInfo') {
        sendIPC({ type: 'peerInfo', peerId, peerCount: swarm.connections.size })
      }
    } catch (e) {
      // Non-JSON or unknown message — ignore
    }
  }

  pipe.on('data', onMessage)

  const peerInterval = setInterval(() => {
    sendIPC({ type: 'peerInfo', peerId, peerCount: swarm.connections.size })
  }, 5000)

  function destroy() {
    clearInterval(peerInterval)
  }

  return { init, sendIPC, destroy }
}

module.exports = { createMarket, MARKET_TOPIC }
