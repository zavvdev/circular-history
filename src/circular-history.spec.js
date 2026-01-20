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
    var bufferNumber = new CircularHistory(5, "number");
    expect(bufferNumber).toBeInstanceOf(CircularHistory);

    var bufferString = new CircularHistory(10, "string");
    expect(bufferString).toBeInstanceOf(CircularHistory);

    var bufferBigInt = new CircularHistory(3, "bigint");
    expect(bufferBigInt).toBeInstanceOf(CircularHistory);

    var bufferBoolean = new CircularHistory(7, "boolean");
    expect(bufferBoolean).toBeInstanceOf(CircularHistory);

    var bufferSymbol = new CircularHistory(2, "symbol");
    expect(bufferSymbol).toBeInstanceOf(CircularHistory);

    var bufferObject = new CircularHistory(4, "object");
    expect(bufferObject).toBeInstanceOf(CircularHistory);
  });

  test("should not commit invalid data types", () => {
    var bufferNumber = new CircularHistory(5, "number");
    expect(() => bufferNumber.commit("string")).toThrow();
    expect(() => bufferNumber.commit(true)).toThrow();
    expect(() => bufferNumber.commit({})).toThrow();
    expect(() => bufferNumber.commit([])).toThrow();
    expect(() => bufferNumber.commit(Symbol("sym"))).toThrow();
    expect(() => bufferNumber.commit(10n)).toThrow();

    var bufferString = new CircularHistory(5, "string");
    expect(() => bufferString.commit(100)).toThrow();
    expect(() => bufferString.commit(false)).toThrow();
    expect(() => bufferString.commit({})).toThrow();
    expect(() => bufferString.commit([])).toThrow();
    expect(() => bufferString.commit(Symbol("sym"))).toThrow();
    expect(() => bufferString.commit(10n)).toThrow();

    var bufferBigInt = new CircularHistory(5, "bigint");
    expect(() => bufferBigInt.commit(100)).toThrow();
    expect(() => bufferBigInt.commit("string")).toThrow();
    expect(() => bufferBigInt.commit(true)).toThrow();
    expect(() => bufferBigInt.commit({})).toThrow();
    expect(() => bufferBigInt.commit(Symbol("sym"))).toThrow();
    expect(() => bufferBigInt.commit(10.5)).toThrow();

    var bufferBoolean = new CircularHistory(5, "boolean");
    expect(() => bufferBoolean.commit(100)).toThrow();
    expect(() => bufferBoolean.commit("string")).toThrow();
    expect(() => bufferBoolean.commit({})).toThrow();
    expect(() => bufferBoolean.commit([])).toThrow();
    expect(() => bufferBoolean.commit(Symbol("sym"))).toThrow();
    expect(() => bufferBoolean.commit(10n)).toThrow();

    var bufferSymbol = new CircularHistory(5, "symbol");
    expect(() => bufferSymbol.commit(100)).toThrow();
    expect(() => bufferSymbol.commit("string")).toThrow();
    expect(() => bufferSymbol.commit(true)).toThrow();
    expect(() => bufferSymbol.commit({})).toThrow();
    expect(() => bufferSymbol.commit(10n)).toThrow();

    var bufferObject = new CircularHistory(5, "object");
    expect(() => bufferObject.commit(100)).toThrow();
    expect(() => bufferObject.commit("string")).toThrow();
    expect(() => bufferObject.commit(true)).toThrow();
    expect(() => bufferObject.commit(Symbol("sym"))).toThrow();
    expect(() => bufferObject.commit(10n)).toThrow();
  });

  test("should get an empty flag if buffer is empty", () => {
    var buffer = new CircularHistory(5, "number");
    expect(buffer.get()).toEqual(CircularHistory.FLAGS.empty);
  });

  test("should not allow to get a value by index out of bounds", () => {
    var buffer = new CircularHistory(5, "number");
    buffer.commit(10);
    buffer.commit(20);
    expect(() => buffer.get(-1)).toThrow();
    expect(() => buffer.get(5)).toThrow();
    expect(() => buffer.get(10)).toThrow();
  });

  test("should get a value by index correctly", () => {
    var buffer = new CircularHistory(5, "number");
    buffer.commit(10);
    buffer.commit(20);
    buffer.commit(30);
    expect(buffer.get(0)).toBe(10);
    expect(buffer.get(1)).toBe(20);
    expect(buffer.get(2)).toBe(30);
  });

  test("should wrap around when capacity is exceeded", () => {
    var buffer = new CircularHistory(3, "number");
    buffer.commit(1);
    buffer.commit(2);
    buffer.commit(3);
    expect(buffer.get()).toBe(3);
    buffer.commit(4);
    expect(buffer.get()).toBe(4);
    expect(buffer.get(0)).toBe(4);
    expect(buffer.get(1)).toBe(2);
    expect(buffer.get(2)).toBe(3);
  });

  test("should move backward and forward correctly (no wrapping)", () => {
    var buffer = new CircularHistory(3, "number");
    buffer.commit(1);
    buffer.commit(2);
    buffer.commit(3);
    expect(buffer.get()).toBe(3);
    buffer.moveBackward();
    expect(buffer.get()).toBe(2);
    buffer.moveBackward();
    expect(buffer.get()).toBe(1);
    buffer.moveBackward();
    expect(buffer.get()).toBe(CircularHistory.FLAGS.empty);
    buffer.moveForward();
    expect(buffer.get()).toBe(1);
    buffer.moveForward();
    expect(buffer.get()).toBe(2);
    buffer.moveForward();
    expect(buffer.get()).toBe(3);
    buffer.moveForward();
    expect(buffer.get()).toBe(3);
  });

  test("should move backward and forward correctly (with wrapping)", () => {
    var buffer = new CircularHistory(3, "number");
    buffer.commit(1);
    buffer.commit(2);
    buffer.commit(3);
    buffer.commit(4);
    expect(buffer.get()).toBe(4);
    expect(buffer.getCurrentIndex()).toBe(0);
    buffer.moveBackward();
    expect(buffer.get()).toBe(3);
    buffer.moveBackward();
    expect(buffer.get()).toBe(2);
    buffer.moveBackward();
    expect(buffer.get()).toBe(CircularHistory.FLAGS.empty);
    buffer.moveForward();
    expect(buffer.get()).toBe(2);
    buffer.moveForward();
    expect(buffer.get()).toBe(3);
    buffer.moveForward();
    expect(buffer.get()).toBe(4);
  });

  test("should override slots ahead after moving backward", () => {
    var buffer = new CircularHistory(2, "number");
    buffer.commit(1);
    expect(buffer.get()).toBe(1);
    buffer.commit(2);
    expect(buffer.get()).toBe(2);
    buffer.moveBackward();
    expect(buffer.get()).toBe(1);
    buffer.commit(3);
    expect(buffer.get(1)).toBe(3);
    expect(buffer.get()).toBe(3);
    buffer.moveBackward();
    expect(buffer.get()).toBe(1);
    buffer.moveForward();
    expect(buffer.get()).toBe(3);
    buffer.moveForward();
    expect(buffer.get()).toBe(3);
  });

  test("should clear the buffer correctly", () => {
    var buffer = new CircularHistory(3, "number");
    buffer.commit(1);
    buffer.commit(2);
    buffer.commit(3);
    expect(buffer.get()).toBe(3);
    buffer.clear();
    expect(buffer.get()).toEqual(CircularHistory.FLAGS.empty);
    expect(buffer.isEndReached()).toBe(true);
    expect(buffer.isStartReached()).toBe(true);
    expect(buffer.getCurrentIndex()).toBe(-1);
    buffer.commit(4);
    expect(buffer.get()).toBe(4);
    expect(buffer.getCurrentIndex()).toBe(0);
  });

  test("should return back the current buffer state with empty values", () => {
    var buffer = new CircularHistory(3, "number");
    buffer.commit(1);
    buffer.commit(2);
    expect(buffer.dump()).toEqual([1, 2, undefined]);
  });

  test("should return back the current buffer state without empty values", () => {
    var buffer = new CircularHistory(3, "number");
    buffer.commit(1);
    buffer.commit(2);
    expect(buffer.dump(true)).toEqual([1, 2]);
  });

  test("should return back the correct current pointer position", () => {
    var buffer = new CircularHistory(3, "number");
    expect(buffer.getCurrentIndex()).toBe(-1);
    buffer.commit(1);
    expect(buffer.getCurrentIndex()).toBe(0);
    buffer.commit(2);
    expect(buffer.getCurrentIndex()).toBe(1);
    buffer.commit(3);
    expect(buffer.getCurrentIndex()).toBe(2);
    buffer.commit(4);
    expect(buffer.getCurrentIndex()).toBe(0);
    buffer.commit(5);
    expect(buffer.getCurrentIndex()).toBe(1);
    buffer.moveBackward();
    expect(buffer.getCurrentIndex()).toBe(0);
    buffer.moveBackward();
    expect(buffer.getCurrentIndex()).toBe(2);
    buffer.moveForward();
    expect(buffer.getCurrentIndex()).toBe(0);
    buffer.moveForward();
    expect(buffer.getCurrentIndex()).toBe(1);
    buffer.moveForward();
    expect(buffer.getCurrentIndex()).toBe(1);
    buffer.moveForward();
    expect(buffer.getCurrentIndex()).toBe(1);
  });

  test("should correctly identify when start is reached", () => {
    var buffer = new CircularHistory(3, "number");
    expect(buffer.isStartReached()).toBe(true);
    buffer.commit(1);
    expect(buffer.isStartReached()).toBe(false);
    buffer.commit(2);
    expect(buffer.isStartReached()).toBe(false);
    buffer.moveBackward();
    expect(buffer.isStartReached()).toBe(false);
    buffer.moveBackward();
    expect(buffer.isStartReached()).toBe(true);
  });

  test("should correctly identify when end is reached", () => {
    var buffer = new CircularHistory(3, "number");
    expect(buffer.isEndReached()).toBe(true);
    buffer.commit(1);
    buffer.commit(2);
    expect(buffer.get()).toBe(2);
    buffer.moveForward();
    expect(buffer.isEndReached()).toBe(true);
    buffer.moveBackward();
    expect(buffer.get()).toBe(1);
    expect(buffer.isEndReached()).toBe(false);
    buffer.moveBackward();
    expect(buffer.get()).toBe(CircularHistory.FLAGS.empty);
    expect(buffer.isEndReached()).toBe(false);
    buffer.moveForward();
    expect(buffer.get()).toBe(1);
    expect(buffer.isEndReached()).toBe(false);
    buffer.moveForward();
    expect(buffer.get()).toBe(2);
    expect(buffer.isEndReached()).toBe(true);
    buffer.moveForward();
    expect(buffer.get()).toBe(2);
    expect(buffer.isEndReached()).toBe(true);
  });

  test("should return the last available item when capacity is not reached, the next item is empty and moving forward", () => {
    var buffer = new CircularHistory(3, "number");
    buffer.commit(1);
    buffer.commit(2);
    expect(buffer.get()).toBe(2);
    buffer.moveForward();
    expect(buffer.get()).toBe(2);
    buffer.moveForward();
    expect(buffer.get()).toBe(2);
    buffer.moveBackward();
    expect(buffer.get()).toBe(1);
    buffer.moveBackward();
    expect(buffer.get()).toBe(CircularHistory.FLAGS.empty);
    buffer.moveBackward();
    expect(buffer.get()).toBe(CircularHistory.FLAGS.empty);
    buffer.moveForward();
    expect(buffer.get()).toBe(1);
    buffer.moveForward();
    expect(buffer.get()).toBe(2);
    buffer.moveForward();
    expect(buffer.get()).toBe(2);
  });

  test("moveBackward should return either empty flag or previous item", () => {
    var buffer = new CircularHistory(2, "number");
    expect(buffer.moveBackward()).toBe(CircularHistory.FLAGS.empty);
    buffer.commit(1);
    expect(buffer.moveBackward()).toBe(CircularHistory.FLAGS.empty);
    expect(buffer.getCurrentIndex()).toBe(-1);
    expect(buffer.moveBackward()).toBe(CircularHistory.FLAGS.empty);
    expect(buffer.getCurrentIndex()).toBe(-1);
    buffer.commit(2);
    expect(buffer.getCurrentIndex()).toBe(0);
    expect(buffer.get()).toBe(2);
    expect(buffer.moveBackward()).toBe(CircularHistory.FLAGS.empty);
  });

  test("moveForward should return current item, next item or empty flag if no values were added", () => {
    var buffer = new CircularHistory(2, "number");
    expect(buffer.moveForward()).toBe(CircularHistory.FLAGS.empty);
    buffer.commit(1);
    expect(buffer.moveForward()).toBe(1);
    expect(buffer.getCurrentIndex()).toBe(0);
    expect(buffer.moveForward()).toBe(1);
    expect(buffer.getCurrentIndex()).toBe(0);
    buffer.commit(2);
    expect(buffer.getCurrentIndex()).toBe(1);
    expect(buffer.get()).toBe(2);
    expect(buffer.moveForward()).toBe(2);
    expect(buffer.moveForward()).toBe(2);
    buffer.commit(3);
    expect(buffer.getCurrentIndex()).toBe(0);
    expect(buffer.get()).toBe(3);
    expect(buffer.moveForward()).toBe(3);
    expect(buffer.moveForward()).toBe(3);
  });

  test("commit should return commited value", () => {
    var buffer = new CircularHistory(2, "number");
    expect(buffer.commit(10)).toBe(10);
    expect(buffer.commit(20)).toBe(20);
    expect(buffer.commit(30)).toBe(30);
  });
});
