# Circular History

Data structure that holds a fixed amount of items of a specific data type. It's designed more for managing history, such as undo-redo functionality, therefore it allows you to overwrite the items after moving backward in order to discard the "redo" history.

## Usage

### 1. Create an instance of `CircularHistory` with a specified capacity and data type.

```javascript
var history = new CircularHistory(5, "string");
```

### 2. Commit new items to the history.

```javascript
history.commit("First");
history.commit("Second");
```

Keep in mind that after moving backward, committing a new item will overwrite the items ahead of the current index.
It was designed this way to facilitate undo-redo functionality by discarding the "redo" history when a new action is taken.

When the capacity is reached, the oldest items will be overwritten in a circular manner.

### 3. Get the current item.

```javascript
var currentItem = history.get();
```

To get the item at a specific index, you can pass the index as an argument.

```javascript
var specificItem = history.get(0); // Gets the first item
```

### 4. Move backward and forward in the history.

```javascript
history.moveBackward();
history.moveForward();
```

Moving backward and forward will adjust the current index accordingly and allow you to navigate within specific range which is determined by the number of committed items before navigation. If the number of committed items exceeds the capacity, the range will be limited to the capacity.

Each call to `moveBackward` or `moveForward` will return the item at the new current index after the move or `CircularHistory.FLAGS.emty` if the buffer is empty or `moveBackward` ended up at the starting position.

### 5. Clear the history.

```javascript
history.clear();
```

### 6. Get the history array.

```javascript
var historyArray = history.dump();
```

This will return an array of all committed items in the history. If capacity has not been reached, the array will contain items with `undefined` values for uncommitted slots.

If you want to get only the committed items, you can pass `true` as an argument.

```javascript
var committedItems = history.dump(true);
```

### 7. Get the current index.

```javascript
var currentIndex = history.getCurrentIndex();
```

### 8. Determine if start/end has been reached

```javascript
var isAtStart = history.isStartReached();
var isAtEnd = history.isEndReached();
```

## Running tests

1. `pnpm install`

2. `pnpm test`
