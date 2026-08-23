import Handlebars from 'handlebars';

type EventListType = Partial<
  Record<keyof HTMLElementEventMap, (e: Event) => void>
>;

export interface BlockOwnProps extends Record<string, unknown> {
  __children?: Array<{
    component: Block<Record<string, unknown>>;
    embed(node: DocumentFragment): void;
  }>;
  __refs?: Record<string, Element>;
}

export abstract class Block<Props extends BlockOwnProps> {
  protected abstract template: string;

  protected props = {} as Props;

  private domElement: Element | null = null;

  protected events: EventListType = {};

  protected refs: Record<string, Element> = {};

  protected children: Block<Record<string, unknown>>[] = [];

  constructor(props: Props = {} as Props) {
    this.props = props;
  }

  private attachListeners() {
    for (const eventName in this.events) {
      const eventCallback = this.events[eventName as keyof HTMLElementEventMap];

      if (typeof eventCallback == 'function' && this.domElement) {
        this.domElement.addEventListener(eventName, eventCallback);
      }
    }
  }

  private removeListeners() {
    for (const eventName in this.events) {
      const eventCallback = this.events[eventName as keyof HTMLElementEventMap];

      if (typeof eventCallback === 'function' && this.domElement) {
        this.domElement.removeEventListener(eventName, eventCallback);
      }
    }
  }

  protected componentDidMount() { }

  protected componentWillUnmount() { }

  private mountComponent() {
    this.attachListeners();
    this.componentDidMount();
  }

  private unmountComponent() {
    if (this.domElement) {
      this.children.reverse().forEach((child) => child.unmountComponent());
      this.componentWillUnmount();
      this.removeListeners();
    }
  }

  public element(): Element | null {
    if (!this.domElement) {
      this.render();
    }

    return this.domElement;
  }

  protected render() {
    this.unmountComponent();

    const fragment = this.compile();

    if (this.domElement && fragment) {
      this.domElement.replaceWith(fragment);
    }

    this.domElement = fragment;
    this.mountComponent();
  }

  private compile() {
    const html = Handlebars.compile(this.template)(this.props);

    const templateElement = document.createElement('template');
    templateElement.innerHTML = html;
    const fragment = templateElement.content;

    if (this.props.__children) {
      this.children = this.props.__children.map((child) => child.component);

      this.props.__children.forEach((child) => {
        child.embed(fragment);
      });
    }

    const defaultRefs = this.props?.__refs ?? {};

    this.refs = Array.from(fragment.querySelectorAll('[ref]')).reduce(
      (list, element) => {
        const key = element.getAttribute('ref') as string;
        list[key] = element as HTMLElement;
        element.removeAttribute('ref');
        return list;
      },
      defaultRefs
    );

    return templateElement.content.firstElementChild;
  }

  public setProps(props: Partial<Props>) {
    this.props = { ...this.props, ...props, __children: [], __refs: {} };
    this.render();
  }
}
