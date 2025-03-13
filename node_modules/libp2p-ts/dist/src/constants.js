export const CHAT_TOPIC = 'universal-connectivity';
export const CHAT_FILE_TOPIC = 'universal-connectivity-file';
export const PUBSUB_PEER_DISCOVERY = [
    // `myApp._peer-discovery._p2p._pubsub`, // It's recommended but not required to extend the global space
    // '_peer-discovery._p2p._pubsub', // Include if you want to participate in the global space.
    //  'browser-peer-discovery',
    // 'peer-discovery',
    'universal-connectivity-browser-peer-discovery'
];
export const FILE_EXCHANGE_PROTOCOL = '/universal-connectivity-file/1';
export const DIRECT_MESSAGE_PROTOCOL = '/universal-connectivity/dm/1.0.0';
export const CIRCUIT_RELAY_CODE = 290;
export const MIME_TEXT_PLAIN = 'text/plain';
// 👇 App specific dedicated bootstrap PeerIDs
// Their multiaddrs are ephemeral so peer routing is used to resolve multiaddr
export const WEBTRANSPORT_BOOTSTRAP_PEER_ID = '12D3KooWFhXabKDwALpzqMbto94sB7rvmZ6M28hs9Y9xSopDKwQr';
export const BOOTSTRAP_PEER_IDS = [WEBTRANSPORT_BOOTSTRAP_PEER_ID];
export const HELIA_DELEGATED_API_URL = 'https://delegated-ipfs.dev';
//# sourceMappingURL=constants.js.map