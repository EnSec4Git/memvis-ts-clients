export default class MemRow {
    constructor($startAddr, $endAddr, $data) {
        this.startAddr = $startAddr;
        this.endAddr = $endAddr;
        if ($data)
            this.data = $data;
    }
    fromOther($otherRow) {
        this.startAddr = $otherRow.startAddr;
        this.endAddr = $otherRow.endAddr;
        this.data = $otherRow.data;
    }
}
