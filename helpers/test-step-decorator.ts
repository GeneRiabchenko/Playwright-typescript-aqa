import { test } from '@playwright/test';

// Decorator signatures are inherently loosely typed (any `this`, any args).
/* eslint-disable @typescript-eslint/no-unsafe-function-type, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */
export function step(target: Function, context: ClassMethodDecoratorContext) {
  return function replacementMethod(this: any, ...args: any) {
    const name = this.constructor.name + '.' + (context.name as string);
    return test.step(name, async () => {
      return await target.call(this, ...args);
    });
  };
}