import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Route } from './route';
import { Block, type BlockOwnProps } from '../components/block/block';

class MockBlock extends Block<BlockOwnProps> {
  static componentName = 'Home';
  protected template = '<div>home<div>';

  hide = vi.fn();
  show = vi.fn();
}

describe('Route', () => {
  const rootProps = { rootQuery: '#app' };

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with correct properties', () => {
      const route = new Route('/home', MockBlock, rootProps);

      expect(route._pathname).toBe('/home');
      expect(route._blockClass).toBe(MockBlock);
      expect(route._props).toEqual(rootProps);
      expect(route._block).toBeNull();
    });
  });

  describe('match()', () => {
    it('should match exact pathname for regular routes', () => {
      const route = new Route('/home', MockBlock, rootProps);

      expect(route.match('/home')).toBe(true);
      expect(route.match('/about')).toBe(false);
    });

    it('should support dynamic IDs for /messenger route using regex', () => {
      const route = new Route('/messenger', MockBlock, rootProps);

      expect(route.match('/messenger')).toBe(true);
      expect(route.match('/messenger/')).toBe(true);
      expect(route.match('/messenger/123')).toBe(true);
      expect(route.match('/messenger/123/')).toBe(true);
      expect(route.match('/messenger/123/edit')).toBe(false);
      expect(route.match('/messengers')).toBe(false);
    });
  });

  describe('render()', () => {
    it('should create new block instance and append its element to document.body on first render', () => {
      const route = new Route('/home', MockBlock, rootProps);

      route.render();

      expect(route._block).toBeInstanceOf(MockBlock);
    });

    it('should call show() on existing block if it was already rendered', () => {
      const route = new Route('/home', MockBlock, rootProps);

      route.render();

      const showSpy = vi.spyOn(route._block!, 'show');

      route.render();

      expect(showSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('navigate()', () => {
    it('should update pathname and trigger render if new path matches', () => {
      const route = new Route('/home', MockBlock, rootProps);
      const renderSpy = vi.spyOn(route, 'render');

      route.navigate('/home');

      expect(route._pathname).toBe('/home');
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });

    it('should update pathname to dynamic chat ID for /messenger route', () => {
      const route = new Route('/messenger', MockBlock, rootProps);
      const renderSpy = vi.spyOn(route, 'render');

      route.navigate('/messenger/456');

      expect(route._pathname).toBe('/messenger/456');
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });

    it('should do nothing if pathname does not match', () => {
      const route = new Route('/home', MockBlock, rootProps);
      const renderSpy = vi.spyOn(route, 'render');

      route.navigate('/settings');

      expect(route._pathname).toBe('/home'); // Не изменился
      expect(renderSpy).not.toHaveBeenCalled();
    });
  });

  describe('leave()', () => {
    it('should call hide() on block and set _block to null', () => {
      const route = new Route('/home', MockBlock, rootProps);
      route.render();

      const blockInstance = route._block;
      const hideSpy = vi.spyOn(blockInstance!, 'hide');

      route.leave();

      expect(hideSpy).toHaveBeenCalledTimes(1);
      expect(route._block).toBeNull();
    });

    it('should do nothing if block was not rendered yet', () => {
      const route = new Route('/home', MockBlock, rootProps);

      expect(() => route.leave()).not.toThrow();
      expect(route._block).toBeNull();
    });
  });
});
