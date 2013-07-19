/**
 * A widget showing the number of successfulls essions as stars.
 * A maximum of stars can be set. If more sessions are set the onMaxReached Event is triggered.
 *
 */
enyo.kind({
    name:'Grundschrift.Views.SessionStars',
    published:{
        max:25,
        value:0,
        divisor:5,
        size:16,
        handOrientation:'right'
    },
    classes:'sessionStars',
    components:[
        {name:'wrapper', classes:'wrapper', components:[
            {name:'enabled', classes:"enabled", kind:'Control'},
            {name:'disabled', classes:"disabled", kind:'Control'}
        ]},
        {kind:'Animator', duration:1500, easingFunc:enyo.easing.cubicOut, startValue:0, endValue:100, onStep:'animationStep', onEnd:'animationEnd'},
        {kind:'Image', name:'animatedImage', showing:false, src:'assets/icons/Star_04.png'}
    ],
    handlers:{
        onSettingsLoaded:'settingsLoaded'
    },
    events:{
        onAnimationEnd:'',
        onMaxReached:''
    },
    rendered:function () {
        this.inherited(arguments);
        this.sizeChanged();

    },
    maxChanged:function () {
        this.valueChanged();
    },
    settingsLoaded:function (inSender, inEvent) {
        this.setMax(inEvent.settings.maxSessions);
    },
    sizeChanged:function () {
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

        this.$.wrapper.applyStyle('width', this.max * singleWidth + 'px');

        this.$.enabled.applyStyle('width', value * singleWidth + 'px');
        this.$.disabled.applyStyle('width', (this.max - value) * singleWidth + 'px');
        this.$.disabled.applyStyle('background-position-x', (this.max - value) * singleWidth + 'px');

    },
    animateValueChange:function (value, startPoint) {
        if (value > 0) {

            var pos = Math.floor(((value - 1) % this.max) / this.divisor);

            //this.$.animatedImage.setSrc('assets/icons/Star_0' + (pos + 1) + '.png');
            this.targetBounds = this.$.enabled.getBounds();

            this.targetBounds.left += this.targetBounds.height * pos;
            this.targetBounds.width = this.targetBounds.height;

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

            if (this.handOrientation === 'left') {
                this.startBounds.left *= -1;
                this.startBounds.left += imgBounds.left / 2;
            }

            this.startBounds.left -= this.startBounds.width / 2;
            this.startBounds.top -= this.startBounds.top / 2;

            for (var k in this.startBounds) {
                this.$.animatedImage.applyStyle(k, this.startBounds[k]);
            }
            this.$.animatedImage.show();

            this.$.animator.play({
                node:this.$.animatedImage.hasNode()
            });

        }
    },
    animationStep:function (inSender, inEvent) {
        var value = inEvent.originator.value / 100.0;

        var rotation = Math.round(360 * 2 * value % 360);

        var styles = {
            top:this.startBounds.top + ((this.targetBounds.top - this.startBounds.top) * value),
            left:this.startBounds.left + ((this.targetBounds.left - this.startBounds.left) * value),
            width:this.startBounds.width + ((this.targetBounds.width - this.startBounds.width) * value),
            height:this.startBounds.height + ((this.targetBounds.height - this.startBounds.height) * value),
            opacity:value + 0.3 <= 1 ? value + 0.3 : 1 //- value
            //'-webkit-transform': 'rotate(' + rotation + 'deg)'
        };

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
