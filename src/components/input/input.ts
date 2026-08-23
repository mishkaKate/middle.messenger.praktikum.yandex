import { Block, type BlockOwnProps } from '../block/block';
import { Error } from '../error/error';
import inputTmpl from './input.hbs?raw';

type Props = BlockOwnProps & {
  placeholder: string;
  type: string;
  name: string;
  id: string;
  validationRule: 'string';
};

export class Input extends Block<Props> {
  static componentName = 'Input';
  protected template = inputTmpl;

  validate() {
    const regex = new RegExp(this.props.validationRule);
    const element = this.element();

    if (!element || !(this.refs.input instanceof HTMLInputElement)) {
      return true;
    }

    let result = true;

    const value = this.refs.input.value;
    const regexResult = regex.test(value);

    if (!regexResult) {
      result = regexResult;
    }

    Array.from(this.children).forEach((element) => {
      if (element instanceof Error) {
        element.setProps({
          text: regexResult ? '' : 'Ошибка валидации',
        });
      }
    });

    return result;
  }

  protected events = {
    focusout: () => {
      this.validate();
    },
  };
}
