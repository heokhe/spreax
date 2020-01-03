import { Subscriber } from "./subscriber";

const DEP_REGEX = /(@\(\w+\))/gi;

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
      if (i % 2 === 0) continue;
      const dep = this.sections[i].slice(2, -1) as keyof T;
      this.dependencies.push(dep);
    }
  }
  
  render() {
    return this.sections.map((sect, i) => {
      if (i % 2 === 0) return sect;
      return this.context[sect.slice(2, -1) as keyof T]?.value;
    }).join('');
  }

  setText() {
    this.node.textContent = this.render();
  }
}