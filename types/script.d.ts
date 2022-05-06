declare type Callback<T> = (() => T) | (() => Promise<T>);
interface Script {
  <T extends unknown>(script: string, callback: Callback<T>): void;
  run(script?: string): Promise<unknown>;
}

export {
  Callback,
  Script,
};
