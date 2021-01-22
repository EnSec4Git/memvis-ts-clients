import { IpcRenderer } from "electron";
import MVClient from "./client";
import { MapState } from "./mapstate";
import MemRow from "./memRow";



export default class ElectronMVClient extends MVClient {
    private renderer: IpcRenderer;
    
    ptrSize?: number;
    constructor($ipcRenderer: IpcRenderer) {
        super();
        this.renderer = $ipcRenderer;
    }

    getPtrSize(): Promise<number> {
        return new Promise((res, _) => {
            this.renderer.once(
                "ptrsize",
                (_, ptrSize) => { this.ptrSize = ptrSize; return res(this.ptrSize) }
            );
            this.renderer.send("get-ptrsize");
        });
    }

    getMaps(): Promise<MapState> {
        return new Promise((res, _) => {
            this.renderer.once("maps", (_, rawMaps) => {
                let result = MapState.fromRawMaps(rawMaps, this.ptrSize);
                this._notify_maps_listeners(result);
                return res(result);
            });
            this.renderer.send("get-maps");
        });
    }

    async _internal_memread($startAddr: bigint, $endAddr: bigint): Promise<MemRow> {
        return new Promise((res, _) => {
            this.renderer.once("mem", (_, row) => {
                res(new MemRow($startAddr, $endAddr, row))
            })
            this.renderer.send("get-mem", [$startAddr, $endAddr])
        })
        // throw new Error('Not implemented');
    }

    
}