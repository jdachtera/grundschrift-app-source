enyo.kind({
    name: 'Grundschrift.Views.LevelFinishedPopup',
    kind: 'onyx.Popup',

    published: {
        currentLevel: '',
        currentSessionCount: '',
        nextLevel: '',
        nextSessionCount: ''
    },

    events: {
        onLevelSelected: '',
        onBack: ''
    },

    handlers: {
        onSettingsLoaded: 'settingsLoaded',
        onSessionsLoaded: 'sessionsLoaded',
        onHide: 'hidden'
    },

    centered: true,
    modal: true,
    floating: true,
    //autoDismiss: false,
    scrim: true,

    selected: null,

    classes: 'levelFinishedPopup',

    components: [
        {showing: false, components: [
            {kind: 'onyx.Toolbar', components: [
                {kind: 'ImageButton', name: 'exit', type: 'Exit', ontap: 'back'}
            ]},
            {kind: 'Grundschrift.Views.LevelMenuItem', name: 'current', ontap: 'levelTap'},
            {kind: 'Grundschrift.Views.LevelMenuItem', name: 'next', ontap: 'levelTap'}
        ]},

        {kind: 'Control', name: 'stars', classes: 'stars', ontap: 'hide'}
    ],

    hidden: function() {
        this.bubble('onLevelSelected', {
            level: this.nextLevel
        });
        Grundschrift.Models.SoundManager.play(this.nextLevel.name.toString().toLowerCase().split('_').shift());
    },


    levelTap: function(inSender) {
        if (this.selected === inSender.name) {
            if (inSender.name == 'next') {
                this.bubble('onLevelSelected', {
                    level: this.nextLevel
                });
            }
            this.hide();

        } else {
            this.selected = inSender.name;

            this.$.current.setIsActive(inSender == this.$.current);
            this.$.next.setIsActive(inSender == this.$.next);

            var level = inSender.name == 'current' ? this.currentLevel : this.nextLevel;

            Grundschrift.Models.SoundManager.play(level.name.toString().toLowerCase().split('_').shift());
        }
    },

    back: function() {
        this.bubble('onBack');
        this.hide();
    },

    show: function() {
        this.inherited(arguments);
        this.selected = null;
        this.resized();

        setTimeout(enyo.bind(this, function() {
            if (this.showing == true) {
                this.hide();
            }
        }), 5000);

        var blink = setInterval(enyo.bind(this, function() {
            if (!this.showing) {
                clearInterval(blink);
            }
            this.$.stars.setShowing(!this.$.stars.showing);
        }), 400);
    },

    currentLevelChanged: function() {
        this.$.current.setLevel(this.currentLevel);
    },

    nextLevelChanged: function() {
        this.$.next.setLevel(this.nextLevel);
    },

    currentSessionCountChanged: function() {
        this.$.current.setSessionCount(this.currentSessionCount);
    },

    nextSessionCountChanged: function() {
        this.$.next.setSessionCount(this.nextSessionCount);
    },

    settingsLoaded: function(inSender, inEvent) {
        this.$.current.setSessionCountMax(inEvent.settings.maxSessions);
        this.$.next.setSessionCountMax(inEvent.settings.maxSessions);
    },

    sessionsLoaded: function(inSender, inEvent) {
        this.setNextSessionCount(enyo.filter(inEvent.sessions, function(session) {
            return session.level == this.nextLevel;
        }, this).length);

        this.setCurrentSessionCount(this.$.current.getSessionCountMax());
    }
});