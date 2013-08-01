enyo.kind({
	kind:'FittableRows',
	name:'Grundschrift.Views.Admin.BaseView',
	classes: 'adminBaseView',
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