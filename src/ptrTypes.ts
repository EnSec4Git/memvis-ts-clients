type _PtrArrayTypes = Uint8Array | Uint16Array | Uint32Array | BigUint64Array;

export type PtrArrayTypes = _PtrArrayTypes & { readOneFromBuffer: (x: any, o: any) => _PtrArrayTypes };

const Do2 = [
  1n,
  256n, // 2 ^ 8
  65536n,
  16777216n,
  4294967296n, // 2 ^ 32
  1099511627776n,
  281474976710656n,
  72057594037927936n // 2 ^ 56
]

const Do2n = Do2.map(x => Number(x))

function mod2y(x: bigint, y: number) {
  return Number((x / Do2[y]) % 256n)
}

export function PtrArray(n: number): PtrArrayTypes {
  let res //: _PtrArrayTypes;
  let r1f: (x: Buffer, o: number) => number | bigint;
  let t8a;
  switch (n) {
    case 2:
      res = Uint16Array;
      r1f = ((x: Buffer, o: number) => x.readUInt16LE(o));
      // t8a = ((x: Uint16Array) => )
      break;
    case 4:
      res = Uint32Array;
      r1f = ((x: Buffer, o: number) => x.readUInt32LE(o));
      break;
    case 8:
      res = BigUint64Array;
      t8a = ((x: bigint): Uint8Array => {
        let vals = [0, 1, 2, 3, 4, 5, 6, 7].map(y => mod2y(x, y))
        return Uint8Array.from(vals)
      })
      r1f = ((x: Buffer, o: number) => x.readBigUInt64LE(o));
      res.bytesFromPointer = t8a
      break;
    default:
      throw new Error(`Unknown pointer size: ${this.ptrSize}`);
  }
  res.readOneFromBuffer = r1f;
  return res;
}
