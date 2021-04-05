import { MapRow, MapState, MemRow, MockMVClient, MVClient } from "../src";
import sinon from 'sinon';
import { assert } from 'chai';
import { performance } from 'perf_hooks';

// Thanks, mate!
// https://stackoverflow.com/a/12646864
function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export const nmin = (x: bigint, y: bigint) => (x > y) ? y : x;
export const nmax = (x: bigint, y: bigint) => (x < y) ? y : x;

export function getFirstNonemptyMap(mapState: MapState) {
    return mapState.maps.filter((x) => x.type == MapRow.USED)[0];
}

export async function performRandomizedParallelRequests(numberOfRequests: number, first: MVClient, second: MVClient): Promise<[MemRow[], MemRow[]]> {
    const HN = BigInt(numberOfRequests);
    const tcpMaps = await first.getMaps();
    const memRow = getFirstNonemptyMap(tcpMaps);
    const reqCnt = Array.from(Array(numberOfRequests).keys());
    shuffleArray(reqCnt);
    const preResps = await Promise.all(reqCnt.map((x: number) => { return first.memr(memRow.start + BigInt(x) * HN, memRow.start + BigInt(x + 1) * HN).then((r): [number, MemRow] => [x, r]) }));
    preResps.sort((a, b) => (a[0] - b[0]));
    const resps = preResps.map((x) => x[1]);
    const seqLocalResps: MemRow[] = [];
    for (let i = 0; i < 100; i++) {
        seqLocalResps.push(await second.memr(memRow.start + BigInt(i) * HN, memRow.start + BigInt(i + 1) * HN));
    }
    return [resps, seqLocalResps];
}

export async function readFirstXOfFirstMapFromTwoClients(numberOfBytesToRequest: number, first: MVClient, second: MVClient): Promise<[MemRow, MemRow]> {
    const tcpMaps = await first.getMaps();
    const memReq = getFirstNonemptyMap(tcpMaps);
    const endAddr = nmin(memReq.start + BigInt(numberOfBytesToRequest), memReq.end);
    const readMem = await first.memr(memReq.start, endAddr);
    const localMem = await second.memr(memReq.start, endAddr);
    return [readMem, localMem];
}

export async function performRequestsThatUpscaleToSamePageAndAssert(numberOfRequests: number, testTarget: MVClient, spiedClient: MockMVClient): Promise<[$startAddr: bigint, $endAddr: bigint, $trackUsage?: boolean][]> {
    if (numberOfRequests < 2) {
        throw new Error('Teach me how to compare 1 object...');
    }
    const spyObj = sinon.spy(spiedClient, 'memr');
    const PS = testTarget.PAGE_SIZE;
    const maps = await testTarget.getMaps();
    const MIN_SLICE_SIZE = 10;
    const memRow = getFirstNonemptyMap(maps);
    const MAX_SLICE_NR = Math.floor(Number((memRow.end - memRow.start) / BigInt(MIN_SLICE_SIZE)));
    if ((memRow.end - memRow.start) % PS != BigInt(0)) {
        throw new Error('MapRow does not consist of an integer number of memory pages');
        // TODO: Maybe implement a unit test for that?
    }
    const SLICE_SIZE = Math.max(MIN_SLICE_SIZE, Number((memRow.end - memRow.start) / BigInt(numberOfRequests)))
    const FIRST_RQ = await testTarget.memr(memRow.start, memRow.start + BigInt(SLICE_SIZE), false);
    const FIRST_CALL = spyObj.getCall(0).args;
    let res = [FIRST_CALL];
    for (let i = 0, j = 0; i < numberOfRequests; i++, j = (j + 1) % (MAX_SLICE_NR - 1)) {
        let e1 = memRow.start + BigInt(i * SLICE_SIZE),
            e2 = memRow.start + BigInt((i + 1) * SLICE_SIZE);
        let start = nmax(e1, e2), end = nmin(e1, e2);
        const resRow = await testTarget.memr(start, end);
        const lastCall = spyObj.getCall(spyObj.callCount - 1).args;
        res.push(lastCall);
    }
    return res;
}

export async function performAndTimeSameSinglePageRequests(numberOfRequests: number, testTarget: MVClient, referenceClient: MockMVClient): Promise<[MemRow[], number, number]> {
    const MULTI_LIMIT = 10;
    const maps = await testTarget.getMaps();
    const memRow = getFirstNonemptyMap(maps);
    const reqEnd = nmin(memRow.end, memRow.start + testTarget.PAGE_SIZE);
    const t0 = performance.now();
    const res0 = await testTarget.memr(memRow.start, reqEnd);
    const resRef = await referenceClient.memr(memRow.start, reqEnd);
    let results = [resRef, res0];
    const d0 = performance.now() - t0;
    let dsum = 0;
    for (let i = 0; i < numberOfRequests; i++) {
        const ti = performance.now();
        const resi = await testTarget.memr(memRow.start, reqEnd);
        const di = performance.now() - ti;
        // assert.deepStrictEqual(res0, resi);
        results.push(resi);
        dsum += di;
    }
    return [results, dsum, MULTI_LIMIT * d0];
}

export async function performAndTimeAdjacentPageRequests(numberOfTests: number, testTarget: MVClient, referenceClient: MockMVClient): Promise<[MemRow[][], number, number]> {
    const EMT_FACTOR = 0.2;
    const maps = await testTarget.getMaps();
    const memRow = getFirstNonemptyMap(maps);
    assert.isBelow(Number(BigInt(3) * testTarget.PAGE_SIZE - (memRow.end - memRow.start)), 0);
    const reqEnd = nmin(memRow.end, memRow.start + testTarget.PAGE_SIZE);
    const res0: MemRow[] = [];
    const resRef: MemRow[] = [];
    const t0 = performance.now();
    for(let j=0; j<3; j++) {
        const st = memRow.start + BigInt(j) * testTarget.PAGE_SIZE;
        const en = reqEnd + BigInt(j) * testTarget.PAGE_SIZE;
        res0.push(await testTarget.memr(st, en));
        resRef.push(await referenceClient.memr(st, en));
    }
    let dsum = 0;
    const d0 = performance.now() - t0;
    const ress = [resRef, res0];
    for(let i=0; i < numberOfTests; i++) {
        const ti = performance.now();
        const resi = [];
        for(let j=0; j<3; j++) {
            const st = memRow.start + BigInt(j) * testTarget.PAGE_SIZE;
            const en = reqEnd + BigInt(j) * testTarget.PAGE_SIZE;
            resi.push(await testTarget.memr(st, en));
        }
        const di = performance.now() - ti;
        dsum += di;
        ress.push(resi);
    }
    return [ress, dsum, numberOfTests * d0 * EMT_FACTOR];
}