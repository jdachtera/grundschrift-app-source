/**
 * The edit canvas. This view is used to edit the paths of a glyph and set the anchorpoints
 *
 * @author Jascha Dachtera <jascha.dachtera@googlemail.com>
 */
enyo.kind({
    name:'Grundschrift.Views.Admin.EditCanvas',
    kind:'Grundschrift.Views.Canvas',
    /**
     * The default draw configuration
     */
    defaultConf:{
        strokeStyle:"#000",
        fillStyle:'#000',
        lineWidth:10,
        lineCap:'round',
        lineJoin:'round',
        globalCompositeOperation:'source-atop'
    },
    events:{
        /**
         * Is triggered when the paths are changed
         */
        onPathsChanged:''
    },
    published:{
        /**
         * The current path
         */
        currentPath:-1,
        /**
         * The current point
         */
        currentPoint:-1,
        /**
         * The line width
         */
        lineWidth:10,
        /**
         * The paths
         */
        paths:[],

        /**
         * The thinning factor
         * */
        thinning:0,

        /**
         * The interpolation factor
         * */
        interpolation:0,

        /**
         * The smoothness factor
         * */
        smoothness:0
    },

    /**
     * Event handlers
     */
    handlers:{
        /**
         * Is triggered when a control value has changed
         */
        onControlValuesChanged:'setValues'
    },

    /**
     * the down handler. Triggers the onPathsChanged event
     * @protected
     * @returns void
     */
    downHandler:function () {
        this.inherited(arguments);
        this.publishValues();
    },

    /**
     * the up handler. Triggers the onPathsChanged event
     * @protected
     * @returns void
     */
    upHandler:function () {
        this.inherited(arguments);
        this.paths[this.paths.length - 1][0].isAnchor = true;
        this.paths[this.paths.length - 1][this.paths[this.paths.length - 1].length - 1].isAnchor = true;
        this.currentPath = this.paths.length - 1;
        this.drawHighlightedPaths();
        this.publishValues();
    },

    /**
     * Triggered when the level was changed.
     * @protected
     * @returns void
     */
    levelChanged:function () {
        this.inherited(arguments);
        this.level.getPaths(this, function(paths) {
			this.paths = paths;
			this.currentPath = 0;
			this.currentPoint = 0;
			this.setLineWidth(this.level.lineWidth);
			this.publishValues();
			enyo.asyncMethod(this, function () {
				this.drawHighlightedPaths();
			});
		});
    },

    /**
     * Deletes the active path
     * @public
     * @returns void
     */
    deleteActivePath:function () {
        if (this.paths.length > 0 && this.currentPath >= 0) {
            this.paths.splice(this.currentPath, 1);
            this.currentPathChanged();
            this.publishValues();
            this.drawHighlightedPaths();
        }
    },

    /**
     * Resets the canvas
     * @public
     * @returns void
     */
    reset:function () {
        this.paths = [];
    },

    /**
     * Initializes the different draw confs when the component is created.
     * @protected
     * @returns void
     */
    create:function () {
        this.inherited(arguments);
        this.currentPathConf = enyo.mixin({}, this.defaultConf);
        this.currentPointConf = enyo.mixin({}, this.defaultConf);
        this.anchorPointConf = enyo.mixin({}, this.defaultConf);
        this.currentPointConf.fillStyle = '#f00';
        this.currentPathConf.strokeStyle = '#0f0';
        this.anchorPointConf.fillStyle = '#fedcba';
    },

    /**
     * Updates all the control properties with the incoming values at once
     * @param inSender
     * @param inValues
     */
    setValues:function (inSender, inValues) {
        if (this.currentPath == inValues.currentPath && this.currentPoint == inValues.currentPoint) {
            this.setAnchor(inValues.isAnchor);
        }
        this.setCurrentPath(inValues.currentPath);
        this.setCurrentPoint(inValues.currentPoint);


        this.setLineWidth(inValues.lineWidth);

        this.setThinning(inValues.thinning);
        this.setSmoothness(inValues.smoothness);
        this.setInterpolation(inValues.interpolation);

        this.publishValues();

        this.drawHighlightedPaths();

    },

    /**
     * Emits the onValuesChanged event with all control values attached
     */
    publishValues:function () {
        this.bubble('onValuesChanged', {
            paths:this.paths,
            currentPath:this.currentPath,
            currentPoint:this.currentPoint,
            lineWidth:this.lineWidth,
            thinning:this.thinning,
            smoothness:this.smoothness,
            interpolation:this.interpolation
        });
    },

    /**
     * Is triggered when the current path is changed
     * @protected
     * @returns void
     */
    currentPathChanged:function () {
        if (typeof this.paths[this.currentPath] === 'undefined') {
            if (this.currentPath < 0) this.currentPath = this.paths.length - 1;
            if (this.currentPath > this.paths.length - 1) {
                if (this.paths.length > 0) {
                    this.currentPath = 0;
                } else {
                    this.currentPath = -1;
                }
            }
        }
        this.currentPoint = 0;
    },

    /**
     * Triggered when the current point is changed
     * @protected
     * @returns void
     */
    currentPointChanged:function () {
        if (typeof this.paths[this.currentPath] === 'undefined' ||
            typeof this.paths[this.currentPath][this.currentPoint] === 'undefined') {
            if (this.currentPath >= 0) {
                if (this.currentPoint < 0) this.currentPoint = this.paths[this.currentPath].length - 1;
                if (this.currentPoint > this.paths[this.currentPath].length - 1) {
                    if (this.paths[this.currentPath].length > 0) {
                        this.currentPoint = 0;
                    } else {
                        this.currentPoint = -1;
                    }
                }
            } else {
                this.currentPoint = -1;
            }
        }

    },

    /**
     * Triggered when the line width is changed
     * @protected
     * @returns void
     */
    lineWidthChanged:function () {
        this.defaultConf.lineWidth = this.lineWidth;
        this.currentPointConf.lineWidth = this.lineWidth;
        this.currentPathConf.lineWidth = this.lineWidth;
    },

    /**
     * Returns the current points anchor state
     * @protected
     * @returns void
     */
    getAnchor:function () {
        if (this.paths[this.currentPath] && this.paths[this.currentPath][this.currentPoint]) {
            return this.paths[this.currentPath][this.currentPoint].isAnchor;
        }
        return null;
    },

    /**
     * Sets the current points anchor state
     * @protected
     * @returns void
     */
    setAnchor:function (state) {
        if (this.paths[this.currentPath] && this.paths[this.currentPath][this.currentPoint]) {
            this.paths[this.currentPath][this.currentPoint].isAnchor = state;
        }
    },

    /**
     * Throttles the redraw of the canvas and draws the anchor points
     * @protected
     * @returns void
     */
    drawHighlightedPaths:function () {
        enyo.job('drawHighLightedPathEditCanvas', enyo.bind(this, function () {
            this.drawBackground();
            var i, k, point, path;


            for (i = 0; i < this.paths.length; i++) {
                path = i == this.currentPath ? this.getPostProcessedPath(this.paths[i]) : this.paths[i];

                this.drawPath(path, i === this.currentPath ? this.currentPathConf : this.defaultConf);
                if (i == this.currentPath && this.currentPoint > -1) {
                    point = this.paths[i][this.currentPoint];
                    if (point) {
                        this.drawArc(point, this.currentPointConf);
                    }

                }
                for (k = 0; k < this.paths[i].length; k++) {
                    point = this.paths[i][k];
                    if (point.isAnchor === true) {
                        this.drawArc(point, this.anchorPointConf);
                    }
                }
            }
        }), 1000 / 60);

    },

    /**
     * Returns a path with the smoothing, thinning and spline algorithms applied to
     * @param path
     * @return {Path}
     */
    getPostProcessedPath:function (path) {
        if (this.smoothness > 0) {
            path = this.smoothPath(path, this.smoothness);
        }
        if (this.thinning > 0) {
            path = this.thinPath(path, this.thinning);
        }
        if (this.interpolation > 0) {
            path = this.spline(path, this.interpolation);
        }
        return path;
    },

    /**
     * Applies the smoothin, thinning and spline algorithms to the path.
     * Then the values are reset to 0.
     */
    applyModifications:function () {
        this.paths[this.currentPath] = this.getPostProcessedPath(this.paths[this.currentPath]);

        this.setSmoothness(0);
        this.setInterpolation(0);
        this.setThinning(0);
        this.publishValues();
    },

    /**
     * Adds the point to the path. Sets the isAnchor property.
     * @protected
     * @returns void
     */
    addPointToPath:function () {
        if (this.inherited(arguments) === true) {
            this.paths[this.paths.length - 1][this.paths[this.paths.length - 1].length - 1].isAnchor = false;
        }
    }
});