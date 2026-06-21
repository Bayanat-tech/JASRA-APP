// Type definitions for create-react-class 15.7
import { ComponentClass, ComponentSpec } from 'react';

declare module 'create-react-class' {
  interface ClassicComponentClass<P> extends ComponentClass<P> {
    replaceState(nextState: any, callback?: () => void): void;
    isMounted(): boolean;
  }

  interface Statics {
    [key: string]: any;
  }

  function createReactClass<P = {}, S = {}>(spec: ComponentSpec<P, S> & Statics): ClassicComponentClass<P>;

  export = createReactClass;
}

declare global {
  interface Window {
    createReactClass: typeof createReactClass;
  }
}
