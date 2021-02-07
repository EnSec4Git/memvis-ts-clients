import { MapState } from "./mapstate";
import MemRow from './memRow';
import { IterableWeakSet } from './iterableWeakSet';
export declare type MapsEventListener = (x: MapState) => any;
export default abstract class MVClient {
    ptrSize?: number;
    PAGE_SIZE: number;
    protected _memrefs: IterableWeakSet<MemRow>;
    protected _pagerefs: IterableWeakSet<MemRow>;
    protected eventListeners: MapsEventListener[];
    protected constructor();
    protected abstract _internal_memread($startAddr: bigint, $endAddr: bigint): Promise<MemRow>;
    protected _notify_maps_listeners(result: MapState): void;
    abstract getMaps(): Promise<MapState>;
    abstract getPtrSize(): Promise<number>;
    roundToPage($startAddr: bigint, $endAddr: bigint): [bigint, bigint];
    memr($startAddr: bigint, $endAddr: bigint): Promise<MemRow>;
    addMapsEventListener($listener: MapsEventListener): void;
    removeMapsEventListener($listener: MapsEventListener): void;
    refresh(): Promise<void>;
}
