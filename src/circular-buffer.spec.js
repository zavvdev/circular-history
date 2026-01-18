import { test, describe, expect } from "vitest";
import { CircularBuffer } from "./circular-buffer.js";

describe("CircularBuffer", () => {
  test("should throw if capacity is not a positive integer", () => {
    expect(() => new CircularBuffer(0, "number")).toThrow();
    expect(() => new CircularBuffer(-5, "number")).toThrow();
    expect(() => new CircularBuffer(3.5, "number")).toThrow();
    expect(() => new CircularBuffer("10", "number")).toThrow();
  });

  test("should throw if data type is not allowed", () => {
    expect(() => new CircularBuffer(5, "invalidType")).toThrow();
    expect(() => new CircularBuffer(5, 123)).toThrow();
    expect(() => new CircularBuffer(5, null)).toThrow();
  });

  test("should successfully create a CircularBuffer with valid parameters", () => {
    var bufferNumber = new CircularBuffer(5, "number");
    expect(bufferNumber).toBeInstanceOf(CircularBuffer);

    var bufferString = new CircularBuffer(10, "string");
    expect(bufferString).toBeInstanceOf(CircularBuffer);

    var bufferBigInt = new CircularBuffer(3, "bigint");
    expect(bufferBigInt).toBeInstanceOf(CircularBuffer);

    var bufferBoolean = new CircularBuffer(7, "boolean");
    expect(bufferBoolean).toBeInstanceOf(CircularBuffer);

    var bufferSymbol = new CircularBuffer(2, "symbol");
    expect(bufferSymbol).toBeInstanceOf(CircularBuffer);

    var bufferObject = new CircularBuffer(4, "object");
    expect(bufferObject).toBeInstanceOf(CircularBuffer);
  });

  test("should not commit invalid data types", () => {
    var bufferNumber = new CircularBuffer(5, "number");
    expect(() => bufferNumber.commit("string")).toThrow();
    expect(() => bufferNumber.commit(true)).toThrow();
    expect(() => bufferNumber.commit({})).toThrow();
    expect(() => bufferNumber.commit([])).toThrow();
    expect(() => bufferNumber.commit(Symbol("sym"))).toThrow();
    expect(() => bufferNumber.commit(10n)).toThrow();

    var bufferString = new CircularBuffer(5, "string");
    expect(() => bufferString.commit(100)).toThrow();
    expect(() => bufferString.commit(false)).toThrow();
    expect(() => bufferString.commit({})).toThrow();
    expect(() => bufferString.commit([])).toThrow();
    expect(() => bufferString.commit(Symbol("sym"))).toThrow();
    expect(() => bufferString.commit(10n)).toThrow();

    var bufferBigInt = new CircularBuffer(5, "bigint");
    expect(() => bufferBigInt.commit(100)).toThrow();
    expect(() => bufferBigInt.commit("string")).toThrow();
    expect(() => bufferBigInt.commit(true)).toThrow();
    expect(() => bufferBigInt.commit({})).toThrow();
    expect(() => bufferBigInt.commit(Symbol("sym"))).toThrow();
    expect(() => bufferBigInt.commit(10.5)).toThrow();

    var bufferBoolean = new CircularBuffer(5, "boolean");
    expect(() => bufferBoolean.commit(100)).toThrow();
    expect(() => bufferBoolean.commit("string")).toThrow();
    expect(() => bufferBoolean.commit({})).toThrow();
    expect(() => bufferBoolean.commit([])).toThrow();
    expect(() => bufferBoolean.commit(Symbol("sym"))).toThrow();
    expect(() => bufferBoolean.commit(10n)).toThrow();

    var bufferSymbol = new CircularBuffer(5, "symbol");
    expect(() => bufferSymbol.commit(100)).toThrow();
    expect(() => bufferSymbol.commit("string")).toThrow();
    expect(() => bufferSymbol.commit(true)).toThrow();
    expect(() => bufferSymbol.commit({})).toThrow();
    expect(() => bufferSymbol.commit(10n)).toThrow();

    var bufferObject = new CircularBuffer(5, "object");
    expect(() => bufferObject.commit(100)).toThrow();
    expect(() => bufferObject.commit("string")).toThrow();
    expect(() => bufferObject.commit(true)).toThrow();
    expect(() => bufferObject.commit(Symbol("sym"))).toThrow();
    expect(() => bufferObject.commit(10n)).toThrow();
  });

  test("should not get a value from an empty buffer", () => {
    var buffer = new CircularBuffer(5, "number");
    expect(() => buffer.get()).toThrow();
  });

  test("should not allow to get a value by index out of bounds", () => {
    var buffer = new CircularBuffer(5, "number");
    buffer.commit(10);
    buffer.commit(20);
    expect(() => buffer.get(-1)).toThrow();
    expect(() => buffer.get(5)).toThrow();
    expect(() => buffer.get(10)).toThrow();
  });

  test("should get a value by index correctly", () => {
    var buffer = new CircularBuffer(5, "number");
    buffer.commit(10);
    buffer.commit(20);
    buffer.commit(30);
    expect(buffer.get(0)).toBe(10);
    expect(buffer.get(1)).toBe(20);
    expect(buffer.get(2)).toBe(30);
  });

  test("should wrap around when capacity is exceeded", () => {
    var buffer = new CircularBuffer(3, "number");
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
    var buffer = new CircularBuffer(3, "number");
    buffer.commit(1);
    buffer.commit(2);
    buffer.commit(3);
    expect(buffer.get()).toBe(3);
    buffer.moveBackward();
    expect(buffer.get()).toBe(2);
    buffer.moveBackward();
    expect(buffer.get()).toBe(1);
    buffer.moveBackward();
    expect(buffer.get()).toBe(1);
    buffer.moveForward();
    expect(buffer.get()).toBe(2);
    buffer.moveForward();
    expect(buffer.get()).toBe(3);
    buffer.moveForward();
    expect(buffer.get()).toBe(3);
  });

  test("should move backward and forward correctly (with wrapping)", () => {
    var buffer = new CircularBuffer(3, "number");
    buffer.commit(1);
    buffer.commit(2);
    buffer.commit(3);
    buffer.commit(4);
    expect(buffer.get()).toBe(4);
    buffer.moveBackward();
    expect(buffer.get()).toBe(3);
    buffer.moveBackward();
    expect(buffer.get()).toBe(2);
    buffer.moveBackward();
    expect(buffer.get()).toBe(2);
    buffer.moveForward();
    expect(buffer.get()).toBe(3);
    buffer.moveForward();
    expect(buffer.get()).toBe(4);
    buffer.moveForward();
    expect(buffer.get()).toBe(4);
  });

  test("should override slots ahead after moving backward", () => {
    var buffer = new CircularBuffer(2, "number");
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
});
