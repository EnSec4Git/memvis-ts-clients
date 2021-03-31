import MemRow from './memRow';
import { IterableWeakSet } from './iterableWeakSet';
const Cache = require('safe-memory-cache').safeMemoryCache;
const MAX_CACHED_PAGES = 5;
export default class MVClient {
    constructor() {
        this.eventListeners = [];
        this._memrefs = new IterableWeakSet();
        this._pageCache = Cache({
            limit: MAX_CACHED_PAGES,
            buckets: MAX_CACHED_PAGES
        });
        this.PAGE_SIZE = 4096n;
    }
    _notify_maps_listeners(result) {
        for (let el of this.eventListeners) {
            el(result);
        }
    }
    roundToPageNumbers($startAddr, $endAddr) {
        let limits = [$startAddr / this.PAGE_SIZE, ($endAddr + this.PAGE_SIZE - 1n) / this.PAGE_SIZE];
        let res = [];
        for (let i = limits[0]; i < limits[1]; i++) {
            res.push(i);
        }
        return res;
    }
    async memr($startAddr, $endAddr, $trackUsage = false) {
        // First, reduce the requested memory interval to a list of memory pages
        const pageNrs = this.roundToPageNumbers($startAddr, $endAddr);
        const pageCount = pageNrs.length;
        let pages = [];
        // For each page
        for (let page of pageNrs) {
            let pst = page.toString();
            // Check if it is present in the cache
            let resPage = this._pageCache.get(pst);
            if (!resPage) {
                // And if not, read it from the server
                let $pageStart = this.PAGE_SIZE * page, $pageEnd = this.PAGE_SIZE * (page + 1n);
                resPage = await this._internal_memread($pageStart, $pageEnd);
                // If the interval does not fit in a single page, forego saving to cache
                if (pageCount == 1) {
                    this._pageCache.set(pst, resPage);
                }
            }
            // And add the memory page to a result list
            pages.push(resPage);
        }
        let resSlices = [];
        for (let i = 0; i < pageNrs.length; i++) {
            let startInd = (i == 0) ? Number($startAddr % this.PAGE_SIZE) : 0;
            let endInd = (i == pageNrs.length - 1)
                ? (1 + Number(($endAddr + this.PAGE_SIZE - BigInt(1)) % this.PAGE_SIZE))
                : (Number(this.PAGE_SIZE));
            resSlices.push(pages[i].dataSlices[0].slice(startInd, endInd));
        }
        let res = new MemRow($startAddr, $endAddr, resSlices);
        if ($trackUsage) {
            this._memrefs.addRef(res);
        }
        return res;
    }
    addMapsEventListener($listener) {
        this.eventListeners.push($listener);
    }
    removeMapsEventListener($listener) {
        let i = 0;
        for (let el of this.eventListeners) {
            if (el == $listener) {
                this.eventListeners.splice(i);
                return;
            }
            i++;
        }
    }
    refresh() {
        let promises = [];
        this._memrefs.forEachRef((x) => {
            promises.push((async () => {
                x.fromOther(await this._internal_memread(x.startAddr, x.endAddr));
            })());
        });
        return Promise.all(promises).then((x) => undefined);
    }
}
;
