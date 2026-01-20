export declare const FLAGS: {
  readonly empty: unique symbol;
};

export declare type CircularHistoryType = number | string | bigint | boolean | symbol | object;

type DataType = "number" | "string" | "bigint" | "boolean" | "symbol" | "object";

export declare class CircularHistory<T extends CircularHistoryType = CircularHistoryType> {
  constructor(capacity: number, dataType: DataType);

  commit(value: T): void;

  current(): T | typeof FLAGS.empty;

  moveBackward(): void;

  moveForward(): void;

  clear(): void;

  dump(discardHoles?: boolean): T[];

  getCurrentIndex(): number;

  isStartReached(): boolean;

  isEndReached(): boolean;

  static readonly FLAGS: typeof FLAGS;
}
