import { IpcRenderer } from "electron";
import MVClient from "./client";
import { MapState } from "./mapstate";
import MemRow from "./memRow";
export declare type MapsEventListener = (x: MapState) => any;
export default class ElectronMVClient extends MVClient {
    private renderer;
    private eventListeners;
    ptrSize?: number;
    constructor($ipcRenderer: IpcRenderer);
    getPtrSize(): Promise<number>;
    getMaps(): Promise<MapState>;
    _internal_memread($startAddr: any, $endAddr: any): Promise<MemRow>;
    addMapsEventListener($listener: MapsEventListener): void;
    removeMapsEventListener($listener: MapsEventListener): void;
}
