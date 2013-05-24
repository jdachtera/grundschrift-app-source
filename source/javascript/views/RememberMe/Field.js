enyo.kind({
    name:"Grundschrift.Views.RememberMe.Field",
    classes:"field",
    published:{
        level:"",
        visible:false,
        size:0,
        solved:false
    },

    style:"",

    components:[
        {name:"image", classes:"image"}
    ],

    rendered:function () {
        this.visibleChanged();
    },

    levelChanged:function () {
        this.visibleChanged();
    },

    sizeChanged:function () {
        this.applyStyle("width", this.size + "px");
        this.applyStyle("height", this.size + "px");
    },

    visibleChanged:function () {
        var src = "";
        if (this.level && this.visible) {
            src = enyo.macroize('assets/levels/{$category}/{$name}/thumbnail.png', this.level);
            Grundschrift.Models.SoundManager.play(this.level.name.toString().split("_").shift().toLowerCase());

        } else {
            src = "assets/images/rememberMeBackside.png";
        }
        this.$.image.applyStyle("background-image", "url(" + src + ")");
    },

    solvedChanged:function () {
        this.addRemoveClass("solved", this.solved);
    }
})