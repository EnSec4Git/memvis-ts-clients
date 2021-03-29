import assert from 'assert'
import { ipcMain, ipcRenderer } from './mock/electron-mock'
import { MockTCPMVClient } from './mock/tcp-client-mock';
import ElectronMVClient from '../src/electronClient';
import { performRandomizedParallelRequests, readFirstXOfFirstMapFromTwoClients } from './commons';

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

    it('Should return proper memr() values', async () => {
        const results = await readFirstXOfFirstMapFromTwoClients(150, electronClient, mockTCPClient);
        assert.deepStrictEqual(results[0], results[1]);
    })

    it('Should handle concurrent memr() requests', async () => {
        const results = await performRandomizedParallelRequests(100, electronClient, mockTCPClient);
        assert.deepStrictEqual(results[0], results[1]);
    });
})