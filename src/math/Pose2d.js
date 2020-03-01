class Pose2d {
  constructor(translation, rotation, comment) {
    this.translation = translation;
    this.rotation = rotation;
    this.comment = comment || '';
  }
  
  get getTranslation() {
    return this.translation;
  }

  get getRotation() {
    return this.rotation;
  }

  transformBy(other) {
    return new Pose2d(this.translation.translateBy(other.translation.rotateBy(this.rotation)),
      this.rotation.rotateBy(other.rotation));
  }

  inverse() {
    const rotationInverted = this.rotation.inverse();
    return new Pose2d(this.translation.inverse().rotateBy(rotationInverted), rotationInverted);
  }

  normal() {
    return new Pose2d(this.translation, this.rotation.normal());
  }

  heading(other) {
    return Math.atan2(this.translation.y - other.translation.y,
      this.translation.x - other.translation.x);
  }
  
  distance(other) {
    return Math.hypot(this.translation.x - other.translation.x, this.translation.y - other.translation.y)
  }

  draw(drawHeading, radius, ctx) {
    this.translation.draw(null, radius, ctx);

    if (!drawHeading) {
      return;
    }

    const x = this.translation.drawX;
    const y = this.translation.drawY;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 25 * Math.cos(-this.rotation.getRadians()),
      y + 25 * Math.sin(-this.rotation.getRadians()));
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.closePath();
  }

  toString() {
    return `${this.translation.x}, ${this.translation.y}, ${this.rotation.getDegrees()}`
  }

  transform(other) {
    other.position.rotate(this.rotation);
    this.translation.translate(other.translation);
    this.rotation.rotate(other.rotation);
  }
}

module.exports = Pose2d;
