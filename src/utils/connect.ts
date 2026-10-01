import type { BlockOwnProps } from '../components/block/block';
import store, { type State } from '../store';
import type { ComponentClass, Indexed } from './helpers';

export function connect<P extends BlockOwnProps>(
  Component: ComponentClass<P>,
  mapStateToProps: (state: State) => Indexed
): ComponentClass<P> {
  return class extends Component {
    protected template: string = this.getTemplate();
    constructor(props: P) {
      super({ ...props, ...mapStateToProps(store.getState()) });

      store.subscribe(() => {
        this.setProps({ ...mapStateToProps(store.getState()) } as unknown as P);
      });
    }
  };
}
