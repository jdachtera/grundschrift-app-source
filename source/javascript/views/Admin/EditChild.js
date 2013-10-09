enyo.kind({
    name:'Grundschrift.Views.Admin.EditChild',
    kind:'Grundschrift.Views.Admin.BaseView',
    fit: true,
    classes:'editChild',
    published:{
        /**
         * The child to edit
         */
        child:-1,

		groups: []
    },
    image:'',
    password:[],
    events:{
        /**
         * Is triggered when the child was changed
         */
        onChildrenChanged:'',
        onOpenStatistics:'',
        onBack: ''
    },
	handlers: {
		onGroupsLoaded: 'groupsLoaded'
	},
    components:[
        {kind:'onyx.Toolbar', style:'height:80px', components:[
            {kind:'ImageButton', type:'Exit', ontap:'doBack'},
            //{kind:"onyx.Button", content:"Statistik", ontap:"statisticsTap"},
            {kind:"onyx.Button", content:"Speichern", ontap:"saveTap"},
			{kind:"onyx.Button", content:"Speichern und zum Hauptmenü", ontap:"saveAndToMainMenu"},
            {kind:"onyx.Button", content:"Löschen", ontap:"confirmDelete"}
        ]},
        {kind:'Scroller', fit:true, components:[
            {kind:'onyx.Groupbox', style: "width: 50%; margin: 10pt auto; background:#fffafa", components:[
                {kind: 'onyx.InputDecorator', components:[
					{content:'Name:', style:'display:inline-block;width:100px'},
                    {kind:'onyx.Input', name:'name', onkeyup:'keyup'}
                ]},
                {kind: 'onyx.InputDecorator', components: [
					{content:'Linkshänder:', style:'display:inline-block;width:100px'},
                    {kind:'onyx.Checkbox', name:'leftHand', style:'margin-right:3pt', onchange: 'setLeftHandPathsVisibility'},
					{content:'Alternative Bewegungsabläufe:', name:'leftHandPathsLabel', style:'display:inline-block;margin: 0 10px'},
					{kind:'onyx.Checkbox', name:'leftHandPaths', style:'margin-right:3pt'}

                ]},

                {kind: 'onyx.InputDecorator', components:[
                    {content:'Bild:',style:'display:inline-block;width:100px'},
                    {kind:'Grundschrift.Views.CroppedImage', ontap:'childImageTap', style:'width:150pt;height:80pt;border:2px white solid;'}
                ]},
				{kind: 'onyx.InputDecorator', components:[
					{content:'Geschlecht:', style:'display:inline-block;width:100px'},
					{kind: "onyx.PickerDecorator", components: [
						{},
						{
							name: "genderPicker",
							kind: "onyx.Picker",
							onChange: 'changeGender',
							components: [
								{
									name: 'genderUndefined', content: 'Nicht angegeben', value: ''
								},
								{
									name: 'genderMale', content: 'Junge', value: 'm'
								},
								{
									name: 'genderFemale', content: 'Mädchen', value: 'f'
								}
							]
						}
					]}
				]},
				{kind: 'onyx.InputDecorator', components:[
					{content:'Gruppe:', style:'display:inline-block;width:100px'},
					{kind: "onyx.PickerDecorator", components: [
						{},
						{
							name: "groupPicker",
							kind: "onyx.Picker",
							onChange: 'changeGroup'
						}
					]}
				]},
                {kind: 'onyx.InputDecorator', components:[
                    {content:'Password:'},
                    {kind:'FittableColumns', classes:'password', components:[

                        {kind:'FittableRows', style:'width:33%', components:[
                            {content:'1', style:'text-align: center;'},
                            {kind:'Image', src:'assets/images/password1.png', name:'p0', ontap:'passwordImageTap', slot:0, index:1},
                            {kind:'Image', src:'assets/images/password2.png', name:'p1', ontap:'passwordImageTap', slot:0, index:2},
                            {kind:'Image', src:'assets/images/password3.png', name:'p2', ontap:'passwordImageTap', slot:0, index:3}
                        ]},
                        {kind:'FittableRows', style:'width:33%', components:[
                            {content:'2', style:'text-align: center;'},
                            {kind:'Image', src:'assets/images/password1.png', name:'p3', ontap:'passwordImageTap', slot:1, index:1},
                            {kind:'Image', src:'assets/images/password2.png', name:'p4', ontap:'passwordImageTap', slot:1, index:2},
                            {kind:'Image', src:'assets/images/password3.png', name:'p5', ontap:'passwordImageTap', slot:1, index:3}
                        ]},
                        {kind:'FittableRows', style:'width:33%', components:[
                            {content:'3', style:'text-align: center;'},
                            {kind:'Image', src:'assets/images/password1.png', name:'p6', ontap:'passwordImageTap', slot:2, index:1},
                            {kind:'Image', src:'assets/images/password2.png', name:'p7', ontap:'passwordImageTap', slot:2, index:2},
                            {kind:'Image', src:'assets/images/password3.png', name:'p8', ontap:'passwordImageTap', slot:2, index:3}
                        ]}
                    ]}
                ]}

            ]}
        ]},

        {name: 'confirmDelete', kind: 'onyx.Popup', style: 'padding: 10pt; text-align: center', modal: true, centered: true, components: [
            {content: 'Soll das Kind wirklich gelöscht werden?', style: 'margin-bottom: 10pt'},
            {kind: 'onyx.Button', content: 'Ja', ontap: 'deleteTap'},
            {kind: 'onyx.Button', content: 'Nein', ontap: 'closeConfirmDelete'}
        ]}


    ],


	groupsLoaded: function(inSender, inGroups) {
		this.setGroups(inGroups);
	},

	groupsChanged: function() {
		this.$.groupPicker.destroyClientControls();

		var groupId = '';

		if (this.child) {
			var childGroup = enyo.filter(this.groups, function(group) {
				return group.id == this.child.groupId;
			}, this)[0];
			if (childGroup) {
				groupId = childGroup.id;
			}
		}

		this.$.groupPicker.createComponent({content: 'Keine Gruppe', groupId: '', active: groupId == ''}, {owner: this});

		enyo.forEach(this.groups, function(group, i) {
			this.$.groupPicker.createComponent({content: group.name, groupId: group.id, active: groupId == group.id}, {owner: this});
		}, this);

		this.$.groupPicker.render();
	},

	changeGroup: function(inSender, inEvent) {
		if (this.child) {
			this.child.groupId = inEvent.selected.groupId;
		}
	},

	changeGender: function(inSender, inEvent) {
		if (this.child) {
			this.child.gender = inEvent.selected.value;
			this.image = this.child.imageUrl;
			this.$.croppedImage.setSrc(this.image || 'assets/images/rememberMeBackside' + (this.child.gender == 'f' ? '_f' : '') + '.png');
		}
	},

	setLeftHandPathsVisibility: function() {
		this.$.leftHandPaths.setShowing(this.$.leftHand.getValue());
		this.$.leftHandPathsLabel.setShowing(this.$.leftHand.getValue());

	},


	/**
     * Fills the form with the childs properties
     * @protected
     * @returns void
     */
    childChanged:function () {
		if (this.child) {
			this.image = this.child.imageUrl;
			this.$.croppedImage.setSrc(this.image || 'assets/images/rememberMeBackside' + (this.child.gender == 'f' ? '_f' : '') + '.png');
			this.$.name.setValue(this.child.name);
			this.$.leftHand.setValue(this.child.leftHand);
			this.$.leftHandPaths.setValue(this.child.getPreference('leftHandPaths.default') || false);
			this.password.length = 0;

			this.$.genderUndefined.setActive(this.child.gender !== 'm' && this.child.gender !== 'f');
			this.$.genderMale.setActive(this.child.gender === 'm');
			this.$.genderFemale.setActive(this.child.gender === 'f')

			enyo.forEach(this.child.password, function (p) {
				this.password.push(p);
			}, this);
			this.passwordChanged()
			this.groupsChanged();
		}
    },

    /**
     * Updates the password selector with the password value
     * @protected
     * @returns void
     */
    passwordChanged:function () {
        var img, i;
        for (i = 0; i < 9; i++) {
            img = this.$['p' + i];
            img.addRemoveClass('active', this.password[img.slot] === img.index);
        }
    },

    /**
     * password image tap handler
     * @param inSender
     * @protected
     * @returns void
     */
    passwordImageTap:function (inSender) {
        this.password[inSender.slot] = inSender.index;
        this.passwordChanged();
    },


    /**
     * Child image tap handler. Opens the camera application to take a picture.
     * @protected
     * @returns void
     */
    childImageTap:function () {

        navigator.camera.getPicture(enyo.bind(this, function (imageData) {
            //this.image = 'data:image/jpeg;base64,' + imageData;
            this.image = imageData;
            this.$.croppedImage.setSrc(this.image);
            this.show();
        }), function () {
        }, {
            quality:100,
            destinationType: Camera.DestinationType.FILE_URI,
            targetWidth:100,
            targetHeight:100
        });
    },
    /**
     * Request the Statistics Screen to be opened for the current child
     */
    statisticsTap:function () {
        this.bubble("onOpenStatistics", {
            child:this.child
        });
    },


    confirmDelete: function() {
        this.$.confirmDelete.show();
    },

    closeConfirmDelete: function() {
        this.$.confirmDelete.hide();
    },

    /**
     * Delete Button tap handler. Deletes the child.
     * @protected
     * @returns void
     */
    deleteTap:function () {
		Grundschrift.Models.db.sessions
			.filter('userId', '==', this.child.id)
			.toArray(enyo.bind(this, function(sessions) {
				var next = enyo.bind(this, function() {
					if (sessions.length) {
						var session = sessions.pop();
						Grundschrift.Models.SessionData.remove(session.pathsId, this, function() {
							session.remove().then(next);
						});
					} else {
						this.child.remove().then(enyo.bind(this, function () {
							this.bubble('onChildrenChanged');
							this.bubble('onBack');
						}));
					}
				})
				next();
			}))
        this.hide();
    },

    /**
     * Name keyup Handler. Saves the child when Enter is pressed.
     * @param inSender
     * @param inEvent
     * @protected
     * @returns void
     */
    keyup:function (inSender, inEvent) {
        if (inEvent.keyIdentifier == 'Enter') {
            this.saveTap();
        }
    },

	saveChild: function(context, callback) {
		this.child.name = this.$.name.getValue();
		this.child.password = this.password;
		this.child.setPreference('leftHandPaths.default', this.$.leftHandPaths.getValue() || false);
		this.child.imageUrl = this.image;
		this.child.leftHand = this.$.leftHand.getValue();
		this.child._lastChange = Date.now();
		this.child.save().then(enyo.bind(context, callback));
	},

    /**
     * Save button tap handler. Saves the child
     * @protected
     * @returns void
     */
    saveTap:function () {
        this.saveChild(this, function () {
			this.bubble('onChildrenChanged');
			this.bubble('onBack');
		});
    },

	saveAndToMainMenu: function() {
		this.saveChild(this, function () {
			this.bubble('onChildrenChanged');
			this.bubble('onBackToChildMenu');
		});
	}
});
