import { test, describe, expect } from "vitest";
import { CircularHistory } from "./circular-history.js";

describe("CircularHistory", () => {
  test("should throw if capacity is not a positive integer", () => {
    expect(() => new CircularHistory(0, "number")).toThrow();
    expect(() => new CircularHistory(-5, "number")).toThrow();
    expect(() => new CircularHistory(3.5, "number")).toThrow();
    expect(() => new CircularHistory("10", "number")).toThrow();
  });

  test("should throw if data type is not allowed", () => {
    expect(() => new CircularHistory(5, "invalidType")).toThrow();
    expect(() => new CircularHistory(5, 123)).toThrow();
    expect(() => new CircularHistory(5, null)).toThrow();
  });

  test("should successfully create a CircularHistory with valid parameters", () => {
    var historyNumber = new CircularHistory(5, "number");
    expect(historyNumber).toBeInstanceOf(CircularHistory);

    var historyString = new CircularHistory(10, "string");
    expect(historyString).toBeInstanceOf(CircularHistory);

    var historyBigInt = new CircularHistory(3, "bigint");
    expect(historyBigInt).toBeInstanceOf(CircularHistory);

    var historyBoolean = new CircularHistory(7, "boolean");
    expect(historyBoolean).toBeInstanceOf(CircularHistory);

    var historySymbol = new CircularHistory(2, "symbol");
    expect(historySymbol).toBeInstanceOf(CircularHistory);

    var historyObject = new CircularHistory(4, "object");
    expect(historyObject).toBeInstanceOf(CircularHistory);
  });

  test("should not commit invalid data types", () => {
    var historyNumber = new CircularHistory(5, "number");
    expect(() => historyNumber.commit("string")).toThrow();
    expect(() => historyNumber.commit(true)).toThrow();
    expect(() => historyNumber.commit({})).toThrow();
    expect(() => historyNumber.commit([])).toThrow();
    expect(() => historyNumber.commit(Symbol("sym"))).toThrow();
    expect(() => historyNumber.commit(10n)).toThrow();

    var historyString = new CircularHistory(5, "string");
    expect(() => historyString.commit(100)).toThrow();
    expect(() => historyString.commit(false)).toThrow();
    expect(() => historyString.commit({})).toThrow();
    expect(() => historyString.commit([])).toThrow();
    expect(() => historyString.commit(Symbol("sym"))).toThrow();
    expect(() => historyString.commit(10n)).toThrow();

    var historyBigInt = new CircularHistory(5, "bigint");
    expect(() => historyBigInt.commit(100)).toThrow();
    expect(() => historyBigInt.commit("string")).toThrow();
    expect(() => historyBigInt.commit(true)).toThrow();
    expect(() => historyBigInt.commit({})).toThrow();
    expect(() => historyBigInt.commit(Symbol("sym"))).toThrow();
    expect(() => historyBigInt.commit(10.5)).toThrow();

    var historyBoolean = new CircularHistory(5, "boolean");
    expect(() => historyBoolean.commit(100)).toThrow();
    expect(() => historyBoolean.commit("string")).toThrow();
    expect(() => historyBoolean.commit({})).toThrow();
    expect(() => historyBoolean.commit([])).toThrow();
    expect(() => historyBoolean.commit(Symbol("sym"))).toThrow();
    expect(() => historyBoolean.commit(10n)).toThrow();

    var historySymbol = new CircularHistory(5, "symbol");
    expect(() => historySymbol.commit(100)).toThrow();
    expect(() => historySymbol.commit("string")).toThrow();
    expect(() => historySymbol.commit(true)).toThrow();
    expect(() => historySymbol.commit({})).toThrow();
    expect(() => historySymbol.commit(10n)).toThrow();

    var historyObject = new CircularHistory(5, "object");
    expect(() => historyObject.commit(100)).toThrow();
    expect(() => historyObject.commit("string")).toThrow();
    expect(() => historyObject.commit(true)).toThrow();
    expect(() => historyObject.commit(Symbol("sym"))).toThrow();
    expect(() => historyObject.commit(10n)).toThrow();
  });

  test("should get an empty flag if history is empty", () => {
    var history = new CircularHistory(5, "number");
    expect(history.current()).toEqual(CircularHistory.FLAGS.empty);
  });

  test("should wrap around when capacity is exceeded", () => {
    var history = new CircularHistory(3, "number");

    history.commit(1);
    history.commit(2);
    history.commit(3);

    expect(history.current()).toBe(3);
    history.commit(4);

    expect(history.current()).toBe(4);
    expect(history.dump(true)).toEqual([4, 2, 3]);
  });

  test("should move backward and forward (no wrapping)", () => {
    var history = new CircularHistory(3, "number");

    history.commit(1);
    history.commit(2);
    history.commit(3);
    expect(history.current()).toBe(3);

    history.moveBackward();
    expect(history.current()).toBe(2);

    history.moveBackward();
    expect(history.current()).toBe(1);

    history.moveBackward();
    expect(history.current()).toBe(CircularHistory.FLAGS.empty);

    history.moveBackward();
    expect(history.current()).toBe(CircularHistory.FLAGS.empty);
    expect(history.getCurrentIndex()).toBe(-1);

    history.moveForward();
    expect(history.current()).toBe(1);

    history.moveForward();
    expect(history.current()).toBe(2);

    history.moveForward();
    expect(history.current()).toBe(3);

    history.moveForward();
    expect(history.current()).toBe(3);
  });

  test("should move backward and forward (with wrapping)", () => {
    var history = new CircularHistory(3, "number");
    history.commit(1);
    history.commit(2);
    history.commit(3);
    expect(history.getCurrentIndex()).toBe(2);
    history.commit(4);

    expect(history.current()).toBe(4);
    expect(history.getCurrentIndex()).toBe(0);

    history.moveBackward();
    expect(history.current()).toBe(3);

    history.moveBackward();
    expect(history.current()).toBe(2);

    history.moveBackward();
    expect(history.current()).toBe(2);

    history.moveForward();
    expect(history.current()).toBe(3);

    history.moveForward();
    expect(history.current()).toBe(4);

    history.moveForward();
    expect(history.current()).toBe(4);
  });

  test("should override items ahead after moving backward", () => {
    var history = new CircularHistory(2, "number");

    history.commit(1);
    expect(history.current()).toBe(1);

    history.commit(2);
    expect(history.current()).toBe(2);

    history.moveBackward();
    expect(history.current()).toBe(1);

    history.commit(3);
    expect(history.current()).toBe(3);

    history.moveBackward();
    expect(history.current()).toBe(1);

    history.moveForward();
    expect(history.current()).toBe(3);

    history.moveForward();
    expect(history.current()).toBe(3);
  });

  test("should clear the history correctly", () => {
    var history = new CircularHistory(3, "number");

    history.commit(1);
    history.commit(2);
    history.commit(3);

    expect(history.current()).toBe(3);

    history.clear();
    expect(history.current()).toEqual(CircularHistory.FLAGS.empty);
    expect(history.getCurrentIndex()).toBe(-1);

    history.commit(4);

    expect(history.current()).toBe(4);
    expect(history.getCurrentIndex()).toBe(0);
  });

  test("should return back the current history state with empty values", () => {
    var history = new CircularHistory(3, "number");
    history.commit(1);
    history.commit(2);
    expect(history.dump()).toEqual([1, 2, undefined]);
  });

  test("should return back the current history state without empty values", () => {
    var history = new CircularHistory(3, "number");
    history.commit(1);
    history.commit(2);
    expect(history.dump(true)).toEqual([1, 2]);
  });

  test("should return back the correct current pointer position", () => {
    var history = new CircularHistory(3, "number");
    expect(history.getCurrentIndex()).toBe(-1);

    history.commit(1);
    expect(history.getCurrentIndex()).toBe(0);

    history.commit(2);
    expect(history.getCurrentIndex()).toBe(1);

    history.commit(3);
    expect(history.getCurrentIndex()).toBe(2);

    history.commit(4);
    expect(history.getCurrentIndex()).toBe(0);

    history.commit(5);
    expect(history.getCurrentIndex()).toBe(1);

    history.moveBackward();
    expect(history.getCurrentIndex()).toBe(0);

    history.moveBackward();
    expect(history.getCurrentIndex()).toBe(2);

    history.moveForward();
    expect(history.getCurrentIndex()).toBe(0);

    history.moveForward();
    expect(history.getCurrentIndex()).toBe(1);

    history.moveForward();
    expect(history.getCurrentIndex()).toBe(1);

    history.moveForward();
    expect(history.getCurrentIndex()).toBe(1);
  });

  test("should correctly identify when start is reached", () => {
    var history = new CircularHistory(3, "number");
    expect(history.isStartReached()).toBe(true);

    history.commit(1);
    expect(history.isStartReached()).toBe(false);

    history.commit(2);
    expect(history.isStartReached()).toBe(false);

    history.moveBackward();
    expect(history.isStartReached()).toBe(false);

    history.moveBackward();
    expect(history.isStartReached()).toBe(true);

    history.moveBackward();
    expect(history.isStartReached()).toBe(true);
  });

  test("should correctly identify when end is reached", () => {
    var history = new CircularHistory(3, "number");
    expect(history.isEndReached()).toBe(true);

    history.commit(1);
    history.commit(2);
    expect(history.current()).toBe(2);

    history.moveForward();
    expect(history.isEndReached()).toBe(true);

    history.moveBackward();
    expect(history.current()).toBe(1);
    expect(history.isEndReached()).toBe(false);

    history.moveBackward();
    expect(history.current()).toBe(CircularHistory.FLAGS.empty);
    expect(history.isEndReached()).toBe(false);

    history.moveForward();
    expect(history.current()).toBe(1);
    expect(history.isEndReached()).toBe(false);

    history.moveForward();
    expect(history.current()).toBe(2);
    expect(history.isEndReached()).toBe(true);

    history.moveForward();
    expect(history.current()).toBe(2);
    expect(history.isEndReached()).toBe(true);
  });

  test("should return the last available item when capacity is not reached, the next item is empty and moving forward", () => {
    var history = new CircularHistory(3, "number");

    history.commit(1);
    history.commit(2);
    expect(history.current()).toBe(2);

    history.moveForward();
    expect(history.current()).toBe(2);

    history.moveForward();
    expect(history.current()).toBe(2);

    history.moveBackward();
    expect(history.current()).toBe(1);

    history.moveBackward();
    expect(history.current()).toBe(CircularHistory.FLAGS.empty);

    history.moveBackward();
    expect(history.current()).toBe(CircularHistory.FLAGS.empty);

    history.moveForward();
    expect(history.current()).toBe(1);

    history.moveForward();
    expect(history.current()).toBe(2);

    history.moveForward();
    expect(history.current()).toBe(2);
  });

  test("should behave correctly after multiple backward moves against empty history", () => {
    var history = new CircularHistory(3, "number");

    history.moveBackward();
    history.moveBackward();
    history.moveBackward();

    history.commit(4);
    expect(history.dump(true)).toEqual([4]);
    expect(history.getCurrentIndex()).toBe(0);
    expect(history.current()).toBe(4);
  });

  test("should behave correctly after multiple forward moves against empty history", () => {
    var history = new CircularHistory(3, "number");

    history.moveForward();
    history.moveForward();
    history.moveForward();

    history.commit(3);
    expect(history.dump(true)).toEqual([3]);
    expect(history.getCurrentIndex()).toBe(0);

    history.commit(5);
    expect(history.dump(true)).toEqual([3, 5]);

    history.moveForward();
    history.moveForward();

    expect(history.current()).toBe(5);
  });

  test("should not expose the next item after discarding previous after moving backwards", () => {
    var history = new CircularHistory(10, "number");

    history.commit(1);
    history.commit(2);
    history.commit(3);

    history.moveBackward();
    history.moveBackward();
    expect(history.current()).toBe(1);

    history.commit(4);
    expect(history.dump(true)).toEqual([1, 4, 3]);

    history.moveForward();
    expect(history.getCurrentIndex()).toBe(1);
    expect(history.isEndReached()).toBe(true);
    expect(history.current()).toBe(4);

    history.moveForward();
    expect(history.current()).toBe(4);
  });

  test("should behave correctly after multiple moveBackward calls when some item was overriden", () => {
    var history = new CircularHistory(3, "number");
    history.commit(1);
    history.commit(2);
    history.commit(3);

    history.moveBackward();
    history.moveBackward();

    history.commit(4);

    history.moveBackward();
    history.moveBackward();
    history.moveBackward();
    history.moveBackward();

    expect(history.getCurrentIndex()).toBe(-1);

    history.moveForward();
    expect(history.current()).toBe(1);

    history.moveForward();
    expect(history.current()).toBe(4);

    history.moveForward();
    expect(history.current()).toBe(4);
  });
});
