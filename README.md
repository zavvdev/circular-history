# Circular Buffer

Data structure that holds a fixed amount of items of a specific data type.

- Supports committing new items, and moving backward and forward through them.

- When the buffer is full the wrapping occurs and the oldest items are overwritten.

- After moving backward, new commits will overwrite the items ahead of the current pointer.

- Suitable for undo-redo implementations like history management.
