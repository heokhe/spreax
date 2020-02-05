import { DirectiveHandler, DirectiveMatch } from '../handler';
import { Wrapper } from '../../wrapper';
import { parse } from '../../parser/parser';
import { derived, DerivedVariable as Derived } from '../../core/derived';
import { makeElementTree } from '../../dom';

type OnCreateFn<T> = (wrapper: Wrapper<T>) => void;

export class LoopHandler<T> extends DirectiveHandler<T> {
  name = 'for';

  parameters = false;

  onCreate: OnCreateFn<T>;

  comment = new Comment();

  wrappers = [] as Wrapper<T>[];

  itemName: string;

  indexName?: string;

  array: any[] = [];

  backupEl: Element;

  constructor(onCreate: OnCreateFn<T>) {
    super();
    this.onCreate = onCreate;
  }

  get hasIndex() {
    return !!this.indexName;
  }

  private clone() {
    const child = this.backupEl.cloneNode(true) as Element;
    child.removeAttribute('@for');
    return child;
  }

  parse(expression: string) {
    return parse(expression.split(' of ', 2)[1]);
  }


  private createVariables(index: number) {
    const itemVar = derived(() => this.array[index]);
    const indexVar = this.hasIndex ? derived(() => index as any) : undefined;
    return [itemVar, indexVar];
  }

  private createNewItem(index: number) {
    const [itemVar, indexVar] = this.createVariables(index);
    const rootEl = this.clone();
    for (const el of makeElementTree(rootEl)) {
      const wrapper = new Wrapper<T>(el);
      if (el === rootEl)
        this.wrappers.push(wrapper);
      this.addToItemContext(wrapper, itemVar, indexVar);
      this.onCreate(wrapper);
    }
    this.comment.before(rootEl);
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

  private destroyItem(index: number) {
    this.wrappers[index].destroy();
    this.wrappers.splice(index, 1);
  }

  init(_: unknown, { value: attrValue }: DirectiveMatch) {
    [this.itemName, this.indexName] = attrValue
      .split(' of ')[0]
      .split(', ', 2);
    this.el.after(this.comment);
    this.backupEl = this.el.cloneNode(true) as Element;
    this.target.destroy();
  }

  handle(array: any[]) {
    const n = array.length,
      p = this.array?.length ?? 0;
    this.array = array;

    if (n > p)
      for (let i = p; i < n; i++)
        this.createNewItem(i);
    else if (n < p)
      for (let i = n; i < p; i++)
        this.destroyItem(i);
  }
}
