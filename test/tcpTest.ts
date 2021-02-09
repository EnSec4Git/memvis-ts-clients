import assert from 'assert';
import TCPMVClient from '../src/tcpClient';
import mitm from 'mitm';
import { connect, Socket } from 'net';
import MockMVClient from '../src/mockClient';
import { PtrArray, PtrArrayTypes } from '../src/ptrTypes';
import { MapRow, MemRow } from '../src';
import { start } from 'repl';

// For an explanation of the above code, take a look at this
// issue: https://github.com/moll/node-mitm/issues/42
const MockSocketFactory = () => Object.assign(connect(2160, 'localhost'), { connect: () => { } });

const nmin = (x: bigint, y: bigint) => (x > y) ? y : x;

// Thanks, mate!
// https://stackoverflow.com/a/12646864
function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

const mockHandleRequest = async ($this: Mocha.Context & { mitm?: ReturnType<typeof mitm>, client?: MockMVClient }, socket: Socket, data: Buffer) => {
    // console.log('Data available: ', data, data.toString());
    const cmd = data.slice(0, 4).toString();
    const ptrSize = await $this.client.getPtrSize();
    const PAC = PtrArray(ptrSize);
    switch (cmd) {
        case 'PTRS':
            const ptrResp = Uint8Array.of(ptrSize);
            socket.write(ptrResp)
            break;
        case 'MAPS':
            const maps = await $this.client.getMaps();
            const rawMaps = maps.maps.filter(
                (x) => x.type == MapRow.USED).map(
                    (x => [x.start, x.end])
                );
            const mapNr = rawMaps.length;
            const byteLen = 6 + (1 + mapNr * 2) * ptrSize;
            const buf = Buffer.alloc(byteLen);
            let cnt = 0;
            buf.write('RESULT');
            cnt += 6;
            PAC.writeOneToBuffer(buf, cnt, mapNr);
            cnt += ptrSize;
            for (let i = 0; i < mapNr; i++) {
                const map = rawMaps[i];
                PAC.writeOneToBuffer(buf, cnt, map[0]);
                cnt += ptrSize;
                PAC.writeOneToBuffer(buf, cnt, map[1]);
                cnt += ptrSize;
            }
            socket.write(buf);
            break;
        case 'MEMR':
            const startAddr = BigInt(PAC.readOneFromBuffer(data, 4));
            const endAddr = BigInt(PAC.readOneFromBuffer(data, 4 + ptrSize))
            const memLen = 6 + Number(endAddr - startAddr);
            const memBuf = Buffer.alloc(memLen);
            let memCnt = 0;
            memBuf.write('RESULT');
            memCnt += 6;
            const localMem = await $this.client.memr(startAddr, endAddr);
            // for(let i=startAddr; i<endAddr; i++) {
            //     PAC.writeOneToBuffer(memBuf, memCnt, localMem.data[Number(i - startAddr)])
            //     memCnt += ptrSize;
            // }
            Buffer.from(localMem.data).copy(memBuf, memCnt, 0, Number(endAddr - startAddr));
            socket.write(memBuf);
            break;
        default:
            throw new Error('Unknown command from client!');
    }
}

describe('TCP Client', function () {
    beforeEach(async function (this: Mocha.Context & { mitm?: ReturnType<typeof mitm>, client?: MockMVClient }) {
        this.mitm = mitm();
        this.mitm.on("connection", (socket, opts) => {
            if (opts.host == 'localhost' && opts.port === 2160) {
                socket.on('data', (data: Buffer) => mockHandleRequest(this, socket, data))
            } else {
                (socket as any).bypass()
            }
        })
    })

    afterEach(function (this: Mocha.Context & { mitm?: ReturnType<typeof mitm> }) {
        this.mitm.disable();
    })

    it('Should support getPtrSize()', async function (this: Mocha.Context & { mitm?: ReturnType<typeof mitm>, client?: MockMVClient }) {
        const clientPtrSize = 4;
        this.client = new MockMVClient();
        const tcpClient = new TCPMVClient('localhost', 2160, MockSocketFactory);
        tcpClient._connect();
        const ptrSize = await tcpClient.getPtrSize();
        assert.strictEqual(ptrSize, clientPtrSize);
    })

    it('Should support getMaps()', async function (this: Mocha.Context & { mitm?: ReturnType<typeof mitm>, client?: MockMVClient }) {
        const clientPtrSize = 4;
        this.client = new MockMVClient();
        const tcpClient = new TCPMVClient('localhost', 2160, MockSocketFactory);
        tcpClient._connect();
        await tcpClient.getPtrSize();
        const tcpMaps = await tcpClient.getMaps();
        const localMaps = await this.client.getMaps();
        assert.deepStrictEqual(localMaps, tcpMaps);
    })

    it('Should return proper memr() values', async function (this: Mocha.Context & { mitm?: ReturnType<typeof mitm>, client?: MockMVClient }) {
        const clientPtrSize = 4;
        this.client = new MockMVClient();
        const tcpClient = new TCPMVClient('localhost', 2160, MockSocketFactory);
        tcpClient._connect();
        await tcpClient.getPtrSize();
        const tcpMaps = await tcpClient.getMaps();
        const memReq = tcpMaps.maps.filter((x) => x.type == MapRow.USED)[0];
        const endAddr = nmin(memReq.start + BigInt(150), memReq.end);
        const readMem = await tcpClient.memr(memReq.start, endAddr);
        const localMem = await this.client.memr(memReq.start, endAddr);
        assert.deepStrictEqual(readMem, localMem);
    })

    it('Should handle concurrent memr() requests', async function (this: Mocha.Context & { mitm?: ReturnType<typeof mitm>, client?: MockMVClient }) {
        const HN = BigInt(100);
        const clientPtrSize = 4;
        this.client = new MockMVClient();
        const tcpClient = new TCPMVClient('localhost', 2160, MockSocketFactory);
        tcpClient._connect();
        await tcpClient.getPtrSize();
        const tcpMaps = await tcpClient.getMaps();
        const memRow = tcpMaps.maps.filter((x) => x.type == MapRow.USED)[0];
        const reqCnt = Array.from(Array(100).keys());
        shuffleArray(reqCnt);
        const preResps = await Promise.all(reqCnt.map((x: number) => { return tcpClient.memr(memRow.start + BigInt(x) * HN, memRow.start + BigInt(x + 1) * HN).then((r): [number, MemRow] => [x, r]) }));
        preResps.sort((a, b) => (a[0] - b[0]));
        const resps = preResps.map((x) => x[1]);
        const seqLocalResps: MemRow[] = [];
        for(let i=0; i<100; i++) {
            seqLocalResps.push(await tcpClient.memr(memRow.start + BigInt(i) * HN, memRow.start + BigInt(i + 1) * HN))
        }
        assert.deepStrictEqual(resps, seqLocalResps);
    });
})