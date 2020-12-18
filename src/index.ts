import { MapState, MapRow, RawMaps } from './mapstate';
import client from './client';
import MockMVClient from './mockClient';
import TCPMVClient, { TCPMVClientInterface } from './tcpClient';
//let tcpClientClass = TCPMVClientPromise as unknown as ($confirm: boolean) => Promise<TCPMVClientInterface>;
import MemRow from './memRow';

export { client as MVClient };

export { RawMaps as RawMaps };

// export { tcpClientClass as TCPMVClientPromise };
export { MockMVClient as MockMVClient };

export { MapRow as MapRow }
export { MapState as MapState }
export { MemRow as MemRow };

// let DEFAULT_EXPORT = {
//     MapState,
//     MapRow,
//     MemRow,
//     MockMVClient,
//     TCPMVClient: tcpClientClass
// };

// export default DEFAULT_EXPORT;

export default {
    //client as MVClient,
    //RawMaps,
    //TCPMVClientPromise: tcpClientClass(useTcp),
    TCPMVClient,
    MockMVClient,
    MapRow,
    MapState
}