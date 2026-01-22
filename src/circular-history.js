/**
 * #Config
 */

/**
 * @description
 * List of data types that are allowed to be stored in the items.
 * All items should be of the same data type.
 */
var ALLOWED_DATA_TYPES = ["number", "string", "bigint", "boolean", "symbol", "object"];

var NAVIGATION_LOWER_BOUND = 0;
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

var canCommit = (value, dataType) => isValueTypeAllowed(value) && typeof value === dataType;
var isItemEmpty = (slot) => slot === undefined;
var makeIndex = (pointer, capacity) => pointer % capacity;

/**
 * #State
 *
 * @description
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
 * @param {number} capacity - Maximum amount of items in the buffer
 * @param {string} dataType - Data type of each slot
 */
function CircularHistory(capacity, dataType) {
  if (typeof capacity !== "number" || capacity <= 0 || !Number.isInteger(capacity)) {
    throw new Error(`Capacity must be a positive integer. Got "${capacity}".`);
  }

  if (!isTypeAllowed(dataType)) {
    throw new Error(`"${dataType}" is not allowed`);
  }

  STATE.set(this, {
    /**
     * Represents range [0, navigationUpperBound] of how many items can be used
     * for navigation.
     */
    navigationUpperBound: NAVIGATION_LOWER_BOUND,

    /**
     * Represents current index within the navigation range [0, navigationUpperBound].
     */
    navigatedItemsCount: NAVIGATION_LOWER_BOUND,

    /**
     * Current pointer. It does not point to an index in the buffer directly.
     * It is used to calculate the index in the buffer using modulo operation.
     * Initial value is -1 which means no items have been committed yet.
     * It's also possible to move back from 0 to -1 to represent the state
     * where no item is selected but only in case when we at the very beginning.
     * See moveBackward method for more details.
     */
    pointer: EMPTY_POINTER,

    /**
     * Total maximum amount of items.
     */
    capacity: capacity,

    /**
     * Data type of each slot.
     */
    dataType: dataType,

    /**
     * Array of items.
     * Should always be pre-allocated with capacity.
     */
    buffer: new Array(capacity),
  });
}

CircularHistory.prototype.commit = function (value) {
  var self = STATE.get(this);
  var dataType = self.dataType;

  if (!canCommit(value, dataType)) {
    throw new Error(
      `Type of ${value} is invalid. Expected "${dataType}", got "${value === null ? "null" : typeof value}".`,
    );
  }

  var capacity = self.capacity;

  if (self.navigatedItemsCount === capacity - 1) {
    self.navigationUpperBound = capacity - 1;
    self.navigatedItemsCount = capacity - 1;
  } else {
    self.navigationUpperBound = ++self.navigatedItemsCount;
  }

  self.buffer[makeIndex(++self.pointer, capacity)] = value;
};

CircularHistory.prototype.current = function () {
  var self = STATE.get(this);
  if (self.pointer === EMPTY_POINTER) return FLAGS.empty;
  var buffer = self.buffer;
  var pointer = self.pointer;
  var nextItem = buffer[makeIndex(pointer, self.capacity)];
  return isItemEmpty(nextItem) ? FLAGS.empty : nextItem;
};

CircularHistory.prototype.moveBackward = function () {
  var self = STATE.get(this);

  /**
   * @description
   *
   * If we are about to move back from index 0 to -1, we set the pointer to -1
   * and do not decrease the navigatedItemsCount because -1 represents the state
   * where no item is selected. We also can't decrease navigatedItemsCount
   * in this case because it would go below the NAVIGATION_LOWER_BOUND
   * in case when we have wrapped around the buffer and haven't reached
   * the beginning yet, so we need to handle this case separately in order
   * to have an ability to move back up to the empty state.
   * If we do not do that, we won't be able to move back to the empty state
   * and the first item will always be selected.
   */
  if (self.pointer === EMPTY_POINTER + 1) {
    self.pointer = EMPTY_POINTER;
    return;
  }

  if (self.navigatedItemsCount === NAVIGATION_LOWER_BOUND || self.pointer === EMPTY_POINTER) return;
  self.pointer--;
  self.navigatedItemsCount--;
};

CircularHistory.prototype.moveForward = function () {
  var self = STATE.get(this);

  /**
   * @description
   *
   * At this point if we at the very beginning and navigationUpperBound has
   * not been reached yet, which means that we came back to the empty state,
   * we need to move the pointer to 0 without increasing the navigatedItemsCount
   * in order to recover from the empty state that we set in the moveBackward method.
   * If we increase navigatedItemsCount here, we wont reach the navigationUpperBound
   * because it would be off left by one.
   */
  if (self.pointer === EMPTY_POINTER && self.navigationUpperBound > NAVIGATION_LOWER_BOUND) {
    self.pointer = EMPTY_POINTER + 1;
    return;
  }

  if (self.navigatedItemsCount === self.navigationUpperBound) return;

  self.pointer++;
  self.navigatedItemsCount++;
};

CircularHistory.prototype.clear = function () {
  var self = STATE.get(this);
  self.navigatedItemsCount = NAVIGATION_LOWER_BOUND;
  self.navigationUpperBound = NAVIGATION_LOWER_BOUND;
  self.pointer = EMPTY_POINTER;
  self.buffer = new Array(self.capacity);
};

CircularHistory.prototype.dump = function (discardHoles = false) {
  var self = STATE.get(this);
  var result = [...self.buffer];
  return discardHoles ? result.filter((slot) => !isItemEmpty(slot)) : result;
};

CircularHistory.prototype.getCurrentIndex = function () {
  var self = STATE.get(this);
  return makeIndex(self.pointer, self.capacity);
};

CircularHistory.prototype.isStartReached = function () {
  var self = STATE.get(this);
  return self.navigatedItemsCount === NAVIGATION_LOWER_BOUND || self.pointer === EMPTY_POINTER;
};

CircularHistory.prototype.isEndReached = function () {
  var self = STATE.get(this);
  return self.navigatedItemsCount === self.navigationUpperBound;
};

CircularHistory.FLAGS = FLAGS;

export { CircularHistory };
