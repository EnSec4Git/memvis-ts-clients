var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "./mapstate", "./client", "./mockClient", "./tcpClient", "./memRow"], function (require, exports, mapstate_1, client_1, mockClient_1, tcpClient_1, memRow_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MemRow = exports.MapState = exports.MapRow = exports.MockMVClient = exports.MVClient = void 0;
    client_1 = __importDefault(client_1);
    mockClient_1 = __importDefault(mockClient_1);
    tcpClient_1 = __importDefault(tcpClient_1);
    memRow_1 = __importDefault(memRow_1);
    Object.defineProperty(exports, "MapState", { enumerable: true, get: function () { return mapstate_1.MapState; } });
    Object.defineProperty(exports, "MapRow", { enumerable: true, get: function () { return mapstate_1.MapRow; } });
    exports.MVClient = client_1.default;
    exports.MockMVClient = mockClient_1.default;
    exports.MemRow = memRow_1.default;
    // let DEFAULT_EXPORT = {
    //     MapState,
    //     MapRow,
    //     MemRow,
    //     MockMVClient,
    //     TCPMVClient: tcpClientClass
    // };
    // export default DEFAULT_EXPORT;
    exports.default = {
        //client as MVClient,
        //RawMaps,
        //TCPMVClientPromise: tcpClientClass(useTcp),
        TCPMVClient: tcpClient_1.default,
        MockMVClient: mockClient_1.default,
        MapRow: mapstate_1.MapRow,
        MapState: mapstate_1.MapState
    };
});
