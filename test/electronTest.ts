import { assert } from 'chai'
import { ipcMain, ipcRenderer } from './mock/electron-mock'
import { MockTCPMVClient } from './mock/tcp-client-mock';
import ElectronMVClient from '../src/electronClient';
import { getFirstNonemptyMap, performAndTimeSameSinglePageRequests, performRandomizedParallelRequests, performRequestsThatUpscaleToSamePageAndAssert, readFirstXOfFirstMapFromTwoClients } from './commons';

describe('Electron Server/Client', function() {
    this.timeout(5000);
    const mockTCPClient = new MockTCPMVClient();
    mockTCPClient.startElectronServer(ipcMain);
    const electronClient = new ElectronMVClient(ipcRenderer);

    it('Should support getPtrSize()', async () => {
        const bitsTcp = await mockTCPClient.getPtrSize();
        const bitsEl = await electronClient.getPtrSize();
        assert.strictEqual(bitsTcp, bitsEl);
    })
    
    it('Should support getMaps()', async () => {
        const mapsTcp = await mockTCPClient.getMaps();
        const mapsEl = await electronClient.getMaps();
        assert.deepStrictEqual(mapsEl, mapsTcp);
    })

    it('Should have a sane memr() implementation', async function () {
        const maps = await electronClient.getMaps();
        const REQ_SIZE = 13;
        const REQ_N_SIZE = BigInt(REQ_SIZE);
        const uMap = getFirstNonemptyMap(maps);
        const testRes = await mockTCPClient.memr(uMap.start, uMap.start + REQ_N_SIZE);
        const sampleRes = await electronClient.memr(uMap.start, uMap.start + REQ_N_SIZE);
        assert.strictEqual(testRes.dataSlices.length, 1);
        assert.strictEqual(testRes.dataSlices[0].length, REQ_SIZE);
        assert.deepStrictEqual(testRes, sampleRes);
    })

    it('Should return proper memr() values', async () => {
        const results = await readFirstXOfFirstMapFromTwoClients(150, electronClient, mockTCPClient);
        assert.deepStrictEqual(results[0], results[1]);
    })

    it('Should handle concurrent memr() requests', async () => {
        const localElClient = new ElectronMVClient(ipcRenderer);
        localElClient.PAGE_SIZE = BigInt(4096);
        await localElClient.getPtrSize();
        const results = await performRandomizedParallelRequests(100, localElClient, mockTCPClient);
        assert.deepStrictEqual(results[0], results[1]);
    });

    it('Should upscale requests to PAGE_SIZE before sending', async () => {
        const localElClient = new ElectronMVClient(ipcRenderer);
        localElClient.PAGE_SIZE = BigInt(4096);
        await localElClient.getPtrSize();
        const res = await performRequestsThatUpscaleToSamePageAndAssert(20, localElClient, mockTCPClient);
        for(let i=1; i<res.length; i++) {
            assert.deepStrictEqual(res[0], res[i]);
        }
    })

    it('Should cache requests responses for faster execution', async () => {
        const REQUEST_COUNT = 100;
        const localElClient = new ElectronMVClient(ipcRenderer);
        localElClient.PAGE_SIZE = BigInt(4096);
        await localElClient.getPtrSize();
        const [results, actualTime, expectedMaxTime] = await performAndTimeSameSinglePageRequests(REQUEST_COUNT, localElClient, mockTCPClient);
        for(let i=1; i<results.length; i++) {
            assert.deepStrictEqual(results[0], results[i]);
        }
        assert.isBelow(actualTime, expectedMaxTime);
    })
})