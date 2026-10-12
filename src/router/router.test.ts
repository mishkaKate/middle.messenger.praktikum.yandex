import { describe, it, expect, vi } from 'vitest';
import router from './router.ts';
import { Block, type BlockOwnProps } from '../components/block/block.ts';

export class HomeMock extends Block<BlockOwnProps> {
  static componentName = 'Home';
  protected template = '<div>home<div>';
}

class IconMock extends Block<BlockOwnProps> {
  static componentName = 'Icon';
  protected template = '<div>test icon<div>';
}

class ComponentMock1 extends Block<BlockOwnProps> {
  static componentName = 'ComponentMock1';
  protected template = '<div>Componen tMock 1 <div>';
}

class ComponentMock2 extends Block<BlockOwnProps> {
  static componentName = 'ComponentMock2';
  protected template = '<div>Componen tMock 2 <div>';
}

describe('Router tests', () => {
  it('router use pathname and return itself', () => {
    const result = router
      .use('/test', IconMock)
      .use('/', HomeMock)
      .use('/com1', ComponentMock1)
      .use('/com2', ComponentMock2);

    expect(result).toEqual(router);
    expect(router.routes.length).toBe(4);
    expect(router.routes[0]._pathname).toBe('/test');

    router.start();
  });

  it('router go', () => {
    const spyOnRoute = vi.spyOn(router, '_onRoute');
    router.go('/test');

    expect(spyOnRoute).toHaveBeenCalledWith('/test');
    expect(window.location.pathname).toBe('/test');
  });

  it('back', () => {
    const spyOnBack = vi.spyOn(window.history, 'back');
    router.go('/com1');
    router.go('/com2');

    router.back();
    expect(spyOnBack).toHaveBeenCalled();
  });

  it('forward', () => {
    const spyOnForward = vi.spyOn(window.history, 'forward');
    router.go('/com1');
    router.go('/com2');

    router.back();
    router.forward();
    expect(spyOnForward).toHaveBeenCalled();
  });
});
