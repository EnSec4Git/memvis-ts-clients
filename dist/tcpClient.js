"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = require("net");
const assert_1 = __importDefault(require("assert"));
const ptrTypes_1 = require("./ptrTypes");
const client_1 = __importDefault(require("./client"));
const mapstate_1 = require("./mapstate");
class TCPMVClient extends client_1.default {
    constructor($host, $port) {
        super();
        this.host = $host;
        this.port = $port;
        this._client = new net_1.Socket();
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
}
exports.default = TCPMVClient;
