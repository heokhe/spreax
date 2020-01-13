import { ElementWrapper as Wrapper } from "./element-wrapper";
import { computed } from "./computed";
import { Variable } from "./variables";
import { makeElementTree } from './dom';

type WithExtraVars<T, V extends string> = T & { i: number } & { [x in V]: any }
type WrapperWithExtraVars<T, V extends string> = Wrapper<WithExtraVars<T, V>>;
type LoopHandlerOptions<T, V extends string> = {
  wrapper: Wrapper<T>;
  arrayName: keyof T;
  varName: V;
  onCreate: (wrapper: WrapperWithExtraVars<T, V>) => any;
}

class LoopHandler<T, V extends string> {
  wrapper: Wrapper<T>;
  arrayName: keyof T;
  el: Element;
  varName: V;
  onCreate: (wrapper: WrapperWithExtraVars<T, V>) => any;
  comment: Comment = new Comment();
  wrappers: WrapperWithExtraVars<T, V>[] = [];
  backup: Element;
  constructor({ wrapper, arrayName, varName, onCreate }: LoopHandlerOptions<T, V>) {
    this.wrapper = wrapper;
    this.el = wrapper.el;
    this.backup = this.clone(this.el);
    this.arrayName = arrayName;
    this.varName = varName;
    this.onCreate = onCreate;
  }

  get variable(): Variable<T[keyof T] & any[]> {
    const v = this.wrapper.context[this.arrayName];
    return v.value instanceof Array
      ? v as Variable<T[keyof T] & any[]>
      : undefined;
  }

  start() {
    this.el.before(this.comment);
    this.listenForChanges();
    this.wrapper.destroy();
  }

  wrap(el: Element) {
    return new Wrapper<WithExtraVars<T, V>>(el);
  }

  clone(el = this.backup) {
    const child = el.cloneNode(true) as Element;
    child.removeAttribute('@for');
    return child;
  }

  subscribeWrapper(wrapper: WrapperWithExtraVars<T, V>, index: number) {
    const { varName, variable } = this,
      item = computed(() => variable.value[index]),
      ci = computed(() => index);
    item.subscribeAndAutoCompute(variable);
    wrapper.subscribeTo(varName, item);
    wrapper.subscribeTo('i', ci);
    for (const node of wrapper.nodes) {
      node.subscribeTo(varName, item);
      node.subscribeTo('i', ci);
    }
  }

  createAndSetupWrapper(index: number) {
    const clone = this.clone();
    this.comment.before(clone);
    for (const el of makeElementTree(clone)) {
      const wrapper = this.wrap(el);
      if (el === clone)
        this.wrappers.push(wrapper);
      this.subscribeWrapper(wrapper, index);
      this.onCreate.call(null, wrapper);
    }
  }

  listenForChanges() {
    this.variable.subscribe((newArray, prevArray) => {
      const n = newArray.length,
        p = prevArray?.length ?? 0;
      if (n < p) {
        this.removeWrappers(n, p);
      } else {
        for (let i = p; i < n; i++)
          this.createAndSetupWrapper(i);
      }
    }, true)
  }

  removeWrappers(currentLength: number, prevLength: number) {
    this.wrappers.slice(currentLength).forEach(w => w.destroy());
    this.wrappers = this.wrappers.slice(0, prevLength);
  }
}

export function handleFor<T, V extends string>(options: LoopHandlerOptions<T, V>) {
  new LoopHandler(options).start();
}
