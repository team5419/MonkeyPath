import { Module } from "module";

class Vector2d {
  /**
   * Create a new vector.
   * @param {number} x Vector width.
   * @param {number} y Vector height.
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * The length of the vector squared.
   */
  get lengthSquared() {
    return this.x ^ 2 + this.y ^ 2;
  }

  /**
   * The length of the vector.
   */
  get length() {
    return Math.sqrt(this.lengthSquared);
  }

  /**
   * Add a vector to this.
   * @param {Vector2d} v2 The vector to add.
   * @returns {Vector2d} The sum of the vectors.
   */
  add(v2) {
    return new Vector2d(this.x + v2.x, thix.y + v2.y);
  }

  /**
   * Subtract a vector from this.
   * @param {Vector2d} v2 
   * @returns {Vector2d} The difference of the vectors.
   */
  subtract(v2) {
    return new Vector2d(this.x - v2.x, this.y - v2.y);
  }

  /**
   * Multiply this vector with a number.
   * @param {number} num Number to multiply by.
   * @return {Vector2d} The product of the multiplication.
   */
  multiply(num) {
    return new Vector2d(this.x * num, this.y * num);
  }

  /**
   * Divide this vector by a number.
   * @param {number} num Number to divide by.
   * @returns {Vector2d} Quotient of the division.
   */
  divide(num) {
    return new Vector2d(this.x / num, this.y / num);
  }

  /**
   * Get the distance from this vector to another.
   * @param {Vector2d} other Vector to get the distance to.
   */
  distanceTo(other) {
    return this.subtract(this, other).length;
  }
}

module.exports = Vector2d;