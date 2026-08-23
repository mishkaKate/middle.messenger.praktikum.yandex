import handlebars, { type HelperOptions } from 'handlebars';
import { Block, type BlockOwnProps } from '../components/block/block';

interface ComponentClass<P extends BlockOwnProps> {
  new (props: P): Block<P>;
  componentName: string;
}

let uniqueId = 0;

export function registerComponent<P extends BlockOwnProps>(
  Component: ComponentClass<P>
) {
  handlebars.registerHelper(
    Component.componentName,
    function (this: unknown, { hash, data }: HelperOptions) {
      const dataAttribute = `data-component-hbs-id="${++uniqueId}"`;
      const component = new Component(hash as P);

      if ('ref' in hash) {
        (data.root.__refs = data.root.__refs || {})[hash.ref] =
          component.element();
      }

      (data.root.__children = data.root.__children || []).push({
        component,
        embed(node: DocumentFragment) {
          const placeholder = node.querySelector(`[${dataAttribute}]`);
          if (!placeholder) {
            throw new Error(
              `Can't find data-id for component ${Component.componentName}`
            );
          }

          const element = component.element();

          if (element) {
            placeholder.replaceWith(element);
          }
        },
      });

      return `<div ${dataAttribute}></div>`;
    }
  );
}
