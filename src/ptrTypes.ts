type _PtrArrayTypes = Uint8Array | Uint16Array | Uint32Array | BigUint64Array;

export type PtrArrayTypes = _PtrArrayTypes & { 
  readOneFromBuffer: (x: Buffer, o: number) => PtrValType;
  writeOneToBuffer: (x: Buffer, o: number, v: PtrValType) => void;
  bytesFromPointer: (x: PtrValType) => Uint8Array;
};

export type PtrValType = number | bigint;

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

export function PtrArray(byteSize: number): PtrArrayTypes {
  let res;
  let r1f: (x: Buffer, o: number) => PtrValType;
  let w1t: (x: Buffer, o: number, v: PtrValType) => void;
  let t8a: (x: PtrValType) => Uint8Array;
  switch (byteSize) {
    case 2:
      res = Uint16Array;
      t8a = (x) => {
        let vals = [0, 1].map(y => mod2y(BigInt(x), y))
        return Uint8Array.from(vals)
      }
      r1f = ((x, o) => x.readUInt16LE(o));
      w1t = ((x, o, v) => x.writeUInt16LE(Number(v), o));
      break;
    case 4:
      res = Uint32Array;
      t8a = (x) => {
        let vals = [0, 1, 2, 3].map(y => mod2y(BigInt(x), y))
        return Uint8Array.from(vals)
      }
      r1f = ((x, o) => x.readUInt32LE(o));
      w1t = ((x, o, v) => x.writeUInt32LE(Number(v), o));
      break;
    case 8:
      res = BigUint64Array;
      t8a = (x) => {
        let vals = [0, 1, 2, 3, 4, 5, 6, 7].map(y => mod2y(BigInt(x), y))
        return Uint8Array.from(vals)
      }
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
