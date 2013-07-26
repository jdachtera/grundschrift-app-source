/**
 * @author Jascha Dachtera <jascha.dachtera@googlemail.com>
 */
enyo.kind({
	name:'Grundschrift.Views.Admin.EditGroups',
	kind:'FittableRows',
	published:{
		/**
		 * The groups
		 */
		groups: []
	},

	updateQueue: [],

	handlers:{
		onGroupsLoaded:'groupsLoaded'
	},

	events: {
		onBack: ''
	},

	components:[
		{kind:'onyx.Toolbar', style:'height:80px', components:[
			{
				kind:'ImageButton',
				type:'Exit',
				ontap:'doBack'
			},
			{
				kind:'onyx.Button',
				content:'Gruppe hinzufügen',
				ontap:'addNewGroup'
			},
			{
				kind: 'onyx.Button',
				content: 'Speichern',
				name: 'save',
				ontap: 'save'
			}
		]},
		{
			kind: 'Scroller',
			fit:true,
			components: [
				{
					kind:'Repeater',
					onSetupItem:'setupItem',
					components:[
						{
							kind: 'FittableColumns',
							components: [
								{
									kind: 'FittableColumns',
									fit: true,
									style:'padding:16px;padding-bottom:0',
									components: [
										{
											kind: 'onyx.InputDecorator',
											fit:true,
											components: [
												{
													kind: 'onyx.Input',
													style: 'width:100%',
													property: 'name',
													name: 'name',
													onchange: 'change'
												}
											]
										},
										{
											kind: 'onyx.Button',
											style: 'margin-left:16px',
											content: 'Löschen',
											ontap: 'remove'
										}
									]
								}
							]
						}
					]
				},
			]
		}
	],

	groupsLoaded:function (inSender, inGroups) {
		this.setGroups(inGroups);
	},

	save: function(inSender, inEvent) {
		this.bubble('onAsyncOperationStarted');
		enyo.forEach(this.groups, function(group) {
			Grundschrift.Models.db.groups[group.id ? 'attach' : 'add'](group);
		}, this);

		enyo.forEach(this.updateQueue, function(cb) {
			cb();
		});
		this.updateQueue.length = 0;

		Grundschrift.Models.db.groups.saveChanges(enyo.bind(this, function() {
			this.bubble('onGroupsChanged');
			this.bubble('onAsyncOperationFinished');
			this.bubble('onBack');
		}));
	},

	remove: function(inSender, inEvent) {
		var group = this.groups[inEvent.index];
		if (group.id) {
			this.bubble('onAsyncOperationStarted');
			Grundschrift.Models.db.groups.remove(group);
			Grundschrift.Models.db.groups.saveChanges(enyo.bind(this, function() {
				this.bubble('onAsyncOperationFinished');
				this.bubble('onGroupsChanged');
			}));
		} else {
			this.groups.splice(this.groups.indexOf(group), 1);
		}

	},

	change: function(inSender, inEvent) {
		var group = this.groups[inEvent.index];
		this.updateQueue.push(function() {
			group[inEvent.originator.property] = inEvent.originator.getValue();
		});
	},

	/**
	 * Re-renders the list on changes
	 * @protected
	 * @return void
	 */
	groupsChanged:function () {
		this.$.repeater.setCount(this.groups.length);
		this.$.repeater.render();
	},



	/**
	 * Adds a new Group
	 * @protected
	 * @return void
	 */
	addNewGroup:function () {
		this.groups.push(new Grundschrift.Models.Group({
			name: 'Gruppe ' + (this.groups.length + 1),
			description: ''
		}));
		this.groupsChanged();
	},

	/**
	 * Renders a single item of the group list
	 * @param inSender The event sender
	 * @param inEvent The event
	 * @protected
	 * @return void
	 */
	setupItem:function (inSender, inEvent) {
		var i = inEvent.index;
		inEvent.item.$.name.setValue(this.groups[i].name);
	}

});
