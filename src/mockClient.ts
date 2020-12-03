import MVClient from "./client";
import { MapRow, MapState } from "./mapstate";

export class MockMVClient implements MVClient {
    constructor() {}
    async getMaps() {
        let res = new MapState(32);
        res.maps = [new MapRow(MapRow.FREE, 0n, 256n, 32), new MapRow(MapRow.USED, 256n, 65536n, 32)];
        res.freeCount = 1;
        res.usedLogSum = Math.log2(Math.max(1024, Number(65536n - 256n)));
        return res;
    }
}