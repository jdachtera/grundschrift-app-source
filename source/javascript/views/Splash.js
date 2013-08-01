/**
 * The loading screen
 * @author Jascha Dachtera <jascha.dachtera@googlemail.com>
 */
enyo.kind({
    name:'Grundschrift.Views.Splash',
    kind:'Grundschrift.Views.CroppedImage',
    src:'assets/images/splashBackground.png',
    classes:'splash',
    components:[
        {classes:"spinner"},
        {name:'image', kind:'Image', onload:'resizeHandler'},
		{name: 'lsb', kind: 'Image', src: 'assets/images/GSV_Logo.png', style: 'position:absolute; width: 16%; left: 2%; bottom: 2%'},
		{name: 'gsv', kind: 'Image', src: 'assets/images/Laborschule_Logo.png', style: 'position:absolute; width: 16%; right: 2%; bottom: 2%'}

    ],

    show:function () {
        this.inherited(arguments);
        this.resizeHandler();
    },

	hideStartScreenImages: function() {
		this.$.image.hide();
		this.$.lsb.hide();
		this.$.gsv.hide();
	}
});
