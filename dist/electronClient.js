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
        this.eventListeners = [];
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
                for (let el of this.eventListeners) {
                    el(result);
                }
                return res(result);
            });
            this.renderer.send("get-maps");
        });
    }
    async _internal_memread($startAddr, $endAddr) {
        throw new Error('Not implemented');
    }
    addMapsEventListener($listener) {
        this.eventListeners.push($listener);
    }
    removeMapsEventListener($listener) {
        let i = 0;
        for (let el of this.eventListeners) {
            if (el == $listener) {
                this.eventListeners.splice(i);
                return;
            }
            i++;
        }
    }
}
exports.default = ElectronMVClient;
