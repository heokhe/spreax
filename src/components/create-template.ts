import { memoize } from '../helpers';
import { ComponentTemplate } from './component';

export const createTemplateElement = memoize(
  async (template: ComponentTemplate): Promise<HTMLTemplateElement> => {
    if (template instanceof HTMLTemplateElement)
      return template;
    if (template instanceof Promise)
      return template.then(createTemplateElement);
    const el = document.createElement('template');
    el.innerHTML = template;
    return el;
  }
);
