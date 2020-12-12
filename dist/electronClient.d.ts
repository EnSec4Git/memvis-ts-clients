import { IpcRenderer } from "electron";
import MVClient from "./client";
import { MapState } from "./mapstate";
import MemRow from "./memRow";
export default class ElectronMVClient extends MVClient {
    private renderer;
    ptrSize?: number;
    constructor($ipcRenderer: IpcRenderer);
    getPtrSize(): Promise<number>;
    getMaps(): Promise<MapState>;
    _internal_memread($startAddr: bigint, $endAddr: bigint): Promise<MemRow>;
}
