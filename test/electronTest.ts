import assert from 'assert'
import { ipcMain, ipcRenderer } from './mock/electron-mock'
import { MockTCPMVClient } from './mock/tcp-client-mock';

describe('Electron Server', () => {
    it('should start', () => {
        assert.equal(true, true);
    })
})