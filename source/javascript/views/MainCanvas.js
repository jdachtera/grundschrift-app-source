enyo.kind({
    name:'Grundschrift.Views.MainCanvas',
    kind:'Grundschrift.Views.Canvas',
    components:[
        {kind:'Animator', path:0, lastPoint:0, name:'demoAnimator', easingFunction:enyo.easing.linear},
        {kind:'Image', name:'demoFinger', classes:'demoFinger', src:'assets/images/finger.png', showing:false},
        {name:'wrapper', classes:'wrapper', components:[
            {name:'canvas', tag:'canvas'}
        ]}
    ],
    published:{
        levelPaths:[],
        currentPath:0,
        currentPoint:0,
        currentAnchor:0,
        anchorPoints:[],
        finished:false,
        sensitivity:60,
		aid: false,
		aidStep: false,
        handOrientation:'right',
        child:'',
        drawMode:'advanced' //'simple'
    },

	statics: {
		easing: {
			tenPercentQuadInOut: function() {

			}
		}
	},

    events:{
        onFinished:'',
        onPlayStart:'',
        onPlayStop:''
    },

    handlers:{
        ontap:'tapHandler',
        onSettingsLoaded:'onSettingsLoaded'
    },

    inDemoMode:false,

    drawMode:'simple',



    /**
     * Initializes some vairables
     * @protected
     * @returns void
     */
    create:function () {
        this.inherited(arguments);

        // The paths used for recognition
        this.normalizedLevelPaths = [];

        // The paths used for drawing
        this.levelPaths = [];

        this.drawConf = enyo.mixin({}, this.defaultConf);
        this.finishedConf = enyo.mixin({}, this.drawConf);
        this.finishedConf.strokeStyle = '#0B610B';
        this.finishedConf.fillStyle = '#0B610B';
        this.anchorConf = enyo.mixin({}, this.defaultConf);
        this.anchorConf.lineWidth /= 2;
        this.anchorConf.globalCompositeOperation = 'source-over'
        //this.anchorConf.globalAlpha = 0.5;

        this.lastFrameTime = 0;
        this.blinkCounter = 0;
    },

    onSettingsLoaded:function (inSender, inEvent) {
        this.drawMode = inEvent.settings.drawMode;
    },

    /**
     * Sets the hand orientation
     * @public
     * @param orientation The orientation. Either left or right. Defaults to right.
     * @return void
     */
    setHandOrientation:function (orientation) {
        this.handOrientation = orientation;
        this.$.demoFinger.setSrc(this.handOrientation === 'left' ? 'assets/images/finger_left.png' : 'assets/images/finger.png');
    },

    sensitivityChanged:function () {

        if (this.level) {
            console.log('Recomputing level paths due to sensitivity change. Sensitivity: ' + this.sensitivity);
            this.levelChanged();
        }
    },

    levelChanged:function () {
        this.inherited(arguments);

        this.levelPaths.length = 0;
        this.anchorPoints.length = 0;
        this.normalizedLevelPaths.length = 0;


        if (this.level && this.backgroundScale && this.backgroundScale < Infinity && this.sensitivity) {
            this.drawConf.lineWidth = this.level.lineWidth;
            this.finishedConf.lineWidth = this.level.lineWidth;

			this.bubble('onAsyncOperationStarted');

            this.level.getPaths(this, function(levelPaths) {
				this.levelPaths.length = 0;
				this.anchorPoints.length = 0;
				this.normalizedLevelPaths.length = 0;

				enyo.forEach(levelPaths, function (path, pathIndex) {
					this.levelPaths.push(this.getNormalizedPath(path, 10 / this.backgroundScale, true));
				}, this);

				enyo.forEach(this.levelPaths, function (p) {
					this.normalizedLevelPaths.push(this.getNormalizedPath(p, this.sensitivity / this.backgroundScale));
				}, this);


				this.anchorPoints = this.getAnchorPoints();
				this.bubble('onAsyncOperationFinished');
			});

        } else {
			this.reset();
		}



    },

    /**
     * Called on resize
     */
    resizeHandler:function () {
        this.inherited(arguments);
        this.levelChanged();
    },

    /**
     * Computes normalized paths and anchor point and sets the line width.
     * @protected
     * @returns void
     */
    levelPathsChanged:function () {


    },

    /**
     * Resets the canvas
     * @public
     * @returns void
     */
    reset:function () {
        this.currentPath = 0;
        this.currentPoint = 0;
        this.currentAnchor = 0;
        this.paths.length = 0;
        this.finished = false;
        this.isDown = false;
        this.locked = false;
        this.pointerIdentifier = null;
        enyo.cancelRequestAnimationFrame(this.animationId);
        if (this.drawMode == 'simple') {
            this.setBlinkingPoint(true);
            this.drawBackground();
        } else if (this.drawMode == 'advanced') {
            this.animFrame();
        }
        this.bubble('onPlayStop');

    },

    /**
     * Draws only the last two bits of the path
     * @protected
     * @returns void
     */
    drawNewPathParts:function (number) {
        var end = this.normalizedLevelPaths[this.currentPath][this.currentPoint].index + 1 || 1,
            start = this.normalizedLevelPaths[this.currentPath][this.currentPoint - number >= 0 ? this.currentPoint - number : 0].index,
            path = this.levelPaths[this.currentPath],
            lastParts = path.slice(start - 1, end);
        this.drawPath(lastParts, this.drawConf);
    },

    /**
     * Gets the anchor points of the current levels paths
     * @protected
     * @returns {Array} The Anchor points in the form {path: [number of the path], point: [number of the point]
     */
    getAnchorPoints:function () {
        var i, k, points = [];
        for (i = 0; i < this.levelPaths.length; i++) {
            for (k = 0; k < this.levelPaths[i].length; k++) {
                if (this.levelPaths[i][k].isAnchor === true) {
                    points.push({path:i, point:k});
                }
            }
        }
        return points;
    },

    /**
     * Starts or stops the blinking anchor point
     * @param state The state. Either true or false
     */
    setBlinkingPoint:function (state) {
        var anchor, pos;
        window.clearInterval(this.blinkingPoint);
        if (state === true) {
            this.blinkingPoint = setInterval(enyo.bind(this, function () {
                anchor = this.anchorPoints[this.currentAnchor];
                if (anchor) {
                    pos = this.levelPaths[anchor.path][anchor.point];
                    if (pos) {
                        if (this.anchorConf.fillStyle === '#ebc634') {
                            this.anchorConf.fillStyle = '#f00';
                        } else {
                            this.anchorConf.fillStyle = '#ebc634';
                        }
                        if (this.drawMode == 'simple') {
                            this.drawArc(pos, this.anchorConf);
                        }
                    }
                }
            }), 250);
        }
    },


    animFrame:function () {
        this.animationId = enyo.requestAnimationFrame(enyo.bind(this, 'animFrame'));
        var now = enyo.now();
        var elapsed = now - this.lastFrameTime;
        this.blinkCounter = (this.blinkCounter + elapsed) % 2000;
        this.lastFrameTime = now;


        var c1 = [255, 0, 0];
        var c2 = [11, 97, 11];

        var percentage = Math.abs(this.blinkCounter / 2000 - 0.5) * 2;


        var blended = [
            Math.round(c1[0] * (1 - percentage) + c2[0] * percentage),
            Math.round(c1[1] * (1 - percentage) + c2[1] * percentage),
            Math.round(c1[2] * (1 - percentage) + c2[2] * percentage)
        ];

        this.anchorConf.fillStyle = 'rgb(' + blended.join(',') + ')';


        if (this.finished) {
            this.setConf(this.finishedConf);
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.drawBackground();

            for (var i = 0; i < this.currentPath; i++) {
                this.drawPath(this.levelPaths[i], this.finishedConf);
            }

            var anchor = this.anchorPoints[this.currentAnchor];

            if (anchor) {
                var pos = this.levelPaths[anchor.path][anchor.point];
                if (pos) {
                    this.drawArc(pos, this.anchorConf);
                }
            }

            if (this.currentPoint && this.normalizedLevelPaths.length) {
                var end = this.normalizedLevelPaths[this.currentPath][this.currentPoint].index + 1 || 1,
                    path = this.levelPaths[this.currentPath],
                    parts = path.slice(0, end);
                this.drawPath(parts, this.drawConf);
            }
        }


    },

    /**
     * Stops the demo animation when the canvas is tapped.
     * @protected
     * @returns void
     */
    tapHandler:function () {
        if (this.inDemoMode === true) {
            this.stopDemo();
        }
    },

    /**
     * Sets the demoFinger size after the background is drawn.
     * @protected
     * @return void
     */
    drawBackground:function () {
        this.inherited(arguments);
        this.$.demoFinger.applyStyle('width', 2329 / 3 * this.backgroundScale + 'px');
        this.$.demoFinger.applyStyle('height', 3246 / 3 * this.backgroundScale + 'px');
    },

    /**
     * Starts the demo animation
     * @public
     * @returns void
     */
    startDemo:function () {
        //this.stopDemo();
		this.$.demoAnimator.stop();
		this.reset();
        this.inDemoMode = true;
        this.$.demoAnimator.path = -1;
        this.demoDoBetweenPaths(this.$.demoAnimator);
    },

    /**
     * Stops the demo animation
     * @public
     * @returns void
     */
    stopDemo:function () {
        this.inDemoMode = false;
        this.$.demoAnimator.stop();
        this.$.demoFinger.hide();
        this.reset();
    },

    /**
     * Moves the demo finger to a point on the canvas.
     * @param point The point to move the finger to
     * @returns void
     */
    moveFinger:function (point) {
        var fingerOffset, width, origin, left;
        fingerOffset = {
            x:12 * this.backgroundScale,
            y:12 * this.backgroundScale
        };

        width = this.$.demoFinger.getComputedStyleValue('width', '0px').split('px')[0];

        if (!enyo.platform.webos) {
            if (this.handOrientation === 'left') {
                origin = (width - fingerOffset.x) + 'px ' + fingerOffset.y + 'px';
            } else {
                origin = fingerOffset.x + 'px ' + fingerOffset.y + 'px';
            }

            this.$.demoFinger.applyStyle('-webkit-transform-origin', origin);

			var containerWidth = this.getComputedStyleValue('width', '0px').split('px')[0];

			var rotate = ((containerWidth / 2 - point.x) / containerWidth / 2 * -90);

			this.$.demoFinger.applyStyle('-webkit-transform', 'rotate(' + (rotate + (this.handOrientation == 'left' ? 25 : 0)) + 'deg)');
        }
        if (this.handOrientation === 'left') {
            left = this.position.x + point.x + fingerOffset.x - width;
        } else {
            left = this.position.x + point.x - fingerOffset.x;
        }

        this.$.demoFinger.applyStyle('left', left + 'px');
        this.$.demoFinger.applyStyle('top', this.position.y + point.y - fingerOffset.y + 'px');
    },

    /**
     * A Step of the demo animation
     * @protected
     * @param inSender
     * @param inEvent
     * @returns void
     */
    demoStep:function (inSender, inEvent) {

        var value = Math.round(inSender.value),
            skipped = value - inSender.lastPoint,
            point;

        skipped = skipped < 0 ? 0 : skipped;

        if (value > inSender.lastPoint || value == 0) {

            for (var i = skipped; i >= 0; i--) {
                //console.log('Current: ' + (value - i) );
                point = this.getResizedPoint(this.levelPaths[inSender.path][value - i]);
                this.moveFinger(point);
                this.moveHandler(this, {
                    pageX:point.x + this.position.x,
                    pageY:point.y + this.position.y,
                    inDemoMode:true
                });

            }
        }

        inSender.lastPoint = value;

    },

    /**
     * A step of the movement to the new path start
     * @protected
     * @param inSender
     * @param inEvent
     * @returns void
     */
    demoStepBetweenPaths:function (inSender, inEvent) {
        var value = inEvent.originator.value;
		this.$.demoFinger.show();

		var direction = this.normalize(this.minus(
			this.getResizedPoint(this.levelPaths[inSender.path][0]),
			this.$.demoAnimator.start
		));

        var width = 2329 / 3 * this.backgroundScale;
        var height = 3246 / 3 * this.backgroundScale;

        var percentage = (value / inEvent.originator.endValue) * 100;

        if (percentage <= 20) {
            width *= 1 + (percentage / 100);
            height *= 1+ (percentage / 100);
        } else if (percentage > 20 && percentage < 80) {
            width *= 1.2;
            height *= 1.2;
        } else if (percentage >= 80) {
            width *= 1 + (1 - percentage / 100);
            height *= 1 + (1 - percentage / 100);
        }

        this.$.demoFinger.applyStyle('width', width + 'px');
        this.$.demoFinger.applyStyle('height', height + 'px');
        this.moveFinger(this.plus(this.$.demoAnimator.start, this.multiply(direction, value)));
    },

	getDemoStepBetweenPathsStartPoint: function() {
		var fingerOffset = fingerOffset = {
			x:12 * this.backgroundScale,
			y:12 * this.backgroundScale
		};
		var width = this.$.demoFinger.getComputedStyleValue('width', '0px').split('px')[0];

		if (this.$.demoAnimator.path === 0) {
			if (this.$.demoFinger.getShowing()) {
				var start = {
					x: parseInt(this.$.demoFinger.getComputedStyleValue('left', '0px').split('px')[0], 10),
					y: parseInt(this.$.demoFinger.getComputedStyleValue('top', '0px').split('px')[0], 10)
				};
				if (this.handOrientation === 'left') {
					start.x = width - this.position.x + start.x - fingerOffset.x;
				} else {
					start.x = start.x + fingerOffset.x - this.position.x;
				}
				start.y = start.y - this.position.y + fingerOffset.y;
				return start;

			} else {
				return {

					x: this.handOrientation === 'left' ?
						- width + fingerOffset.x :
						parseInt(this.getComputedStyleValue('width', '0px').split('px')[0], 10),
					y: parseInt(this.getComputedStyleValue('height', '0px').split('px')[0], 10)
				};
			}
		} else {
			return this.getResizedPoint(this.levelPaths[this.$.demoAnimator.path - 1][this.levelPaths[this.$.demoAnimator.path - 1].length - 1]);
		}
	},

    /**
     * Moves the finger to the next path start
     * @param inSender
     * @protected
     * @returns void
     */
    demoDoBetweenPaths:function (inSender) {
        this.upHandler();
        this.$.demoAnimator.path++;

        if (inSender.path < this.levelPaths.length) {

			var start = this.getDemoStepBetweenPathsStartPoint();

            var length = parseInt(this.getDistance(
				start,
                this.getResizedPoint(this.levelPaths[inSender.path][0])
            ), 10);

            setTimeout(enyo.bind(this, function () {
				this.$.demoAnimator.play({
                    node:this.$.demoFinger.hasNode(),
					easingFunc: enyo.easing.quadInOut,
					start: start,
                    startValue:0,
                    duration: inSender.path == 0 ? length : length * 2,
                    endValue:length,
                    onStep:'demoStepBetweenPaths',
                    onEnd:'demoDoPath'
                });
            }), 100);
        }
    },

    /**
     * Moves the finger along the current Path
     * @protected
     * @returns void
     */
    demoDoPath:function () {

        if (this.$.demoAnimator.path < this.levelPaths.length) {
            this.paths.push([]);
            this.isDown = true;
            var length = this.levelPaths[this.$.demoAnimator.path].length - 1;

            //enyo.asyncMethod(this, function () {
            setTimeout(enyo.bind(this, function () {
                this.$.demoAnimator.play({
                    node:this.$.demoFinger.hasNode(),
					easingFunc: enyo.easing.linear,
                    startValue:0,
                    lastPoint:0,
                    duration:this.getPathLength(this.levelPaths[this.$.demoAnimator.path]) * 3,
                    endValue:length,
                    onStep:'demoStep',
                    onEnd:'demoDoBetweenPaths'
                });
                //});
            }), 100);
        }
    },

    /**
     * The finger ist put down on the canvas
     * @protected
     * @returns void
     */
    downHandler:function (inSender, inEvent) {

        if (this.inDemoMode || this.locked || this.pointerIdentifier !== null) return true;

        this.pointerIdentifier = inEvent.identifier;

        this.bubble('onPlayStart');
        this.inherited(arguments);
    },

    /**
     * The finger is moved on the canvas
     * @protected
     * @return void
     */
    moveHandler:function (inSender, inEvent) {

		if (this.aid && this.isDown && this.normalizedLevelPaths[this.currentPath].length > this.currentPoint) {
			this.addPointToPath(inEvent);
			return;
		}

        if (this.locked || (inEvent.identifier != this.pointerIdentifier && !inEvent.inDemoMode) ) {
            return true;
        }



        if (!!inEvent.inDemoMode == !!this.inDemoMode) {
            this.inherited(arguments);
        }
    },

    /**
     * The finger is lifted from the canvas
     * @protected
     * @returns void
     */
    upHandler:function (inSender, inEvent) {



        if (this.inDemoMode || this.locked || inEvent.identifier !== this.pointerIdentifier) return true;

        this.pointerIdentifier = null;

        this.inherited(arguments);

		if (this.paths[this.paths.length -1].length === 0) {
			this.paths.length = this.paths.length -1;
		}

        if (this.finished === false &&
            this.currentPath < this.normalizedLevelPaths.length &&
            this.currentPoint < this.normalizedLevelPaths[this.currentPath].length - 1 &&
            this.currentPoint > 0 &&
			this.aid !== true) {

            if (this.inDemoMode !== true) {
                this.bubbleUnfinishedSession();
            } else {
                this.reset();
            }
        }
    },

    bubbleUnfinishedSession: function(inSender, inEvent) {
        this.bubble('onFinished', {
            paths:this.paths,
            success:false
        });
    },



    /**
     * The main path recognition algorithm.
     *
     * TODO Detailed description of the algorithm
     *
     * @inEvent The mouse Event to process
     * @protected
     * @returns void
     */
    addPointToPath:function (inEvent) {

        var position,
            currentPath,
            anchor,
            i,
            angle,
            distance,
            lastDistance,
            increment,
            point;

        if (inEvent.pageX && inEvent.pageY) {

            position = this.getPositionFromEvent(inEvent);
            currentPath = this.normalizedLevelPaths[this.currentPath];

            if (currentPath) {

                increment = 0;
                point = null;

                // Find the next matching point
                for (i = this.currentPoint; i < currentPath.length; i++) {

                    if (i == 1 && i > this.paths[this.currentPath].length) {
                        break;
                    }

                    distance = this.getDistance(position, currentPath[i]);

                    // The currentPoint is the default reference
                    // Only take an other point if its distance to the finger is shorter
                    if (i == this.currentPoint || distance <= lastDistance ) {

                        angle = Math.abs(this.cosPhi(currentPath[this.currentPoint], currentPath[i]));

                        // Only points with angle < 90deg to the currentPoint are valid
                        if (i == this.currentPoint || angle < 90) {
                            lastDistance = distance;
                            // Set the point increment in the current path.
                            // If i == currentPoint then the increment is 0
                            increment = i - this.currentPoint;
                            point = currentPath[i];
                        } else {
                            break;
                        }
                    }
                    else {
                        break;
                    }
                }

                // Did we find a matching point?
                if (point !== null && lastDistance < this.sensitivity) {

                    // Collect the data
                    this.paths[this.currentPath].push(position);

                    // Did we proceed to the next point?
                    if (increment) {

                        this.currentPoint += increment;

                        // Did we pass an anchor point?
                        anchor = this.anchorPoints[this.currentAnchor];
                        if (anchor && anchor.path === this.currentPath && anchor.point <= point.index) {
                            this.currentAnchor++;
                        }

                        // If there is no next point, this path is finished
                        if (currentPath.length - 1 == this.currentPoint) {
                            this.isDown = false;
                            if (this.drawMode == 'simple') {
                                this.drawBackground();
                                for (i = 0; i <= this.currentPath; i++) {
                                    this.drawPath(this.levelPaths[i], this.finishedConf);
                                }
                            }
                            this.currentPoint = 0;
                            this.currentPath++;

                            // Otherwise draw the new parts of the path if any
                        } else if (increment && this.drawMode == 'simple') {
                            this.drawNewPathParts(increment);
                        }
                    }
                } else  {
					if (!this.aid) {
						this.locked = true;
						// Save the unfinished data
						this.bubbleUnfinishedSession();
					} else if (this.currentPoint > 0) {
						// Collect the data
						this.paths[this.currentPath].push(position);
					}
				}

            }
            if (this.currentPath > this.levelPaths.length - 1 && this.finished === false) {
                // Save the finished data
                this.finish();
            }
        }
    },

    /**
     * TODO Check the purpose of this function.
     * @param position
     * @param index
     * @returns radius
     */
    getRadius:function (position, index) {
        var path, point;
        path = this.normalizedLevelPaths[this.currentPath];
        index += this.currentPoint;
        index = index < 0 ? 0 : (index > path.length - 1 ? path.length - 1 : index);
        point = path[index];
        return this.getDistance(position, point);
    },

    /**
     * Gets a session point from a touch event
     * @param inEvent
     * @returns {Object} The Session point
     */
    getPositionFromEvent:function (inEvent) {
        // Normalized position

        var position = this.getNormalizedPoint({
            x:inEvent.pageX - this.position.x,
            y:inEvent.pageY - this.position.y
        });

        /*
         var position = {
         x: (inEvent.pageX - this.position.x) * this.backgroundScale + this.backgroundOffsetX,
         y: (inEvent.pageY - this.position.y) * this.backgroundScale + this.backgroundOffsetY
         };
         */

        // Add the timestamp (not builtin on Android)
        if (inEvent.timeStamp instanceof Date) {
            position.timestamp = inEvent.timeStamp.getTime();
        } else {
            position.timestamp = enyo.now();
        }
        return position;
    },

    /**
     * The letter is finished!
     * @protected
     * @returns void
     */
    finish:function () {
        this.setBlinkingPoint(false);
        this.setConf(this.finishedConf);
        if (this.drawMode == 'simple') {
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        this.finished = true;
        //navigator.notification.vibrate(100, 100);
        if (this.inDemoMode !== true) {
            this.bubble('onFinished', {
                paths:this.paths,
                success:true
            });
        }
    }
});
