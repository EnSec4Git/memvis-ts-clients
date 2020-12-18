/// <reference types="./node_modules/electron" />
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
declare const _default: ($confirm: boolean) => Promise<{
    new ($host: string, $port: number): {
        _client: Socket;
        host: string;
        port: number;
        ptrSize?: number;
        _PAC?: PtrArrayTypes;
        _connect(): Promise<unknown>;
        _close(): void;
        getPtrSize(): Promise<number>;
        getRawMaps(): Promise<RawMaps>;
        getMaps(): Promise<MapState>;
        _internal_memread($startAddr: bigint, $endAddr: bigint): Promise<MemRow>;
        startElectronServer($ipcMain: IpcMain): Promise<void>;
        _memrefs: import("./iterableWeakSet").IterableWeakSet<MemRow>;
        eventListeners: import("./client").MapsEventListener[];
        _notify_maps_listeners(result: MapState): void;
        memr($startAddr: bigint, $endAddr: bigint): Promise<MemRow>;
        addMapsEventListener($listener: import("./client").MapsEventListener): void;
        removeMapsEventListener($listener: import("./client").MapsEventListener): void;
        refresh(): Promise<void>;
    };
} | {
    new (): {};
}>;
export default _default;
