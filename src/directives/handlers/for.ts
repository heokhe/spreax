import { DirectiveHandler } from '../handler';
import { DirectiveMatch } from '../matches';
import { Wrapper, wrap } from '../../wrappers/element';
import { parse, ParseResult } from '../../parser/parser';
import { derived, DerivedVariable as Derived } from '../../core/derived';
import { createElementTree } from '../../dom';

type OnCreateFn<T> = (wrapper: Wrapper<T>) => void;

export class ForHandler<T, E extends HTMLElement = HTMLElement> extends DirectiveHandler<T, E> {
  name = 'for';

  parameters = false;

  parsed: ParseResult;

  onCreate: OnCreateFn<T>;

  comment = new Comment();

  wrappers = [] as Wrapper<T>[];

  itemName: string;

  indexName?: string;

  array = [];

  backupEl: E;

  constructor(onCreate: OnCreateFn<T>) {
    super();
    this.onCreate = onCreate;
  }

  get hasIndex() {
    return !!this.indexName;
  }

  private clone() {
    const child = this.backupEl.cloneNode(true) as E;
    child.removeAttribute('@for');
    return child;
  }

  parse(expression: string) {
    return parse(expression.split(' of ', 2)[1]);
  }

  private getParseResultForItem(index: number): ParseResult {
    const { parsed } = this;
    return {
      ...parsed,
      path: [...(parsed.path ?? []), {
        isLiteral: true, name: `${index}`
      }]
    };
  }

  private createVariables(index: number) {
    const itemVar = derived(
      () => this.array[index],
      value => this.set(this.getParseResultForItem(index), value)
    );
    const indexVar = this.hasIndex ? derived(() => index) : undefined;
    return [itemVar, indexVar];
  }

  private createNewItem(index: number) {
    const [itemVar, indexVar] = this.createVariables(index);
    const rootEl = this.clone();
    this.comment.before(rootEl);
    for (const el of createElementTree(rootEl)) {
      const wrapper = wrap<T>(el);
      if (el === rootEl)
        this.wrappers.push(wrapper);
      this.addToItemContext(wrapper, itemVar, indexVar);
      this.onCreate(wrapper);
    }
  }

  private addToItemContext(wrapper: Wrapper<T>, itemVar: Derived<any>, indexVar?: Derived<any>) {
    const itemName = this.itemName as keyof T,
      indexName = this.indexName as keyof T;

    for (const dep of this.dependencies)
      itemVar.subscribeAndAutoCompute(this.context[dep]);

    wrapper.addToContextIfNotPresent(itemName, itemVar);
    if (this.hasIndex)
      wrapper.addToContextIfNotPresent(indexName, indexVar);

    for (const node of wrapper.nodes) {
      node.addToContextIfNotPresent(itemName, itemVar);
      if (this.hasIndex)
        node.addToContextIfNotPresent(indexName, indexVar);
    }
  }

  private destroyItems(from: number, to: number) {
    for (let i = from; i < to; i++)
      this.wrappers[i].destroy();
    this.wrappers.splice(from, to - from);
  }

  init(_: unknown, { value: attrValue, parsed }: DirectiveMatch) {
    this.parsed = parsed;
    [this.itemName, this.indexName] = attrValue
      .split(' of ')[0]
      .split(', ', 2);
    this.el.after(this.comment);
    this.backupEl = this.el.cloneNode(true) as E;
    this.target.destroy();
  }

  handle(array: any[]) {
    if (Array.isArray(array)) {
      const n = array.length,
        p = this.array.length;
      this.array = array;

      if (n > p)
        for (let i = p; i < n; i++)
          this.createNewItem(i);
      else if (n < p)
        this.destroyItems(n, p);
    } else {
      // eslint-disable-next-line no-console
      console.warn(`@for expected an array, but got ${array}`);
    }
  }
}
