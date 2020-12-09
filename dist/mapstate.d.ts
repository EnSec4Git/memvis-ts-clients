import { PtrArrayTypes } from "./ptrTypes";
export declare class MapRow {
    static FREE: 'FREE';
    static USED: 'USED';
    start: bigint;
    end: bigint;
    private ptrSize;
    type: 'FREE' | 'USED';
    constructor($type: 'FREE' | 'USED', $start: bigint, $end: bigint, $ptrSize: number);
    hexStart(): string;
    hexEnd(): string;
}
export declare type RawMaps = [PtrArrayTypes, PtrArrayTypes][];
export declare class MapState {
    readonly ptrSize: number;
    freeCount: number;
    usedLogSum: number;
    maps: MapRow[];
    constructor($ptrSize: number);
    static fromRawMaps(rawMaps: RawMaps, ptrSize: number): MapState;
}
