import { assertIsVector } from "../../../global/utils";

export function isValidCell(vector) {
  assertIsVector(vector);
  return vector.x >= 0 && vector.x < 8 && vector.y >= 0 && vector.y < 8;
}
