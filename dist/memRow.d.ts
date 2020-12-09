export default class MemRow {
    startAddr: bigint;
    endAddr: bigint;
    data: Uint8Array;
    constructor($startAddr: bigint, $endAddr: bigint, $data?: Uint8Array);
    fromOther($otherRow: MemRow): void;
}
