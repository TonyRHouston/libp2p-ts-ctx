import { DelegatedRoutingV1HttpApiClient } from '@helia/delegated-routing-v1-http-api-client';
import { Libp2p, PubSub } from "@libp2p/interface";
import type { Identify } from "@libp2p/identify";
import type { DirectMessage } from "./direct-message.ts";
import { ClientManager } from "./ClientManager.ts";
export type Libp2pTypeR = Libp2p<{
    pubsub?: PubSub;
    identify: Identify;
    directMessage: DirectMessage;
    delegatedRouting?: DelegatedRoutingV1HttpApiClient;
    ClientManager: ClientManager;
}>;
export declare function startRelay(): Promise<Libp2pTypeR>;
//# sourceMappingURL=libp2p_relay.d.ts.map