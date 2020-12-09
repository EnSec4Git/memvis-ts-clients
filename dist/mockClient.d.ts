import MVClient from "./client";
import { MapState } from "./mapstate";
import MemRow from "./memRow";
export default class MockMVClient extends MVClient {
    constructor();
    getPtrSize(): Promise<number>;
    getMaps(): Promise<MapState>;
    _internal_memread($startAddr: bigint, $endAddr: bigint): Promise<MemRow>;
}
