export default class MemRow {
    startAddr: bigint;
    endAddr: bigint;
    data: Uint8Array;
    constructor($startAddr: bigint, $endAddr: bigint, $data?: Uint8Array) {
        this.startAddr = $startAddr;
        this.endAddr = $endAddr;
        if ($data) this.data = $data;
    }
    fromOther($otherRow: MemRow) {
        this.startAddr = $otherRow.startAddr;
        this.endAddr = $otherRow.endAddr;
        this.data = $otherRow.data;
    }
}