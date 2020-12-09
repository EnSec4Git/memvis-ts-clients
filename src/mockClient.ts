import MVClient from "./client";
import { MapRow, MapState } from "./mapstate";
import MemRow from "./memRow";

export default class MockMVClient extends MVClient {
    constructor() {
        super();
    }
    async getPtrSize() {
        return 32;
    }
    async getMaps() {
        let res = new MapState(32);
        res.maps = [new MapRow(MapRow.FREE, 0n, 256n, 32), new MapRow(MapRow.USED, 256n, 65536n, 32)];
        res.freeCount = 1;
        res.usedLogSum = Math.log2(Math.max(1024, Number(65536n - 256n)));
        return res;
    }
    async _internal_memread($startAddr: bigint, $endAddr: bigint): Promise<MemRow> {
        let res = new MemRow($startAddr, $endAddr);
        let len = Number($endAddr - $startAddr);
        if (len > 8096) {
            throw new Error('It\'s a bad idea to request this big of a row');
        }
        res.data = new Uint8Array(len);
        for (let $i = $startAddr, $j=0; $i < $endAddr; $i++, $j++) {
            res.data[$j] = Number($i % 256n)
        }
        return res;
    }
}