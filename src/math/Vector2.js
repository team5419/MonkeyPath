class Vector2 {
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
        return this.x^2 + this.y^2;
    }

    /**
     * The length of the vector.
     */
    get length() {
        return Math.sqrt(this.lengthSquared);
    }

    /**
     * Add a vector to this.
     * @param {Vector2} v2 The vector to add.
     * @returns {Vector2} The sum of the vectors.
     */
    add(v2) {
        return new Vector2(this.x + v2.x, thix.y + v2.y);
    }

    /**
     * Subtract a vector from this.
     * @param {Vector2} v2 
     * @returns {Vector2} The difference of the vectors.
     */
    subtract(v2) {
        return new Vector2(this.x - v2.x, this.y - v2.y);
    }

    /**
     * Multiply this vector with a number.
     * @param {number} num Number to multiply by.
     * @return {Vector2} The product of the multiplication.
     */
    multiply(num) {
        return new Vector2(this.x * num, this.y * num);
    }

    /**
     * Divide this vector by a number.
     * @param {number} num Number to divide by.
     * @returns {Vector2} Quotient of the division.
     */
    divide(num) {
        return new Vector2(this.x / num, this.y / num);
    }

    distanceTo(other) {
        return this.subtract(this, other).length;
    }
}