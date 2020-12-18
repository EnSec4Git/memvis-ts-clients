import { MapState, MapRow, RawMaps } from './mapstate';
import client from './client';
import MockMVClient from './mockClient';
import { TCPMVClientInterface } from './tcpClient';
import MemRow from './memRow';
export { client as MVClient };
export { RawMaps as RawMaps };
export { MapRow as MapRow };
export { MapState as MapState };
export { MemRow as MemRow };
declare const _default: (useTcp: boolean) => {
    TCPMVClientPromise: Promise<TCPMVClientInterface>;
    MockMVClient: typeof MockMVClient;
    MapRow: typeof MapRow;
};
export default _default;
