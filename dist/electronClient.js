import MVClient from "./client";
import { MapState } from "./mapstate";
export default class ElectronMVClient extends MVClient {
    constructor($ipcRenderer) {
        super();
        this.renderer = $ipcRenderer;
    }
    getPtrSize() {
        return new Promise((res, _) => {
            this.renderer.once("ptrsize", (_, ptrSize) => { this.ptrSize = ptrSize; return res(this.ptrSize); });
            this.renderer.send("get-ptrsize");
        });
    }
    getMaps() {
        return new Promise((res, _) => {
            this.renderer.once("maps", (_, rawMaps) => {
                let result = MapState.fromRawMaps(rawMaps, this.ptrSize);
                this._notify_maps_listeners(result);
                return res(result);
            });
            this.renderer.send("get-maps");
        });
    }
    async _internal_memread($startAddr, $endAddr) {
        throw new Error('Not implemented');
    }
}
