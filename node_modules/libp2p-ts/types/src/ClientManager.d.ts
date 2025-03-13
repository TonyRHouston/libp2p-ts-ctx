import { PeerObject } from "./types.ts";
export declare class ClientManager {
    private map;
    constructor(_map: Map<string, PeerObject>);
    add(peer: string, val: PeerObject): void;
    remove(peer: string): boolean;
    len(): number;
}
export declare function clientManager(): () => ClientManager;
//# sourceMappingURL=ClientManager.d.ts.map