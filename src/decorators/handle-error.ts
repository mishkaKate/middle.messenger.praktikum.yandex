export type ErrorHandler = (error: unknown) => void;

export function handleError(errorHandler: ErrorHandler) {
  return function <T, Args extends unknown[], Return>(
    _target: T,
    _propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<
      (...args: Args) => Promise<Return | void>
    >
  ): TypedPropertyDescriptor<(...args: Args) => Promise<Return | void>> {
    const originalMethod = descriptor.value;

    if (!originalMethod) {
      return descriptor;
    }

    descriptor.value = async function (
      this: T,
      ...args: Args
    ): Promise<Return | void> {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        errorHandler(error);
      }
    };

    return descriptor;
  };
}

export function errorHandlerDefault(error: unknown) {
  console.log(error);
}
