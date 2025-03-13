export class ClientManager {
    constructor(_map) {
        this.map = _map;
    }
    add(peer, val) {
        this.map.set(peer, val);
    }
    remove(peer) {
        return this.map.delete(peer);
    }
    len() {
        return this.map.size;
    }
}
export function clientManager() {
    return () => {
        return new ClientManager(new Map());
    };
}
//# sourceMappingURL=ClientManager.js.map