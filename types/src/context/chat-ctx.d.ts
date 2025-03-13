import React from 'react';
export interface ChatMessage {
    msgId: string;
    msg: string;
    fileObjectUrl: string | undefined;
    peerId: string;
    read: boolean;
    receivedAt: number;
}
export interface ChatFile {
    id: string;
    body: Uint8Array;
    sender: string;
}
export interface DirectMessages {
    [peerId: string]: ChatMessage[];
}
type Chatroom = string;
export interface ChatContextInterface {
    messageHistory: ChatMessage[];
    setMessageHistory: (messageHistory: ChatMessage[] | ((prevMessages: ChatMessage[]) => ChatMessage[])) => void;
    directMessages: DirectMessages;
    setDirectMessages: (directMessages: DirectMessages | ((prevMessages: DirectMessages) => DirectMessages)) => void;
    roomId: Chatroom;
    setRoomId: (chatRoom: Chatroom) => void;
    files: Map<string, ChatFile>;
    setFiles: (files: Map<string, ChatFile>) => void;
}
export declare const chatContext: React.Context<ChatContextInterface>;
export declare const useChatContext: () => ChatContextInterface;
export declare const ChatProvider: ({ children }: any) => React.JSX.Element;
export {};
//# sourceMappingURL=chat-ctx.d.ts.map