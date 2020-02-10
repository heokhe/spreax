import { Subscriber } from '../core/subscriber';
import { parse } from '../parser/parser';
import { evaluate } from '../parser/evaluate';

const DEP_REGEX = /(@(?:(?:{[^}]+})|(?:\([^)]+\))))/g;

export class TextNodeWrapper<T> extends Subscriber<T> {
  node: Node;

  initialText: string;

  sections: string[];

  dependencies: (keyof T)[] = [];

  constructor(node: Node) {
    super();
    this.node = node;
    this.initialText = node.textContent;
    this.sections = this.initialText.split(DEP_REGEX);
    for (let i = 0; i < this.sections.length; i++) {
      // sections with odd indexes are variables.
      if (i % 2 === 1) {
        const { dependencies } = parse(this.sections[i].slice(2, -1));
        this.dependencies.push(...dependencies as (keyof T)[]);
      }
    }
  }

  render() {
    return this.sections.map((sect, i) => {
      return i % 2 === 0
        ? sect
        : evaluate(parse(sect.slice(2, -1)), this.context);
    }).join('');
  }

  setText() {
    this.node.textContent = this.render();
  }
}
