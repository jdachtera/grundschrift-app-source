enyo.kind({
	name:'Grundschrift.Views.QuitDialog',
	kind:'onyx.Popup',
	modal:true,
	centered:true,
	floating:true,
	autoDismiss:false,
	style: 'padding:20px;text-align:center',
	components:[
		{kind:"onyx.Groupbox", components:[
			{kind:"onyx.GroupboxHeader", content:"Wirklich Beenden?"},

			{kind:"onyx.Button", style: 'display:inline-block', content:"Ja", ontap:"confirmClick"},
			{kind:"onyx.Button", style: 'display:inline-block;', content:"Nein", ontap:"hide"}

		]}
	],
	confirmClick:function () {
		console.log('Goodbye...');
		if (navigator && navigator.app && navigator.exitApp) {
			navigator.app.exitApp();
		} else {
			window.close();
		}
	}
});