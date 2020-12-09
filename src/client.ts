import { MapState } from "./mapstate";
import MemRow from './memRow';
import { IterableWeakSet } from './iterableWeakSet';

export default abstract class MVClient {
    ptrSize?: number;
    protected _memrefs: IterableWeakSet<MemRow>;

    protected constructor() {
        this._memrefs = new IterableWeakSet<MemRow>();
    }

    protected abstract _internal_memread($startAddr, $endAddr): Promise<MemRow>;

    abstract getMaps(): Promise<MapState>;

    abstract getPtrSize(): Promise<number>;
    
    async memr($startAddr, $endAddr): Promise<MemRow> {
        let res = await this._internal_memread($startAddr, $endAddr);
        this._memrefs.addRef(res);
        return res;
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