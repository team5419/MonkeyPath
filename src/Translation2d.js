const xOffset = 120;
const yOffset = 180;

class Translation2d {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  norm() {
    return Math.hypot(this.x, this.y);
  }

  norm2() {
    return this.x * this.x + this.y * this.y;
  }

  translateBy(other) {
    return new Translation2d(this.x + other.x, this.y + other.y);
  }

  rotateBy(rotation) {
    return new Translation2d(
      this.x * rotation.cos - this.y * rotation.sin,
      this.x * rotation.sin + this.y * rotation.cos);
  }

  direction() {
    return new Rotation2d(this.x, this.y, true);
  }

  inverse() {
    return new Translation2d(-this.x, -this.y);
  }

  interpolate(other, x) {
    if (x <= 0) {
      return new Translation2d(this.x, this.y);
    } if (x >= 1) {
      return new Translation2d(other.x, other.y);
    }
    return this.extrapolate(other, x);
  }

  extrapolate(other, x) {
    return new Translation2d(x * (other.x - this.x) + this.x, x * (other.y - this.y) + this.y);
  }

  scale(s) {
    return new Translation2d(this.x * s, this.y * s);
  }

  static dot(a, b) {
    return a.x * b.x + a.y * b.y;
  }

  static getAngle(a, b) {
    const cosAngle = this.dot(a, b) / (a.norm() * b.norm());
    if (Double.isNaN(cosAngle)) {
      return new Rotation2d(1, 0, false);
    }

    return Rotation2d.fromRadians(Math.acos(Math.min(1.0, Math.max(cosAngle, -1.0))));
  }

  static cross(a, b) {
    return a.x * b.y - a.y * b.x;
  }

  distance(other) {
    return this.inverse().translateBy(other).norm();
  }

  draw(color, radius, ctx) {
    color = color || '#2CFF2C';
    ctx.beginPath();
    ctx.arc(this.drawX, this.drawY, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.fill();
    ctx.lineWidth = 0;
    ctx.stroke();
  }

  get drawX() {
    return (this.x + xOffset) * (width / fieldWidth);
  }

  get drawY() {
    return height - (this.y + yOffset) * (height / fieldHeight);
  }
}

module.exports = Translation2d
