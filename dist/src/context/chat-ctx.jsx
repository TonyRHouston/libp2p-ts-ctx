var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLibp2pContext } from './ctx';
import { CHAT_FILE_TOPIC, CHAT_TOPIC, FILE_EXCHANGE_PROTOCOL, directMessageEvent } from 'libp2p-ts';
import { toString as uint8ArrayToString } from 'uint8arrays/to-string';
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string';
import { pipe } from 'it-pipe';
import map from 'it-map';
import * as lp from 'it-length-prefixed';
export const chatContext = createContext({
    messageHistory: [],
    setMessageHistory: () => { },
    directMessages: {},
    setDirectMessages: () => { },
    roomId: '',
    setRoomId: () => { },
    files: new Map(),
    setFiles: () => { },
});
export const useChatContext = () => {
    return useContext(chatContext);
};
export const ChatProvider = ({ children }) => {
    const [messageHistory, setMessageHistory] = useState([]);
    const [directMessages, setDirectMessages] = useState({});
    const [files, setFiles] = useState(new Map());
    const [roomId, setRoomId] = useState('');
    const { libp2p } = useLibp2pContext();
    const messageCB = (evt) => {
        // FIXME: Why does 'from' not exist on type 'Message'?
        const { topic, data } = evt.detail;
        switch (topic) {
            case CHAT_TOPIC: {
                chatMessageCB(evt, topic, data);
                break;
            }
            case CHAT_FILE_TOPIC: {
                chatFileMessageCB(evt, topic, data);
                break;
            }
            case 'universal-connectivity-browser-peer-discovery': {
                break;
            }
            default: {
                break;
            }
        }
    };
    const chatMessageCB = (evt, topic, data) => {
        const msg = new TextDecoder().decode(data);
        console.log(`${topic}: ${msg}`);
        // Append signed messages, otherwise discard
        if (evt.detail.type === 'signed') {
            setMessageHistory([
                ...messageHistory,
                {
                    msgId: crypto.randomUUID(),
                    msg,
                    fileObjectUrl: undefined,
                    peerId: evt.detail.from.toString(),
                    read: false,
                    receivedAt: Date.now(),
                },
            ]);
        }
    };
    const chatFileMessageCB = async (evt, topic, data) => {
        const newChatFileMessage = (id, body) => {
            return `File: ${id} (${body.length} bytes)`;
        };
        const fileId = new TextDecoder().decode(data);
        // if the message isn't signed, discard it.
        if (evt.detail.type !== 'signed') {
            return;
        }
        const senderPeerId = evt.detail.from;
        try {
            const stream = await libp2p.dialProtocol(senderPeerId, FILE_EXCHANGE_PROTOCOL);
            await pipe([uint8ArrayFromString(fileId)], (source) => lp.encode(source), stream, (source) => lp.decode(source), async function (source) {
                var _a, e_1, _b, _c;
                try {
                    for (var _d = true, source_1 = __asyncValues(source), source_1_1; source_1_1 = await source_1.next(), _a = source_1_1.done, !_a; _d = true) {
                        _c = source_1_1.value;
                        _d = false;
                        const data = _c;
                        const body = data.subarray();
                        console.log(`chat file message request_response: response received: size:${body.length}`);
                        const msg = {
                            msgId: crypto.randomUUID(),
                            msg: newChatFileMessage(fileId, body),
                            fileObjectUrl: window.URL.createObjectURL(new Blob([body])),
                            peerId: senderPeerId.toString(),
                            read: false,
                            receivedAt: Date.now(),
                        };
                        setMessageHistory([...messageHistory, msg]);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_d && !_a && (_b = source_1.return)) await _b.call(source_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            });
        }
        catch (e) {
            console.error(e);
        }
    };
    useEffect(() => {
        const handleDirectMessage = (evt) => {
            const peerId = evt.detail.connection.remotePeer.toString();
            const message = {
                msg: evt.detail.content,
                read: false,
                msgId: crypto.randomUUID(),
                fileObjectUrl: undefined,
                peerId: peerId,
                receivedAt: Date.now(),
            };
            const updatedMessages = directMessages[peerId] ? [...directMessages[peerId], message] : [message];
            setDirectMessages(Object.assign(Object.assign({}, directMessages), { [peerId]: updatedMessages }));
        };
        libp2p.services.directMessage.addEventListener(directMessageEvent, handleDirectMessage);
        return () => {
            libp2p.services.directMessage.removeEventListener(directMessageEvent, handleDirectMessage);
        };
    }, [directMessages, libp2p.services.directMessage, setDirectMessages]);
    useEffect(() => {
        libp2p.services.pubsub.addEventListener('message', messageCB);
        libp2p.handle(FILE_EXCHANGE_PROTOCOL, ({ stream }) => {
            pipe(stream.source, (source) => lp.decode(source), (source) => map(source, async (msg) => {
                const fileId = uint8ArrayToString(msg.subarray());
                const file = files.get(fileId);
                return file.body;
            }), (source) => lp.encode(source), stream.sink);
        });
        return () => {
            ;
            (async () => {
                // Cleanup handlers 👇
                libp2p.services.pubsub.removeEventListener('message', messageCB);
                await libp2p.unhandle(FILE_EXCHANGE_PROTOCOL);
            })();
        };
    });
    return (<chatContext.Provider value={{
            roomId,
            setRoomId,
            messageHistory,
            setMessageHistory,
            directMessages,
            setDirectMessages,
            files,
            setFiles,
        }}>
      {children}
    </chatContext.Provider>);
};
//# sourceMappingURL=chat-ctx.jsx.map