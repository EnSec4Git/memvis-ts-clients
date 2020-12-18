import assert from 'assert';
import { PtrArray, PtrArrayTypes } from './ptrTypes';
import { Socket } from 'net';
import MVClient from './client';
import { MapState, RawMaps } from './mapstate';
import { IpcMain } from 'electron';
import MemRow from './memRow';

// export type MODULE_SIG = {
//     TCPMVClient: TCPMVClient;
// }

export interface TCPMVClientInterface extends MVClient {
    host: string;
    port: number;
    ptrSize?: number;
    _PAC?: PtrArrayTypes;
    getPtrSize(): Promise<number>;
    getRawMaps(): Promise<RawMaps>;
    getMaps(): Promise<MapState>;
    startElectronServer($ipcMain: IpcMain): Promise<any>;
};
export default (async ($confirm: boolean) => {
    // type MODULE_SIG = {
    //     TCPMVClient: TCPMVClient;
    // }
    if($confirm) {
        let SocketImpl = (await import('net')).Socket;
        return class TCPMVClient extends MVClient {
            private _client: Socket;
            host: string;
            port: number;
            ptrSize?: number;
            _PAC?: PtrArrayTypes;
    
            constructor($host: string, $port: number) {
                super();
                this.host = $host;
                this.port = $port;
                this._client = new SocketImpl();
                this.ptrSize = undefined;
                this._PAC = undefined;
            }
    
            _connect() {
                return new Promise((res, rej) => {
                    this._client.on('error', rej);
                    // this._client.on('data', res);
                    this._client.connect(this.port, this.host, () => {
                        res(true);
                        // console.log(this._client.read());
                    });
                });
            }
    
            _close() {
                this._client.destroy();
            }
    
            getPtrSize(): Promise<number> {
                return new Promise((res, rej) => {
                    this._client.on('error', rej);
                    this._client.on('data', (data) => {
                        const _szs = Uint8Array.from(data);
                        try {
                            assert(_szs.length === 1);
                        } catch (err) {
                            rej(err);
                        }
                        [this.ptrSize] = _szs;
                        this._PAC = PtrArray(this.ptrSize);
                        res(this.ptrSize);
                    });
                    this._client.write('PTRS');
                });
            }
    
            getRawMaps(): Promise<RawMaps> {
                return new Promise((res, rej) => {
                    this._client.removeAllListeners();
                    this._client.on('error', rej);
                    this._client.on('data', (data) => {
                        const resp = data.slice(0, 6);
                        if (resp.toString() === 'RESULT') {
                            const mapNr = Number(this._PAC.readOneFromBuffer(data, 6));
                            const result = [];
                            for (let i = 0; i < 2 * mapNr; i += 1) {
                                const elemI = this._PAC.readOneFromBuffer(data, 6 + (i + 1) * this.ptrSize);
                                i += 1;
                                const elemJ = this._PAC.readOneFromBuffer(data, 6 + (i + 1) * this.ptrSize);
                                result.push([elemI, elemJ]);
                            }
                            return res(result);
                        } if (resp.toString() === 'ERROR:') {
                            return rej(new Error(data.slice(6).toString()));
                        }
                        return rej(new Error('Unknown server response!'));
                    });
                    this._client.write('MAPS');
                });
            }
    
            async getMaps(): Promise<MapState> {
                let rawMaps = await this.getRawMaps();
                let res = MapState.fromRawMaps(rawMaps, this.ptrSize);
                this._notify_maps_listeners(res);
                return res;
            }
    
            async _internal_memread($startAddr: bigint, $endAddr: bigint): Promise<MemRow> {
                throw new Error('Not implemented');
            }
    
            async startElectronServer($ipcMain: IpcMain) {
                if (!this.ptrSize) { await this.getPtrSize(); }
                $ipcMain.on('get-maps', async (evt) => {
                    const rawMaps = await this.getRawMaps();
                    //console.log('MAPS: ', rawMaps);
                    evt.reply('maps', rawMaps);
                });
                $ipcMain.on('get-ptrsize', (evt) => {
                    evt.reply('ptrsize', this.ptrSize);
                });
            }
        }
    } else {
        return class MockTCPMVClient {}
    }

    
    // let DEF_EXPORT;

    // if (process && process.env) {
    //     DEF_EXPORT = TCPMVClient;
    // } else {
    //     DEF_EXPORT = null as TCPMVClient;
    // }
    // return {
    //     default: DEF_EXPORT,
    //     MODU
    //     TCPMVClient
    // };
});


// export default DEF_EXPORT;
