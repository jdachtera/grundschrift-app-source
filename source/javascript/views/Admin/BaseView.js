enyo.kind({
	kind:'FittableRows',
	name:'Grundschrift.Views.Admin.BaseView',
	handlers: {
		onBackButton: 'backButton'
	},

	backButton: function(inSender, inEvent) {
		if (inEvent.pane === this) {
			this.bubble('onBack');
			return true;
		}

	},
});