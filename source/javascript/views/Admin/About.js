enyo.kind({
	name: 'Grundschrift.Views.Admin.About',
	events: {
		onBack: ''
	},
	components: [
		{kind:'onyx.Toolbar', components:[
			{kind:'ImageButton', type:'Exit', ontap:'doBack'}
		]},
		{kind:'Scroller', style: 'padding: 20px;', fit:true, components:[
			{allowHtml: true, name: 'htmlContainer'}
		]}
	],
	create: function() {
		this.inherited(arguments);
		new enyo.Ajax({
			url: 'assets/about.html'
		}).go().response(this, function(inSender, inContent) {
			this.$.htmlContainer.setContent(inContent);
		});
	}
});
