import mutexify from "mutexify/promise";
import MVClient from "./client";
import { MapState } from "./mapstate";
import MemRow from "./memRow";
export default class ElectronMVClient extends MVClient {
    constructor($ipcRenderer) {
        super();
        this.PAGE_SIZE = 256n;
        this.renderer = $ipcRenderer;
        this._lock = mutexify();
    }
    async getPtrSize() {
        if (this.ptrSize) {
            return new Promise((res, rej) => res(this.ptrSize));
        }
        const releaseLock = await this._lock();
        return new Promise((res, _) => {
            this.renderer.once("ptrsize", (_, ptrSize) => { this.ptrSize = ptrSize; releaseLock(); return res(this.ptrSize); });
            this.renderer.send("get-ptrsize");
        });
    }
    async getMaps() {
        const releaseLock = await this._lock();
        return new Promise((res, _) => {
            this.renderer.once("maps", (_, rawMaps) => {
                let result = MapState.fromRawMaps(rawMaps, this.ptrSize);
                this._notify_maps_listeners(result);
                releaseLock();
                return res(result);
            });
            this.renderer.send("get-maps");
        });
    }
    async _internal_memread($startAddr, $endAddr) {
        const releaseLock = await this._lock();
        return new Promise((res, _) => {
            this.renderer.once("mem", (_, row) => {
                releaseLock();
                res(new MemRow($startAddr, $endAddr, row));
            });
            this.renderer.send("get-mem", [$startAddr, $endAddr]);
        });
        // throw new Error('Not implemented');
    }
}
