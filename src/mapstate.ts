import { PtrArrayTypes } from "./ptrTypes";

export class MapRow {
    static FREE: 'FREE' = 'FREE';
    static USED: 'USED' = 'USED';
    start: bigint;
    end: bigint;
    private ptrSize: number;
    type: 'FREE' | 'USED';

    constructor($type: 'FREE' | 'USED', $start: bigint, $end: bigint, $ptrSize: number) {
        this.type = $type;
        this.start = $start;
        this.end = $end;
        this.ptrSize = $ptrSize;
    }

    hexStart(): string {
        return "0x" + this.start.toString(16).padStart(2 * this.ptrSize, "0");
    }

    hexEnd() {
        return "0x" + this.end.toString(16).padStart(2 * this.ptrSize, "0");
    }
}

export type RawMaps = [PtrArrayTypes, PtrArrayTypes][];

export class MapState {
    readonly ptrSize: number;
    freeCount: number;
    usedLogSum: number;
    freeMaxLog: number;
    maps: MapRow[];
    MAX_PTR: bigint;

    constructor($ptrSize: number) {
        this.ptrSize = $ptrSize;
        this.MAX_PTR = pown(2n, 8 * $ptrSize);
    }

    static fromRawMaps(rawMaps: RawMaps, ptrSize: number) {
        if (rawMaps.length == 0) {
            let emptyState = new MapState(ptrSize);
            emptyState.freeCount = 1;
            emptyState.usedLogSum = 0;
            emptyState.maps = [new MapRow(MapRow.FREE, 0n, pown(2n, 8*ptrSize), ptrSize)];
            return emptyState;
        }
        let res = [];
        let first = new MapRow(MapRow.FREE, BigInt(0), BigInt(rawMaps[0][0]), ptrSize);
        let freeCount = 0,
            usedSum = 0,
            freeMaxLog = Math.max(0, Math.log2(Number(rawMaps[0][1])));
        res.push(first);
        freeCount += 1;
        for (let i = 0; i < rawMaps.length; i += 1) {
            let premap = rawMaps[i];
            let start = BigInt(premap[0]);
            let end = BigInt(premap[1]);
            res.push(new MapRow(MapRow.USED, start, end, ptrSize));
            usedSum += Math.log2(Math.max(1024, Number(end - start)));
            let endAddr =
                i == rawMaps.length - 1 ? pown(2n, 8 * ptrSize) : BigInt(rawMaps[i + 1][0]);
            if (end == endAddr && i != rawMaps.length - 1) continue;
            freeCount += 1;
            res.push(new MapRow(MapRow.FREE, end, endAddr, ptrSize));
            freeMaxLog = Math.max(freeMaxLog, Math.log2(Number(endAddr - end)));
        }
        let result = new MapState(ptrSize);
        result.freeCount = freeCount;
        result.usedLogSum = usedSum;
        result.freeMaxLog = freeMaxLog;
        result.maps = res;
        return result;
    }
}

function pown(a: bigint, b: number): bigint {
    let x: bigint;
    if (b == 0) {
        return 1n;
    } else if (b == 1) {
        return a;
    }
    if (b % 2 == 1) {
        x = pown(a, (b - 1) / 2);
        return (x * x * a);
    } else {
        x = pown(a, b / 2);
        return x * x;
    }
}

