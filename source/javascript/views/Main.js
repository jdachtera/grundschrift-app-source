enyo.kind({
    name:'Grundschrift.Views.Main',
    kind:'Grundschrift.Views.BaseView',
    classes:'main',
    layoutKind:'FittableColumnsLayout',

    published:{
        /**
         * The level we are playing
         */
        level:'',
        /**
         * The child that is playing
         */
        child:'',
        /**
         * The childs (successful) session count for this level
         */
        sessionCount:0,

        /**
         * Other variants of the current level
         */
        variants:[],

		successHistory: 0,

		maxTolerance: 30
    },

    events:{
        /**
         * Is triggered when the back button is tapped
         */
        onBack:'',

        onRequestCheckIfChildIsAllowedToPlay:'',

        onSessionsChanged:'',

        onMaxReached:''
    },

    handlers:{
        onSettingsLoaded:'settingsLoaded'
    },


    loadedIllustrations:[],

    components:[
        {kind:'FittableRows', style:'width:25%;', components:[
            {kind:'onyx.Toolbar', classes:'sideBarHeader', components:[
                {kind:'ImageButton', type:'Exit', ontap:'doBack'},
                {kind:'ImageButton', type:'finger', ontap:'startDemo'}
            ]},
            {name:'sideBar', fit:true, kind:"FittableRows", classes:"sideBarContent", components:[
                {kind:'Grundschrift.Views.SessionStars', max:5, size:32, onAnimationEnd:'resetCanvas'},
                {name:'illustrations', fit:true},
                {kind:'Scroller', vertical: 'hidden', touchOverscroll: false, classes:'variants', components:[
                    {name:'variants'}
                ]}
            ]}
        ]},
        {kind:'Control', style:"width:75%", components:[
            {kind:'Grundschrift.Views.MainCanvas', name:'canvas',
                onFinished:'levelFinished',
                onPlayStart:enyo.bubbler,
                onPlayStop:enyo.bubbler
            },
			{
				name: 'aidButton',
				classes: 'aidButton',
				ontap: 'toggleAid'
			}
        ]}

    ],

	settingsLoaded: function(inSender, inEvent) {
		this.setMaxTolerance(inEvent.settings.maxTolerance);
	},

	toggleAid: function() {
		this.setAid(!this.$.canvas.getAid());
		this.successHistory = this.$.canvas.getAid() ? -3 : 0;
	},

	setAid: function(aid) {
		this.$.canvas.setAid(aid);
		this.$.aidButton.addRemoveClass('active', aid);
	},

    setDrawmode:function (drawMode) {
        this.$.canvas.setDrawMode(drawMode);
    },

    setChild:function (inChild) {
        this.set("child", inChild, "childChanged");
    },

    /**
     * Hands the child over to the canvas
     * @protected
     * @returns void
     */
    childChanged:function () {
        this.$.canvas.setChild(this.child);
        this.setHandOrientation(this.child.leftHand === true ? 'left' : 'right');
        this.$.canvas.setHandOrientation(this.child.leftHand === true ? 'left' : 'right');
        this.$.sessionStars.setHandOrientation(this.child.leftHand === true ? 'left' : 'right');
    },

    /**
     * Hands over the session count to the stars widget
     * @protected
     * @returns void
     */
    sessionCountChanged:function () {
        this.$.sessionStars.setValue(this.sessionCount);
    },


    /**
     * Loads the illustrations for the current level and hands over the level to the canvas.
     * @protected
     * @returns void
     */
    levelChanged:function () {
		this.bubble('onAsyncOperationStarted', {callback: enyo.bind(this, function() {
			// Show / hide the canvas to fix Android not displaying the canvas
			this.$.canvas.hide();
			enyo.asyncMethod(this, function() {
				this.$.canvas.show();
				this.$.canvas.resized();
				if (this.sessionCount === 0) {
					setTimeout(enyo.bind(this, 'startDemo'), 300);
				}
			})
		})});

		this.setAid(false);

        this.$.illustrations.destroyComponents();
        enyo.forEach(this.loadedIllustrations, function (illustration) {
            illustration.destroy();
        });
        this.loadedIllustrations.length = 0;

        enyo.forEach(this.level.illustrations, function (i) {
            this.$.illustrations.createComponent({
                owner:this,
                kind:'Grundschrift.Views.Illustration',
                onload:'illustrationLoaded',
                name:i,
                data:{
                    category:this.level.category,
                    levelName:this.level.name,
                    illustrationName:i
                }
            });
        }, this);

		if (this.level.illustrations.length === 0) {
			enyo.asyncMethod(this, function() {
				this.bubble('onAsyncOperationFinished');
			});
		}

        this.$.canvas.setLevel(this.level);

        enyo.forEach(Grundschrift.Models.Level.classNames, function (levelClass) {
            this.$.sideBar.addRemoveClass(levelClass, this.level.className == levelClass);
        }, this);

        this.$.canvas.stopDemo();

        this.$.illustrations.render();
    },

    variantsChanged:function () {
        this.$.variants.destroyClientControls();
        var components = [];
        enyo.forEach(this.variants, function (level, i) {
            components.push({classes:"wrapper", ontap:'variantTap',
                index:i, components:[
                    {
                        kind:'Image',
                        src:enyo.macroize('assets/levels/{$category}/{$name}/thumbnail.png', level)
                    }
                ]});
        }, this);
        this.$.variants.createComponents(components, {owner:this});
        this.$.variants.render();
        this.$.variants.applyStyle("width", this.variants.length * 64 + "px");
    },

    variantTap:function (inSender) {
        console.log("level.name");
        this.bubble('onVariantTap', {level:this.variants[inSender.index]});
    },

    /**
     * Event handler for illustration load
     * @param inSender
     * @param inEvent
     * @protected
     * @returns void
     */
    illustrationLoaded:function (inSender, inEvent) {
        this.loadedIllustrations.push(inSender);
        if (this.loadedIllustrations.length === this.level.illustrations.length) {
            this.resizeIllustrations();
			this.bubble('onAsyncOperationFinished');
        }
    },

    /**
     * Triggers a resize of the illustrations
     * @protected
     * @returns void
     */
    resizeHandler:function () {
        this.inherited(arguments);
        enyo.asyncMethod(this, 'resizeIllustrations');
    },

    /**
     * Resizes the illustration
     * @protected
     * @returns void
     */
    resizeIllustrations:function () {
        var number = this.$.illustrations.children.length;
        if (number > 0) {

            var bounds = this.$.illustrations.getBounds();

            var marginBottom = this.$.illustrations.children[0].getComputedStyleValue('margin-bottom', '0px').split('px')[0];
            var marginRight = this.$.illustrations.children[0].getComputedStyleValue('margin-right', '0px').split('px')[0];
            var marginLeft = this.$.illustrations.children[0].getComputedStyleValue('margin-left', '0px').split('px')[0];

            var maxHeight = (bounds.height / number) - marginBottom;

            var maxWidth = bounds.width - marginRight - marginLeft;

            var ratios = enyo.map(this.$.illustrations.children, function (illustration) {
                return illustration.getRatio();
            }, this);

            ratios.sort(function (a, b) {
                return a - b;
            });
            var useHeight = (maxHeight * ratios[0]) < maxWidth;

            enyo.forEach(this.$.illustrations.children, function (illustration) {
                var ratio = illustration.getRatio();
                if (useHeight) {
                    var height = maxHeight * ratios[0] / ratio;
                    illustration.applyStyle('height', height + 'px');
                    illustration.applyStyle('width', height * ratio + 'px');
                } else {
                    illustration.applyStyle('width', maxWidth + 'px');
                    illustration.applyStyle('height', maxWidth / ratio);
                }
            }, this);
        }


    },

    /**
     * Resets the canvas
     * @protected
     * @returns void
     */
    resetCanvas:function () {
        var min = 20;
        var s = this.maxTolerance - (Math.floor(this.sessionCount / 5) + 1) * 2.5;
        if (s < min) s = min;

        if (this.$.canvas.getSensitivity() != s) {
            this.$.canvas.setSensitivity(s);
        }
        this.$.canvas.reset();
    },

    /**
     * The handler for the level finished event
     * @param inSender
     * @param inEvent
     * @protected
     * @returns void
     */
    levelFinished:function (inSender, inEvent) {
        enyo.asyncMethod(this, function () {
            var session = new Grundschrift.Models.Session({
                level:this.level,
                child:this.child,
                success:inEvent.success
            });

			this.successHistory += inEvent.success ? 1 : -1;
			this.successHistory = this.successHistory < -3 ? -3 : (this.successHistory > 0 ? 0 : this.successHistory);
			if (this.successHistory == -3) {
				this.setAid(true);
			} else if (this.successHistory >= 0){
				this.setAid(false);
			}

            session.setPaths(inEvent.paths);

            persistence.add(session);
            Grundschrift.Models.flushAndSync(['Session'], enyo.bind(this, function () {
                if (inEvent.success === true) {

                    Grundschrift.Models.SoundManager.play(this.level.name.toString().toLowerCase());
                    this.sessionCount++;
                    var lastPoint = {};

                    if (inEvent.paths.length > 0 && inEvent.paths[inEvent.paths.length - 1].length > 0) {
                        lastPoint = this.$.canvas.getAbsolutizedPoint(inEvent.paths[inEvent.paths.length - 1][inEvent.paths[inEvent.paths.length - 1].length - 1]);
                    }

                    this.$.sessionStars.animateValueChange(this.sessionCount, lastPoint);

                } else {
                    this.resetCanvas();
                }
                this.bubble('onRequestCheckIfChildIsAllowedToPlay');
            }));
        });
    },

    /**
     * Starts the demo animation
     * @protected
     * @returns void
     */
    startDemo:function () {
        this.$.canvas.startDemo();
    }

});
