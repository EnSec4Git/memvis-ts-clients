import { MapState } from "./mapstate";
import MemRow from './memRow';
import { IterableWeakSet } from './iterableWeakSet';
export default abstract class MVClient {
    ptrSize?: number;
    protected _memrefs: IterableWeakSet<MemRow>;
    protected constructor();
    protected abstract _internal_memread($startAddr: any, $endAddr: any): Promise<MemRow>;
    abstract getMaps(): Promise<MapState>;
    abstract getPtrSize(): Promise<number>;
    memr($startAddr: any, $endAddr: any): Promise<MemRow>;
    refresh(): Promise<void>;
}
