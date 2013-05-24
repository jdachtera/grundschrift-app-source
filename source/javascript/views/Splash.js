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
        {name:'image', kind:'Image', onload:'resizeHandler'}

    ],

    show:function () {
        this.inherited(arguments);
        this.resizeHandler();
    }
});
