import type { BlockProps } from '../components/block/block';
import { checkUser } from '../services/auth';
import { checkChats } from '../services/chats';
import type { ComponentClass } from '../utils/helpers';
import { Route } from './route';

class Router {
  static __instance: Router | undefined;
  routes: Array<Route<BlockProps>> = [];
  history?: History;
  _currentRoute?: Route<BlockProps> | null;
  _rootQuery?: string;

  constructor(rootQuery: string) {
    if (Router.__instance) {
      return Router.__instance;
    }

    this.routes = [];
    this.history = window.history;
    this._currentRoute = null;
    this._rootQuery = rootQuery;

    Router.__instance = this;
  }

  use<P extends BlockProps>(pathname: string, block: ComponentClass<P>) {
    const route = new Route(pathname, block, { rootQuery: this._rootQuery });
    this.routes.push(route as unknown as Route<BlockProps>);

    return this;
  }

  start() {
    window.onpopstate = (e: PopStateEvent) => {
      if (e.currentTarget instanceof Window) {
        this._onRoute(e.currentTarget?.location.pathname);
      }
    };

    this._onRoute(window.location.pathname);
  }

  _go(pathname: string, route: Route<BlockProps> | undefined) {
    if (!route) {
      return;
    }

    if (this._currentRoute && !this._currentRoute.match(pathname)) {
      this._currentRoute.leave();
    }

    this._currentRoute = route;
    route.render();
  }

  _onRoute(pathname: string) {
    const route = this.getRoute(pathname);
    if (pathname !== '/' && pathname !== '/sign-up') {
      checkUser()
        .then((withUser) => {
          if (!withUser) {
            this.go('/');
          } else {
            if (pathname === '/messenger') {
              checkChats().then(() => {
                this._go(pathname, route);
              });
            } else {
              this._go(pathname, route);
            }
          }
        })
        .catch(() => {
          this.go('/');
        });
    } else {
      this._go(pathname, route);
    }
  }

  go(pathname: string) {
    this.history?.pushState({}, '', pathname);
    this._onRoute(pathname);
  }

  back() {
    this.history?.back();
  }

  forward() {
    this.history?.forward();
  }

  getRoute(pathname: string) {
    return this.routes.find((route) => route.match(pathname));
  }
}

const router = new Router('#app');

export default router;
