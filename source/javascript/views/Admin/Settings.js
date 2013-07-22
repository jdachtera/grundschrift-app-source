enyo.kind({
    kind:'Control',
    name:'Grundschrift.Views.Admin.Settings',

	lastUpdateRequest: null,

    components:[
        {kind:'FittableRows', style:'width:100%;', components:[
            {kind:'onyx.Toolbar', style:'height:80px', components:[
                {kind:'ImageButton', type:'Exit', ontap:'doBack'}
            ]},
            {kind: 'Scroller', style:'padding: 10px', components: [
                {tag:'h2', content:'Passwort:'},
                {kind:'onyx.Input', name:'password', setting:'password', onchange:'setSetting', onkeyup:'setSetting'},
                {tag:'h2', content:'Rendermodus:'},
                {kind:'onyx.RadioGroup', components:[
                    {content:'Einfach', name:'simple', setting:'drawMode', active:true, ontap:'setSetting'},
                    {content:'Erweitert', name:'advanced', setting:'drawMode', ontap:'setSetting'}
                ]},
                {tag:'h2', content:'Sortierung der Buchstaben:'},
                {kind:'onyx.RadioGroup', components:[
                    {content:'Nach Bewegungsklasse', name:'sortByClassName', setting:'levelSortMode', active:true, ontap:'setSetting'},
                    {content:'Alphabetisch', name:'sortByName', setting:'levelSortMode', ontap:'setSetting'}
                ]},
                {tag:'h2', content:'Spielzeit pro Kind:'},
                {kind:'Grundschrift.Views.IntegerSlider', caption:'Minuten', min:0, max:60, name:'allowedPlayTime', setting:'allowedPlayTime', onChange:'setSetting'},
				{tag:'h2', content:'Erkennungstoleranz:'},
				{kind:'Grundschrift.Views.IntegerSlider', caption:'maximal', min:30, max:80, name:'maxTolerance', setting:'maxTolerance', onChange:'setSetting'},
                {tag:'h2', content:'Wechsel zum nächsten Buchstaben:'},
                {kind:'Grundschrift.Views.IntegerSlider', caption:'Erfolgreiche Versuche', min:5, max:60, step:5, name:'maxSessions', setting:'maxSessions', onChange:'setSetting'}
            ]}
        ]}
    ],
    events:{
        onSettingsChanged:'',
        onBack: ''
    },

    handlers:{
        onSettingsLoaded:'settingsLoaded'
    },

    settings:{},

    settingsLoaded:function (inSender, inEvent) {
        this.settings = inEvent.settings;

        this.$.password.setValue(this.settings.password);

        this.$.simple.setActive(this.settings.drawMode == 'simple');
        this.$.advanced.setActive(this.settings.drawMode == 'advanced');

        this.$.sortByClassName.setActive(this.settings.levelSortMode == 'sortByClassName');
        this.$.sortByName.setActive(this.settings.levelSortMode == 'sortByName');

        this.$.maxSessions.setValue(this.settings.maxSessions);

        this.$.allowedPlayTime.setValue(this.settings.allowedPlayTime);
		this.$.maxTolerance.setValue(this.settings.maxTolerance);
    },

    setSetting:function (inSender) {
        if (inSender.kind == 'onyx.RadioButton') {
            this.settings[inSender.setting] = inSender.name;
        } else {
            this.settings[inSender.setting] = inSender.getValue();
        }
        localStorage['settings'] = enyo.json.stringify(this.settings);

		if (this.lastUpdateRequest) {
			clearTimeout(this.lastUpdateRequest);
		}

		this.lastUpdateRequest = setTimeout(enyo.bind(this, function() {
			this.bubble('onSettingsChanged');
			this.lastUpdateRequest = null
		}), 200);

    }

});