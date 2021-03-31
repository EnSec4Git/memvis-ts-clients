import { MapState } from "./mapstate";
import MemRow from './memRow';
import { IterableWeakSet } from './iterableWeakSet';
interface PageCache {
    set(key: string, value: MemRow): any;
    get(key: string): MemRow | null;
}
export declare type MapsEventListener = (x: MapState) => any;
export default abstract class MVClient {
    ptrSize?: number;
    PAGE_SIZE: bigint;
    protected _memrefs: IterableWeakSet<MemRow>;
    protected _pageCache: PageCache;
    protected eventListeners: MapsEventListener[];
    protected constructor();
    protected abstract _internal_memread($startAddr: bigint, $endAddr: bigint): Promise<MemRow>;
    protected _notify_maps_listeners(result: MapState): void;
    abstract getMaps(): Promise<MapState>;
    abstract getPtrSize(): Promise<number>;
    roundToPageNumbers($startAddr: bigint, $endAddr: bigint): bigint[];
    memr($startAddr: bigint, $endAddr: bigint, $trackUsage?: boolean): Promise<MemRow>;
    addMapsEventListener($listener: MapsEventListener): void;
    removeMapsEventListener($listener: MapsEventListener): void;
    refresh(): Promise<void>;
}
export {};
