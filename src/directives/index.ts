import { Wrapper } from '../wrapper';
import { ParseResult, parse } from '../parser/parser';
import { evaluate } from '../parser/evaluate';
import { Variables } from '../core/variables';
import { flatUnique } from '../helpers';

export type DirectiveMatch = {
  value: string;
  parameter?: string;
  parsed: ParseResult;
}

export abstract class DirectiveHandler<T, E extends Element = Element> {
  target: Wrapper<T, E>;
  protected name: string;
  protected parameters = false;
  private matches: DirectiveMatch[];

  get el(): E {
    return this.target.el;
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
        })
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
    return evaluate(parsed, this.target.context);
  }

  start(wrapper: Wrapper<T, E>, variables: Variables<T>) {
    this.setTarget(wrapper);
    this.use(variables);
    for (const match of this.matches) {
      const value = this.eval(match.parsed);
      this.init?.(value, match);
      this.handle?.(value, match);
      for (const dep of match.parsed.dependencies) {
        this.target.subscribeTo(dep as keyof T, () => {
          this.handle?.(this.eval(match.parsed), match);
        });
      }
    }
  }
}
