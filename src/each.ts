import { ElementWrapper as Wrapper } from "./element-wrapper";
import { computed } from "./computed";
import { Variable } from "./variables";

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
  comment: Comment;
  wrappers: WrapperWithExtraVars<T, V>[];
  constructor({ wrapper, arrayName, varName, onCreate }: LoopHandlerOptions<T, V>) {
    this.wrapper = wrapper;
    this.el = wrapper.el;
    this.arrayName = arrayName;
    this.varName = varName;
    this.onCreate = onCreate;
    this.comment = new Comment('bruh');
    this.wrappers = [];
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

  createWrapper() {
    const child = this.el.cloneNode(true) as Element;
    child.removeAttribute('@each');
    return new Wrapper<WithExtraVars<T, V>>(child);
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
    this.wrappers.push(wrapper);
  }

  createAndSetupWrapper(index: number) {
    const childWrapper = this.createWrapper();
    this.comment.before(childWrapper.el);
    this.subscribeWrapper(childWrapper, index);
    this.onCreate.call(null, childWrapper);
  }

  listenForChanges() {
    let prevArray = [];
    this.variable.subscribe(newArray => {
      const n = newArray.length,
        p = prevArray.length;
      if (n > p) {
        for (let i = p; i < n; i++)
          this.createAndSetupWrapper(i);
      } else if (n < p) {
        this.wrappers.slice(n).forEach(w => w.destroy());
        this.wrappers = this.wrappers.slice(0, p)
      }
      prevArray = newArray; 
    }, true)
  }
}

export function handleEach<T, V extends string>(options: LoopHandlerOptions<T, V>) {
  new LoopHandler(options).start();
}
