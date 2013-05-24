enyo.kind({
    name:"Grundschrift.Views.RememberMe.FinishedPopup",
    kind:"onyx.Popup",
    autoDismiss:false,
    modal:true,
    centered:true,
    floating:true,
    showing:false,
    style:"text-align: center",
    events:{
        onClose:""
    },
    components:[
        {content:"Sehr gut!"},
        {kind:"Image", src:"assets/icons/Smiley_03.png", attributes:{height:"50px"} },
        {tag:"div"},
        {kind:"onyx.Button", content:"Schließen", ontap:"close"}
    ],

    close:function () {
        this.hide();
        this.bubble("onClose");
    }

});