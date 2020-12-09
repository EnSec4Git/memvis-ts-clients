interface WeakRef<T extends object> {
    readonly [Symbol.toStringTag]: "WeakRef";
    /**
     * Returns the WeakRef instance's target object, or undefined if the target object has been
     * reclaimed.
     */
    deref(): T | undefined;
}
interface WeakRefConstructor {
    readonly prototype: WeakRef<any>;
    /**
     * Creates a WeakRef instance for the given target object.
     * @param target The target object for the WeakRef instance.
     */
    new <T extends object>(target?: T): WeakRef<T>;
}
declare var WeakRef: WeakRefConstructor;
