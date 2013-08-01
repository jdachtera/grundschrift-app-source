/**
 * This is the main admin menu
 *
 * @author Jascha Dachtera <jascha.dachtera@googlemail.com>
 */
enyo.kind({
    name:'Grundschrift.Views.Admin.Menu',
	kind: 'Grundschrift.Views.Admin.BaseView',
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

	handlers: {
		onSettingsLoaded: 'settingsLoaded'
	},

    itemChrome: {
        ontap:'open', classes: 'onyx-menu-item enyo-tool-decorator'
    },

    items: [
        {content: 'Benutzer verwalten', view: 'editChildren'},
		{content: 'Gruppen bearbeiten', view: 'editGroups'},
        {content: 'Einstellungen', view: 'settings' },
        {content: 'Export', view: 'export', name: 'export'},
        {content: 'Buchstaben bearbeiten', view: 'editLevels', name: 'editLevels'},
		{content: 'Über diese Anwendung', view: 'about'}
    ],

    components:[
        {kind:'FittableRows', style:'width:100%;', components:[
            {kind:'onyx.Toolbar', style:'height:80px', components:[
                {
					kind:'ImageButton',
					type:'Exit',
					ontap:'doBack'
				}
            ]},
            {kind:'Scroller', classes: 'onyx-menu onyx-picker', fit:true}
        ]}
    ],

	settingsLoaded: function(inSender, inEvent) {
		this.$.editLevels.setShowing(inEvent.settings.isDeveloperMode);
		this.$.export.setShowing(inEvent.settings.isDeveloperMode);
	},

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