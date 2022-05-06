interface Logger {
  (type: string, message?: string): void;
  error: {
    (message: string): void;
    trace(message: string): void;
  };
  done(message: string): void;
  empty(): void;
  warn(message: string): void;
}
declare type Types = 'done' | 'error' | 'warn';

export {
  Logger,
  Types,
};
