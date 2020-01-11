import { TouchBarScrubber } from "electron";
const Vector2d = require('./Vector2d');

/**
 * Represents a Quintic Hermite Spline
 * (I was asked to blindly port this code from Kotlin. I have no idea how it works or how to document it. -Sam)
 */
class QuinticHermiteSpline {
  constructor(x0, x1, dx0, dx1, ddx0, ddx1, y0, y1, dy0, dy1, ddy0, ddy1) {
    this.x0 = x0;
    this.x1 = x1;
    this.dx0 = dx0;
    this.dx1 = dx1;
    this.ddx0 = ddx0;
    this.ddx1 = ddx1;
    this.y0 = y0;
    this.y1 = y1;
    this.dy0 = dy0;
    this.dy1 = dy1;
    this.ddy0 = ddy0;
    this.ddy1 = ddy1;

    this._ax = 0;
    this._bx = 0;
    this._cx = 0;
    this._dx = 0;
    this._ex = 0;
    this._fx = 0;

    this._ay = 0;
    this._by = 0;
    this._cy = 0;
    this._dy = 0;
    this._ey = 0;
    this._fy = 0;

    this.calcCoeffs();
  }

  calcCoeffs() {
    this._ax = -6 * x0 - 3 * dx0 - 0.5 * ddx0 + 0.5 * ddx1 - 3 * dx1 + 6 * x1;
    this._bx = 15 * x0 + 8 * dx0 + 1.5 * ddx0 - ddx1 + 7 * dx1 - 15 * x1;
    this._cx = -10 * x0 - 6 * dx0 - 1.5 * ddx0 + 0.5 * ddx1 - 4 * dx1 + 10 * x1;
    this._dx = 0.5 * ddx0;
    this._ex = dx0;
    this._fx = x0;

    this._ay = -6 * this.y0 - 3 * this.dy0 - 0.5 * this.ddy0 + 0.5 * this.ddy1 - 3 * this.dy1 + 6 * this.y1;
    this._by = 15 * this.y0 + 8 * this.dy0 + 1.5 * this.ddy0 - this.ddy1 + 7 * this.dy1 - 15 * this.y1;
    this._cy = -10 * this.y0 - 6 * this.dy0 - 1.5 * this.ddy0 + 0.5 * this.ddy1 - 4 * this.dy1 + 10 * this.y1;
    this._dy = 0.5 * this.ddy0;
    this._ey = this.dy0;
    this._fy = this.y0;
  }

  /**
   * Get a point on the path.
   * @param {number} t Place along the path to get (0 - 1).
   * @returns {Vector2d} The point on the path.
   */
  getPoint(t) {
    let x = this.ax * this.t * this.t * this.t * this.t * this.t + this.bx * this.t * this.t * this.t * this.t + this.cx * this.t * this.t * this.t + this.dx * this.t * this.t + this.ex * this.t + this.fx;
    let y = this.ay * this.t * this.t * this.t * this.t * this.t + this.by * this.t * this.t * this.t * this.t + this.cy * this.t * this.t * this.t + this.dy * this.t * this.t + this.ey * this.t + this.fy;
    return new Vector2d(x, y);
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

  dCurvature2(t) {
    let dx2dy2 = (this.__dx(t) * this.__dx(t) + this.__dy(t) * this.__dy(t));
    let num = (this.__dx(t) * this.__dddy(t) - this.__dddx(t) * this.__dy(t)) * dx2dy2 - 3 * (this.__dx(t) * this.__ddy(t) - this.__ddx(t) * this.__dy(t)) * (this.__dx(t) * this.__ddx(t) + this.__dy(t) * this.__ddy(t));
    return num * num / (dx2dy2 * dx2dy2 * dx2dy2 * dx2dy2 * dx2dy2);
  }

  // getHeading()
}