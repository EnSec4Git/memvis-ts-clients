/// <reference types="node" />
import { PtrArrayTypes } from './ptrTypes';
import { Socket } from 'net';
import MVClient from './client';
import { MapState, RawMaps } from './mapstate';
import { IpcMain } from 'electron';
import MemRow from './memRow';
export interface TCPMVClientInterface extends MVClient {
    host: string;
    port: number;
    ptrSize?: number;
    _PAC?: PtrArrayTypes;
    getPtrSize(): Promise<number>;
    getRawMaps(): Promise<RawMaps>;
    getMaps(): Promise<MapState>;
    startElectronServer($ipcMain: IpcMain): Promise<any>;
}
export default class TCPMVClient extends MVClient {
    private _client;
    host: string;
    port: number;
    ptrSize?: number;
    _PAC?: PtrArrayTypes;
    constructor($host: string, $port: number, $socketConstructor: typeof Socket);
    _connect(): Promise<unknown>;
    _close(): void;
    getPtrSize(): Promise<number>;
    getRawMaps(): Promise<RawMaps>;
    getMaps(): Promise<MapState>;
    _internal_memread($startAddr: bigint, $endAddr: bigint): Promise<MemRow>;
    startElectronServer($ipcMain: IpcMain): Promise<void>;
}
