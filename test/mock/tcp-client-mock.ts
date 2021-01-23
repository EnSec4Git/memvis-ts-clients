import { MockMVClient, RawMaps, TCPMVClient } from "../../src";
import { PtrArray } from "../../src/ptrTypes";

class FakeSocket {}

export class MockTCPMVClient extends TCPMVClient {
    private mockClient: MockMVClient
    constructor() {
        super('localhost', 2160, FakeSocket as any)
        this.mockClient = new MockMVClient()
    }

    async getPtrSize() {
        let res = await this.mockClient.getPtrSize();
        this.ptrSize = res;
        this._PAC = PtrArray(res)
        return res;
    }

    getMaps() {
        return this.mockClient.getMaps();
    }

    async getRawMaps(): Promise<RawMaps> {
        return [
            [256 as any, 65536 as any]
        ]
    }

    _internal_memread($startAddr: bigint, $endAddr: bigint) {
        return this.mockClient._internal_memread($startAddr, $endAddr);
    }
}