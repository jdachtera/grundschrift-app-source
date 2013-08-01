/**
 * A scaling cropped image
 */
enyo.kind({
    kind:'Control',
    name:'Grundschrift.Views.CroppedImage',
    classes:'croppedImage',

    published:{
        src:''
    },

    style:'overflow: hidden',

    components:[
        {name:'image', kind:'Image', onload:'resizeHandler'}
    ],

    rendered:function () {
        this.inherited(arguments);
        this.srcChanged();
    },

    srcChanged:function () {
        this.$.image.setAttribute('src', this.src);
        this.resizeHandler();
    },
    resizeHandler:function () {
		var imgNode
		setTimeout(enyo.bind(this, function() {
			if (this.$.image && (imgNode = this.$.image.hasNode()) && imgNode.naturalWidth && imgNode.naturalHeight) {
				var bounds = this.getBounds();

				if (bounds.height && bounds.width) {
					var ratioW = bounds.width / imgNode.naturalWidth,
						ratioH = bounds.height / imgNode.naturalHeight,
						ratio = ratioW > ratioH ? ratioW : ratioH;

					this.$.image.applyStyle('width', imgNode.naturalWidth * ratio + 'px');
					this.$.image.applyStyle('height', imgNode.naturalHeight * ratio + 'px');
					this.$.image.applyStyle('margin-top', (imgNode.naturalHeight * ratio - bounds.height) / -2 + 'px');
					this.$.image.applyStyle('margin-left', (imgNode.naturalWidth * ratio - bounds.width) / -2 + 'px');
				}

			} else {
				this.resizeHandler();
			}
		}), 50);
    }
});