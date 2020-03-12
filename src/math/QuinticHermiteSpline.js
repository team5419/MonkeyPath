// import { TouchBarScrubber } from "electron";
kEpsilon = require('./constants');
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

        this.x0 = p0.translation.x;
        this.x1 = p1.translation.x;
        this.dx0 = Math.cos(p0.rotation.getRadians()) * scale;
        this.dx1 = Math.cos(p1.rotation.getRadians()) * scale;
        this.ddx0 = 0;
        this.ddx1 = 0;

        this.y0 = p0.translation.y;
        this.y1 = p1.translation.y;
        this.dy0 = Math.sin(p0.rotation.getRadians()) * scale;
        this.dy1 = Math.sin(p1.rotation.getRadians()) * scale;
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

        this.calcCoeffs()
    }

    calcCoeffs() {
        this.ax = -6 * this.x0 - 3 * this.dx0 - 0.5 * this.ddx0 + 0.5 * this.ddx1 - 3 * this.dx1 + 6 * this.x1;
        this.bx = 15 * this.x0 + 8 * this.dx0 + 1.5 * this.ddx0 - this.ddx1 + 7 * this.dx1 - 15 * this.x1;
        this.cx = -10 * this.x0 - 6 * this.dx0 - 1.5 * this.ddx0 + 0.5 * this.ddx1 - 4 * this.dx1 + 10 * this.x1;
        this.dx = 0.5 * this.ddx0;
        this.ex = this.dx0;
        this.fx = this.x0;

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
        return 5 * this.ax * t * t * t * t + 4 * this.bx * t * t * t + 3 * this.cx * t * t + 2 * this.dx * t + this.ex;
    }

    __dy(t) {
        return 5 * this.ay * t * t * t * t + 4 * this.by * t * t * t + 3 * this.cy * t * t + 2 * this.dy * t + this.ey;
    }

    __ddx(t) {
        return 20 * this.ax * t * t * t + 12 * this.bx * t * t + 6 * this.cx * t + 2 * this.dx
    }

    __ddy(t) {
        return 20 * this.ay * t * t * t + 12 * this.by * t * t + 6 * this.cy * t + 2 * this.dy
    }

    __dddx(t) {
        return 60 * this.ax * t * t + 24 * this.bx * t + 6 * this.cx;
    }

    __dddy(t) {
        return 60 * this.ay * t * t + 24 * this.by * t + 6 * this.cy;
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