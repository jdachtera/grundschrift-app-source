enyo.kind({
    kind:'Control',
    name:'Grundschrift.Views.Illustration',
    classes:'illustration',
    published:{
        /**
         *    Data object:
         *    {
		 *		illustrationName: ...,
		 *		category: ...
		 *		levelName: ...
		 *	}
         */
        data:''
    },
    components:[
        {kind:'Image', onload:enyo.bubbler},
        {name:'caption', kind:'Control', allowHtml:true, classes:'caption'}
    ],
    handlers:{
        ontap:'tapHandler'
    },

    /**
     * Sets data when the control is created
     * @protected
     * @returns void
     */
    create:function () {
        this.inherited(arguments);
        this.dataChanged();
    },

    /**
     * Helper function which replaces values in a string
     * @param string The string to operate on
     * @param exchanges Array containing arrays with two string: [[search,replace], ...]
     * @protected
     * @returns string The replaced string
     */
    replace:function (string, exchanges) {
        enyo.forEach(exchanges, function (e) {
            string = string.split(e[0]).join(e[1]);
        });
        return string;
    },

    /**
     * Get the ratio of the illustration image
     * @protected
     * @returns the ratio of the illustration image
     */
    getRatio:function () {
        if (this.$.image.hasNode()) {
            var width = this.$.image.node.naturalWidth,
                height = this.$.image.node.naturalHeight;
            if (width > 0 && height > 0) {
                return width / height;
            }
        }
        return 1;
    },

    /**
     * Plays the illustration sound on tap
     * @protected
     * @returns void
     */
    tapHandler:function () {
        Grundschrift.Models.SoundManager.play(this.illustrationFilename.toString().toLowerCase());
    },

    /**
     * Triggered when the data object is changed. Sets the image source
     * @protected
     * @returns void
     */
    dataChanged:function () {
        if (this.data) {
            var macros = { illustrationFilename:this.data.illustrationName };

            this.illustrationFilename = macros.illustrationFilename = this.replace(macros.illustrationFilename, [
                ['ö', 'oe'],
                ['ü', 'ue'],
                ['ä', 'ae'],
                ['ß', 'sz']
            ]);

            enyo.mixin(macros, this.data);

            var path = enyo.macroize('assets/illustrationen/{$illustrationFilename}.png', macros);
            this.$.image.setSrc(path);
            var levelName = this.data.levelName.toString().split("_").shift();
            var caption = this.replace(
                this.data.illustrationName,
                [
                    [this.data.levelName, '<span class="levelPart">' + levelName + '</span>']
                ]
            );
            this.$.caption.setContent(caption);
        }
    }

});
