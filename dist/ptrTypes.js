define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PtrArray = void 0;
    function PtrArray(n) {
        let res; //: _PtrArrayTypes;
        let r1f;
        switch (n) {
            case 2:
                res = Uint16Array;
                r1f = ((x, o) => x.readUInt16LE(o));
                break;
            case 4:
                res = Uint32Array;
                r1f = ((x, o) => x.readUInt32LE(o));
                break;
            case 8:
                res = BigUint64Array;
                r1f = ((x, o) => x.readBigUInt64LE(o));
                break;
            default:
                throw new Error(`Unknown pointer size: ${this.ptrSize}`);
        }
        res.readOneFromBuffer = r1f;
        return res;
    }
    exports.PtrArray = PtrArray;
});
