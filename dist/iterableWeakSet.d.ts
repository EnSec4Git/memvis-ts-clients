export declare class IterableWeakSet<T extends object> extends Set<WeakRef<T>> {
    addRef(el: T): this;
    forEachRef(fn: (x: T) => void): void;
}
