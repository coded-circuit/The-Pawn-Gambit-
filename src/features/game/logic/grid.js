import { assertIsVector } from "../../../global/utils";


/**
 * Checks if a given vector is within the grid boundaries.
 * @param {object} vector - The {x, y} position to check.
 * @param {number} gridSize - The size of the grid (e.g., 8 or 10).
 * @returns {boolean}
 */
export function isValidCell(vector, gridSize) {
  assertIsVector(vector);
  return vector.x >= 0 && vector.x < gridSize && vector.y >= 0 && vector.y < gridSize;
}

/**
 * Creates a 2D array representing the game grid.
 * @param {number} size - The size of the grid.
 * @param {*} initialValue - The value to fill each cell with.
 * @returns {Array<Array<*>>}
 */
export function generateGrid(size, initialValue = false) {
  return new Array(size).fill(null).map(() => new Array(size).fill(initialValue));
}