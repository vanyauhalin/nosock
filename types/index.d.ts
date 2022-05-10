interface Context {
  rejected: number;
  scripts: Record<string, () => Promise<unknown>>;
}

interface Logger {
  (type: string, message?: string): Logger;
  error: {
    (message: string): Logger;
    trace(message: string): Logger;
  };
  done(message: string): Logger;
  empty(message?: string): Logger;
  warn(message: string): Logger;
}

interface Script {
  <C extends () => unknown>(
    cmd: string,
    callback: C,
  ): () => (
    Promise<C extends () => Promise<unknown>
      ? Awaited<ReturnType<C>>
      : ReturnType<C>>
  );
}

export {
  Context,
  Logger,
  Script,
};
