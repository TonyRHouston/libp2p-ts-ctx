import {
  createDelegatedRoutingV1HttpApiClient,
  DelegatedRoutingV1HttpApiClient,
} from '@helia/delegated-routing-v1-http-api-client'
import { createLibp2p } from 'libp2p'
import { identify } from '@libp2p/identify'
import { peerIdFromString } from '@libp2p/peer-id'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { Multiaddr } from '@multiformats/multiaddr'
import type { Connection, Message, PeerId, PeerInfo, SubscriptionChangeData } from '@libp2p/interface'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { webSockets } from '@libp2p/websockets'
import { webTransport } from '@libp2p/webtransport'
import { webRTC } from '@libp2p/webrtc'
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'
import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'
import { ping } from '@libp2p/ping'
import { BOOTSTRAP_PEER_IDS, CHAT_FILE_TOPIC, CHAT_TOPIC, PUBSUB_PEER_DISCOVERY } from './constants.ts'
import first from 'it-first'
import { directMessage } from './direct-message.ts'
import type { Libp2p, PubSub } from '@libp2p/interface'
import type { Identify } from '@libp2p/identify'
import type { DirectMessage, DirectMessageEvent } from './direct-message.ts'
import { KadDHT } from '@libp2p/kad-dht'
import { bootstrap } from '@libp2p/bootstrap'
import { kadDHT } from '@libp2p/kad-dht'
import { encrypt } from './func.ts'

export type Libp2pTypeC = Libp2p<{
  pubsub: PubSub
  identify: Identify
  directMessage: DirectMessage
  kadDHT: KadDHT
}>

let pubKey: string

export async function startClient(): Promise<Libp2pTypeC> {
  const delegatedClient = createDelegatedRoutingV1HttpApiClient('https://delegated-ipfs.dev')
  const relayListenAddrs = await getRelayListenAddrs(delegatedClient)
  let libp2p: Libp2pTypeC
  try {
    libp2p = await createLibp2p({
      addresses: {
        listen: ['/webrtc', ...relayListenAddrs],
      },
      transports: [webTransport(), webSockets(), webRTC(), circuitRelayTransport()],
      connectionEncrypters: [noise()],
      streamMuxers: [yamux()],
      peerDiscovery: [
        pubsubPeerDiscovery({
          interval: 10_000,
          listenOnly: true,
          topics: PUBSUB_PEER_DISCOVERY,
        }),
        bootstrap({
          list: ['/ip4/127.0.0.1/tcp/9089/ws/p2p/12D3KooWDq819c3UoichS1LfGuxrT5hNNTFKLv3hDxFvm9ZnuzFz'],
        }),
      ],
      services: {
        kadDHT: kadDHT({
          protocol: '/ipfs/lan/kad/1.0.0',
          clientMode: true,
        }),
        pubsub: gossipsub(),
        identify: identify(),
        directMessage: directMessage(),
        ping: ping(),
      },
    })
  } catch (e) {
    console.error('Failed to create libp2p node', e)
    throw new Error('Failed to create libp2p node')
  }
  await libp2p.start()
  await libp2p.services.directMessage.start()
  subscribeToTopics(libp2p)
  setupEventListeners(libp2p)

  console.log(libp2p.peerId.toString())

  return libp2p
}

function logPubsubMessage(event: CustomEvent) {
  const { detail } = event
  console.log('📨 Pubsub Message Details:')
  console.log('├─ Topic:', detail.topic)
  console.log('├─ From:', detail.from.toString())
  console.log('├─ Data:', new TextDecoder().decode(detail.data))
  console.log('├─ SequenceNumber:', detail.sequenceNumber)
  console.log('└─ Valid Signature:', detail.valid)
}
function logPeerInfo(prefix: string, peerId: PeerId, multiaddrs?: Multiaddr[]) {
  console.log(`${prefix} Peer Information:`)
  console.log('├─ PeerId:', peerId)
  if (multiaddrs) {
    console.log('└─ Multiaddrs:')
    multiaddrs.forEach((addr, i) => {
      const isLast = i === multiaddrs.length - 1
      console.log(`${isLast ? '   └─' : '   ├─'} ${addr.toString()}`)
    })
  }
}
function logConnectionInfo(libp2p: Libp2pTypeC, connection: Connection) {
  console.log('🔗 Peer Connected:')
  console.log('├─ Peer:', connection.remotePeer.toString())
  console.log('├─ Connection #:', libp2p.getConnections().length)
  console.log('├─ Remote Address:', connection.remoteAddr.toString())
  console.log('└─ Protocols:', Array.from(connection.remoteAddr.protoNames()))
}
function logSubscriptionChange(event: CustomEvent<SubscriptionChangeData>) {
  console.log('sub change data: ', event.detail)
  const { topic, subscribe } = event.detail.subscriptions[0]
  console.log('📢 Subscription Change:')
  console.log('├─ Topic:', topic)
  console.log('└─ Status:', subscribe ? 'Subscribed' : 'Unsubscribed')
}
function logDirectMessage(event: CustomEvent) {
  console.log('📬 Direct Message Details:')
  console.log('├─ From:', event.detail.connection.remotePeer.toString())
  console.log('├─ Content:', event.detail.content)
  console.log('└─ Timestamp:', new Date().toISOString())
}

function setupEventListeners(libp2p: Libp2pTypeC) {
  libp2p.services.pubsub.addEventListener('message', async (event: CustomEvent<Message>) => { 
    logPubsubMessage(event)
    switch (event.detail.topic) {
      case 'peer-discovery':
        break
    }
  })

  libp2p.services.directMessage.addEventListener('message',async  (event: CustomEvent<DirectMessageEvent>) => { 
    logDirectMessage(event)
    const { content, type } = event.detail
    switch (type) {
      case 'handshake':
      pubKey = content;
      const retVal = {
        multiAddrs: libp2p.getMultiaddrs(),
        type: `client${process.env.NEXT_PUBLIC_CLIENT_VERSION}`,
      }
      libp2p.services.directMessage.send(event.detail.connection.remotePeer, await encrypt(pubKey, JSON.stringify(retVal)), 'handshake-response')
        break
    }
  })

  libp2p.addEventListener('peer:connect', (event: CustomEvent<PeerId>) => {
    logConnectionInfo(libp2p, libp2p.getConnections(event.detail)[0])
  })

  libp2p.addEventListener('peer:discovery', (event: CustomEvent<PeerInfo>) => {
    const { id, multiaddrs } = event.detail
    logPeerInfo('🔍 Discovered', id, multiaddrs)
  })

  libp2p.services.pubsub.addEventListener('subscription-change', (event: CustomEvent<SubscriptionChangeData>) => {
    logSubscriptionChange(event)
  })
}
function subscribeToTopics(libp2p: Libp2pTypeC) {
  libp2p.services.pubsub.subscribe(CHAT_TOPIC)
  libp2p.services.pubsub.subscribe(CHAT_FILE_TOPIC)
  for (const topic of PUBSUB_PEER_DISCOVERY) {
    libp2p.services.pubsub.subscribe(topic)
  }
}
const getRelayListenAddr = (maddr: Multiaddr, peer: PeerId): string =>
  `${maddr.toString()}/p2p/${peer.toString()}/p2p-circuit`
async function getRelayListenAddrs(client: DelegatedRoutingV1HttpApiClient): Promise<string[]> {
  const peers = await Promise.all(BOOTSTRAP_PEER_IDS.map((peerId:string) => first(client.getPeers(peerIdFromString(peerId)))))

  const relayListenAddrs = []
  for (const p of peers) {
    if (p && p.Addrs.length > 0) {
      for (const maddr of p.Addrs) {
        const protos = maddr.protoNames()
        if (protos.includes('tls') && protos.includes('ws')) {
          if (maddr.nodeAddress().address === '127.0.0.1') continue
          relayListenAddrs.push(getRelayListenAddr(maddr, p.ID))
        }
      }
    }
  }
  return relayListenAddrs
}
