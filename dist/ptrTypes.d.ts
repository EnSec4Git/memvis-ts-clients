/// <reference types="node" />
declare type _PtrArrayTypes = Uint8Array | Uint16Array | Uint32Array | BigUint64Array;
export declare type PtrArrayTypes = _PtrArrayTypes & {
    readOneFromBuffer: (x: Buffer, o: number) => PtrValType;
    writeOneToBuffer: (x: Buffer, o: number, v: PtrValType) => void;
    bytesFromPointer: (x: PtrValType) => Uint8Array;
};
export declare type PtrValType = number | bigint;
export declare function PtrArray(byteSize: number): PtrArrayTypes;
export {};
