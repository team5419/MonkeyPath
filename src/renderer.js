/* eslint-disable */
const $ = window.$ = window.jQuery = require('jQuery');
require('jquery-ui-dist/jquery-ui');
//const PathGen = require('./PathGen.js');
const Translation2d = require('./Translation2d.js');
const Rotation2d = require('./Rotation2d.js');
const Pose2d = require('./Pose2d.js');

// class Waypoint extends Pose2d{
//   constructor(x,y,handle1,handle2) {
//     super(x,y);
//     this.handle1 = handle1;
//     handle1.waypoint = this;
//     if(handle2){
//       this.handle2 = handle2;
//       handle2.waypoint = this;
//     }
//   };
// }

// class Handle extends Translation2d{}
  

let waypoints = [];
// let handles = [];
let splinePoints = [];
let movePoints = [];
let ctx;
let ctxBackground;
let image;
let imageFlipped;
let wto;
let animating = false;

const fieldWidth = 886; // inches
const fieldHeight = 360; // inches
const width = 1604; // pixels
const height = 651; // pixels

const robotWidth = 22.01; // inches
const robotHeight = 27.47; // inches

const waypointRadius = 7;
const handleRadius = 5;
const splineWidth = 2;
const pi = Math.PI;

let handle;
let offSet = 1;

/**
 * Converts coordinates relative to the full picture to coordinates relative to field
 *
 * @param mX X-coordinate
 * @param mY Y-coordinate
 * @returns coords coordinates list of x, y
 */

function getFieldCoords(mX, mY){
  let x = mX - 162;
  let y = -1 * mY + 256;
  let coords = [x, y]
  return (coords);
}

/**
 * Converts coordinates relative to the field to coordinates relative to full picture
 *
 * @param mX X-coordinate
 * @param mY Y-coordinate
 * @returns coordinates list of x, y
 */

function getFullCoords(mX, mY){
  let x = mX + 162;
  let y = -1 * mY + 256;
  let coords = [x, y]
  return (coords);
}

function d2r(d) {
  return d * (Math.PI / 180);
}

function r2d(r) {
  return r * (180 / Math.PI);
}

let animation;

/**
 * Draws the generated path without reloading the points
 */

 function animate() {
  drawSplines(false, true);
}

/**
 * Draws to canvas
 *
 * @param {number} style specifies what to draw: 1 is waypoints only, 2 is waypoints + splines, and 3 is the animation
 */

function draw(style) {
  clear();
  drawWaypoints();
  switch (style) {
    case 1:
      break;
    case 2:
      drawSplines(true);
      drawSplines(false);
      break;
    case 3:
      animate();
      break;
    default:
      break;
  }
}

/**
 * Draws 4 points on the vertices of the bounding box of the robot
 *
 * @param position list of x, y
 * @param heading angle in degrees
 */

function drawRobot(position, heading) {
  const h = heading;
  const angles = [h + (pi / 2) + t, h - (pi / 2) + t, h + (pi / 2) - t, h - (pi / 2) - t];
  const points = [];
  angles.forEach((angle) => {
    const point = new Translation2d(
      position.x + (r * Math.cos(angle)),
      position.y + (r * Math.sin(angle)));
    points.push(point);
    point.draw(Math.abs(angle - heading) < pi / 2 ? '#00AAFF' : '#0066FF', splineWidth, ctx);
  });
}

/**
 * Fills path with velocity-dependent color
 *
 * @param position Pose2d list of generated points
 * @param heading angle in degrees
 * @param color hue: rgba
 */

function fillRobot(position, heading, color) {
  const previous = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = 'destination-over';

  const translation = position.translation;

  ctx.translate(translation.drawX, translation.drawY);
  ctx.rotate(-heading);

  const w = robotWidth * (width / fieldWidth);
  const h = robotHeight * (height / fieldHeight);
  ctx.fillStyle = color || 'rgba(0, 0, 0, 0)';
  ctx.fillRect(-h / 2, -w / 2, h, w);

  ctx.rotate(heading);
  ctx.translate(-translation.drawX, -translation.drawY);

  ctx.globalCompositeOperation = previous;
}

/**
 * Draws generated path. Can animate or update
 *
 * @param {boolean} fill
 * @param {boolean} animate
 */

function drawSplines(fill, animate) {
  animate = animate || false;
  let i = 0;

  if (animate) {
    clearInterval(animation);

    animation = setInterval(() => {
      if (i === splinePoints.length) {
        animating = false;
        clearInterval(animation);
        return;
      }

      animating = true;

      const splinePoint = splinePoints[i];
      const hue = Math.round(180 * (i++ / splinePoints.length));

      const previous = ctx.globalCompositeOperation;
      fillRobot(splinePoint, splinePoint.rotation.getRadians(), `hsla(${hue}, 100%, 50%, 0.025)`);
      ctx.globalCompositeOperation = 'source-over';
      drawRobot(splinePoint, splinePoint.rotation.getRadians());
      splinePoint.draw(false, splineWidth, ctx);
      ctx.globalCompositeOperation = previous;
    }, 25);
  } else {
    splinePoints.forEach((splinePoint) => {
      splinePoint.draw(false, splineWidth, ctx);

      if (fill) {
        const hue = Math.round(180 * (i++ / splinePoints.length));
        fillRobot(splinePoint, splinePoint.rotation.getRadians(), `hsla(${hue}, 100%, 50%, 0.025)`);
      } else {
        drawRobot(splinePoint, splinePoint.rotation.getRadians());
      }
    });
  }
}

/**
 * Draws user-inputed waypoints using drawRobot()
 */

function drawWaypoints() {
  waypoints.forEach((waypoint) => {
    //waypoint.draw(true, waypointRadius, ctx);
    drawRobot(waypoint, waypoint.rotation.getRadians());
    drawRobot(waypoint, 0);
  });
  handles.forEach((handle) => {
    handle.draw(true, handleRadius, ctx);
    ctx.beginPath()
    ctx.moveTo(handle.x, handle.y);
    ctx.lineTo(handle.x, handle.y);
    ctx.stroke()
  })
}

/**
 * Run when points are updated,
 * pushes new points to waypoints and redraws the path
 * @var {Array} splinePoints generated Pose2d points
 */


function update() {
  if (animating) {
    return;
  }
  draw(1);
  splinePoints = [];
  //splinePoints = PathGen.generatePath(waypoints);
  var printSpline = [];
  for (i = 1; i <= splinePoints.length - 1; i++) {
    printSpline.push(splinePoints[i].getTranslation);
  }

  splinePoints.pop();

  draw(2);
}


const r = Math.sqrt((robotWidth ** 2) + (robotHeight ** 2)) / 2;
const t = Math.atan2(robotHeight, robotWidth);

/**
 * Delays before updating
 */

function rebind() {
  const change = 'propertychange change click keyup input paste';
  const input = $('input');
  input.unbind(change);
  input.bind(change, () => {
    clearTimeout(wto);
    wto = setTimeout(() => {
      update();
    }, 500);
  });
}

function init() {
  const field = $('#field');
  const background = $('#background');
  const canvases = $('#canvases');

  field.mousedown((e) => {handleMouseDown(e)});
  field.mousemove((e) => {handleMouseMove(e)});
  field.mouseup((e) => {handleMouseUp(e)});
  field.mouseout((e) => {handleMouseOut(e)});

  const widthString = `${width / 1.5}px`;
  const heightString = `${height / 1.5}px`;

  field.css('width', widthString);
  field.css('height', heightString);
  background.css('width', widthString);
  background.css('height', heightString);
  canvases.css('width', widthString);
  canvases.css('height', heightString);

  ctx = document.getElementById('field').getContext('2d');
  ctx.canvas.width = width;
  ctx.canvas.height = height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#FF0000';

  ctxBackground = document.getElementById('background').getContext('2d');
  ctxBackground.canvas.width = width;
  ctxBackground.canvas.height = height;
  ctx.clearRect(0, 0, width, height);

  image = new Image();
  image.src = 'img/field.png';
  image.onload = function () {
    ctxBackground.drawImage(image, 0, 0, width, height);
    update();
  };
  imageFlipped = new Image();
  imageFlipped.src = 'img/fieldFlipped.png';
  rebind();

  addPoint()
}

let flipped = false;
/**
 * Flips field and updates
 */
function flipField() {
  flipped = !flipped;
  ctx.drawImage(flipped ? imageFlipped : image, 0, 0, width, height);
  update();
}

/**
 * Clears all drawn elements
 */

function clear() {
  ctx = document.getElementById('field').getContext('2d');
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#FF0000';

  ctxBackground.clearRect(0, 0, width, height);
  ctxBackground.fillStyle = '#FF0000';
  ctxBackground.drawImage(flipped ? imageFlipped : image, 0, 0, width, height);
}

/**
 * Runs when Add Point is clicked, updates
 */

function addPoint() {
  let prev, waypoint;
  if (waypoints.length > 0) prev = waypoints[waypointss.length-1];
  else prev = new Translation2d(20,20);

  waypoints.push(new Pose2d(new Translation2d(prev.x + 50, prev.x + 50), new Rotation2d()));

  // if (waypoints.length > 0) { 
  //   prev = waypoints[waypoints.length - 1];
  //   waypoint = new Waypoint(
  //     prev.x + 50, 
  //     prev.y + 50, 
  //     new Handle(prev.x + 75, prev.y + 75),
  //     new Handle(prev.x + 25, prev.y + 25));
  //   waypoints.push(waypoint);
  //   handles.push(waypoint.handle1);
  //   handles.push(waypoint.handle2);
  // }
  // else {
  //   waypoint = new Waypoint(20, 20, new Handle(30, 30));
  //   waypoints.push(waypoint);
  //   handles.push(waypoint.handle1);
  // }

  // var newFieldCoords = getFullCoords(prev.x + 50, prev.y + 50);
  // $('#canvases').append(`${"<span class = 'dot' style={left: " +
  //   newFieldCoords[0] + "; top: " +
  //   newFieldCoords[1] +  ">" + "</span>"}`);

  console.log(waypoint)

  $('tbody').append(`${'<tr>' + "<td class='drag_handler'></td>"
        + "<td class='x'><input type='number' value='"}${waypoint.x}'></td>`
        + `<td class='y'><input type='number' value='${waypoint.y}'></td>`
        + `<td class='heading'><input type='number' value='${90}'></td>`
        // + '<td class=\'handles\'>placeholder</td>'
        + '<td class=\'enabled\'><input type=\'checkbox\' checked></td>'
        + '<td class=\'delete\'><button onclick=\'$(this).parent().parent().remove();update()\'>&times;</button></td></tr>');
  update();
  rebind();
}

function handleMouseDown(e){
  coords = getFieldCoords(e.clientX, e.clientY);
  x = coords[0];
  y = coords[1];
  console.log('mouse down', handles)
  handles.forEach((tHandle) => {
    console.log(tHandle,x,y, Math.sqrt((tHandle.x - x)**2 + (tHandle.y - y)**2));
    if (Math.sqrt((i.x - x)**2 + (i.y - y)**2) < offSet){
      handle = i;
      console.log('found handle', handle);
    }
  })
}

function handleMouseMove(x,y){
  if(handle){
    console.log('move handle')
    handle.x = x;
    handle.y = y;
    update()
  }
}

function handleMouseUp(){ handle = undefined; }

function handleMouseOut(){ handleMouseUp(); }

$(document).ready(init);
