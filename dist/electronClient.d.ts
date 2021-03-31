import { IpcRenderer } from "electron";
import MVClient from "./client";
import { MapState } from "./mapstate";
import MemRow from "./memRow";
export default class ElectronMVClient extends MVClient {
    private renderer;
    private _lock;
    ptrSize?: number;
    constructor($ipcRenderer: IpcRenderer);
    getPtrSize(): Promise<number>;
    getMaps(): Promise<MapState>;
    protected _internal_memread($startAddr: bigint, $endAddr: bigint): Promise<MemRow>;
}
