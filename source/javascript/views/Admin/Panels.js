enyo.kind({
    name: 'Grundschrift.Views.Admin.Panels',
    kind: 'Grundschrift.Views.Panels',
    style: 'height:100%;width:100%',
    classes: 'admin',
    fit: true,
    events: {
        onBack: ''
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
        {kind: 'Grundschrift.Views.Admin.EditChild', onBack: 'previous', onOpenStatistics: 'openStatistics'},

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
        {kind: 'Grundschrift.Views.Admin.EditLevel', onBack: 'openMenu'},

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

    openMenu: function() {
        this.pageName('menu');
        return true;
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