"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MVClient {
    async memr($startAddr, $endAddr) {
        let res = await this._internal_memread($startAddr, $endAddr);
        this._memrefs.addRef(res);
        return res;
    }
    refresh() {
        let promises = [];
        this._memrefs.forEachRef((x) => {
            promises.push((async () => {
                x.fromOther(await this._internal_memread(x.startAddr, x.endAddr));
            })());
        });
        return Promise.all(promises).then((x) => undefined);
    }
}
exports.default = MVClient;
;
