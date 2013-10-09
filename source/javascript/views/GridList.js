enyo.Scroller.getTouchStrategy = function() {
	return (enyo.platform.android >= 3) ? 
		"TransitionScrollStrategy" 
		: ((enyo.platform.windowsPhone === 8)
			? "TranslateScrollStrategy"
			: "TouchScrollStrategy");
}
// provide a touch scrolling solution by default when the environment is mobile
if (enyo.Scroller.hasTouchScrolling()) {
	enyo.Scroller.prototype.strategyKind = enyo.Scroller.getTouchStrategy();
}


/**
 * A gridList kind based utilizing a Repeater
 */
enyo.kind({
    name:'Grundschrift.Views.GridList',
    kind:'FittableRows',
    classes:'gridListWrapper',

    published:{
        minItemWidth:200,
        count:0,
        noGrid:false,
		lastGroupId: '',
		groupFunc: function() {},
    },

    events:{
        /**
         * Is triggered when an item is tapped
         */
        onItemTap:''
    },

    itemWidth:200,

    components:[
        {kind:'Scroller', fit: true, style:'width:100%', components:[
            {classes:'gridList', ontap:'cellClick', kind:'Repeater', onSetupItem:'setupItem', components:[

            ]}
        ]}

    ],

    /**
     * Initializes the component.
     * @protected
     * @returns void
     */
    create:function () {
        var components = this.components || [
            {kind:'Control'}
        ];

        this.itemComponents = [
			{name: 'groupHeader', classes: 'groupHeader'},
            {kind:'Control', name:'container', classes:'gridItemContainer', components:components}
        ];

        this.components = [];
        //this.initComponents();
        this.inherited(arguments);
		this.$.repeater.itemComponents = this.itemComponents;
    },


    /**
     * Hacks the components into the repeater.
     * @protected
     * @returns void
     */
    rendered:function () {

        this.inherited(arguments);

		//enyo.asyncMethod(this, 'resize');

    },

    scrollToTop: function() {
        this.$.scroller.scrollToTop();
    },

    /**
     * Resizes the repeater
     * @protected
     * @returns void
     */
    minItemWidthChanged:function () {
        this.resize();
    },

    /**
     * Automatically change repeater values
     * @protected
     * @returns void
     */
    countChanged:function () {
        this.$.repeater.setCount(this.count);
    },

    /**
     * re-renders the Grid
     * @param rows (optional) the new row count
     * @public
     * @returns void
     */
    refresh:function (count) {
		this.lastGroupId = '';
        if (count) {
            this.setCount(count);
        }
        this.$.repeater.build();
        this.$.repeater.render();
        this.resize();
    },

    /**
     * Updates the existing rows without a re-rendering
     * @public
     * @returns void
     */
    update:function (index) {
        if (index !== undefined) {
            this.setupItem(this, {index:index, item:this.$.repeater.children[index], update:true});
        } else {
            for (var i = 0; i < this.$.repeater.children.length; i++) {
                this.setupItem(this, {index:i, item:this.$.repeater.children[i], update:true});
            }
        }
        this.resize();
    },

    /**
     * Setups a grid cell. Automatically sets the right cell width
     * @param inSender
     * @param inEvent
     * @protected
     * @returns void
     */
    setupItem:function (inSender, inEvent) {
		if(inEvent.item.$.groupHeader) {
			var group = this.groupFunc(inEvent.index) || {id: '', name: 'Keine Gruppe zugewiesen'};
			inEvent.item.$.groupHeader.setContent(group.name);
			inEvent.item.$.groupHeader.setCanGenerate(group.id !== this.lastGroupId);
			this.lastGroupId = group.id;
			inEvent.item.$.container.applyStyle('width', this.itemWidth);
			this.bubble('onSetupItem', inEvent);
		} else {
			return true;
		}

    },

    /**
     * The cell click handler. Triggers the item tap event with the right row
     * @param inSender
     * @param inEvent
     * @protected
     * @returns void
     */
    cellClick:function (inSender, inEvent) {
        var element = inEvent.dispatchTarget;
        while (element !== undefined && element !== null && element.index === undefined) {
            element = element.parent;
        }
        if (element) {
            return this.bubble('onItemTap', {item:element});
        }
    },

    /**
     * Resizes the grid
     * @protected
     * @returns void
     */
    resizeHandler:function () {
        this.$.scroller.applyStyle('height', this.getBounds().height + 'px');
        this.resize();
    },

    /**
     * Resizes the grid
     * @protected
     * @param inSender
     * @param inEvent
     */
    resize:function (inSender, inEvent) {
        enyo.asyncMethod(this, function () {
            var bounds = this.$.repeater.getBounds(), itemCount, i, id, node;
            if (this.noGrid === true) {
                this.itemWidth = '100%';
            } else {
                itemCount = Math.floor(bounds.width / this.minItemWidth);
                this.itemWidth = Math.floor((bounds.width - 1) / itemCount) + 'px';
            }
            for (i = 0; i < this.$.repeater.children.length; i++) {
                id = this.$.repeater.children[i].$.container.id;
                node = enyo.dom.byId(id);
                if (node) {
                    node.style.width = this.itemWidth;
                }
            }
            return true;
        });

    }


});
