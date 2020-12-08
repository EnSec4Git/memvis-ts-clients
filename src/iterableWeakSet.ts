// spec: https://github.com/tc39/proposal-weakrefs
// the spec contains an [iterable WeakMap implementation](https://github.com/tc39/proposal-weakrefs#iterable-weakmaps)
// NOTE: this WeakSet implementation is incomplete, only does what I needed
// In Firefox Nightly, visit about:config and enable javascript.options.experimental.weakrefs

import { WeakRef } from './weakref-pf';

export class IterableWeakSet<T extends object> extends Set<WeakRef<T>> {
    addRef(el: T) {
        return super.add(new WeakRef<T>(el));
    }
    forEachRef(fn: (x: T) => void) {
        super.forEach(ref => {
            const value = ref.deref()
            if (value) fn(value);
            else this.delete(ref)
        })
    }
    // *[Symbol.iterator]() {
    //   for (const ref of super.values()) {
    //     const value = ref.deref()
    //     if (value) yield value
    //   }
    // }
}