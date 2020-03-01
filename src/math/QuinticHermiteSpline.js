// import { TouchBarScrubber } from "electron";
// import { kEpsilon } from "constants";
const Translation2d = require('./Translation2d');

/**
 * Represents a Quintic Hermite Spline
 * (I was asked to blindly port this code from Kotlin. I have no idea how it works or how to document it. -Sam)
 */
class QuinticHermiteSpline {
    /**
     * Create a spline from vectors and rotations.
     * @param {Pose2d} p0 Start vector.
     * @param {Pose2d} p1 End vector.
     */
    constructor(p0, p1) {
        const scale = 1.2 * p0.distance(p1);

        this.x0 = p0.x;
        this.x1 = p1.x;
        this.dx0 = Math.cos(p0.rotation) * scale;
        this.dx1 = Math.cos(p1.rotation) * scale;
        this.ddx0 = 0;
        this.ddx1 = 0;

        this.y0 = p0.y;
        this.y1 = p1.y;
        this.dy0 = Math.sin(p0.rotation) * scale;
        this.dy1 = Math.sin(p1.rotation) * scale;
        this.ddy0 = 0;
        this.ddy1 = 0;

        this.ax = 0;
        this.bx = 0;
        this.cx = 0;
        this.dx = 0;
        this.ex = 0;
        this.fx = 0;

        this.ay = 0;
        this.by = 0;
        this.cy = 0;
        this.dy = 0;
        this.ey = 0;
        this.fy = 0;
        this._kSamples = 100;

        this.calcCoeffs
    }

    calcCoeffs() {
        this.ax = -6 * x0 - 3 * dx0 - 0.5 * ddx0 + 0.5 * ddx1 - 3 * dx1 + 6 * x1;
        this.bx = 15 * x0 + 8 * dx0 + 1.5 * ddx0 - ddx1 + 7 * dx1 - 15 * x1;
        this.cx = -10 * x0 - 6 * dx0 - 1.5 * ddx0 + 0.5 * ddx1 - 4 * dx1 + 10 * x1;
        this.dx = 0.5 * ddx0;
        this.ex = dx0;
        this.fx = x0;

        this.ay = -6 * this.y0 - 3 * this.dy0 - 0.5 * this.ddy0 + 0.5 * this.ddy1 - 3 * this.dy1 + 6 * this.y1;
        this.by = 15 * this.y0 + 8 * this.dy0 + 1.5 * this.ddy0 - this.ddy1 + 7 * this.dy1 - 15 * this.y1;
        this.cy = -10 * this.y0 - 6 * this.dy0 - 1.5 * this.ddy0 + 0.5 * this.ddy1 - 4 * this.dy1 + 10 * this.y1;
        this.dy = 0.5 * this.ddy0;
        this.ey = this.dy0;
        this.fy = this.y0;
    }

    /**
     * Get a point on the path.
     * @param {number} t Place along the path to get (0 - 1).
     * @returns {Translation2d} The point on the path.
     */
    getPoint(t) {
        let x = this.ax * t * t * t * t * t + this.bx * t * t * t * t + this.cx * t * t * t + this.dx * t * t + this.ex * t + this.fx;
        let y = this.ay * t * t * t * t * t + this.by * t * t * t * t + this.cy * t * t * t + this.dy * t * t + this.ey * t + this.fy;
        return new Translation2d(x, y);
    }

    __dx(t) {
        return 5 * this._ax * t * t * t * t + 4 * this._bx * t * t * t + 3 * this._cx * t * t + 2 * this._dx * t + this._ex;
    }

    __dy(t) {
        return 5 * this._ay * t * t * t * t + 4 * this._by * t * t * t + 3 * this._cy * t * t + 2 * this._dy * t + this._ey;
    }

    __ddx(t) {
        return 20 * this._ax * t * t * t + 12 * this._bx * t * t + 6 * this._cx * t + 2 * this._dx
    }

    __ddy(t) {
        return 20 * this._ay * t * t * t + 12 * this._by * t * t + 6 * this._cy * t + 2 * this._dy
    }

    __dddx(t) {
        return 60 * this._ax * t * t + 24 * this._bx * t + 6 * this._cx;
    }

    __dddy(t) {
        return 60 * this._ay * t * t + 24 * this._by * t + 6 * this._cy;
    }

    /**
     * Get the velocity at a point on the spline.
     * @param {number} t Point along spline.
     */
    getVelocity(t) {
        return Math.hypot(this.__dx(t), this.__dy(t));
    }

    /**
     * Get the curvature at a point on the spline.
     * @param {number} t  Point along spline.
     */
    getCurvature(t) {
        let temp = this.__dx(t) * this.__ddy(t) - this.__ddx(t) * this.__dy(t)
        temp /= ((this.__dx(t) * this.__dx(t) + this.__dy(t) * __dy(t)) * Math.sqrt((this.__dx(t) * this.__dx(t) + this.__dy(t) * this.__dy(t))));
        return temp;
    }

    /**
     * 
     * @param {number} t 
     */
    getDCurvature(t) {
        let dx2dy2 = (this.__dx(t) * this.__dx(t) + this.__dy(t) * this.__dy(t));
        let num = (this.__dx(t) * this.__dddy(t) - this.__dddx(t) * this.__dy(t)) * dx2dy2 - 3 * (this.__dx(t) * this.__ddy(t) - this.__ddx(t) * this.__dy(t)) * (this.__dx(t) * this.__ddx(t) + this.__dy(t) * this.__ddy(t));
        return num / (dx2dy2 * dx2dy2 * Math.sqrt(dx2dy2));
    }

    /**
     * 
     * @param {number} t 
     */
    dCurvature2(t) {
        let dx2dy2 = (this.__dx(t) * this.__dx(t) + this.__dy(t) * this.__dy(t));
        let num = (this.__dx(t) * this.__dddy(t) - this.__dddx(t) * this.__dy(t)) * dx2dy2 - 3 * (this.__dx(t) * this.__ddy(t) - this.__ddx(t) * this.__dy(t)) * (this.__dx(t) * this.__ddx(t) + this.__dy(t) * this.__ddy(t));
        return num * num / (dx2dy2 * dx2dy2 * dx2dy2 * dx2dy2 * dx2dy2);
    }

    /**
     * Get the rotation at which the robot faces at a point on the spline.
     * @param {number} t The point along the spline.
     */
    getHeading(t) {
        const x = this.__dx(t);
        const y = this.__dy(t);

        let sin = 0;
        let cos = 0;

        const magnitude = Math.hypot(x, y);
        if (magnitude > kEpsilon) {
            sin = y / magnitude;
            cos = x / magnitude;
        } else {
            sin = 0;
            cos = 1;
        }

        return Math.atan2(sin, cos);
    }

    sumDCurvature2() {
        let dt = 1.0 / this._kSamples;
        let sum = 0.0;
        let t = 0.0;

        while (t < 1.0) {
            sum += (dt * dCurvature2(t));
            t += dt;
        }

        return sum;
    }

    toString() {
        return `${this.ax}*t^5 + ${this.bx}*t^4 + ${this.cx}*t^3 + ${this.dx}*t^2 + ${this.ex}* t\n`

    }
}

module.exports = QuinticHermiteSpline;