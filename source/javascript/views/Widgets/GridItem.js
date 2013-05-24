/**
 * The default grid item for the grid list
 */
enyo.kind({
    name:'Grundschrift.Views.GridItem',
    classes:'gridItem',
    kind:"Control",

    /**
     * Hides the item while preserving the allocated space
     */
    hide:function () {
        this.applyStyle('visibility', 'hidden');
    },

    /**
     * Shows the item
     */
    show:function () {
        this.applyStyle('visibility', 'visible');
    }
});