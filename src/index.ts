import { MapState, MapRow, RawMaps } from './mapstate';
import client from './client';
import MockMVClient from './mockClient';
import TCPMVClientPromise, { TCPMVClientInterface } from './tcpClient';
let tcpClientClass = TCPMVClientPromise as unknown as ($confirm: boolean) => Promise<TCPMVClientInterface>;
import MemRow from './memRow';

export { client as MVClient };

export { RawMaps as RawMaps };

export { tcpClientClass as TCPMVClientPromise };
export { MockMVClient as MockMVClient };

export { MapRow as MapRow }
export { MapState as MapState }
export { MemRow as MemRow };

let DEFAULT_EXPORT = {
    MapState,
    MapRow,
    MemRow,
    MockMVClient,
    TCPMVClient: tcpClientClass
};

// if (typeof window === 'undefined') {
// if(process && process.env) {
//     //console.log(window, typeof(window));
//     //console.log(window.document)
//     let TCPMVClient = require('./tcpClient').default;
//     Object.assign(exports, {
//         TCPMVClient
//     });
//     Object.assign(DEFAULT_EXPORT, { TCPMVClient });
// }

export default DEFAULT_EXPORT;