/**
 * The export view
 * @author Jascha Dachtera <jascha.dachtera@googlemail.com>
 **/
enyo.kind({
    name:'Grundschrift.Views.Admin.Export',
    kind:'Grundschrift.Views.Admin.BaseView',

    events: {
        onBack: ''
    },
    components:[
        {kind:'onyx.Toolbar', defaultKind:'onyx.Button', style:'height:80px', components:[

            {kind:'ImageButton', type:'Exit', ontap:'doBack'},

            {kind:'onyx.Checkbox', name:'child'},
            {content:'Child', kind:'Control'},
            {kind:'onyx.Checkbox', name:'session'},
            {content:'Session', kind:'Control'},
            {kind:'onyx.Checkbox', name:'level'},
            {content:'Level', kind:'Control'},
            {content:'Export', ontap:'exportButtonClick'},
            //{content:'Import', ontap:'importButtonClick'},

            {content:'Send', ontap:'sendEmail'},
            {content:'Reset Levels', ontap:'resetLevels'}
        ]},
        {kind: 'onyx.InputDecorator', style: 'width: 100%', fit: true, components: [
            {kind: 'onyx.TextArea', style:'height:100%;width:100%', name:'exportContainer'}
        ]}
    ],

    /**
     * Export Button tap handler
     * @param inSender
     * @protected
     * @return void
     */
    exportButtonClick:function (inSender) {
		var data = {}, counter = 0;

		var cb = enyo.bind(this, function() {
			counter--;
			if (counter === 0) {
				enyo.asyncMethod(this, 'setExportData', data);
			}
		});

        if (this.$.child.getValue()) {
			counter++;
			Grundschrift.Models.User.export(this, function(childs) {
				data.Child = childs;
				cb();
			});
        }

        if (this.$.session.getValue()) {
			counter++;
			Grundschrift.Models.Session.export(this, function(sessions) {
				data.Session = sessions;
				cb();
			});
        }

        if (this.$.level.getValue()) {
			counter++;
			Grundschrift.Models.Level.export(this, function(levels) {
				data.Level = levels;
				cb();
			});
        }

    },

    /**
     * Import Button tap Handler
     * @protected
     * @return void
     */
    importButtonClick:function () {

    },

    /**
     * Sets the contents of the export box
     * @protected
     * @param data The contents
     */
    setExportData:function (data) {
        this.$.exportContainer.setValue(enyo.json.stringify(data, undefined, 2));
        this.resized();
    },

    /**
     * Sends an email with the contents of the export container
     */
    sendEmail:function () {
        window.open(
            'mailto:' + Grundschrift.Models.developerEmail +
                '?subject=' + encodeURIComponent('[Grundschrift Export]') +
                '&body=' + encodeURIComponent(this.$.exportContainer.getValue())
        );
    },

    /**
     * Reloads the levels from the json definition files
     */
    resetLevels:function () {
        this.bubble("onAsyncOperationStarted");
        Grundschrift.Models.Level.checkUpdates(enyo.bind(this, function () {
            this.bubble("onAsyncOperationFinished");
            this.bubble("onLevelsChanged");
        }), true);
    }

});
