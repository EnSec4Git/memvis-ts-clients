export interface WeakRef<T extends object> {
    readonly [Symbol.toStringTag]: "WeakRef";
    /**
     * Returns the WeakRef instance's target object, or undefined if the target object has been
     * reclaimed.
     */
    deref(): T | undefined;
}
export interface WeakRefConstructor {
    readonly prototype: WeakRef<any>;
    /**
     * Creates a WeakRef instance for the given target object.
     * @param target The target object for the WeakRef instance.
     */
    new <T extends object>(target?: T): WeakRef<T>;
}
export declare var WeakRef: WeakRefConstructor;
