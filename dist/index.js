"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MVClient = void 0;
const mapstate_1 = require("./mapstate");
const client_1 = __importDefault(require("./client"));
exports.MVClient = client_1.default;
const mockClient_1 = __importDefault(require("./mockClient"));
const tcpClient_1 = __importDefault(require("./tcpClient"));
exports.default = {
    MapState: mapstate_1.MapState,
    MapRow: mapstate_1.MapRow,
    MockMVClient: mockClient_1.default,
    TCPMVClient: tcpClient_1.default
};
