/**
 * The children menu view
 *
 * @author Jascha Dachtera <jascha.dachtera@googlemail.com>
 */
enyo.kind({
	name:'Grundschrift.Views.ChildGrid',
	kind:'FittableRows',
	classes:'childGrid',

	published:{
		/**
		 * The children
		 * this.children is already used by enyo so we call it childs ;)
		 */
		childs:[],

		groups: []

	},

	events:{
		/**
		 * Is fired when a child was tapped
		 */
		onChildSelected:'',
	},

	handlers:{
		onChildrenLoaded:'childrenLoaded',
		onGroupsLoaded: 'groupsLoaded'
	},

	components:[
		{kind:'Grundschrift.Views.GridList',
			onSetupItem:'setupItem',
			onItemTap:'childTap',
			fit:true,
			components:[
				{kind:'Grundschrift.Views.ChildItem'}
		]}
	],

	create: function() {
		this.inherited(arguments);

		this.$.gridList.setGroupFunc(enyo.bind(this, function(index) {
			var child = this.childs[index];
			if (child) {
				return this.getChildGroup(child.groupId);
			}
		}));
	},

	getChildGroup: function(id) {
		var group = enyo.filter(this.groups, function(group) {
			return group.id == id;
		})[0] || {id: '', name: 'Keine Gruppe'};
		return group;
	},


	groupsLoaded: function(inSender, inGroups) {
		this.setGroups(inGroups);
		this.childsChanged();
	},

	childrenLoaded:function (inSender, inChildren) {
		this.setChilds(inChildren.slice(0));
	},


	/**
	 * Setups a row for the child grid
	 * @param inSender The gridlist
	 * @param inEvent The event
	 * @protected
	 * @returns void
	 */
	setupItem:function (inSender, inEvent) {
		var i = inEvent.index;
		inEvent.item.$.childItem.setName(this.childs[i].name);
		inEvent.item.$.childItem.setGender(this.childs[i].gender);
		inEvent.item.$.childItem.setImage(this.childs[i].imageUrl);

	},

	/**
	 * Re-renders the grid when the childs are changed
	 * @protected
	 * @returns void
	 */
	childsChanged:function () {
		this.childs.sort(enyo.bind(this, function(a, b) {
			if (a.groupId !== b.groupId) {
				if (a.groupId == '') {
					return 1;
				} else if (b.groupId == '') {
					return -1;
				}
				return this.getChildGroup(a.groupId).name > this.getChildGroup(b.groupId).name;
			} else {
				return a.name > b.name;
			}

		}));
		this.$.gridList.setCount(this.childs.length);
		this.$.gridList.refresh();

	},

	/**
	 * Fires the onItemSelected event
	 * @param inSender
	 * @param inRow
	 * @protected
	 * @returns void
	 */
	childTap:function (inSender, inEvent) {
		this.bubble('onChildSelected', {child:this.childs[inEvent.item.index]});
	}
});