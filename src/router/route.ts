import type {
  BlockOwnProps,
  BlockWithStandartProps,
} from '../components/block/block';
import { type ComponentClass } from '../utils/helpers';

type Props = { rootQuery: string | undefined };

export class Route<P extends BlockOwnProps> {
  _pathname: string;
  _blockClass: ComponentClass<P>;
  _block: BlockWithStandartProps | null;
  _props: Props;

  constructor(
    pathname: string,
    view: ComponentClass<P>,
    props: { rootQuery: string | undefined }
  ) {
    this._pathname = pathname;
    this._blockClass = view;
    this._block = null;
    this._props = props;
  }

  navigate(pathname: string) {
    if (this.match(pathname)) {
      this._pathname = pathname;
      this.render();
    }
  }

  leave() {
    if (this._block) {
      this._block.hide();
      this._block = null;
    }
  }

  match(pathname: string) {
    if (this._pathname === '/messenger') {
      const regExp = /^\/messenger(?:\/\d+)?\/?$/;
      return regExp.test(pathname);
    }

    return pathname === this._pathname;
  }

  render() {
    if (!this._block) {
      this._block = new this._blockClass({} as P);
      const el = this._block.element();

      if (el) {
        document.body.appendChild(el); //todo this._block.render(this._props.rootQuery, this._block);
      }

      return;
    }

    this._block.show();
  }
}
