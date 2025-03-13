import type { Multiaddr } from "@multiformats/multiaddr";
export declare function generateKeys(prvKey_64hex?: string): Promise<{
    privateKey: string;
    publicKey: string;
}>;
export declare function encrypt(pubKey: string, _in: string): Promise<string>;
export declare function decrypt(prvKey: string, _in: string): Promise<string>;
export declare function hexToUint8Array(hexString: string): Promise<Uint8Array<ArrayBufferLike>>;
export declare function trimAddresses(list: Multiaddr[]): string[];
export declare function random(len: number): string;
//# sourceMappingURL=func.d.ts.map