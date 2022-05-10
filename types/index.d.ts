interface Context {
  rejected: number;
  scripts: Record<string, ContextScript>;
}
type ContextScript = {
  cmd: string;
  cb(): Promise<unknown>;
};

interface Logger {
  (type: string, message?: string): Logger;
  done(message: string): Logger;
  empty(message?: string): Logger;
  error(message: string): Logger;
  trace(err: Error): Logger;
  warn(message: string): Logger;
}

interface Script {
  <C extends () => unknown>(cmd: string, cb: C): () => (
    Promise<C extends () => Promise<unknown>
      ? Awaited<ReturnType<C>>
      : ReturnType<C>>
  );
}

export {
  Context,
  ContextScript,
  Logger,
  Script,
};
