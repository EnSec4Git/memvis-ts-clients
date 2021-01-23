import assert from 'assert'
import { ipcMain, ipcRenderer } from './mock/electron-mock'
import { MockTCPMVClient } from './mock/tcp-client-mock';
import ElectronMVClient from '../src/electronClient';

describe('Electron Server/Client', function() {
    this.timeout(5000);
    const mockTCPClient = new MockTCPMVClient();
    mockTCPClient.startElectronServer(ipcMain);
    const electronClient = new ElectronMVClient(ipcRenderer);

    it('Should return the same pointer size results', async () => {
        const bitsTcp = await mockTCPClient.getPtrSize();
        const bitsEl = await electronClient.getPtrSize();
        assert.strictEqual(bitsTcp, bitsEl);
    })
    
    it('Should read the same memory', async () => {
        const mapsTcp = await mockTCPClient.getMaps();
        const mapsEl = await electronClient.getMaps();
        assert.deepStrictEqual(mapsEl, mapsTcp);
    })
})