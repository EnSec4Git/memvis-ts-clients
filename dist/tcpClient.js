var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "assert", "./ptrTypes", "./client", "./mapstate"], function (require, exports, assert_1, ptrTypes_1, client_1, mapstate_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    assert_1 = __importDefault(assert_1);
    client_1 = __importDefault(client_1);
    ;
    exports.default = (async () => {
        // type MODULE_SIG = {
        //     TCPMVClient: TCPMVClient;
        // }
        try {
            let SocketImpl = (await new Promise((resolve_1, reject_1) => { require(['net'], resolve_1, reject_1); }).then(__importStar)).Socket;
            return class TCPMVClient extends client_1.default {
                constructor($host, $port) {
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
                getPtrSize() {
                    return new Promise((res, rej) => {
                        this._client.on('error', rej);
                        this._client.on('data', (data) => {
                            const _szs = Uint8Array.from(data);
                            try {
                                assert_1.default(_szs.length === 1);
                            }
                            catch (err) {
                                rej(err);
                            }
                            [this.ptrSize] = _szs;
                            this._PAC = ptrTypes_1.PtrArray(this.ptrSize);
                            res(this.ptrSize);
                        });
                        this._client.write('PTRS');
                    });
                }
                getRawMaps() {
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
                            }
                            if (resp.toString() === 'ERROR:') {
                                return rej(new Error(data.slice(6).toString()));
                            }
                            return rej(new Error('Unknown server response!'));
                        });
                        this._client.write('MAPS');
                    });
                }
                async getMaps() {
                    let rawMaps = await this.getRawMaps();
                    let res = mapstate_1.MapState.fromRawMaps(rawMaps, this.ptrSize);
                    this._notify_maps_listeners(res);
                    return res;
                }
                async _internal_memread($startAddr, $endAddr) {
                    throw new Error('Not implemented');
                }
                async startElectronServer($ipcMain) {
                    if (!this.ptrSize) {
                        await this.getPtrSize();
                    }
                    $ipcMain.on('get-maps', async (evt) => {
                        const rawMaps = await this.getRawMaps();
                        //console.log('MAPS: ', rawMaps);
                        evt.reply('maps', rawMaps);
                    });
                    $ipcMain.on('get-ptrsize', (evt) => {
                        evt.reply('ptrsize', this.ptrSize);
                    });
                }
            };
        }
        catch (err) {
            return class TCPMVClient {
            };
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
});
// export default DEF_EXPORT;
