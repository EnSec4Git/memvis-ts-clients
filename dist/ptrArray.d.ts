declare type _PtrArrayTypes = Uint8Array | Uint16Array | Uint32Array | BigUint64Array;
export declare type PtrArrayTypes = _PtrArrayTypes & {
    readOneFromBuffer: (x: any, o: any) => _PtrArrayTypes;
};
export declare function PtrArray(n: any): PtrArrayTypes;
export {};
