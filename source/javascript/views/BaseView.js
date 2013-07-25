/**
 * This is the base for all Grundschrift views
 * It implements some common functions and styles
 */
enyo.kind({
    kind:'FittableRows',
    name:'Grundschrift.Views.BaseView',
    classes:'grundschriftView',

    events:{
        onAsyncOperationStart:'',
        onAsyncOperationFinished:''
    },

	handlers: {
		onBackButton: 'backButton'
	},

	backButton: function(inSender, inEvent) {
		if (inEvent.pane === this) {
			this.bubble('onBack');
			return true;
		}

	},


    /**
     * Changes the orientation of the view.
     * @param orientation 'left' or 'right'
     * @return void
     */
    setHandOrientation:function (orientation) {
        if (orientation == 'left') {
            this.setLeftHand();
        } else {
            this.setRightHand();
        }
    },

    /**
     * Set Left hand orientation.
     * @protected
     * @override
     * @return void
     */
    setLeftHand:function () {
        this.addClass('leftHand');
        this.removeClass('rightHand');
    },

    /**
     * Set right hand orientation.
     * @protected
     * @override
     * @return void
     */
    setRightHand:function () {
        this.addClass('rightHand');
        this.removeClass('leftHand');
    }


});