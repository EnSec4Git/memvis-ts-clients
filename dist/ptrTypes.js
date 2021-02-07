const Do2 = [
    1n,
    256n,
    65536n,
    16777216n,
    4294967296n,
    1099511627776n,
    281474976710656n,
    72057594037927936n // 2 ^ 56
];
const Do2n = Do2.map(x => Number(x));
function mod2y(x, y) {
    return Number((x / Do2[y]) % 256n);
}
export function PtrArray(byteSize) {
    let res;
    let r1f;
    let w1t;
    let t8a;
    switch (byteSize) {
        case 2:
            res = Uint16Array;
            t8a = (x) => {
                let vals = [0, 1].map(y => mod2y(BigInt(x), y));
                return Uint8Array.from(vals);
            };
            r1f = ((x, o) => x.readUInt16LE(o));
            w1t = ((x, o, v) => x.writeUInt16LE(Number(v), o));
            break;
        case 4:
            res = Uint32Array;
            t8a = (x) => {
                let vals = [0, 1, 2, 3].map(y => mod2y(BigInt(x), y));
                return Uint8Array.from(vals);
            };
            r1f = ((x, o) => x.readUInt32LE(o));
            w1t = ((x, o, v) => x.writeUInt32LE(Number(v), o));
            break;
        case 8:
            res = BigUint64Array;
            t8a = (x) => {
                let vals = [0, 1, 2, 3, 4, 5, 6, 7].map(y => mod2y(BigInt(x), y));
                return Uint8Array.from(vals);
            };
            r1f = ((x, o) => x.readBigUInt64LE(o));
            w1t = ((x, o, v) => x.writeBigUInt64LE(BigInt(v), o));
            break;
        default:
            throw new Error(`Unknown pointer size: ${this.ptrSize}`);
    }
    res.readOneFromBuffer = r1f;
    res.writeOneToBuffer = w1t;
    res.bytesFromPointer = t8a;
    return res;
}
