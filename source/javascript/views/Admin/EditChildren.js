/**
 * The child grid
 * @author Jascha Dachtera <jascha.dachtera@googlemail.com>
 */
enyo.kind({
    name:'Grundschrift.Views.Admin.EditChildren',
    kind:'Grundschrift.Views.Admin.BaseView',


    events: {
        onBack: '',
        onChildSelected: ''
    },

    components:[
        {kind:'onyx.Toolbar', style:'height:80px', components:[
            {kind:'ImageButton', type:'Exit', ontap:'doBack'},
            {kind:'onyx.Button', content:'Benutzer hinzufügen', ontap:'addNewChild'}
        ]},
		{kind:'Grundschrift.Views.ChildGrid', fit:true, onChildSelected: 'childSelected'}
	],

	/**
	 * Fires the onItemSelected event
	 * @param inSender
	 * @param inRow
	 * @protected
	 * @returns void
	 */
	childSelected:function (inSender, inEvent) {
		this.bubble('onChildSelected', {child: inEvent.child});
	},

    /**
     * Adds a new Child
     * @protected
     * @return void
     */
    addNewChild:function () {
        this.bubble('onChildSelected', {
            child: new Grundschrift.Models.User({
                name:'',
                password:[1, 1, 1],
                imageUrl: null
            })
        });
    }

});
