import { MapState, MapRow, RawMaps } from './mapstate';
import client from './client';
import MockMVClient from './mockClient';
// import TCPMVClient from './tcpClient';
import MemRow from './memRow';

export { client as MVClient };

export { RawMaps as RawMaps };

// export { TCPMVClient as TCPMVClient };
export { MockMVClient as MockMVClient };

export { MapRow as MapRow }
export { MapState as MapState }
export { MemRow as MemRow };

let DEFAULT_EXPORT = {
    MapState,
    MapRow,
    MemRow,
    MockMVClient,
    // TCPMVClient
};

if (typeof window === 'undefined') {
    let TCPMVClient = require('./tcpClient').default;
    Object.assign(module.exports, {
        TCPMVClient
    });
    Object.assign(DEFAULT_EXPORT, { TCPMVClient });
}

export default DEFAULT_EXPORT;