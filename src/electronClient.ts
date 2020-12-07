import { IpcRenderer } from "electron";
import MVClient from "./client";
import { MapState } from "./mapstate";
import MemRow from "./memRow";

export type MapsEventListener = (x: MapState) => any;

export default class ElectronMVClient extends MVClient {
    private renderer: IpcRenderer;
    private eventListeners: MapsEventListener[] = [];
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
                for(let el of this.eventListeners) {
                    el(result);
                }
                return res(result);
            });
            this.renderer.send("get-maps");
        });
    }

    async _internal_memread($startAddr, $endAddr): Promise<MemRow> {
        throw new Error('Not implemented');
    }

    addMapsEventListener($listener: MapsEventListener) {
        this.eventListeners.push($listener);
    }

    removeMapsEventListener($listener: MapsEventListener) {
        let i=0;
        for(let el of this.eventListeners) {
            if(el == $listener) {
                this.eventListeners.splice(i);
                return;
            }
            i++;
        }
    }
}