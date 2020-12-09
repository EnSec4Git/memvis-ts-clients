import { PtrArrayTypes } from './ptrTypes';
import MVClient from './client';
import { MapState, RawMaps } from './mapstate';
import { IpcMain } from 'electron';
import MemRow from './memRow';
export default class TCPMVClient extends MVClient {
    private _client;
    host: string;
    port: number;
    ptrSize?: number;
    _PAC?: PtrArrayTypes;
    constructor($host: string, $port: number);
    _connect(): Promise<unknown>;
    _close(): void;
    getPtrSize(): Promise<number>;
    getRawMaps(): Promise<RawMaps>;
    getMaps(): Promise<MapState>;
    _internal_memread($startAddr: any, $endAddr: any): Promise<MemRow>;
    startElectronServer($ipcMain: IpcMain): Promise<void>;
}
