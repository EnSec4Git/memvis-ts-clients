import MVClient from "./client";
import { MapState } from "./mapstate";
import MemRow from "./memRow";
import { PtrArrayTypes } from "./ptrTypes";
export default class MockMVClient extends MVClient {
    _PAC?: PtrArrayTypes;
    constructor();
    getPtrSize(): Promise<number>;
    getMaps(): Promise<MapState>;
    _internal_memread($startAddr: bigint, $endAddr: bigint): Promise<MemRow>;
}
