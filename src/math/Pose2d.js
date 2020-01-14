import { kEpsilon } from 'constants';
const Vector2d = require('./Vector2d');

/**
 * Represents a pose on the field.
 */
class Pose2d {
    /**
     * Create a Pose2d from a vector and rotation.
     * @param {Vector2d} translation Linear position on the field.
     * @param {number} rotation Rotation of the robot (in radians).
     */
    constructor(translation, rotation) {
        this.translation = translation;
        this.rotation = rotation;
    }

    // get twist() {
    //     let dtheta = this.rotation;
    //     let halfDTheta = dtheta / 2.0;
    //     let cosMinusOne = Math.cos(this.rotation) - 1;

    //     let halfThetaByTanOfHalfDTheta = Math.abs(cosMinusOne) < kEpsilon
    //         ? 1.0 - 1.0 / 12.0 * dtheta * dtheta
    //         : -(halfDTheta * Math.sin(rotation)) / cosMinusOne;
        

    // }

    /**
     * Get this pose with the rotation flipped.
     */
    get mirror() {
        return new Pose2d(new Vector2d(this.translation.x, this.translation.y), this.rotation * -1);
    }

    /**
     * Transform this pose by another pose.
     * @param {Pose2d} other Pose to transform by.
     * @returns {Pose2d} Transformed pose.
     */
    transformBy(other) {
        return new Pose2d(this.translation.add(other.translation.multiply(rotation)), this.rotation + other.rotation);
    }

    isCollinear(other) {
        if (!this.rotation == other.rotation) {

        }
    }

    // /**
    //  * 
    //  * @param {Pose2d} endValue 
    //  * @param {number} t 
    //  */
    // interpolate(endValue, t) {
    //     if (t <= 0) {
    //         return new Pose2d(this.translation, this.rotation);
    //     } else if (t >= 1) {
    //         return new Pose2d(endValue.translation, endValue.rotation);
    //     }
    // }

    toCSV() {
        return `${this.translation.toCSV()}, ${this.rotation}`
    }

    toString() {
        return this.toCSV();
    }
}

module.exports = Pose2d;