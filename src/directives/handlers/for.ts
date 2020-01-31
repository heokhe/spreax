import { DirectiveHandler } from '../index';
import { Wrapper } from '../../wrapper';
import { Variable } from '../../core/variables';
import { parse } from '../../parser/parser';
import { derived } from '../../core/derived';

// import { Wrapper as Wrapper } from "../wrapper";
// import { derived } from "../core/derived";
// import { Variable } from "../core/variables";
// import { makeElementTree } from '../dom';
// import { DirectiveHandler, DirectiveMatch } from './index';
// import { parse } from '../parser/parser';

// type WithExtraVars<T, V extends string, I extends string> = T & { [x in I]: number } & { [x in V]: any }
// type WrapperWithExtraVars<T, V extends string, I extends string> = Wrapper<WithExtraVars<T, V, I>>;
// type LoopHandlerOptions<T, V extends string, I extends string> = {
// wrapper: Wrapper<T>;
// arrayName: keyof T;
// varName: V;
// indexName: I;
// onCreate: (wrapper: WrapperWithExtraVars<T, V, I>) => any;
// }
//

type OnCreateFn<T> = (wrapper: Wrapper<T>) => any;
export class LoopHandler<T> extends DirectiveHandler<T> {
  onCreate: OnCreateFn<T>;

  comment = new Comment();

  wrappers = [] as Wrapper<T>[];

  itemName: string;

  indexName?: string;

  cloned: Element;

  constructor(onCreate: OnCreateFn<T>) {
    super();
    this.el.before(this.comment);
    this.cloned = this.el.cloneNode(true) as Element;
    this.onCreate = onCreate;
    this.target.destroy();
  }

  get attrValue() {
    return this.matches[0].value;
  }

  get sides() {
    return this.attrValue.split(' of ', 2);
  }

  get leftHandSide() {
    return this.sides[0].split(', ', 2);
  }

  get variable(): Variable<T[keyof T] & any[]> {
    const v = this.target.context[this.itemName];
    return v.value instanceof Array
      ? v as Variable<T[keyof T] & any[]>
      : undefined;
  }

  init() {
    [this.itemName, this.indexName] = this.leftHandSide;
  }

  parse() {
    return parse(this.sides[1]);
  }

  clone() {
    const child = this.el.cloneNode(true) as Element;
    child.removeAttribute('@for');
    return child;
  }

  createNewItem(index: number) {
    const el = this.clone();
    const wrapper = new Wrapper<T>(el);
    // const item = derived(() => )

    return wrapper;
  }

  wrap(el: Element) {
    return new Wrapper<WithExtraVars<T, V, I>>(el);
  }

  subscribeWrapper(wrapper: WrapperWithExtraVars<T, V, I>, index: number) {
    const { leftHandSide: varName, variable } = this,
      item = derived(() => variable.value[index]),
      i = this.indexName
        ? derived(() => index as WithExtraVars<T, V, I>[I])
        : null;
    item.subscribeAndAutoCompute(variable);
    wrapper.addToContextIfNotPresent(varName, item);
    if (i) wrapper.addToContextIfNotPresent(this.indexName, i);
    for (const node of wrapper.nodes) {
      node.addToContextIfNotPresent(varName, item);
      if (i) node.addToContextIfNotPresent(this.indexName, i);
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
    }, true);
  }

  removeWrappers(currentLength: number, prevLength: number) {
    this.wrappers.slice(currentLength).forEach(w => w.destroy());
    this.wrappers = this.wrappers.slice(0, prevLength);
  }
}
//
// export function handleFor<T, V extends string, I extends string>(options: LoopHandlerOptions<T, V, I>) {
// new LoopHandler(options).listenForChanges();
// }


// export class ForHandler<T> extends DirectiveHandler<T> {
//   name = 'for';
//   // onCreate: OnCreateFn<T, V, I>;
//   constructor(/* onCreate: OnCreateFn<T, V, I> */) {
//     super();
//     // this.onCreate = onCreate;
//   }
//   parse(expression: string) {
//     return parse(expression.split(' of ', 2)[1]);
//   }
//   // eslint-disable-next-line @typescript-eslint/no-empty-function
//   init() {}
//   handle(array: any[]) {
//     console.log(array);
//   }
// }
