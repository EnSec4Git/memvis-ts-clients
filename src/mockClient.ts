import MVClient from "./client";
import { MapRow, MapState } from "./mapstate";
import MemRow from "./memRow";
import { PtrArray, PtrArrayTypes } from "./ptrTypes";

export default class MockMVClient extends MVClient {
    _PAC?: PtrArrayTypes;
    constructor() {
        super();
        this.ptrSize = 32 / 8; // Size in BYTES
        this._PAC = PtrArray(this.ptrSize)
    }
    async getPtrSize() {
        return this.ptrSize;
    }
    async getMaps() {
        let res = new MapState(this.ptrSize);
        res.maps = [
            new MapRow(MapRow.FREE, 0n, 4096n, this.ptrSize),
            new MapRow(MapRow.USED, 4096n, 65536n, this.ptrSize),
            new MapRow(MapRow.FREE, 65536n, res.MAX_PTR, this.ptrSize)
        ];
        res.freeCount = 2;
        res.usedLogSum = Math.log2(Math.max(1024, Number(65536n - 4096n)));
        res.freeMaxLog = Math.log2(Number(res.MAX_PTR - 65536n));
        this._notify_maps_listeners(res);
        return res;
    }
    async _internal_memread($startAddr: bigint, $endAddr: bigint): Promise<MemRow> {
        let res = new MemRow($startAddr, $endAddr);
        let len = Number($endAddr - $startAddr);
        if (len > this.PAGE_SIZE) {
            throw new Error('It\'s a bad idea to request this big of a row');
        }
        res.dataSlices = [new Uint8Array(len)];
        for (let $i = $startAddr, $j = 0; $i < $endAddr; $i++, $j++) {
            res.dataSlices[0][$j] = Number($i % 256n);
        }
        return res;
    }
}