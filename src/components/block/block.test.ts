import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type Mock,
} from 'vitest';
import { Block } from './block'; // Adjust the relative import path based on your folder structure
import type { BlockOwnProps, EventListType } from './block';

const mockHandlebarsMethods = vi.hoisted(() => ({
  compile: vi.fn<(template: string) => (props: unknown) => string>(),
}));

vi.mock('handlebars', () => ({
  default: {
    compile: mockHandlebarsMethods.compile,
  },
}));

interface CustomTestProps extends BlockOwnProps {
  text?: string;
}

class TestBlock extends Block<CustomTestProps> {
  protected template: string = '<div>{{text}}</div>';

  public exposedComponentDidMount = vi.fn<() => void>();
  public exposedComponentWillUnmount = vi.fn<() => void>();

  protected override componentDidMount(): void {
    this.exposedComponentDidMount();
  }

  protected override componentWillUnmount(): void {
    this.exposedComponentWillUnmount();
  }

  public setTestEvents(events: EventListType) {
    this.events = events;
  }
}

describe('Core Block Lifecycle Component', () => {
  let blockInstance: TestBlock;
  let renderTemplateStub: Mock<(props: unknown) => string>;

  beforeEach(() => {
    mockHandlebarsMethods.compile.mockReset();

    renderTemplateStub = vi.fn<(props: unknown) => string>(
      (props: unknown) =>
        `<div class="block-node">${(props as CustomTestProps).text ?? ''}</div>`
    );
    mockHandlebarsMethods.compile.mockReturnValue(renderTemplateStub);

    blockInstance = new TestBlock({ text: 'Initial Layout' });
  });

  afterEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  describe('Initialization & Property Pickups', () => {
    it('should assign initialization variables and expose configuration objects accurately', () => {
      expect(blockInstance.getTemplate()).toBe('<div>{{text}}</div>');
      expect(blockInstance.getEvents()).toEqual({});
      expect(blockInstance.element()).not.toBeNull();
    });
  });

  describe('Render Matrix & DOM Lifecycle Pipeline', () => {
    it('should invoke Handlebars compilation and assemble authentic HTML elements during standard render blocks', () => {
      const element = blockInstance.element();

      expect(mockHandlebarsMethods.compile).toHaveBeenCalledWith(
        '<div>{{text}}</div>'
      );
      expect(renderTemplateStub).toHaveBeenCalledWith({
        text: 'Initial Layout',
      });
      expect(element).toBeInstanceOf(HTMLElement);
      expect(element?.className).toBe('block-node');
      expect(blockInstance.exposedComponentDidMount).toHaveBeenCalledTimes(1);
    });

    it('should trigger state replacement and lifecycle updates when updating properties via setProps', () => {
      blockInstance.element(); // Initial compile pass
      blockInstance.setProps({ text: 'Updated State' });

      expect(renderTemplateStub).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'Updated State' })
      );
      expect(blockInstance.exposedComponentWillUnmount).toHaveBeenCalledTimes(
        1
      );
      expect(blockInstance.exposedComponentDidMount).toHaveBeenCalledTimes(2); // Initial mount + update re-mount
    });

    it('should accurately append event listeners to the DOM node during compilation cycles', () => {
      const clickSpy = vi.fn<(e: Event) => void>();
      blockInstance.setTestEvents({
        click: clickSpy,
      });

      const element = blockInstance.element() as HTMLElement;
      const targetClickEvent = new Event('click');

      element.dispatchEvent(targetClickEvent);

      expect(clickSpy).toHaveBeenCalledWith(targetClickEvent);
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Ref Parsers & Elements Registration', () => {
    it('should locate [ref] selectors within generated template fragments and map them to internal structures', () => {
      renderTemplateStub.mockReturnValue(
        '<div class="parent"><button ref="submitBtn">Click</button></div>'
      );

      const element = blockInstance.element();
      expect(element).not.toBeNull();

      type BlockRefsTestShape = {
        submitBtn: HTMLButtonElement;
      };

      const internalRefs = (
        blockInstance as unknown as { refs: BlockRefsTestShape }
      ).refs;

      expect(internalRefs).toBeDefined();
      expect(internalRefs.submitBtn).toBeInstanceOf(HTMLButtonElement);
      expect(internalRefs.submitBtn.getAttribute('ref')).toBeNull(); // Confirms attribute extraction cleanup fires accurately
    });
  });

  describe('Component Destruction & Structural Unmounting', () => {
    it('should clear element registries, release bindings, and displace nodes from viewports on hide()', () => {
      const parentContainer = document.createElement('div');
      const elementNode = blockInstance.element() as HTMLElement;

      parentContainer.appendChild(elementNode);
      document.body.appendChild(parentContainer);

      expect(parentContainer.contains(elementNode)).toBe(true);

      blockInstance.hide();

      expect(parentContainer.contains(elementNode)).toBe(false);
      expect(blockInstance.exposedComponentWillUnmount).toHaveBeenCalledTimes(
        1
      );
      expect(blockInstance['domElement' as keyof TestBlock]).toBeNull();
    });
  });

  describe('Composite Embedding Arrays Pipeline', () => {
    it('should iterate through custom __children properties and embed inner component arrays safely', () => {
      const innerChildBlock = new TestBlock({ text: 'Nested Component' });
      const embedSpy = vi.fn<(node: DocumentFragment) => void>();

      const mockChildRecord = {
        component: innerChildBlock,
        embed: embedSpy,
      };

      const compositionBlock = new TestBlock({
        __children: [mockChildRecord],
      });

      const element = compositionBlock.element();
      expect(element).not.toBeNull();

      const typedInstance = compositionBlock as unknown as {
        children: unknown[];
      };
      const childCollection = typedInstance.children;

      expect(childCollection.length).toBe(1);
      expect(childCollection[0]).toBe(innerChildBlock);
      expect(embedSpy).toHaveBeenCalledWith(expect.any(DocumentFragment));
    });
  });
});
