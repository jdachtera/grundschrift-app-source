enyo.kind({
    name:"Grundschrift.Views.LevelMenuItem",
    kind:'Grundschrift.Views.GridItem',

    classes: 'levelMenuItem',

    published:{
        image:'',
        sessionCount:0,
        sessionCountMax:5,
        isEnabled:true,
        isActive:false
    },

    components:[
        //{classes:'caption', components:[
			{name:'image', kind:'Image', classes: 'levelImage'},
			{classes: 'colorStripe'},
        //]},
        //{classes:'starsWrapper', components:[
            {kind:'Grundschrift.Views.SessionStars', size: 26}
        //]}

    ],

    create:function () {
        this.inherited(arguments);
        this.sessionCountMaxChanged();
        this.isEnabledChanged();
    },

    isEnabledChanged:function () {
        this.addRemoveClass('enabled', this.isEnabled);
    },

    isActiveChanged:function () {
        this.addRemoveClass('selected', this.isActive);
    },

    sessionCountMaxChanged:function () {
        this.$.sessionStars.setMax(this.sessionCountMax);
        this.addRemoveClass('solved', this.sessionCount >= this.sessionCountMax);
    },

    sessionCountChanged:function () {
        this.$.sessionStars.setValue(this.sessionCount);
        this.addRemoveClass('solved', this.sessionCount >= this.sessionCountMax);
    },

    imageChanged:function () {
        this.$.image.setSrc(this.image);
    },

    setLevel: function(level) {
        this.setImage(enyo.macroize('assets/levels/{$category}/{$name}/thumbnail.png', level));

        this.setIsActive(false);

        enyo.forEach(Grundschrift.Models.Level.classNames, function (levelClass) {
            this.addRemoveClass(levelClass, level.className == levelClass);
        }, this);
    }
});