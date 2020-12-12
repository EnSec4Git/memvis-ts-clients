"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("./client"));
const mapstate_1 = require("./mapstate");
const memRow_1 = __importDefault(require("./memRow"));
class MockMVClient extends client_1.default {
    constructor() {
        super();
    }
    async getPtrSize() {
        return 32;
    }
    async getMaps() {
        let res = new mapstate_1.MapState(32);
        res.maps = [new mapstate_1.MapRow(mapstate_1.MapRow.FREE, 0n, 256n, 32), new mapstate_1.MapRow(mapstate_1.MapRow.USED, 256n, 65536n, 32)];
        res.freeCount = 1;
        res.usedLogSum = Math.log2(Math.max(1024, Number(65536n - 256n)));
        this._notify_maps_listeners(res);
        return res;
    }
    async _internal_memread($startAddr, $endAddr) {
        let res = new memRow_1.default($startAddr, $endAddr);
        let len = Number($endAddr - $startAddr);
        if (len > 8096) {
            throw new Error('It\'s a bad idea to request this big of a row');
        }
        res.data = new Uint8Array(len);
        for (let $i = $startAddr, $j = 0; $i < $endAddr; $i++, $j++) {
            res.data[$j] = Number($i % 256n);
        }
        return res;
    }
}
exports.default = MockMVClient;
