/**
 * The Graph is a canvas to display statistic data.
 * The path of a child can be replayed and a speed graph is shown.
 */
enyo.kind({

    name:'Grundschrift.Views.Admin.Graph',
    kind:'Grundschrift.Views.Canvas',

    classes:"graph",

    published:{
        velocity:[]
    },

    replayData:{
        speed:2,
        index:0,
        time:0,
        pause:false
    },


    velocityConf:{
        strokeStyle:"#C00",
        fillStyle:'#C00',
        lineWidth:1,
        lineCap:'round',
        lineJoin:'round',
        globalCompositeOperation:'source-over'
    },

    defaultConf:{
        strokeStyle:"#0C0",
        fillStyle:'#0C0',
        lineWidth:20,
        lineCap:'round',
        lineJoin:'round',
        globalCompositeOperation:'source-over'
    },

    downHandler:function () {

    },

    upHandler:function () {

    },

    moveHandler:function () {

    },

    drawPaths:function () {
        this.drawPathsToIndex(this.velocity.length - 1);
    },

    /**
     * The resize event handler.
     * Resizes the canvas node and triggers a redraw of the canvas.
     * @protected
     * @returns void
     */
    resizeHandler:function () {
        this.canvas.width = 0;
        this.canvas.height = 0;

        var cBounds = this.getBounds();

        this.backgroundScale = cBounds.height / this.image.height;

        if (this.image.width * this.backgroundScale > cBounds.width) {
            this.backgroundScale = cBounds.width / (this.image.width + 20);
        }

        this.backgroundHeight = this.backgroundScale * this.image.height;
        this.backgroundWidth = this.backgroundScale * this.image.width;

        this.canvas.width = cBounds.width;
        this.canvas.height = cBounds.height;

        //this.$.wrapper.applyStyle('margin-top', (cBounds.height - this.backgroundHeight) / 2 + 'px');

        var bounds = this.$.canvas.getBounds();

        this.position = {x:bounds.left, y:bounds.top};
        this.backgroundOffsetX = (this.canvas.width - this.backgroundWidth) / 2;
        this.backgroundOffsetY = (cBounds.height - this.backgroundHeight) / 2;

        this.drawBackground();
        this.pathsChanged();
    },

    pathsChanged:function () {
        this.velocity = this.getVelocityPath(this.paths);

        enyo.forEach(this.velocity, function (point, k) {
            point.x = point.x / this.velocity.length * this.canvas.width;
            point.y = this.canvas.height - point.y;
            this.velocity[k] = this.getNormalizedPoint(point);
        }, this);

        this.drawPaths();
    },

    getVelocityPath:function (paths) {
        var pathIndex, pointIndex, point, velocity = [];
        for (pathIndex = 0; pathIndex < paths.length; pathIndex++) {
            velocity.push({
                x:velocity.length,
                y:pathIndex === 0 ? 0 : this.getVelocity(paths[pathIndex][0], paths[pathIndex - 1][paths[pathIndex - 1].length - 1])
            });
            for (pointIndex = 1; pointIndex < paths[pathIndex].length; pointIndex++) {
                velocity.push({
                    x:velocity.length,
                    y:this.getVelocity(paths[pathIndex][pointIndex], paths[pathIndex][pointIndex - 1])
                });
            }
        }

        return velocity;
    },

    getVelocity:function (point1, point2) {
        return this.getDistance(point1, point2) / (Math.abs(point2.timestamp - point1.timestamp) / 100);
    },


    replay:function () {
        if (this.replayData.pause === false) {
            this.replayData.index = 0;
        }

        this.replayData.pause = false;

        setTimeout(enyo.bind(this, "play"), 400);
    },

    drawPathsToIndex:function (index) {
        var pathIndex = 0,
            pointIndex = 0,
            path,
            velocity = this.velocity.slice(0, index);

        while (index >= 0) {
            path = this.paths[pathIndex]
            if (path) {
                if (index > path.length - 1) {
                    this.drawPath(path);
                    index -= path.length - 1;
                    pathIndex++;
                } else {
                    this.drawPath(path.slice(0, index), this.defaultConf);
                    break;
                }
            } else {
                break;
            }
        }

        this.drawPath(velocity, this.velocityConf);
    },

    getPointByIndex:function (index) {
        var pathIndex = 0,
            path;

        while (index >= 0) {
            path = this.paths[pathIndex]
            if (path) {
                if (index > path.length - 1) {
                    index -= path.length;
                    pathIndex++;
                } else {
                    return path[index];
                }
            } else {
                break;
            }
        }
        return null;
    },

    reset:function () {
        this.inherited(arguments);
        this.level = "";
        this.clear();
    },

    pause:function () {
        this.replayData.pause = true;
    },

    play:function () {
        if (this.replayData.pause) {
            return;
        }
        var point, next;

        point = this.getPointByIndex(this.replayData.index);

        if (point) {
            this.drawBackground();

            this.drawPathsToIndex(this.replayData.index);
            this.replayData.index++;

            next = this.getPointByIndex(this.replayData.index);

            if (next) {
                setTimeout(enyo.bind(this, "play"), (next.timestamp - point.timestamp) * this.replayData.speed);
            }
        }
    }

});
