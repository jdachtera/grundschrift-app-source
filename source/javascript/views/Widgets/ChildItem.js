/**
 * The child item. Used in the child menu grid.
 *
 * @author Jascha Dachtera <jascha.dachtera@googlemail.com>
 */
enyo.kind({
    name:'Grundschrift.Views.ChildItem',
    kind:'Control',
    classes:'gridItem',
    published:{
        /**
         * The image src
         */
        image:'',
        /**
         * The name of the child
         */
        name:'',

		gender: '',
        /**
         * The width of the item
         */
        width:200
    },
    components:[
        {kind:'Grundschrift.Views.CroppedImage', classes:'image', name:'image'},
        {classes:'nameWrapper', components:[
            {name:'name', classes:'name'}
        ]}


    ],

    /**
     * Triggered when the image is changed.
     *
     * @protected
     * @returns void
     */
    imageChanged:function () {

		this.$.image.setSrc(this.image || 'assets/images/rememberMeBackside' + (this.gender == 'f' ? '_f' : '') + '.png');
    },

    /**
     * Triggered when the name is changed
     *
     * @protected
     * @returns void
     */
    nameChanged:function () {
        this.$.name.setContent(this.name);
    },


    /**
     * Triggered when the width is changed
     *
     * @protected
     * @returns void
     */
    widthChanged:function () {
        this.applyStyle('width', this.width);
    }
});