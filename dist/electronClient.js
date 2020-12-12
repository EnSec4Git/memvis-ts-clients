"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("./client"));
const mapstate_1 = require("./mapstate");
class ElectronMVClient extends client_1.default {
    constructor($ipcRenderer) {
        super();
        this.renderer = $ipcRenderer;
    }
    getPtrSize() {
        return new Promise((res, _) => {
            this.renderer.once("ptrsize", (_, ptrSize) => { this.ptrSize = ptrSize; return res(this.ptrSize); });
            this.renderer.send("get-ptrsize");
        });
    }
    getMaps() {
        return new Promise((res, _) => {
            this.renderer.once("maps", (_, rawMaps) => {
                let result = mapstate_1.MapState.fromRawMaps(rawMaps, this.ptrSize);
                this._notify_maps_listeners(result);
                return res(result);
            });
            this.renderer.send("get-maps");
        });
    }
    async _internal_memread($startAddr, $endAddr) {
        throw new Error('Not implemented');
    }
}
exports.default = ElectronMVClient;
