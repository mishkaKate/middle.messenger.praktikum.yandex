import { Block, type BlockOwnProps } from '../block/block';
import { Input } from '../input/input';
import tmpl from './form.hbs?raw';

type Props = BlockOwnProps & {
  valid: boolean;
};

export class Form<T> extends Block<Props> {
  static componentName = 'Form';
  protected template = tmpl;
  onSubmit = (_result: T) => { };
  validate = () => {
    let isValid = true;
    const submitObject = {};

    this.children.forEach((ch) => {
      if (ch instanceof Input) {
        const isInputValid = ch.validate();
        const element = ch.element();

        if (!element || !(element.children[0] instanceof HTMLInputElement)) {
          return;
        }

        const key = element.children[0].getAttribute('name');
        const value = element.children[0].value;

        if (key) {
          Object.defineProperty(submitObject, key, {
            value,
            enumerable: true,
          });
        }

        if (!isInputValid) {
          isValid = false;
        }
      }
    });

    return { isValid, submitObject };
  }

  protected events = {
    submit: (e: Event) => {
      e.preventDefault();
      const { isValid, submitObject } = this.validate();

      if (isValid) {
        this.onSubmit(submitObject as T);
      }
    },
  };
}
