/**
 * #Config
 */

/**
 * @description
 * List of data types that are allowed to be stored in the slots.
 * All slots should be of the same data type.
 */
var ALLOWED_DATA_TYPES = [
  "number",
  "string",
  "bigint",
  "boolean",
  "symbol",
  "object",
];

var EMPTY_SLOTS = 0;
var EMPTY_POINTER = -1;

/**
 * @description
 * List of values that can be returned by the CircularHistory methods
 */
var FLAGS = {
  empty: Symbol("empty"),
};

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

var isSlotEmpty = (slot) => slot === undefined;

var isBufferEmpty = (buffer) =>
  buffer.filter((slot) => !isSlotEmpty(slot)).length === 0;

var makeIndex = (pointer, capacity) => pointer % capacity;

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
 * Circular History
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
function CircularHistory(capacity, dataType) {
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
     * How many slots are used and can be restored by moveBackward/moveForward.
     */
    usedSlots: EMPTY_SLOTS,

    /**
     * Current pointer. It does not point to an index in the buffer directly.
     * It is used to calculate the index in the buffer using modulo operation.
     */
    pointer: EMPTY_POINTER,

    /**
     * Total maximum amount of slots.
     */
    capacity: capacity,

    /**
     * Data type of each slot.
     */
    dataType: dataType,

    /**
     * Array of slots.
     * Should always be pre-allocated with capacity.
     */
    buffer: new Array(capacity),
  });
}

CircularHistory.prototype.commit = function (value) {
  var self = STATE.get(this);
  var dataType = self.dataType;
  if (!canCommit(value)(dataType)) {
    throw new Error(
      `Type of ${value} is invalid. Expected "${dataType}", got "${value === null ? "null" : typeof value}".`,
    );
  }
  var capacity = self.capacity;
  self.pointer++;
  self.buffer[makeIndex(self.pointer, capacity)] = value;
  self.usedSlots = Math.min(++self.usedSlots, capacity);
  return value;
};

CircularHistory.prototype.get = function (index) {
  var self = STATE.get(this);
  var buffer = self.buffer;
  if (typeof index === "number") {
    if (index >= self.capacity || index < 0)
      throw new Error(`Index "${index}" out of bounds.`);
    return buffer[index];
  }
  if (self.usedSlots === EMPTY_SLOTS) return FLAGS.empty;
  var pointer = self.pointer;
  if (pointer === EMPTY_POINTER) return FLAGS.empty;
  return buffer[makeIndex(self.pointer, self.capacity)];
};

CircularHistory.prototype.moveBackward = function () {
  var self = STATE.get(this);
  if (self.usedSlots === EMPTY_SLOTS) return FLAGS.empty;
  self.pointer--;
  self.usedSlots--;
  var nextItem = self.buffer[makeIndex(self.pointer, self.capacity)];
  return isSlotEmpty(nextItem) ? FLAGS.empty : nextItem;
};

CircularHistory.prototype.moveForward = function () {
  var self = STATE.get(this);
  if (self.pointer === EMPTY_POINTER && isBufferEmpty(self.buffer))
    return FLAGS.empty;
  var capacity = self.capacity;
  var currentItem = self.buffer[makeIndex(self.pointer, capacity)];
  if (self.usedSlots === capacity) return currentItem;
  var nextItem = self.buffer[makeIndex(self.pointer + 1, capacity)];
  if (isSlotEmpty(nextItem)) return currentItem;
  self.pointer++;
  self.usedSlots++;
  return self.buffer[makeIndex(self.pointer, capacity)];
};

CircularHistory.prototype.clear = function () {
  var self = STATE.get(this);
  self.usedSlots = EMPTY_SLOTS;
  self.pointer = EMPTY_POINTER;
  self.buffer = new Array(self.capacity);
};

CircularHistory.prototype.dump = function (discardEmptySlots = false) {
  var self = STATE.get(this);
  var result = [...self.buffer];
  if (discardEmptySlots) result = result.filter((slot) => !isSlotEmpty(slot));
  return result;
};

CircularHistory.prototype.getCurrentIndex = function () {
  var self = STATE.get(this);
  return makeIndex(self.pointer, self.capacity);
};

CircularHistory.prototype.isStartReached = function () {
  var self = STATE.get(this);
  return self.usedSlots === EMPTY_SLOTS;
};

CircularHistory.prototype.isEndReached = function () {
  var self = STATE.get(this);
  var nextItem = self.buffer[makeIndex(self.pointer + 1, self.capacity)];
  return isSlotEmpty(nextItem);
};

CircularHistory.FLAGS = FLAGS;

export { CircularHistory };
