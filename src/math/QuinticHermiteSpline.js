import { TouchBarScrubber } from "electron";
const Vector2d = require('./Vector2d');

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
}