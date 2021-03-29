import { MapRow, MemRow, MVClient } from "../src";

// Thanks, mate!
// https://stackoverflow.com/a/12646864
function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

const nmin = (x: bigint, y: bigint) => (x > y) ? y : x;

export async function performRandomizedParallelRequests(numberOfRequests: number, first: MVClient, second: MVClient): Promise<[MemRow[], MemRow[]]> {
    const HN = BigInt(numberOfRequests);
    const tcpMaps = await first.getMaps();
    const memRow = tcpMaps.maps.filter((x) => x.type == MapRow.USED)[0];
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
    const memReq = tcpMaps.maps.filter((x) => x.type == MapRow.USED)[0];
    const endAddr = nmin(memReq.start + BigInt(numberOfBytesToRequest), memReq.end);
    const readMem = await first.memr(memReq.start, endAddr);
    const localMem = await second.memr(memReq.start, endAddr);
    return [readMem, localMem];
}