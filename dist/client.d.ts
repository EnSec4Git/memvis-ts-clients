import { MapState } from "./mapstate";
import MemRow from './memRow';
import { IterableWeakSet } from './iterableWeakSet';
export default abstract class MVClient {
    abstract getMaps(): Promise<MapState>;
    abstract getPtrSize(): Promise<number>;
    memr($startAddr: any, $endAddr: any): Promise<MemRow>;
    protected abstract _internal_memread($startAddr: any, $endAddr: any): Promise<MemRow>;
    refresh(): Promise<void>;
    ptrSize?: number;
    protected _memrefs: IterableWeakSet<MemRow>;
}
