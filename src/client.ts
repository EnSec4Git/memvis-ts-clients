import { MapState } from "./mapstate";
import MemRow from './memRow';
import { IterableWeakSet } from './iterableWeakSet';

export type MapsEventListener = (x: MapState) => any;

export default abstract class MVClient {
    ptrSize?: number;
    protected _memrefs: IterableWeakSet<MemRow>;
    protected eventListeners: MapsEventListener[] = [];

    protected constructor() {
        this._memrefs = new IterableWeakSet<MemRow>();
    }

    protected abstract _internal_memread($startAddr: bigint, $endAddr: bigint): Promise<MemRow>;

    protected _notify_maps_listeners(result: MapState) {
        for(let el of this.eventListeners) {
            el(result);
        }
    }

    abstract getMaps(): Promise<MapState>;

    abstract getPtrSize(): Promise<number>;
    
    async memr($startAddr: bigint, $endAddr: bigint): Promise<MemRow> {
        let res = await this._internal_memread($startAddr, $endAddr);
        this._memrefs.addRef(res);
        return res;
    }

    addMapsEventListener($listener: MapsEventListener) {
        this.eventListeners.push($listener);
    }

    removeMapsEventListener($listener: MapsEventListener) {
        let i=0;
        for(let el of this.eventListeners) {
            if(el == $listener) {
                this.eventListeners.splice(i);
                return;
            }
            i++;
        }
    }

    refresh(): Promise<void> {
        let promises = [];
        this._memrefs.forEachRef((x: MemRow) => {
            promises.push((async () => {
                x.fromOther(await this._internal_memread(x.startAddr, x.endAddr));
            })());
        });
        return Promise.all(promises).then((x) => undefined);
    }
};