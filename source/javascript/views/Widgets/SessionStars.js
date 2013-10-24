/**
 * A widget showing the number of successfulls essions as stars.
 * A maximum of stars can be set. If more sessions are set the onMaxReached Event is triggered.
 *
 */
enyo.kind({
    name:'Grundschrift.Views.SessionStars',
    published:{
        max: 25,
        value: 0,
        divisor: 5,
        size: 24,
        handOrientation: 'right',
		animation: false
    },
    classes:'sessionStars',
    components:[
		{name:'enabled', classes:"enabled", kind:'Control'},
		{name:'disabled', classes:"disabled", kind:'Control'},
        {kind:'Animator', duration:1500, easingFunc:enyo.easing.cubicOut, startValue:0, endValue:100, onStep:'animationStep', onEnd:'animationEnd'},
        {kind:'Image', name:'animatedImage', showing:false, src:'assets/icons/Star_04.png', canGenerate: false}
    ],
	rendered: function() {
		if (this.animation) {
			this.$.animatedImage.setCanGenerate(true);
			this.$.animatedImage.render();
		}
		this.inherited(arguments);
		this.sizeChanged();
	},
    handlers:{
        onSettingsLoaded:'settingsLoaded'
    },
    events:{
        onAnimationEnd:'',
        onMaxReached:''
    },

    maxChanged:function () {
        this.valueChanged();
    },
    settingsLoaded:function (inSender, inEvent) {
        this.setMax(inEvent.settings.maxSessions);
    },
    sizeChanged:function () {
		this.applyStyle('height', this.size + 'px');
        this.$.enabled.applyStyle('height', this.size + 'px');
        this.$.disabled.applyStyle('height', this.size + 'px');
        this.$.enabled.applyStyle('background-size', this.size + 'px ' + this.size + 'px');
        this.$.disabled.applyStyle('background-size', this.size + 'px ' + this.size + 'px');
        this.valueChanged();
    },
    valueChanged:function () {
        this.setDivisor(this.max / 5);
        var singleWidth = this.size / this.divisor;

        var value = this.value > this.max ? this.max : this.value;

        this.applyStyle('width', this.max * singleWidth + 'px');

        this.$.enabled.applyStyle('width', value * singleWidth + 'px');
        this.$.disabled.applyStyle('width', (this.max - value) * singleWidth + 'px');
        this.$.disabled.applyStyle('background-position-x', (this.max - value) * singleWidth + 'px');

    },
    animateValueChange:function (value, startPoint, targetBounds) {
		var pos = Math.floor(((value - 1) % this.max) / this.divisor);
		//this.$.animatedImage.setSrc('assets/icons/Star_0' + (pos + 1) + '.png');

		this.bounds = this.getBounds();
		if (targetBounds) {
			this.targetBounds = targetBounds;
		} else if (value > 0) {
			this.targetBounds = this.$.enabled.getAbsoluteBounds();
			this.targetBounds.left += this.targetBounds.height * pos;
			this.targetBounds.width = this.targetBounds.height;
			this.targetBounds.left += this.targetBounds.height / 2;
			this.targetBounds.top += this.targetBounds.height / 2;
		}
		if (!this.targetBounds) {
			return this.valueChanged();
		}


		startPoint = enyo.mixin({
			x:window.innerWidth / 2 - this.targetBounds.width * 10 / 2,
			y:window.innerHeight / 2 - this.targetBounds.height * 10 / 2
		}, startPoint);

		this.value = value;

		this.startBounds = {
			width:this.targetBounds.width * 10,
			height:this.targetBounds.height * 10,
			left:startPoint.x,
			top:startPoint.y,
			position:'absolute',
			opacity:0
		};

		this.$.animatedImage.applyStyle("left", "0px");
		this.$.animatedImage.applyStyle("top", "0px");
		var imgBounds = this.$.animatedImage.getBounds();

		for (var k in this.startBounds) {
			this.$.animatedImage.applyStyle(k, this.startBounds[k]);
		}
		this.$.animatedImage.show();
		this.$.animator.play({
			node:this.$.animatedImage.hasNode()
		});

    },
    animationStep:function (inSender, inEvent) {
        var value = inEvent.originator.value / 100.0;

        var rotation = Math.round(360 * 2 * value % 360);

        var styles = {
            top:this.startBounds.top - this.bounds.top + ((this.targetBounds.top - this.startBounds.top) * value),
            left:this.startBounds.left - this.bounds.left + ((this.targetBounds.left - this.startBounds.left) * value),
            width:this.startBounds.width + ((this.targetBounds.width - this.startBounds.width) * value),
            height:this.startBounds.height + ((this.targetBounds.height - this.startBounds.height) * value),
            opacity:value + 0.3 <= 1 ? value + 0.3 : 1 //- value
            //'-webkit-transform': 'rotate(' + rotation + 'deg)'
        };

		styles.top -= styles.height / 2;
		styles.left -= styles.width / 2;

        var appendPx = {top: true, left: true, width: true, height: true};

        for (var k in styles) {
            this.$.animatedImage.applyStyle(k, styles[k] + (appendPx[k] ? 'px' : ''));
        }
    },
    animationEnd:function () {
        this.valueChanged();
        this.$.animatedImage.hide();
        this.bubble('onAnimationEnd');
        if (this.value == this.max) {
            this.bubble('onMaxReached');
        }
    }
});
