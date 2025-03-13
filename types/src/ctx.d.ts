import React, { ReactNode } from 'react';
import type { Libp2p } from '@libp2p/interface';
import { Libp2pTypeC } from 'libp2p-ts';
export declare const libp2pContext: React.Context<{
    libp2p: Libp2pTypeC;
}>;
interface WrapperProps {
    children?: ReactNode;
}
export declare function AppWrapper({ children }: WrapperProps): React.JSX.Element | undefined;
export declare function useLibp2pContext(): {
    libp2p: Libp2pTypeC;
};
export declare const connectToMultiaddr: (_multiaddr: string, libp2p: Libp2p) => Promise<import("@libp2p/interface").Connection | undefined>;
export {};
//# sourceMappingURL=ctx.d.ts.map