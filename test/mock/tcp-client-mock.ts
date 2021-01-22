import { MockMVClient, TCPMVClient } from "../../src";

class FakeSocket {}

export class MockTCPMVClient extends TCPMVClient {
    private mockClient: MockMVClient
    constructor() {
        super('localhost', 2160, FakeSocket as any)
        this.mockClient = new MockMVClient()
    }

    getPtrSize() {
        return this.mockClient.getPtrSize();
    }

    getMaps() {
        return this.mockClient.getMaps();
    }

    _internal_memread($startAddr: bigint, $endAddr: bigint) {
        return this.mockClient._internal_memread($startAddr, $endAddr);
    }
}