enyo.kind({
    name:"Grundschrift.Views.CardArranger",
    kind:"CardArranger",
    margin:0
});

enyo.kind({
    name:'Grundschrift.Views.Panels',
    kind:"Panels",

    //arrangerKind: "Grundschrift.Views.LeftRightArranger",
    arrangerKind:'Grundschrift.Views.CardArranger',
    animate:false,

    draggable:false,

    /**
     * Component names which are used as Panels
     */
    panelNames:null,

    /**
     * Overide the Panels method to use only panels specified in this.panelNames
     */
    getPanels:function () {
        if (this.panelNames) {
            return enyo.map(this.panelNames, function (panel) {
                return this.$[panel];
            }, this);
        } else {
            return this.inherited(arguments);
        }
    },

    /**
     * Change the panel by name
     */
    pageName:function (name) {
        var index = -1;
        if (this.panelNames) {
            index = enyo.indexOf(name, this.panelNames);
        } else {
            index = enyo.indexOf(name, enyo.map((this.controlParent || this).children, function (component) {
                return component.name;
            }));
        }
        if (index > -1) {
            this.setIndex(index);
        }

    },

    back:function () {
        this.previous();
    }
});