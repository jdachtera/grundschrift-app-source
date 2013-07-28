/**
 * The children menu view
 *
 * @author Jascha Dachtera <jascha.dachtera@googlemail.com>
 */
enyo.kind({
    name:'Grundschrift.Views.ChildMenu',
    kind:'Grundschrift.Views.BaseView',
    classes:'childGrid',

    events:{
        /**
         * Is fired when a child was tapped
         */
        onChildSelected:'',
        onBack:'',
        onSettingsClicked:''
    },

    components:[
        {kind:'onyx.Toolbar', components:[
            {kind: 'ImageButton', type: 'application-exit', ontap: 'doBack'},
            {kind:'ImageButton', type:'Settings', ontap:'doSettingsClicked'}
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
	}

});