export * from './src/context/ctx'
export * from './src/context/chat-ctx'
import {Libp2pTypeC} from  'libp2p-ts'

declare global {
    interface Window {
      libp2p: Libp2pTypeC | undefined;
      started: boolean;
    }
  }