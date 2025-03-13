import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { startClient } from 'libp2p-ts'
import type { Libp2p, PubSub } from '@libp2p/interface'
import type { Identify } from '@libp2p/identify'
import type { DirectMessage } from 'libp2p-ts'
import type { DelegatedRoutingV1HttpApiClient } from '@helia/delegated-routing-v1-http-api-client'
import { multiaddr } from '@multiformats/multiaddr'
import { KadDHT } from '@libp2p/kad-dht'
import {ChatProvider} from './chat-ctx'
import { Libp2pTypeC } from 'libp2p-ts'

export const libp2pContext = createContext<{ libp2p: Libp2pTypeC }>({
  // @ts-ignore to avoid having to check isn't undefined everywhere. Can't be undefined because children are conditionally rendered
  libp2p: undefined,
})

interface WrapperProps {
  children?: ReactNode
}

// This is needed to prevent libp2p from instantiating more than once

export function AppWrapper({ children }: WrapperProps) {
  const [libp2p, setLibp2p] = useState<Libp2pTypeC | undefined>(undefined)
  useEffect(() => {
    const init = async () => {
      if(window.started == true) return
      window.started = true
      if (window.libp2p) {
        setLibp2p(window.libp2p)
        return
      }
      try {
        const libp2p = await startClient()

        if (!libp2p) {
          throw new Error('failed to start libp2p')
        }

        window.libp2p = libp2p as Libp2pTypeC
       setLibp2p(libp2p as Libp2pTypeC)
      } catch (e) {
        console.error('failed to start libp2p', e)
      }
    }

    init()
  }, [libp2p, window.libp2p])

  if (!libp2p) {
    return  
  }

  return (
    
    <libp2pContext.Provider value={{ libp2p }}>
      <ChatProvider>
      {children}
      </ChatProvider>
    </libp2pContext.Provider>
  )
}

export function useLibp2pContext() {
  return useContext(libp2pContext)
}
export const connectToMultiaddr =  async (_multiaddr: string, libp2p: Libp2p) => {
  console.log(`dialling: %a`, _multiaddr)

const multiaddr_ = multiaddr(_multiaddr)
if(libp2p)
  try {
    const conn = await libp2p.dial(multiaddr_)
    console.log('connected to %p on %a', conn.remotePeer, conn.remoteAddr)
    return conn
  } catch (e) {
    console.error(e)
    throw e
  }
}