const kEps = 1E-9;

class Rotation2d {
  constructor(x, y, normalize) {
    this.cos = x;
    this.sin = y;
    this.normalize = normalize;
    if (normalize) {
      this.normalizeFunc();
    }
  }

  static fromRadians(angleRadians) {
    return new Rotation2d(Math.cos(angleRadians), Math.sin(angleRadians), false);
  }

  static fromDegrees(angleDegrees) {
    return this.fromRadians(angleDegrees / 180 * Math.PI);
  }

  normalizeFunc() {
    const magnitude = Math.hypot(this.cos, this.sin);
    if (magnitude > kEps) {
      this.cos /= magnitude;
      this.sin /= magnitude;
    } else {
      this.sin = 0;
      this.cos = 1;
    }
  }

  tan() {
    if (Math.abs(this.cos) < kEps) {
      if (this.sin >= 0.0) {
        return Number.POSITIVE_INFINITY;
      }
      return Number.NEGATIVE_INFINITY;
    }
    return this.sin / this.cos;
  }

  getRadians() {
    return Math.atan2(this.sin, this.cos);
  }

  getDegrees() {
    return this.getRadians() / Math.PI * 180;
  }

  rotateBy(other) {
    return new Rotation2d(this.cos * other.cos - this.sin * other.sin,
      this.cos * other.sin + this.sin * other.cos, true);
  }

  normal() {
    return new Rotation2d(-this.sin, this.cos, false);
  }

  inverse() {
    return new Rotation2d(this.cos, -this.sin, false);
  }

  interpolate(other, x) {
    if (x <= 0) {
      return new Rotation2d(this.cos, this.sin, this.normalize);
    } if (x >= 1) {
      return new Rotation2d(other.cos, other.sin, other.normalize);
    }
    const angleDiff = this.inverse().rotateBy(other).getRadians();
    return this.rotateBy(Rotation2d.fromRadians(angleDiff * x));
  }

  distance(other) {
    return this.inverse().rotateBy(other).getRadians();
  }
}

module.exports = Rotation2d;
