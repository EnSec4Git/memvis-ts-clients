import { PtrArray } from './ptrTypes';
import MVClient from './client';
import { MapState } from './mapstate';
import MemRow from './memRow';
;
class ReadPromise {
    constructor(requestSize) {
        this.requestSize = requestSize;
    }
    init() {
        this.promise = new Promise((res, rej) => {
            this.resolve = res;
            this.reject = rej;
        });
    }
}
class StreamPromiseReader {
    constructor(socket) {
        this.socket = socket;
        this.errorHandler = (err) => {
            for (let prom of this.waitingPromises) {
                prom.reject(new Error('Error: ' + err.toString()));
            }
        };
        this.endHandler = () => {
            for (let prom of this.waitingPromises) {
                prom.reject(new Error('Other side hung up'));
            }
        };
        this.dataHandler = (data) => {
            this.leftoverBuffer = Buffer.concat([this.leftoverBuffer, data]);
            this.drain();
        };
        this.leftoverBuffer = Buffer.from([]);
        this.waitingPromises = [];
        this.socket.removeAllListeners();
        this.socket.on('error', this.errorHandler);
        this.socket.on('end', this.endHandler);
        this.socket.on('data', this.dataHandler);
    }
    drain() {
        let TBC = this.waitingPromises[0];
        // console.log('Draining', this.leftoverBuffer.length)
        while (TBC && TBC.requestSize <= this.leftoverBuffer.length) {
            // console.log(Object.assign({}, TBC, {socket: undefined}))
            // console.log(TBC.requestSize)
            TBC.resolve(this.leftoverBuffer.slice(0, TBC.requestSize));
            let reqSize = TBC.requestSize;
            this.waitingPromises.shift();
            TBC = this.waitingPromises[0];
            // console.log('New TBC: ', Object.assign({}, TBC, {socket: undefined}))
            this.leftoverBuffer = this.leftoverBuffer.slice(reqSize);
            // console.log('Leftover: ', this.leftoverBuffer.length)
        }
    }
    detach() {
        this.socket.removeListener('error', this.errorHandler);
        this.socket.removeListener('end', this.endHandler);
        this.socket.removeListener('data', this.dataHandler);
    }
    async readNb(n) {
        let prom = new ReadPromise(n);
        prom.init();
        this.waitingPromises.push(prom);
        this.drain();
        return prom.promise;
    }
}
export default class TCPMVClient extends MVClient {
    constructor($host, $port, $socketConstructor) {
        super();
        this.host = $host;
        this.port = $port;
        this._client = new $socketConstructor();
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
                if (_szs.length !== 1) {
                    rej(new Error('Expected a single byte as answer to pointer size query!'));
                }
                [this.ptrSize] = _szs;
                this._PAC = PtrArray(this.ptrSize);
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
        let res = MapState.fromRawMaps(rawMaps, this.ptrSize);
        this._notify_maps_listeners(res);
        return res;
    }
    async _internal_memread($startAddr, $endAddr) {
        this._client.removeAllListeners();
        const reader = new StreamPromiseReader(this._client);
        const encoder = new TextEncoder();
        const startAddrArray = this._PAC.bytesFromPointer($startAddr);
        const endAddrArray = this._PAC.bytesFromPointer($endAddr);
        const command = Buffer.concat([Buffer.from(encoder.encode('MEMR')), Buffer.from(startAddrArray), Buffer.from(endAddrArray)]);
        try {
            this._client.write(command);
            const pref = await reader.readNb(6);
            if (pref.toString() == 'ERROR:') {
                let errDescr = (await reader.readNb(16)).toString();
                console.log('Error:', errDescr);
                throw new Error(errDescr);
            }
            else {
                let resData = await reader.readNb(Number($endAddr - $startAddr));
                reader.detach();
                return new MemRow($startAddr, $endAddr, resData);
            }
        }
        catch (err) {
            console.log(err);
            throw new Error('Could not read response preamble');
        }
    }
    async startElectronServer($ipcMain) {
        if (!this.ptrSize) {
            await this.getPtrSize();
        }
        $ipcMain.on('get-maps', async (evt) => {
            const rawMaps = await this.getRawMaps();
            evt.reply('maps', rawMaps);
        });
        $ipcMain.on('get-ptrsize', (evt) => {
            evt.reply('ptrsize', this.ptrSize);
        });
    }
}
