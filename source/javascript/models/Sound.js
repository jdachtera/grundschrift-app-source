/**
 * The sound kind is used to play a single sound file. It automatically disposes unused Audio elements.
 * On Android it delegates to the Cordova Media object.
 */
enyo.kind({
    name: 'Grundschrift.Models.Sound',
    kind: 'Object',

    constructor: function(src) {
        var platforms = {
            'webOS' : true,
            'HP webOS' : true,
            'palm' : true,
            'browser' : true,
            'iPad Simulator' : true,
            'iOS': true,
            'iPad': true
        };

        if (device.platform && platforms[device.platform] === true) {
            this.src = src;
            return this;
        } else {
            return new window.Media(src);
        }
    },

    play: function () {
        this.context = new (window.Cordova && Cordova.MojoAudio || Audio);
        this.context.src = this.src;
        this.context.play();

        var garbageCollector = setInterval(enyo.bind(this, function () {
            if (!this.context || this.context.ended) {
                delete this.context;
                return clearInterval(garbageCollector);
            }
        }), 500);
    },

    stop: function () {
        return this.pause();
    },

    pause: function () {
        if (this.context) return this.context.pause();
    },

    seekTo: function (time) {
        try {
            this.context.currentTime = time / 1000;
            return true;
        } catch (e) {
            return false;
        }
    },

    getCurrentPosition: function (success, error) {
        return success(this.context.currentTime || 0);
    }

});