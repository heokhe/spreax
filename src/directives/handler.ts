import { Wrapper } from '../wrapper';
import { ParseResult, parse } from '../parser/parser';
import { evaluate, pathSectionsToString } from '../parser/evaluate';
import { Variables } from '../core/variables';
import { flatUnique } from '../helpers';
import { setPath } from '../state-helpers';

export type DirectiveMatch = {
  value: string;
  parameter?: string;
  parsed: ParseResult;
}

export abstract class DirectiveHandler<T, E extends Element = Element> {
  target: Wrapper<T, E>;

  protected name: string;

  protected parameters = false;

  protected matches: DirectiveMatch[];

  get el(): E {
    return this.target.el;
  }

  get context() {
    return this.target.context;
  }

  private isValidName(name: string) {
    return this.parameters
      ? name.startsWith(`@${this.name}:`)
      : name === `@${this.name}`;
  }

  private getMatches(el: E): DirectiveMatch[] {
    const output = [] as DirectiveMatch[];
    for (const { name, value } of el.attributes) {
      if (this.isValidName(name)) {
        const [, parameter] = name.split(':', 2);
        output.push({
          parameter,
          value,
          parsed: this.parse(value)
        });
      }
    }
    return output;
  }

  get dependencies() {
    return flatUnique(
      this.matches
        .map(match => match.parsed)
        .map(parsed => parsed.dependencies as (keyof T)[])
    );
  }

  protected parse(expression: string): ParseResult {
    return parse(expression);
  }

  abstract handle(value: any, match?: DirectiveMatch): void;

  abstract init(value: any, match?: DirectiveMatch): void;

  private use(variables: Variables<T>) {
    for (const dep of this.dependencies)
      this.target.addToContextIfNotPresent(dep, variables[dep]);
  }

  private setTarget(targetWrapper: Wrapper<T, E>) {
    this.target = targetWrapper;
    this.matches = this.getMatches(targetWrapper.el);
  }

  private eval(parsed: ParseResult) {
    return evaluate(parsed, this.context);
  }

  protected set({ path, varName }: ParseResult, value: any) {
    const variable = this.context[varName as keyof T];
    if (!path.length) {
      variable.set(value);
    } else {
      setPath(variable, pathSectionsToString(path, this.context), value);
    }
  }

  start(wrapper: Wrapper<T, E>, variables: Variables<T>) {
    this.setTarget(wrapper);
    this.use(variables);
    for (const match of this.matches) {
      this.init(this.eval(match.parsed), match);
      for (const dep of match.parsed.dependencies) {
        this.target.subscribeTo(dep as keyof T, () => {
          this.handle(this.eval(match.parsed), match);
        }, true);
      }
    }
  }
}
