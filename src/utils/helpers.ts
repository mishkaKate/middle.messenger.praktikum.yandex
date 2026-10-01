import handlebars, { type HelperOptions } from 'handlebars';
import { Block, type BlockProps } from '../components/block/block';

type PlainObject<T = unknown> = {
  [k in string]: T;
};

export type Indexed<T = unknown> = {
  [k in string | symbol]: T;
};
export interface ComponentClass<P extends BlockProps> {
  new (props: P): Block<P>;
  componentName: string;
}

let uniqueId = 0;

export function registerComponent(Component: ComponentClass<BlockProps>) {
  handlebars.registerHelper(
    Component.componentName,
    function (this: unknown, { hash, data }: HelperOptions) {
      const dataAttribute = `data-component-hbs-id="${++uniqueId}"`;
      const component = new Component(hash as BlockProps);

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

function isPlainObject(value: unknown): value is PlainObject {
  return (
    typeof value === 'object' &&
    value !== null &&
    value.constructor === Object &&
    Object.prototype.toString.call(value) === '[object Object]'
  );
}

function isArray(value: unknown): value is [] {
  return Array.isArray(value);
}

function isArrayOrObject(value: unknown): value is [] | PlainObject {
  return isPlainObject(value) || isArray(value);
}

export function isEqual(lhs: PlainObject, rhs: PlainObject) {
  if (Object.keys(lhs).length !== Object.keys(rhs).length) {
    return false;
  }

  for (const [key, value] of Object.entries(lhs)) {
    const rightValue = rhs[key];
    if (isArrayOrObject(value) && isArrayOrObject(rightValue)) {
      if (isEqual(value as PlainObject, rightValue as PlainObject)) {
        continue;
      }
      return false;
    }

    if (value !== rightValue) {
      return false;
    }
  }

  return true;
}

export function merge(lhs: Indexed, rhs: Indexed): Indexed {
  for (const p in rhs) {
    if (!Object.prototype.hasOwnProperty.call(rhs, p)) {
      continue;
    }

    try {
      if (typeof rhs[p] === 'object') {
        rhs[p] = merge(lhs[p] as Indexed, rhs[p] as Indexed);
      } else {
        lhs[p] = rhs[p];
      }
    } catch {
      lhs[p] = rhs[p];
    }
  }

  return lhs;
}

export function set(object: Indexed, path: string, value: unknown): Indexed {
  if (typeof object !== 'object') {
    return object || {};
  }

  if (typeof path !== 'string') {
    throw new Error('path must be string');
  }

  const keys = path.split('.');

  const obj = keys.reduceRight<Indexed>((acc, cur) => {
    return { [cur]: acc };
  }, value as Indexed);

  return merge(object as Indexed, obj as Indexed);
}

export function getImageSource(path: string) {
  return `https://ya-praktikum.tech/api/v2/resources${path}`;
}
