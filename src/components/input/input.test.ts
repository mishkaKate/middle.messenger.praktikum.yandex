import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Input } from './input';
import { Error as ErrorComponent } from '../error/error';
import type { Props } from './input';
import type { Block } from '../block/block';

const mockErrorMethods = vi.hoisted(() => ({
  setProps: vi.fn<(props: { text: string }) => void>(),
}));

vi.mock('../error/error', () => {
  return {
    Error: class {
      setProps = mockErrorMethods.setProps;
    },
  };
});

vi.mock('../block/block', () => {
  return {
    Block: class<P> {
      public props: P;
      public refs: Record<string, unknown> = {};
      public children: unknown[] = [];
      private _element: HTMLElement | null = null;

      constructor(props: P) {
        this.props = props;
      }

      element(): HTMLElement | null {
        return this._element;
      }

      setMockElement(el: HTMLElement | null) {
        this._element = el;
      }
    },
  };
});

vi.mock('./input.hbs?raw', () => ({
  default: '',
}));

describe('Input Component', () => {
  let inputInstance: Input;
  let simulatedInputNode: HTMLInputElement;
  let simulatedWrapperNode: HTMLElement;

  beforeEach(() => {
    mockErrorMethods.setProps.mockReset();

    const initialProps: Props = {
      validationRule: '^[A-Za-z]+$',
      name: 'username_field',
    };
    inputInstance = new Input(initialProps);

    simulatedWrapperNode = document.createElement('div');
    simulatedInputNode = document.createElement('input');
    simulatedInputNode.setAttribute('name', 'username_field');
    simulatedWrapperNode.appendChild(simulatedInputNode);

    (
      inputInstance as unknown as { setMockElement: (el: HTMLElement) => void }
    ).setMockElement(simulatedWrapperNode);
    inputInstance['refs'].input = simulatedInputNode;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should maintain the accurate static componentName label contract metadata', () => {
    expect(Input.componentName).toBe('Input');
  });

  describe('validate() workflow pipelines', () => {
    it('should immediately validate as true if no validationRule layout string is provided', () => {
      const cleanInput = new Input({ name: 'unvalidated_field' });
      expect(cleanInput.validate()).toBe(true);
    });

    it('should validate as true and clear inner child errors if values match the validationRule criteria', () => {
      simulatedInputNode.value = 'ValidLettersOnly';

      const errorChildInstance = new ErrorComponent({});
      inputInstance['children'] = [errorChildInstance];

      const validationResult = inputInstance.validate();

      expect(validationResult).toBe(true);
      expect(mockErrorMethods.setProps).toHaveBeenCalledWith({ text: '' });
      expect(mockErrorMethods.setProps).toHaveBeenCalledTimes(1);
    });

    it('should validate as false and update error children text metadata if input entries break validationRule constraints', () => {
      simulatedInputNode.value = 'Invalid123NumbersBreakThis!'; // contains numbers, violating the regex rule

      const errorChildInstance = new ErrorComponent({});
      inputInstance['children'] = [errorChildInstance];

      const validationResult = inputInstance.validate();

      expect(validationResult).toBe(false);
      expect(mockErrorMethods.setProps).toHaveBeenCalledWith({
        text: 'Ошибка валидации',
      });
      expect(mockErrorMethods.setProps).toHaveBeenCalledTimes(1);
    });

    it('should gracefully return true and terminate operations early if internal DOM element links or ref contexts are missing', () => {
      (
        inputInstance as unknown as { setMockElement: (el: null) => void }
      ).setMockElement(null);

      expect(inputInstance.validate()).toBe(true);
      expect(mockErrorMethods.setProps).not.toHaveBeenCalled();
    });
  });

  describe('setError() layout operations', () => {
    it('should discover and iterate through child elements updating specific Error instances', () => {
      const firstErrorChild = new ErrorComponent({});
      const randomUnrelatedChildObj = {
        randomProperty: true,
      } as unknown as Block<Record<string, unknown>>;
      const secondErrorChild = new ErrorComponent({});

      inputInstance['children'] = [
        firstErrorChild,
        randomUnrelatedChildObj,
        secondErrorChild,
      ];

      inputInstance.setError('Custom runtime form validation message alert');

      expect(mockErrorMethods.setProps).toHaveBeenCalledWith({
        text: 'Custom runtime form validation message alert',
      });
      expect(mockErrorMethods.setProps).toHaveBeenCalledTimes(2);
    });
  });

  describe('Focusout structural event maps', () => {
    it('should intercept focusout events and forward execution into the internal validate framework engine', () => {
      const validateSpy = vi.spyOn(inputInstance, 'validate');

      type InputEventsStructure = {
        focusout: () => void;
      };

      const eventsObject = (
        inputInstance as unknown as { events: InputEventsStructure }
      ).events;
      const focusoutCallback = eventsObject.focusout;

      expect(typeof focusoutCallback).toBe('function');
      focusoutCallback();

      expect(validateSpy).toHaveBeenCalledTimes(1);
    });
  });
});
