/**
 * #Config
 */

var ALLOWED_DATA_TYPES = [
  "number",
  "string",
  "bigint",
  "boolean",
  "symbol",
  "object",
];

var DEFAULT_USED_SLOTS = 0;
var DEFAULT_POINTER = -1;

/**
 * #Utils
 */

var isTypeAllowed = (type) => ALLOWED_DATA_TYPES.includes(type);

var isValueTypeAllowed = (value) => {
  var valueType = typeof value;
  var isObject = valueType === "object" && value !== null;
  return isObject || isTypeAllowed(valueType);
};

var canCommit = (value) => (dataType) => {
  return isValueTypeAllowed(value) && typeof value === dataType;
};

/**
 * #State
 * Using WeakMap to store private state in order to not expose private properties.
 * This will ensure that the reference to the state will be dropped when instances
 * are garbage collected.
 */
var STATE = new WeakMap();

/**
 * @description
 *
 * Circular Buffer
 *
 * Data structure that holds a fixed amount of items of a specific data type.
 * Supports committing new items, and moving backward and forward through the committed items.
 * When the buffer is full the wrapping occurs and the oldest items are overwritten.
 * After moving backward, new commits will overwrite the items ahead of the current pointer which
 * makes this data structure suitable for undo-redo implementations like history management.
 *
 * @param {number} capacity - Maximum amount of slots in the buffer
 * @param {string} dataType - Data type of each slot
 */
function CircularBuffer(capacity, dataType) {
  if (
    typeof capacity !== "number" ||
    capacity <= 0 ||
    !Number.isInteger(capacity)
  ) {
    throw new Error(`Capacity must be a positive integer. Got "${capacity}".`);
  }

  if (!isTypeAllowed(dataType)) {
    throw new Error(`"${dataType}" is not allowed`);
  }

  STATE.set(this, {
    /**
     * How many slots are used and can be restored (undo/redo)
     */
    usedSlots: DEFAULT_USED_SLOTS,

    /**
     * Pointer to the current slot
     */
    pointer: DEFAULT_POINTER,

    /**
     * Total maximum amount of slots
     */
    capacity: capacity,

    /**
     * Data type of each slot
     */
    dataType: dataType,

    /**
     * Slots
     */
    buffer: new Array(capacity),
  });
}

CircularBuffer.prototype.commit = function(value) {
  var self = STATE.get(this);
  var dataType = self.dataType;
  if (!canCommit(value)(dataType)) {
    throw new Error(
      `Type of ${value} is invalid. Expected "${dataType}", got "${value === null ? "null" : typeof value}".`,
    );
  }
  var capacity = self.capacity;
  self.pointer++;
  self.buffer[self.pointer % capacity] = value;
  self.usedSlots = Math.min(++self.usedSlots, capacity);
  return value;
};

CircularBuffer.prototype.get = function(index) {
  var self = STATE.get(this);
  var buffer = self.buffer;
  if (typeof index === "number") {
    if (index >= self.capacity || index < 0) {
      throw new Error(`Index "${index}" out of bounds.`);
    }
    return buffer[index];
  }
  var pointer = self.pointer;
  if (pointer < 0) throw new Error(`Buffer is empty.`);
  return buffer[self.pointer % self.capacity];
};

CircularBuffer.prototype.moveBackward = function() {
  var self = STATE.get(this);
  if (self.usedSlots === 1) return;
  self.pointer--;
  self.usedSlots--;
  return self.buffer[self.pointer % self.capacity];
};

CircularBuffer.prototype.moveForward = function() {
  var self = STATE.get(this);
  var capacity = self.capacity;
  if (self.usedSlots === capacity) return;
  self.pointer++;
  self.usedSlots++;
  return self.buffer[self.pointer % capacity];
};

export { CircularBuffer };
