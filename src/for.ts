import { Wrapper as Wrapper } from "./wrapper";
import { derived } from "./derived";
import { Variable } from "./variables";
import { makeElementTree } from './dom';

type WithExtraVars<T, V extends string, I extends string> = T & { [x in I]: number } & { [x in V]: any }
type WrapperWithExtraVars<T, V extends string, I extends string> = Wrapper<WithExtraVars<T, V, I>>;
type LoopHandlerOptions<T, V extends string, I extends string> = {
  wrapper: Wrapper<T>;
  arrayName: keyof T;
  varName: V;
  indexName: I;
  onCreate: (wrapper: WrapperWithExtraVars<T, V, I>) => any;
}

class LoopHandler<T, V extends string, I extends string> {
  wrapper: Wrapper<T>;
  arrayName: keyof T;
  el: Element;
  varName: V;
  onCreate: (wrapper: WrapperWithExtraVars<T, V, I>) => any;
  comment: Comment = new Comment();
  wrappers: WrapperWithExtraVars<T, V, I>[] = [];
  indexName: I;
  constructor({ wrapper, arrayName, varName, onCreate, indexName }: LoopHandlerOptions<T, V, I>) {
    this.wrapper = wrapper;
    wrapper.el.before(this.comment);
    this.el = wrapper.el.cloneNode(true) as Element;
    this.arrayName = arrayName;
    this.varName = varName;
    this.indexName = indexName;
    this.onCreate = onCreate;
    this.wrapper.destroy();
  }

  get variable(): Variable<T[keyof T] & any[]> {
    const v = this.wrapper.context[this.arrayName];
    return v.value instanceof Array
      ? v as Variable<T[keyof T] & any[]>
      : undefined;
  }

  wrap(el: Element) {
    return new Wrapper<WithExtraVars<T, V, I>>(el);
  }

  clone() {
    const child = this.el.cloneNode(true) as Element;
    child.removeAttribute('@for');
    return child;
  }

  subscribeWrapper(wrapper: WrapperWithExtraVars<T, V, I>, index: number) {
    const { varName, variable } = this,
      item = derived(() => variable.value[index]),
      i = derived(() => index as WithExtraVars<T, V, I>[I]);
    item.subscribeAndAutoCompute(variable);
    wrapper.addToContext(varName, item);
    wrapper.addToContext(this.indexName, i);
    for (const node of wrapper.nodes) {
      node.addToContext(varName, item);
      node.addToContext(this.indexName, i);
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

export function handleFor<T, V extends string, I extends string>(options: LoopHandlerOptions<T, V, I>) {
  new LoopHandler(options).listenForChanges();
}
