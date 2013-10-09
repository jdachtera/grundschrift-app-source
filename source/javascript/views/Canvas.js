enyo.kind({
    name:'Grundschrift.Views.Canvas',
    classes:'canvasContainer',
    kind:enyo.Control,
    published:{
        /**
         * The level to be drawn
         */
        level:'',
        /**
         * the levels paths
         */
        paths:''
    },

    /**
     * This is the default drawing configuration
     */
    defaultConf:{
        strokeStyle:"#000",
        fillStyle:'#000',
        lineWidth:65,
        lineCap:'round',
        lineJoin:'round',
        globalCompositeOperation:'source-atop'
        //globalAlpha: 1
    },

    components:[
        {name:'wrapper', classes:'wrapper', components:[
            {name:'canvas', tag:'canvas'}
        ]}

    ],

    handlers:{
        ondown:'downHandler',
        onup:'upHandler',
        onmove:'moveHandler'
    },

    canvas:'',
    context:'',
    isDown:false,

    /**
     * The canvas is created. Sets some variables
     * @protected
     * @returns void
     */
    create:function () {
        this.inherited(arguments);
        this.ratio = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.backgroundHeight = 1;
        this.backgroundWidth = 1;
        this.paths = [];
    },

    /**
     * Is called when the canvas is first rendered.
     * Initializes the canvas node, the Canvas2dContext and the image node.
     * @protected
     * @returns void
     */
    rendered:function () {
        this.inherited(arguments);
        this.canvas = this.$.canvas.hasNode();
        this.context = this.canvas.getContext('2d');
        this.image = document.createElement('img');//new Image();
        this.image.onload = enyo.bind(this, this.resizeHandler);
        this.image.onerror = function (inEvent) {
            this.log(inEvent);
        };
    },

    /**
     * The resize event handler.
     * Resizes the canvas node and triggers a redraw of the canvas.
     * @protected
     * @returns void
     */
    resizeHandler:function () {
        var cBounds = this.getBounds();

        this.backgroundScale = cBounds.height / this.image.height;

        if (this.image.width * this.backgroundScale > cBounds.width) {
            this.backgroundScale = cBounds.width / (this.image.width + 20);
        }

        this.backgroundHeight = this.backgroundScale * this.image.height;
        this.backgroundWidth = this.backgroundScale * this.image.width;

        this.canvas.width = this.backgroundWidth;
        this.canvas.height = this.backgroundHeight;

        this.$.wrapper.applyStyle('margin-top', (cBounds.height - this.backgroundHeight) / 2 + 'px');

		//this.$.wrapper.applyStyle('height', document.height + 'px');

        var bounds = this.$.canvas.getBounds();

        this.position = {x:bounds.left, y:bounds.top};
        this.backgroundOffsetX = (this.canvas.offsetWidth / 2) - (this.backgroundWidth / 2);
        this.backgroundOffsetY = 0;

        this.drawBackground();
    },

    /**
     * Clears the canvas
     * @protected
     * @returns void
     */
    clear:function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    /**
     * Resets the Scene
     * @public
     * @returns void
     */
    reset:function () {
        this.paths.length = 0;
    },

    /**
     * Changes the image file when the the level is changed.
     * @protected
     * @returns void
     */
    levelChanged:function () {
        if (this.level.name) {
            var path = enyo.macroize('assets/levels/{$category}/{$name}/background.png', this.level);
			// Resolve absolute image url first to avoid a loading / resized loop
			var img = document.createElement('img');
			img.src = path;
			if (img.src !== this.image.src) {
				this.image.src = img.src;
			}
        }

        this.reset();
    },

    /**
     * Redraws the canvas background according to the current Screen Size.
     * @protected
     * @returns void
     */
    drawBackground:function () {
        this.clear();
		this.canvas.trigger
        this.context.globalCompositeOperation = 'source-over';
        this.context.drawImage(this.image, this.backgroundOffsetX, this.backgroundOffsetY, this.backgroundWidth, this.backgroundHeight);
    },

    /**
     * Sets properties of the CanvasRenderingContext2d in bulk. Automatically adjusts numerical values with respect to the current Screen size.
     * @protected
     * @param conf A key value map containing properties to be set in this.context
     */
    setConf:function (conf) {
        for (var k in conf || {}) {
            this.context[k] = conf[k];
            if (isNaN(parseFloat(this.context[k])) === false) {
                this.context[k] *= this.backgroundScale;
            }
        }
    },

    /**
     * The finger down handler. Adds a new path and starts listening for move events.
     * @protected
     * @param inSender
     * @param inEvent
     */
    downHandler:function (inSender, inEvent) {
        this.paths.push([]);
        this.isDown = true;
        this.addPointToPath(inEvent);
		/*
        if (this.paths.length > 0 && this.paths[this.paths.length - 1].length === 0) {
            this.paths.length = this.paths.length - 1;
        }*/
    },

    /**
     * The finger up handler
     * @protected
     * @param inSender
     * @param inEvent
     */
    upHandler:function (inSender, inEvent) {
        if (this.isDown) {
            this.addPointToPath(inEvent);
        }
        this.isDown = false;
    },

    /**
     * The finger move handler
     * @protected
     * @param inSender
     * @param inEvent
     */
    moveHandler:function (inSender, inEvent) {
        if (this.isDown) {
            this.addPointToPath(inEvent);
        }
    },

    /**
     * The main processing function. Should be overridden by Subkinds
     * @protected
     * @param inEvent
     * @returns {Boolean}
     */
    addPointToPath:function (inEvent) {
        if (inEvent.pageX && inEvent.pageY) {
            var position = this.getNormalizedPoint({
                x:inEvent.pageX - this.position.x,
                y:inEvent.pageY - this.position.y
            });
            this.paths[this.paths.length - 1].push(position);
            this.drawNewPathParts();
            return true;
        }
    },

    /**
     *
     * Normalizes a screen point according to the Screen scale factor.
     * @protected
     * @param point The screen point
     * @returns {Point}
     */
    getNormalizedPoint:function (point) {
        var newPoint = enyo.mixin({}, point);
        newPoint.x = (newPoint.x - this.backgroundOffsetX) / this.backgroundScale;
        newPoint.y = (newPoint.y - this.backgroundOffsetY) / this.backgroundScale;
        return newPoint;
    },

    /**
     *
     * Resizes a normalized point back to current screen size.
     * @protected
     * @param point
     * @returns {Point}
     */
    getResizedPoint:function (point) {
        var newPoint = enyo.mixin({}, point);
        newPoint.x = newPoint.x * this.backgroundScale + this.backgroundOffsetX;
        newPoint.y = newPoint.y * this.backgroundScale + this.backgroundOffsetY;
        return newPoint;
    },

    /**
     *
     * Resizes a normalized point and absolutizes its position
     * @protected
     * @param point
     * @returns {Point}
     */
    getAbsolutizedPoint:function (point) {
        var newPoint = this.getResizedPoint(point);
        newPoint.x += this.position.x;
        newPoint.y += this.position.y;
        return newPoint;
    },

    /**
     *
     * Draws only the two last bits of the path
     * @protected
     */
    drawNewPathParts:function () {
        if (this.paths.length > 0) {
            var path = this.paths[this.paths.length - 1],
                lastParts = path.slice(this.paths.length - 2);

            this.drawPath(lastParts, this.defaultConf);
        }

    },
    /**
     *
     * Draws an arc at the specified position with an optional Context configuration
     * @protected
     * @param point The position to draw the arc
     * @param conf The drawing configuration
     */
    drawArc:function (point, conf) {
        this.context.save();
        this.setConf(conf);
        this.context.beginPath();
        var p = this.getResizedPoint(point);
        this.context.arc(p.x, p.y, this.context.lineWidth / 2, 0, Math.PI * 2, false);
        this.context.closePath();
        this.context.fill();
        this.context.restore();
    },

    /**
     *
     * Draws a path into the canvas
     * @protected
     * @param path The path
     * @param conf The Context configuration to draw the path
     */
    drawPath:function (path, conf) {
        var i,
            length = path.length,
            p;
        conf = conf || this.defaultConf;
        if (path.length == 1) {
            this.drawArc(path[0], conf);
        } else if (path.length > 1) {
            this.context.save();
            this.setConf(conf);
            this.context.beginPath();

            for (i = 0; i < length; i++) {
                p = this.getResizedPoint(path[i]);
                if (i === 0) {
                    this.context.moveTo(p.x, p.y);
                } else {
                    this.context.lineTo(p.x, p.y);
                }
            }
            this.context.stroke();
            this.context.closePath();
            this.context.restore();
        }

    },


    /**
     *
     * Returns a normalized path where all points have the same distance
     * @protected
     * @param path The path
     * @param distance The distance
     * @returns {Array}
     */
    getNormalizedPath:function (path, distance, preserveAnchors) {
        var normalized = [path[0]], i, current, cD, last, point, d = 0, rest;
        i = 1;
        while (i < path.length) {
            current = path[i];
            last = normalized[normalized.length - 1];
            cD = this.getDistance(current, last);
            rest = distance - d;
            if (cD > rest) {
                point = this.plus(this.multiply(this.normalize(this.minus(current, last)), rest), last);
                point.index = i - 1;
                normalized.push(point);
                d = 0;
            } else if (cD === rest || i === path.length - 1) {
                current.index = i;
                normalized.push(current);
                d = 0;
                i++;

            } else {
                d += cD;
                i++;
                if (preserveAnchors && current['isAnchor']){
                    point.isAnchor = true;
                    normalized.push(current);
                    d = 0;
                }

            }

        }
        return normalized;
    },

    /**
     *
     * Returns the distance of two points
     * @protected
     * @param p1 First point
     * @param p2 Second point
     * @returns {float}
     */
    getDistance:function (p1, p2) {
        var x = p2.x - p1.x,
            y = p2.y - p1.y;
        return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    },

    /**
     *
     * Normalizes a point so that it has a length of 1
     * @protected
     * @param p1 The point
     * @returns  the new point
     */
    normalize:function (p1) {
        var length = this.getDistance({x:0, y:0}, p1);
        return this.divide(p1, length);
    },

    /**
     *
     * Substracts a point from another
     * @protected
     * @param p1 First point
     * @param p2 Second point
     * @returns {Point}
     */
    minus:function (p1, p2) {
        return {x:p1.x - p2.x, y:p1.y - p2.y};
    },

    /**
     * Returns the sum of two points
     * @protected
     * @param p1 First point
     * @param p2 Second point
     * @returns {Point}
     */
    plus:function (p1, p2) {
        return {x:p1.x + p2.x, y:p1.y + p2.y};
    },

    /**
     * Multiplys a point with a factor
     * @protected
     * @param p1 The point
     * @param m The multiplication factor
     * @returns {Point}
     */
    multiply:function (p1, m) {
        return {x:p1.x * m, y:p1.y * m};
    },

    /**
     * Divides a point by a factor
     * @protected
     * @param p1 The point
     * @param m The division factor
     * @returns {Point}
     */
    divide:function (p1, m) {
        return {x:p1.x / m, y:p1.y / m};
    },

    /**
     * Returns true if the two points have the same x and y values
     * @protected
     */
    equals:function (p1, p2) {
        return p1.x == p2.x && p1.y == p2.y;
    },

    /**
     * Interpolates a path using the catmull rom algorithm
     * @param path The path to interpolate
     * @param factor The factor controls how many intermediate points are generated
     * @returns {Path} The new spline's path
     */
    spline:function (path, factor) {
        var newPath = [],
            i,
            pa, pb, pc, pd,
            w1, w2, w3, increment,

            catmullRom = function (p0, p1, p2, p3, t, t2, t3) {

                var v0 = ( p2 - p0 ) * 0.5,
                    v1 = ( p3 - p1 ) * 0.5;

                return ( 2 * ( p1 - p2 ) + v0 + v1 ) * t3 + ( -3 * ( p1 - p2 ) - 2 * v0 - v1 ) * t2 + v0 * t + p1;

            };

        for (i = 0; i < path.length; i++) {
            newPath.push(path[i]);

            pa = path[i === 0 ? i : i - 1];
            pb = path[i];
            pc = path[i > path.length - 2 ? i : i + 1];
            pd = path[i > path.length - 3 ? i : i + 2];

            increment = 100 / factor / this.getDistance(pb, pc);

            for (w1 = increment; w1 < 1; w1 += increment) {
                w2 = w1 * w1,
                    w3 = w2 * w1;

                newPath.push({
                    x:catmullRom(pa.x, pb.x, pc.x, pd.x, w1, w2, w3),
                    y:catmullRom(pa.y, pb.y, pc.y, pd.y, w1, w2, w3)
                });

            }

        }
        return newPath;
    },

    /**
     * Returns the length of a given path
     * @param path
     * @return {Number}
     */
    getPathLength:function (path) {
        var length = 0;
        for (var i = 0; i < path.length - 1; i++) {
            length += this.getDistance(path[i], path[i + 1]);
        }
        return length;
    },

    /**
     * Returns the shortest distance between two points in a path
     * @param path
     * @return {Number}
     */
    getMinDistanceInPath:function (path) {
        var distance;
        for (var i = 0; i < path.length - 1; i++) {
            var d = this.getDistance(path[i], path[i + 1]);
            if (i == 0 || d < distance) {
                distance = d;
            }
        }
        return distance;
    },

    /**
     * Returns the maximum distance between two points in a path
     * @param path
     * @return {Number}
     */
    getMaxDistanceInPath:function (path) {
        var distance = 0;
        for (var i = 1; i < path.length; i++) {
            var d = this.getDistance(path[i - 1], path[i]);
            if (d > distance) {
                distance = d;
            }
        }
        return distance;
    },

    /**
     * Dot product of two points
     * @param p1
     * @param p2
     * @return {Number}
     */
    dot:function (p1, p2) {
        return (p1.x * p2.x) + (p1.y * p2.y);
    },

    /**
     * Cosinus phi of two points
     * @param p1
     * @param p2
     * @return {Number}
     */
    cosPhi:function (p1, p2) {
        return this.dot(p1, p2) / (this.getDistance({x:0, y:0}, p1) * this.getDistance({x:0, y:0}, p2));
    },

    getDistanceToLine:function (p, l1, l2) {
        dotLineLength = function (x, y, x0, y0, x1, y1, o) {
            function lineLength(x, y, x0, y0) {
                return Math.sqrt((x -= x0) * x + (y -= y0) * y);
            }

            if (o && !(o = function (x, y, x0, y0, x1, y1) {
                if (!(x1 - x0)) return {x:x0, y:y};
                else if (!(y1 - y0)) return {x:x, y:y0};
                var left, tg = -1 / ((y1 - y0) / (x1 - x0));
                return {x:left = (x1 * (x * tg - y + y0) + x0 * (x * -tg + y - y1)) / (tg * (x1 - x0) + y0 - y1), y:tg * left - tg * x + y};
            }(x, y, x0, y0, x1, y1), o.x >= Math.min(x0, x1) && o.x <= Math.max(x0, x1) && o.y >= Math.min(y0, y1) && o.y <= Math.max(y0, y1))) {
                var l1 = lineLength(x, y, x0, y0), l2 = lineLength(x, y, x1, y1);
                return l1 > l2 ? l2 : l1;
            }
            else {
                var a = y0 - y1, b = x1 - x0, c = x0 * y1 - y0 * x1;
                return Math.abs(a * x + b * y + c) / Math.sqrt(a * a + b * b);
            }
        };

        return dotLineLength(p.x, p.y, l1.x, l1.y, l2.x, l2.y, true);

    },

    thinPath:function (path, factor, iteration) {

        var newPath = [],
            i,
            d,
            index = 0,
            max = 0,
            chunk1 = [],
            chunk2 = []

        iteration = iteration || 0;

        if (iteration == 0) {
            newPath.push(path[0]);

        }
        if (path.length > 2) {

            for (i = 1; i < path.length - 1; i++) {
                d = this.getDistanceToLine(path[i], path[0], path[path.length - 1]);
                if (d > max) {
                    max = d;
                    index = i;
                }
            }

            if (max > factor) {

                chunk1 = [];
                chunk2 = [];

                for (i = 0; i < path.length; i++) {
                    if (i <= index) {
                        chunk1.push(path[i]);
                    }
                    if (i >= index) {
                        chunk2.push(path[i]);
                    }
                }

                if (chunk1.length > 1) {
                    enyo.forEach(this.thinPath(chunk1, factor, iteration + 1), function (point) {
                        newPath.push(point);
                    });
                }

                newPath.push(path[index]);

                if (chunk2.length > 1) {
                    enyo.forEach(this.thinPath(chunk2, factor, iteration + 1), function (point) {
                        newPath.push(point);
                    });
                }

            }

            if (iteration == 0) {
                newPath.push(path[path.length - 1]);
            }
        }

        return newPath;

    },
    smoothPath:function (path, factor) {
        var i, k, newPath, row, weight;

        if (factor && path.length >= factor) {
            row = [];
            newPath = [];

            for (i = factor; i < path.length; i += 1) {
                row.length = 0;

                for (k = 0; k <= factor; k++) {
                    row.push(path[i - k]);
                }

                row = enyo.filter(row, function (a) {
                    return a ? true : false;
                });

                newPath.push(this.divide(
                    row.reduce(enyo.bind(this, function (a, b) {
                        return this.plus(a, b);
                    }), {x:0, y:0})
                    , row.length))
            }

            return [].concat([path[0]], newPath, [path[path.length - 1]]);
        } else {
            return path;
        }
    }




});
