"use strict";
// Credits: https://gist.github.com/seanlinsley/bc10378fd311d75cf6b5e80394be813d
// spec: https://github.com/tc39/proposal-weakrefs
// the spec contains an [iterable WeakMap implementation](https://github.com/tc39/proposal-weakrefs#iterable-weakmaps)
// NOTE: this WeakSet implementation is incomplete, only does what I needed
// In Firefox Nightly, visit about:config and enable javascript.options.experimental.weakrefs
Object.defineProperty(exports, "__esModule", { value: true });
exports.IterableWeakSet = void 0;
//import { WeakRef } from './weakref-pf';
class IterableWeakSet extends Set {
    addRef(el) {
        return super.add(new WeakRef(el));
    }
    forEachRef(fn) {
        super.forEach(ref => {
            const value = ref.deref();
            if (value)
                fn(value);
            else
                this.delete(ref);
        });
    }
}
exports.IterableWeakSet = IterableWeakSet;
