import React, { createContext, useContext, useState, useEffect } from 'react';
import { startClient } from 'libp2p-ts';
import { multiaddr } from '@multiformats/multiaddr';
import { ChatProvider } from './chat-ctx';
export const libp2pContext = createContext({
    // @ts-ignore to avoid having to check isn't undefined everywhere. Can't be undefined because children are conditionally rendered
    libp2p: undefined,
});
// This is needed to prevent libp2p from instantiating more than once
export function AppWrapper({ children }) {
    const [libp2p, setLibp2p] = useState(undefined);
    useEffect(() => {
        const init = async () => {
            if (window.started == true)
                return;
            window.started = true;
            if (window.libp2p) {
                setLibp2p(window.libp2p);
                return;
            }
            try {
                const libp2p = await startClient();
                if (!libp2p) {
                    throw new Error('failed to start libp2p');
                }
                window.libp2p = libp2p;
                setLibp2p(libp2p);
            }
            catch (e) {
                console.error('failed to start libp2p', e);
            }
        };
        init();
    }, [libp2p, window.libp2p]);
    if (!libp2p) {
        return;
    }
    return (<libp2pContext.Provider value={{ libp2p }}>
      <ChatProvider>
      {children}
      </ChatProvider>
    </libp2pContext.Provider>);
}
export function useLibp2pContext() {
    return useContext(libp2pContext);
}
export const connectToMultiaddr = async (_multiaddr, libp2p) => {
    console.log(`dialling: %a`, _multiaddr);
    const multiaddr_ = multiaddr(_multiaddr);
    if (libp2p)
        try {
            const conn = await libp2p.dial(multiaddr_);
            console.log('connected to %p on %a', conn.remotePeer, conn.remoteAddr);
            return conn;
        }
        catch (e) {
            console.error(e);
            throw e;
        }
};
//# sourceMappingURL=ctx.jsx.map