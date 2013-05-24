enyo.kind({
    name:'Grundschrift.Views.PasswordDialog',
    kind:'onyx.Popup',
    modal:true,
    centered:true,
    floating:true,
    autoDismiss:false,
    published:{
        password:''
    },

    masterPassword:'Gudcrf2012',

    events:{
        onAccessGranted:''
    },

    handlers:{
        onSettingsLoaded:'settingsLoaded'
    },
    components:[
        {kind:"onyx.Groupbox", components:[
            {kind:"onyx.GroupboxHeader", content:"Geschützter Bereich"},
            {components:[
                {content:'Bitte geben Sie das Passwort ein, um in den Lehrerbereich zu gelangen.'},
                {kind:"onyx.InputDecorator", components:[
                    {kind:'onyx.Input', placeholder:'Hier tippen...', onchange:'clearMessage'}
                ]}
            ]},
            {kind:"onyx.Toolbar", components:[
                {kind:"onyx.Button", content:"OK", ontap:"confirmClick"},
                {kind:"onyx.Button", content:"Abbrechen", ontap:"hide"}
            ]}
        ]}


    ],

    settingsLoaded:function (inSender, inEvent) {
        this.password = inEvent.settings.password;
    },

    show:function () {
        if (this.password) {
            this.inherited(arguments);
            this.$.input.setPlaceholder('Hier tippen...');
            this.$.input.setValue('');
        } else {
            this.bubble('onAccessGranted');
        }

    },
    confirmClick:function () {
        if (this.$.input.getValue() == this.password ||
            this.$.input.getValue() == this.masterPassword
            ) {
            this.log('Passowrd correct!');
            this.bubble('onAccessGranted');
            this.hide();
        } else {
            this.$.input.setValue('');
            this.log('Passowrd wrong!');
            this.$.input.setPlaceholder('leider falsch :(');
        }
    }
});