import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Form } from './form';
import { Input } from '../input/input';

const mockInputMethods = vi.hoisted(() => ({
  validate: vi.fn<() => boolean>(),
}));

vi.mock('../input/input', () => {
  const MockInputClass = class {
    private _element: HTMLElement;
    constructor({ name, value }: { name: string; value: string }) {
      this._element = document.createElement('div');
      const innerInput = document.createElement('input');
      innerInput.setAttribute('name', name);
      innerInput.value = value;
      this._element.appendChild(innerInput);
    }
    element(): HTMLElement {
      return this._element;
    }
    validate = mockInputMethods.validate;
  };
  return {
    Input: MockInputClass,
  };
});

vi.mock('../block/block', () => {
  return {
    Block: class<P> {
      public props: P;
      public children: unknown[] = [];
      constructor(props: P) {
        this.props = props;
      }
    },
  };
});

vi.mock('./form.hbs?raw', () => ({
  default: '',
}));

interface TestFormData {
  username: string;
  email: string;
}

describe('Form Class Component', () => {
  let formInstance: Form<TestFormData>;

  beforeEach(() => {
    mockInputMethods.validate.mockReset();
    formInstance = new Form({});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should maintain the accurate static componentName label contract metadata', () => {
    expect(Form.componentName).toBe('Form');
  });

  describe('validate() functional evaluation tracks', () => {
    it('should aggregate matching input data properties into a single payload and return isValid: true if all inputs validate successfully', () => {
      const inputOne = new Input({ name: 'username', value: 'alex_code' });
      const inputTwo = new Input({ name: 'email', value: 'alex@example.com' });

      formInstance['children'] = [inputOne, inputTwo];
      mockInputMethods.validate.mockReturnValue(true);

      const result = formInstance.validate();

      expect(result.isValid).toBe(true);
      expect(result.submitObject).toEqual({
        username: 'alex_code',
        email: 'alex@example.com',
      });
      expect(mockInputMethods.validate).toHaveBeenCalledTimes(2);
    });

    it('should capture field updates but return isValid: false if at least one underlying child fails checking requirements', () => {
      const inputOne = new Input({
        name: 'username',
        value: 'broken_user_name',
      });
      formInstance['children'] = [inputOne];

      mockInputMethods.validate.mockReturnValue(false);

      const result = formInstance.validate();

      expect(result.isValid).toBe(false);
      expect(result.submitObject).toEqual({ username: 'broken_user_name' });
    });

    it('should gracefully skip payload assignments if structural element nodes or input tags are missing', () => {
      const detachedInput = new Input({
        name: 'hidden_field',
        value: 'hidden_val',
      });

      vi.spyOn(detachedInput, 'element').mockReturnValue(
        null as unknown as HTMLElement
      );
      formInstance['children'] = [detachedInput];

      const result = formInstance.validate();

      expect(result.isValid).toBe(true);
      expect(result.submitObject).toEqual({}); // Empty object because execution breaks early on missing DOM nodes
    });
  });

  describe('Submit event handling handlers (`submit`)', () => {
    it('should fire the internal onSubmit delegate callback with the parsed form dataset if validation criteria matches completely', () => {
      const inputOne = new Input({ name: 'username', value: 'validated_user' });
      formInstance['children'] = [inputOne];
      mockInputMethods.validate.mockReturnValue(true);

      const onSubmitSpy = vi.fn<(_result: TestFormData) => void>();
      formInstance.onSubmit = onSubmitSpy;

      const preventDefaultSpy = vi.fn<() => void>();
      const mockEvent = {
        preventDefault: preventDefaultSpy,
      } as unknown as Event;

      type FormEventsStructure = {
        submit: (e: Event) => void;
      };

      const eventsObject = (
        formInstance as unknown as { events: FormEventsStructure }
      ).events;

      eventsObject.submit(mockEvent);

      expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
      expect(onSubmitSpy).toHaveBeenCalledWith({ username: 'validated_user' });
      expect(onSubmitSpy).toHaveBeenCalledTimes(1);
    });

    it('should prevent default event actions but refuse to invoke onSubmit if data parameters contain validation errors', () => {
      const inputOne = new Input({ name: 'username', value: 'invalid_name' });
      formInstance['children'] = [inputOne];
      mockInputMethods.validate.mockReturnValue(false);

      const onSubmitSpy = vi.fn<(_result: TestFormData) => void>();
      formInstance.onSubmit = onSubmitSpy;

      const preventDefaultSpy = vi.fn<() => void>();
      const mockEvent = {
        preventDefault: preventDefaultSpy,
      } as unknown as Event;

      type FormEventsStructure = {
        submit: (e: Event) => void;
      };

      const eventsObject = (
        formInstance as unknown as { events: FormEventsStructure }
      ).events;

      eventsObject.submit(mockEvent);

      expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
      expect(onSubmitSpy).not.toHaveBeenCalled();
    });
  });
});
