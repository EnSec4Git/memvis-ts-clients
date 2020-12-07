import { MapState } from "./mapstate";
import MemRow from './memRow';
import { IterableWeakSet } from './iterableWeakSet';

export default abstract class MVClient {
    abstract getMaps(): Promise<MapState>;
    abstract getPtrSize(): Promise<number>;
    async memr($startAddr, $endAddr): Promise<MemRow> {
        let res = await this._internal_memread($startAddr, $endAddr);
        this._memrefs.addRef(res);
        return res;
    }
    protected abstract _internal_memread($startAddr, $endAddr): Promise<MemRow>;
    refresh(): Promise<void> {
        let promises = [];
        this._memrefs.forEachRef((x: MemRow) => {
            promises.push((async () => {
                x.fromOther(await this._internal_memread(x.startAddr, x.endAddr));
            })());
        });
        return Promise.all(promises).then((x) => undefined);
    }
    ptrSize?: number;
    protected _memrefs: IterableWeakSet<MemRow>;
};