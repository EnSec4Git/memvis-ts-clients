"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemRow = exports.MapState = exports.MapRow = exports.MockMVClient = exports.MVClient = void 0;
const mapstate_1 = require("./mapstate");
Object.defineProperty(exports, "MapState", { enumerable: true, get: function () { return mapstate_1.MapState; } });
Object.defineProperty(exports, "MapRow", { enumerable: true, get: function () { return mapstate_1.MapRow; } });
const client_1 = __importDefault(require("./client"));
exports.MVClient = client_1.default;
const mockClient_1 = __importDefault(require("./mockClient"));
exports.MockMVClient = mockClient_1.default;
// import TCPMVClient from './tcpClient';
const memRow_1 = __importDefault(require("./memRow"));
exports.MemRow = memRow_1.default;
let DEFAULT_EXPORT = {
    MapState: mapstate_1.MapState,
    MapRow: mapstate_1.MapRow,
    MemRow: memRow_1.default,
    MockMVClient: mockClient_1.default,
};
// if (typeof window === 'undefined') {
if (process && process.env) {
    //console.log(window, typeof(window));
    //console.log(window.document)
    let TCPMVClient = require('./tcpClient').default;
    Object.assign(exports, {
        TCPMVClient
    });
    Object.assign(DEFAULT_EXPORT, { TCPMVClient });
}
exports.default = DEFAULT_EXPORT;
