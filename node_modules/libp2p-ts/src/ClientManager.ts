import { PeerObject } from "./types.ts";

export class ClientManager {
  private map: Map<string, PeerObject>;
  constructor(_map: Map<string, PeerObject>) {
    this.map = _map;
  }
  add(peer: string, val: PeerObject) {
    this.map.set(peer, val);
  }
  remove(peer: string) {
    return this.map.delete(peer);
  }
  len() {
    return this.map.size;
  }
}

export function clientManager() {
  return () => {
    return new ClientManager(new Map<string, PeerObject>());
  };
}
