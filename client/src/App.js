import logo from './logo.svg';
import './App.css';

/**
* gear-toy.js
* http://brm.io/gears-d3-js/
* License: MIT
*/

import * as d3 from 'd3'

import {useEffect} from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useHistory
} from "react-router-dom";
import './tape.css'

var Gear = {

    nextGearId: 0,

    create: function(svg, options) {
        var datum = {
                teeth: Math.round(options.teeth) || 16,
                radius: options.radius || 200,
                x: options.x || 0,
                y: options.y || 0,
                speed: options.power || 0,
                power: options.power || 0,
                angle: options.angle || 0,
                addendum: options.addendum || 8,
                dedendum: options.dedendum || 3,
                thickness: options.thickness || 0.7,
                profileSlope: options.profileSlope || 0.5,
                holeRadius: options.holeRadius || 5,
                dragEvent: 'dragend',
                id: Gear.nextGearId
            };

        Gear.nextGearId += 1;

        datum.rootRadius = datum.radius - datum.dedendum;
        datum.outsideRadius = datum.radius + datum.addendum;
        datum.circularPitch = (1 - datum.thickness) * 2 * Math.PI / datum.teeth;
        datum.pitchAngle = datum.thickness * 2 * Math.PI / datum.teeth;
        datum.slopeAngle = datum.pitchAngle * datum.profileSlope * 0.5;
        datum.addendumAngle = datum.pitchAngle * (1 - datum.profileSlope);

        var gear = svg.append('g')
            .attr('class', 'gear')
            .attr('transform', 'translate(' + datum.x + ', ' + datum.y + ')')
            .datum(datum);

        gear.on('mouseover', function() {
            var $this = d3.select(this);
                $this.attr('transform', $this.attr('transform') + ' scale(1.06)');
        });

        gear.on('mouseout', function() {
            var $this = d3.select(this);
                $this.attr('transform', $this.attr('transform').replace(' scale(1.06)', ''));
        });

        gear.append('path')
            .attr('class', 'gear-path')
            .attr('d', Gear.path);

        return gear;
    },

    setPower: function(gear, power) {
        gear.datum().power = power;
    },

    randomArrange: function(gears, xOffset, yOffset, angleMin, angleMax) {
        var xx = xOffset || 0,
            yy = yOffset || 0,
            angle = 0,
            prevGear,
            nextGear,
            distance,
            collision = false,
            unplacedGears,
            placedGears = [],
            randomPlaced,
            placed;

        // params
        angleMin = angleMin || 0.9;
        angleMax = angleMax || 1.2;

        // first clone and shuffle all the gears
        unplacedGears = Gear.Utility.arrayClone(gears);
        Gear.Utility.arrayShuffle(unplacedGears);

        // place the first gear
        unplacedGears[0].datum().x = xx;
        unplacedGears[0].datum().y = yy;
        placedGears.push(unplacedGears[0]);

        // try place the gears randomly
        // this is a bit hit and miss... but it mostly works

        // for every other gear
        for (var i = 1; i < unplacedGears.length; i++) {
            nextGear = unplacedGears[i].datum();
            randomPlaced = Math.floor(Math.random() * placedGears.length);
            placed = false;
            collision = 2;
            nextGear.power = 0;

            // try mesh to each placed gear until find one that works
            for (var j = 0; j < placedGears.length; j += 1) {
                if (placed === true)
                    break;

                // get the gear in question and find potential position to test
                prevGear = placedGears[(randomPlaced + j) % placedGears.length].datum();
                distance = prevGear.radius + nextGear.radius - nextGear.addendum;
                angle = Math.random() * 2 * Math.PI;

                // try at angular intervals around the gear in question
                // until we find an empty spot where we can place the gear (no collisions)
                for (var k = 0; k < 2 * Math.PI; k += 0.5) {
                    if (placed === true)
                        break;

                    nextGear.x = prevGear.x + Math.cos(angle + k) * distance;
                    nextGear.y = prevGear.y + Math.sin(angle + k) * distance;
                    collision = Gear.anyGearCollides(nextGear, placedGears, 10);

                    if (collision <= 1) {
                        Gear.mesh(prevGear, nextGear);
                        placedGears.push(unplacedGears[i]);
                        placed = true;
                    }
                }
            }

            // the above may fail on rare occasion
            // can't fit so ditch it!
            if (placed !== true) {
                nextGear.x = -100;
                nextGear.y = -100;
            }
        }
    },

    dragBehaviour: function(gears, svg) {
        return d3.behavior.drag()
                    .origin(function(d) { return d; })
                    .on('dragstart', function (d, i) {
                        d.dragEvent = 'dragstart';
                        d3.select(this).classed('dragging', true);
                        d3.select('body').classed('dragging', true);
                    })
                    .on('drag', function (d, i) {
                        var collision = false,
                            oldX = d.x,
                            oldY = d.y;

                        d.x = d3.event.x;
                        d.y = d3.event.y;
                        d.x = Math.max(d.radius, d.x);
                        d.y = Math.max(d.radius, d.y);

                        d.dragEvent = 'drag';
                        collision = Gear.anyGearCollides(d3.select(this).datum(), gears);

                        if (!collision) {
                            d3.select(this).attr('transform', function(d, i){
                                return 'translate(' + [ d.x, d.y ] + ')';
                            });

                            Gear.updateGears(gears);
                        } else {
                            d.x = oldX;
                            d.y = oldY;
                        }
                    })
                    .on('dragend', function (d, i) {
                        d.dragEvent = 'dragend';
                        d3.select(this).classed('dragging', false);
                        d3.select('body').classed('dragging', false);
                        Gear.updateGears(gears);
                    });
    },

    anyGearCollides: function(gearA, gears, tolerance) {
        var collisions = 0;
        tolerance = tolerance || 0;

        for (var i = 0; i < gears.length; i++) {
            var gearB = gears[i];

            if (Gear.gearCollides(gearA, gearB.datum(), tolerance))
                collisions += 1;
        }

        return collisions;
    },

    gearCollides: function(gearA, gearB, tolerance) {
        var threshold = gearA.radius + gearB.radius - Math.max(gearA.addendum, gearB.addendum) + tolerance;
                tolerance = tolerance || 0;
      
        if (gearA.id === gearB.id || 
            Math.abs(gearA.x - gearB.x) > threshold || 
            Math.abs(gearA.y - gearB.y) > threshold)
                return false;

        if (Gear.Utility.distanceSquared(gearA.x, gearA.y, gearB.x, gearB.y) < threshold * threshold)
            return true;

        return false;
    },

    propagateGears: function(gear, visited) {
        var connected = gear.connected;
      
        visited = visited || {};
        visited[gear.id] = true;

        for (var nextGearId in connected) {
            if (connected.hasOwnProperty(nextGearId)) {
                var nextGear = connected[nextGearId];

                if (nextGear.id === gear.id || nextGear.id in visited)
                    continue;

                visited[nextGear.id] = true;

                nextGear.speed -= gear.speed * (gear.teeth / nextGear.teeth);

                Gear.propagateGears(nextGear, visited);
            }
        }
    },

    updateGears: function(gears) {
        var gearA, 
            gearB,
            datum;
      
        for (var i = 0; i < gears.length; i += 1) {
            datum = gears[i].datum();
            datum.connected = {};
            datum.speed = datum.power;
        }

        for (i = 0; i < gears.length; i += 1) {
            for (var j = i + 1; j < gears.length; j += 1) {
                gearA = gears[i];
                gearB = gears[j];

                var datumA = gearA.datum(),
                    datumB = gearB.datum(),
                    collides = Gear.gearCollides(datumA, datumB, Math.max(datumA.addendum, + datumB.addendum));
              
                if (collides) {
                    datumA.connected[datumB.id] = datumB;
                    datumB.connected[datumA.id] = datumA;
                }
            }
        }

        for (i = 0; i < gears.length; i += 1) {
            gearA = gears[i];

            if (!gearA.classed('dragging'))
                continue;

            var nextGear = gearA.datum(),
                connectedKeys = Gear.Utility.keys(nextGear.connected);

            if (connectedKeys.length === 0)
                continue;  

            var gear = nextGear.connected[connectedKeys[0]];

            Gear.mesh(gear, nextGear);
        }

        var visited = {};

        for (i = 0; i < gears.length; i += 1) {
            datum = gears[i].datum();

            if (Math.abs(datum.power) > 0) {
                Gear.propagateGears(datum, visited);
                gears[i].classed('powered', true);
            } else {
                gears[i].classed('powered', false);
            }
        }

        for (i = 0; i < gears.length; i += 1) {
            datum = gears[i].datum();
            if (Math.abs(datum.speed) > 0) {
                gears[i].classed('moving', true);
            } else {
                gears[i].classed('moving', false);
            }
        }
    },

    mesh: function(gear, nextGear) {
        var theta = Gear.Utility.angle(gear.x, gear.y, nextGear.x, nextGear.y),
            pitch = nextGear.circularPitch + nextGear.slopeAngle * 2 + nextGear.addendumAngle,
            radiusRatio = gear.radius / nextGear.radius;
        nextGear.angle = -(gear.angle % (2 * Math.PI)) * radiusRatio + theta + theta * radiusRatio + pitch * 0.5;
    },

    path: function(options) {
        var addendum = options.addendum,
            dedendum = options.dedendum,
            thickness = options.thickness,
            profileSlope = options.profileSlope,
            holeRadius = options.holeRadius,
            teeth = options.teeth,
            radius = options.radius - addendum,
            rootRadius = radius - dedendum,
            outsideRadius = radius + addendum,
            circularPitch = (1 - thickness) * 2 * Math.PI / teeth,
            pitchAngle = thickness * 2 * Math.PI / teeth,
            slopeAngle = pitchAngle * profileSlope * 0.5,
            addendumAngle = pitchAngle * (1 - profileSlope),
            theta = (addendumAngle * 0.5 + slopeAngle),
            path = ['M', rootRadius * Math.cos(theta), ',', rootRadius * Math.sin(theta)];

        for(var i = 0; i < teeth; i++) {
            theta += circularPitch;

            path.push(
              'A', rootRadius, ',', rootRadius, ' 0 0,1 ', rootRadius * Math.cos(theta), ',', rootRadius * Math.sin(theta),
              'L', radius * Math.cos(theta), ',', radius * Math.sin(theta)
            );

            theta += slopeAngle;
            path.push('L', outsideRadius * Math.cos(theta), ',', outsideRadius * Math.sin(theta));
            theta += addendumAngle;
            path.push('A', outsideRadius, ',', outsideRadius, ' 0 0,1 ', outsideRadius * Math.cos(theta), ',', outsideRadius * Math.sin(theta));
            theta += slopeAngle;

            path.push(
                'L', radius * Math.cos(theta), ',', radius * Math.sin(theta),
                'L', rootRadius * Math.cos(theta), ',', rootRadius * Math.sin(theta)
            );
        }

        path.push('M0,', -holeRadius, 'A', holeRadius, ',', holeRadius, ' 0 0,0 0,', holeRadius, 'A', holeRadius, ',', holeRadius, ' 0 0,0 0,', -holeRadius, 'Z');

        return path.join('');
    }
};

Gear.Utility = {
    keys: function(object) {
        if (Object.keys)
            return Object.keys(object);

        var keys = [];
        for (var key in object) {
            if (Object.prototype.hasOwnProperty.call(object, key)) {
                keys.push(key);
            }
        }
        return keys;
    },

    distanceSquared: function(x1, y1, x2, y2) {
        var xs = x2 - x1,
            ys = y2 - y1;
        return (xs * xs) + (ys * ys);
    },

    angle: function(x1, y1, x2, y2) {
        var angle = Math.atan2(y2 - y1, x2 - x1);
        return angle > 0 ? angle : 2 * Math.PI + angle;
    },

    sign: function(x) {
        return x < 0 ? -1 : 1;
    },

    arrayShuffle: function(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    },

    arrayClone: function(array) {
        return array.slice(0);
    }
};

var _svg,
    _allGears = [],
    _randomiseInterval,
    _canvasWidth = 1280,
    _canvasHeight = 768,
    _xOffset = _canvasWidth * 0.5,
    _yOffset = _canvasHeight * 0.4,
    _gearFactors = [64, 64, 32, 48, 48, 96, 112, 256],
    _gearStyles = ['style-0', 'style-1', 'style-2', 'style-3', 'style-4'],
    _autoShuffle = true;

var _options = {
  radius: 16,
  holeRadius: 0.4,
  transition: true,
  speed: 0.01,
  autoShuffle: true,
  number: 20,
  addendum: 8,
  dedendum: 3,
  thickness: 0.7,
  profileSlope: 0.5
};

var main = function() {

  // set up our d3 svg element
  _svg = d3.select('.gears-d3-canvas')
  .append('svg')
  .attr('viewBox', '0 0 ' + _canvasWidth + ' ' + _canvasHeight)
  .attr('preserveAspectRatio', 'xMinYMin slice');

  // generate and randomise scene
  _generateScene(_options);
  _randomiseScene(false);

  // start a timer to randomise every few secs
  _randomiseInterval = setInterval(function() {
    if (_autoShuffle)
      _randomiseScene(true);
  }, 4000);
  
  setTimeout(function() {
    _randomiseScene(true);
  }, 100);

  // start the d3 animation timer
  d3.timer(function () {
    _svg.selectAll('.gear-path')
    .attr('transform', function (d) {
      d.angle += d.speed;
      return 'rotate(' + d.angle * (180 / Math.PI) + ')';
    });
  });
};

var _generateScene = function(options) {
  var holeRadius,
      teeth,
      radius,
      factor,
      newGear,
      innerRadius;

  _gearStyles = Gear.Utility.arrayShuffle(_gearStyles);

  for (var i = 0; i < options.number; i++) {
    factor = _gearFactors[i % _gearFactors.length];
    radius = factor / 2;
    teeth = radius / 4;
    innerRadius = radius - options.addendum - options.dedendum;
    holeRadius = factor > 96 ? innerRadius * 0.5 + innerRadius * 0.5 * options.holeRadius : innerRadius * options.holeRadius;

    _allGears.push(newGear = Gear.create(_svg, { 
      radius: radius, 
      teeth: teeth, 
      x: 0, 
      y: 0, 
      holeRadius: holeRadius,
      addendum: options.addendum,
      dedendum: options.dedendum,
      thickness: options.thickness,
      profileSlope: options.profileSlope
    }));

    newGear.classed(_gearStyles[i % _gearStyles.length], true);
  }
};

var _randomiseScene = function(transition) {
  _allGears = Gear.Utility.arrayShuffle(_allGears);
  Gear.randomArrange(_allGears, _xOffset, _yOffset);
  Gear.setPower(_allGears[0], 0.01);
  Gear.updateGears(_allGears);

  _svg.selectAll('.gear')
  .each(function(d, i) {
    if (transition) {
      d3.select(this)
      .transition()
      .ease('elastic')
      .delay(i * 80 + Math.random() * 80)
      .duration(1500)
      .attr('transform', function(d) {
        return 'translate(' + [ d.x, d.y ] + ')';
      });
    } else {
      d3.select(this)
      .attr('transform', function(d) {
        return 'translate(' + [ d.x, d.y ] + ')';
      });
    }
  });
};

function App() {
  const history = useHistory();

  useEffect(()=>{
    main();
  })

  return (
    <div className="App">
      <br/>
      <br/>
      <div className="container gears-d3-canvas">
          
      </div>
      <div >
        <h1 className="title">eth(OS)step</h1>
      </div>
      <br/>
      <div class="container-tape">
          <div class="rotator">
              <div class="face">
                <div class="screws">
                  <i></i><i></i><i></i><i></i>
                </div>
                <div class="shadow"></div>
                <div class="label">
                  <div class="inner">
                    <div class="lines">
                      <i></i><i></i><i></i>
                    </div>
                    <div class="stripes">
                      <i></i><i></i>
                    </div>
                    <div class="cutout">
                      <div class="wheel">
                        <i></i><i></i><i></i><i></i><i></i><i></i>
                      </div>
                      <div class="wheel">
                        <i></i><i></i><i></i><i></i><i></i><i></i>
                      </div>
                      <div class="window">
                        <div class="spool-left"></div>
                        <div class="spool-right"></div>
                        <div class="reel-left"></div>
                        <div class="reel-right"></div>
                      </div>
                      <div class="ticks"></div>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </div>
        <br/>
        <div className="title">
            Creating lockstep torque rhythms for global tree & mind repair, 
            <br/>
            as we rewind our tape on healing.
        </div>
      <br/>

      <button className="button-begin" onClick={() => history.push('/gather')}>begin</button>
    </div>
  );
}

export default App;
