/**
 * A helper class for an image button
 */
enyo.kind({
    kind:'Image',
    name:'ImageButton',
    classes:'imageButton',

    published:{
        /**
         * The type of the image button. The file assets/icons/{type}.png must exist.
         */
        type:''
    },

    /**
     * The create function
     * @protected
     * @returns void
     */
    create:function () {
        this.inherited(arguments);
        this.typeChanged();
    },

    /**
     * Triggered when the type property is changed. Changes the image source.
     * @protected
     * @returns void
     */
    typeChanged:function () {
        this.setSrc('assets/icons/' + this.type + '.png');
    }
});
