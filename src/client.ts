import { MapState } from "./mapstate";
import MemRow from './memRow';
import { IterableWeakSet } from './iterableWeakSet';

interface PageCache {
    set(key: string, value: MemRow);
    get(key: string): MemRow | null;
}

// function clog(...args: any[]) {
//     const res = args.map((x: any) => util.inspect(x)).join(" ");
//     console.log(res);
// }

const Cache: (opts: { limit: number, buckets?: number }) => PageCache = 
    require('safe-memory-cache').safeMemoryCache as any;

const MAX_CACHED_PAGES = 5;

export type MapsEventListener = (x: MapState) => any;

export default abstract class MVClient {
    ptrSize?: number;
    PAGE_SIZE: bigint;
    protected _memrefs: IterableWeakSet<MemRow>;
    protected _pageCache: PageCache;
    protected eventListeners: MapsEventListener[] = [];

    protected constructor() {
        this._memrefs = new IterableWeakSet<MemRow>();
        this._pageCache = Cache({
            limit: MAX_CACHED_PAGES,
            buckets: MAX_CACHED_PAGES
        });
        this.PAGE_SIZE = 4096n;
    }

    protected abstract _internal_memread($startAddr: bigint, $endAddr: bigint): Promise<MemRow>;

    protected _notify_maps_listeners(result: MapState) {
        for (let el of this.eventListeners) {
            el(result);
        }
    }

    abstract getMaps(): Promise<MapState>;

    abstract getPtrSize(): Promise<number>;

    roundToPageNumbers($startAddr: bigint, $endAddr: bigint): bigint[] {
        let limits = [$startAddr / this.PAGE_SIZE, ($endAddr + this.PAGE_SIZE - 1n) / this.PAGE_SIZE];
        let res: bigint[] = [];
        for (let i = limits[0]; i < limits[1]; i++) {
            res.push(i);
        }
        return res;
    }

    async memr($startAddr: bigint, $endAddr: bigint, $trackUsage: boolean = false): Promise<MemRow> {
        // First, reduce the requested memory interval to a list of memory pages
        const pageNrs = this.roundToPageNumbers($startAddr, $endAddr);
        const pageCount = pageNrs.length;
        let pages: MemRow[] = [];
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
                if(pageCount == 1) {
                    this._pageCache.set(pst, resPage);
                }
            }
            // And add the memory page to a result list
            pages.push(resPage);
        }
        let resSlices = [];
        for(let i = 0; i < pageNrs.length; i++) {
            let startInd = (i == 0) ? Number($startAddr % this.PAGE_SIZE) : 0;
            let endInd = (i == pageNrs.length - 1)
                ? (1 + Number(($endAddr + this.PAGE_SIZE - BigInt(1)) % this.PAGE_SIZE))
                : (Number(this.PAGE_SIZE));
            resSlices.push(pages[i].dataSlices[0].slice(startInd, endInd));
        }
        let res: MemRow = new MemRow(
            $startAddr, $endAddr, resSlices
        );
        if ($trackUsage) {
            this._memrefs.addRef(res);
        }
        return res;
    }

    addMapsEventListener($listener: MapsEventListener) {
        this.eventListeners.push($listener);
    }

    removeMapsEventListener($listener: MapsEventListener) {
        let i = 0;
        for (let el of this.eventListeners) {
            if (el == $listener) {
                this.eventListeners.splice(i);
                return;
            }
            i++;
        }
    }

    refresh(): Promise<void> {
        let promises = [];
        this._memrefs.forEachRef((x: MemRow) => {
            promises.push((async () => {
                x.fromOther(await this._internal_memread(x.startAddr, x.endAddr));
            })());
        });
        return Promise.all(promises).then((x) => undefined);
    }
};