enyo.kind({
    name: 'Grundschrift.Views.Admin.Panels',
    kind: 'Grundschrift.Views.Panels',
    style: 'height:100%;width:100%',
    classes: 'admin',
    fit: true,
    events: {
        onBack: ''
    },
	handlers: {
		onBackButton: 'backButton'
	},
    components: [
        /**
         * The Admin Menu
         */
        {kind: 'Grundschrift.Views.Admin.Menu', onBack: 'doBack', onItemTap: 'openView'},

        /**
         * The child grid
         */
        {kind: 'Grundschrift.Views.Admin.EditChildren', onBack: 'openMenu', onChildSelected: 'openEditChild'},

        /**
         * The Edit child view
         */
        {kind: 'Grundschrift.Views.Admin.EditChild', onBack: 'previous', onBackToChildMenu: 'backToChildMenu', onOpenStatistics: 'openStatistics'},

		/**
		 * The Edit child view
		 */
		{kind: 'Grundschrift.Views.Admin.EditGroups', onBack: 'openMenu', onBackToChildMenu: 'backToChildMenu'},

        /**
         * The statistics view
         */
        {kind: 'Grundschrift.Views.Admin.Statistics', onBack: 'previous'},

        /**
         * The level grid
         */
        {kind: 'Grundschrift.Views.Admin.EditLevels', onBack: 'openMenu', onLevelSelected: 'openEditLevel'},

        /**
         * The edit level view
         */
        {kind: 'Grundschrift.Views.Admin.EditLevel', onBack: 'openEditLevels'},

        /**
         * The export view
         */
        {kind: 'Grundschrift.Views.Admin.Export', onBack: 'openMenu'},

        /**
         * The Settings view
         */
        {kind: 'Grundschrift.Views.Admin.Settings', onBack: 'openMenu'},

		/**
		 * The About view
		 */
		{kind: 'Grundschrift.Views.Admin.About', onBack: 'openMenu'}

    ],

	backButton: function(inSender, inEvent) {
		if (inEvent.pane === this) {
			var pane = this.getPanels()[this.index];
			this.waterfall('onBackButton', {pane: pane});
			return true;
		}
	},

	backToChildMenu: function() {
		this.openMenu();
		this.bubble('onBack');
	},

    openMenu: function() {
        this.pageName('menu');
        return true;
    },

	addNewChild: function() {
		this.$.editChildren.addNewChild();
	},

    previous: function() {
        this.inherited(arguments);
        return true;
    },

    openView: function(inSender, inEvent) {
        this.pageName(inEvent.view);
    },

    openEditChild: function(inSender, inEvent) {
        this.$.editChild.setChild(inEvent.child);
        this.pageName('editChild');
    },

	openEditLevels: function() {
		this.pageName('editLevels');
		return true;
	},

    openEditChildren: function() {
        this.pageName('editChildren');
        return true;
    },

    openStatistics: function(inSender, inEvent) {
        this.$.statistics.setChild(inEvent.child);
        this.pageName('statistics');
    },

    /**
     * Opens the edit screen for a level
     *
     * @param inSender
     * @param inEvent
     * @return void
     */
    openEditLevel:function (inSender, inEvent) {
        this.$.editLevel.setLevel(inEvent.level);
        this.pageName('editLevel');
    }
})