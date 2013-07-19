/**
 * This is the main admin menu
 *
 * @author Jascha Dachtera <jascha.dachtera@googlemail.com>
 */
enyo.kind({
    name:'Grundschrift.Views.Admin.Menu',
    classes:'menu',
    layoutKind:'FittableColumnsLayout',
    events:{
        /**
         * Occurs when the back button is tapped
         */
        onBack:'',

        /**
         * Triggerd when a menu item is tapped
         */
        onItemTap: ''
    },

    itemChrome: {
        ontap:'open', classes: 'onyx-menu-item enyo-tool-decorator'
    },

    items: [
        {content: 'Benutzer administrieren', view: 'editChildren'},
        {content: 'Einstellungen', view: 'settings'},
        {content: 'Export', view: 'export'},
        {content: 'Buchstaben bearbeiten', view: 'editLevels'},
		{content: 'Über diese Anwendung', view: 'about'}
    ],

    components:[
        {kind:'FittableRows', style:'width:100%;', components:[
            {kind:'onyx.Toolbar', style:'height:80px', components:[
                {kind:'ImageButton', type:'Exit', ontap:'doBack'}
            ]},
            {kind:'Scroller', classes: 'onyx-menu onyx-picker', fit:true}
        ]}
    ],

    create: function() {
        this.inherited(arguments);
        enyo.forEach(this.items, function(item) {
            this.$.scroller.createComponent(enyo.mixin(enyo.clone(this.itemChrome), item), {owner: this});
        }, this);
    },

    /**
     * Opens a view in the book
     * @public
     * @return void
     */
    open:function (inSender) {
        this.bubble('onItemTap', {
            view: inSender.view
        });
    }

});