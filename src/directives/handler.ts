import { Wrapper } from '../wrappers/element';
import { ParseResult, parse } from '../parser/parser';
import { evaluate, pathSectionsToString } from '../parser/evaluate';
import { Variables } from '../core/variables';
import { flatUnique } from '../helpers';
import { setPath } from '../core/modifiers';
import { extractDirectiveMatches, DirectiveMatch } from './matches';

export abstract class DirectiveHandler<T, E extends HTMLElement = HTMLElement> {
  target: Wrapper<T, E>;

  protected name: string;

  protected parameters = false;

  protected preserveFunctionsWhenEvaluating = false;

  protected matches: DirectiveMatch[];

  get el(): E {
    return this.target.el;
  }

  get context() {
    return this.target.context;
  }

  private getMatches(el: E): DirectiveMatch[] {
    return extractDirectiveMatches({
      element: el,
      directiveName: this.name,
      parameters: this.parameters,
      parse: this.parse.bind(this)
    });
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
    return evaluate(parsed, this.context, this.preserveFunctionsWhenEvaluating);
  }

  protected set({ path, varName }: ParseResult, value: any) {
    const variable = this.context[varName as keyof T];
    if (!path.length) {
      variable.set(value);
    } else {
      setPath(variable, pathSectionsToString(path, this.context), value);
    }
  }

  /**
   * Applies a directive on a wrapper.
   *
   * Fails if the element is not present in the DOM,
   * Or there's no attribute pointing to the directive.
   */
  start(wrapper: Wrapper<T, E>, variables: Variables<T>) {
    this.setTarget(wrapper);
    if (this.matches.length) {
      this.use(variables);
      for (const match of this.matches) {
        this.init(this.eval(match.parsed), match);
        this.handle(this.eval(match.parsed), match);
        for (const dep of match.parsed.dependencies) {
          this.target.subscribeTo(dep as keyof T, () => {
            this.handle(this.eval(match.parsed), match);
          });
        }
      }
    }
  }
}
