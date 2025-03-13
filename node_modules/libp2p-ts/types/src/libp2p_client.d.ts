import type { Libp2p, PubSub } from '@libp2p/interface';
import type { Identify } from '@libp2p/identify';
import type { DirectMessage } from './direct-message.ts';
import { KadDHT } from '@libp2p/kad-dht';
export type Libp2pTypeC = Libp2p<{
    pubsub: PubSub;
    identify: Identify;
    directMessage: DirectMessage;
    kadDHT: KadDHT;
}>;
export declare function startClient(): Promise<Libp2pTypeC>;
//# sourceMappingURL=libp2p_client.d.ts.map