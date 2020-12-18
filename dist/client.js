define(["require", "exports", "./iterableWeakSet"], function (require, exports, iterableWeakSet_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MVClient {
        constructor() {
            this.eventListeners = [];
            this._memrefs = new iterableWeakSet_1.IterableWeakSet();
        }
        _notify_maps_listeners(result) {
            for (let el of this.eventListeners) {
                el(result);
            }
        }
        async memr($startAddr, $endAddr) {
            let res = await this._internal_memread($startAddr, $endAddr);
            this._memrefs.addRef(res);
            return res;
        }
        addMapsEventListener($listener) {
            this.eventListeners.push($listener);
        }
        removeMapsEventListener($listener) {
            let i = 0;
            for (let el of this.eventListeners) {
                if (el == $listener) {
                    this.eventListeners.splice(i);
                    return;
                }
                i++;
            }
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
});
