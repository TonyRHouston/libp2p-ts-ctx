import { Libp2pTypeC } from "libp2p-ts";
export * from "./src/ctx.tsx";
export * from "./src/chat-ctx.tsx";
declare global {
    interface Window {
        libp2p: Libp2pTypeC | undefined;
        started: boolean;
    }
}
//# sourceMappingURL=index.d.ts.map