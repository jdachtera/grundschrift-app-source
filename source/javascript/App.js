/**
 * The main App controller - all main views are defined here
 *
 * @author Jascha Dachtera <jascha.dachtera@googlemail.com>
 * @class
 * @name Grundschrift.App
 */
enyo.kind({
    name:'Grundschrift.App',
    kind:'Book',
    classes:'enyo-fit',
	id: 'gs-app',


    published:{
        playStartTime:0,
		asyncOperationsRunning: 0,
        allowedPlayTime:1,
		levels: [],
		childs: []
    },

    selectedChild:null,

    playTimeChecker:null,

	loadingFinishedStack: [],

    handlers:{
        onAsyncOperationStarted:'asyncOperationStarted',
        onAsyncOperationFinished:'asyncOperationFinished',

        onRequestCheckIfChildIsAllowedToPlay:'checkIfChildIsAllowedToPlay',

        onChildSelected:'childSelected',

        onChildrenChanged:'reloadChildren',
		onGroupsChanged:'reloadGroups',
        onSessionsChanged:'reloadSessions',
        onSettingsChanged:'reloadSettings',
        onLevelsChanged:'reloadLevels'

    },


    events:{/** @lends Grundschrift.App# */
        onSettingsLoaded:'',
        onChildrenLoaded:'',
        onSessionsLoaded:'',
        onLevelsLoaded:'',
		onBackButton: ''
    },

    components:[
		//{kind: "enyo.Signals", onbackbutton: "handleBack"},

        {kind: 'Grundschrift.Views.Splash'},

        {kind: 'Grundschrift.Views.RememberMe.Game',
            name:'rememberMe',
            onFinish:'rememberMeFinished'
        },

        {kind: 'Grundschrift.Views.ChildMenu',
            onSettingsClicked:'settingsClicked',
			onBack: 'confirmQuit'},

        {kind: 'Grundschrift.Views.Password',
            onBack:'back',
            onAccessGranted:'openLevelMenu'},

        {kind: 'Grundschrift.Views.LevelMenu',
            onBack:'openChildMenu',
            onLevelSelected:'levelSelected',
            onRememberMeTap:'openRememberMe'
        },

        {kind: 'Grundschrift.Views.Main',
            onBack:'backToLevelMenu',
            onMaxReached:'maxReached',
            onPlayStart:'stopPlayTimeChecker',
            onPlayStop:'startPlayTimeChecker',
            onVariantTap:'loadLevel'
        },

        {kind: 'Grundschrift.Views.PasswordDialog', height:'190pt',
            onAccessGranted:'openAdminMenu'},

        {kind: 'Grundschrift.Views.Admin.Panels',
            name:'adminMenu',
            onBack:'openChildMenu'},

        {kind: 'Grundschrift.Views.PlayTimeOverPopup',
            onClose:'reset'},

        {kind: 'Grundschrift.Views.LevelFinishedPopup',
            onLevelSelected: 'loadLevel',
            onBack: 'backToLevelMenu'},

		{kind: 'Grundschrift.Views.QuitDialog'}

    ],

    /**
     * The main controller is created. Initializes the Models and opens the
     * child menu when ready.
     *
     * @return void
     */
    create:function () {
        this.inherited(arguments);

		this.bubble('onAsyncOperationStarted');

        Grundschrift.Models.create(this, function () {
            this.reloadChildren();
            this.reloadLevels();
            this.reloadSettings();
			this.reloadGroups();

            var bClasses = document.body.className.split(' ');
            bClasses.splice(enyo.indexOf('loading', bClasses), 1)
            document.body.className = bClasses.join(' ');

			enyo.asyncMethod(this, function() {
				this.bubble('onAsyncOperationFinished');
				this.loadingFinishedStack.push(enyo.bind(this, function() {
					this.$.splash.hideStartScreenImages();
					if (this.childs.length) {
						this.openChildMenu()
					} else {
						this.openAdminMenu();
						this.$.adminMenu.addNewChild();
					}
				}));
			});

        });

		document.addEventListener("backbutton", enyo.bind(this, function(inEvent){
			this.handleBack(this, inEvent);
		}), false);
    },

	handleBack: function(inSender, inEvent) {
		var pane = this.getControls()[this.pane];
		if (pane !== this.$.childMenu) {
			inEvent.preventDefault();
			inEvent.stopPropagation();
			this.waterfall('onBackButton', {pane: pane})
		} else {
			navigator.app.exitApp();
		}
	},



    /**
     * Quits the application
     *
     * @return void
     */
    confirmQuit:function () {
		this.$.quitDialog.show();
    },

	asyncOperationsRunningChanged: function() {
		this.log('Number of running async operations: ' + this.asyncOperationsRunning);

		if (this.asyncOperationsRunning > 0) {
			this.$.splash.show();
		} else {
			this.$.splash.hide();
			enyo.forEach(this.loadingFinishedStack, function(callback) {
				callback();
			}, this);
			this.loadingFinishedStack.length = 0;
		}
	},


    /**
     * Event handler for onAsyncOperationStarted
     * Displays a splash screen
     */
    asyncOperationStarted:function (inSender, inEvent) {
		console.log('An async op started');
		if (!inEvent.background) {
			this.setAsyncOperationsRunning(this.asyncOperationsRunning + 1);
			if (enyo.isFunction(inEvent.callback)) {
				this.loadingFinishedStack.push(inEvent.callback);
			}
		}

    },

    /**
     * Event handler for onAsyncOperationFinished
     * Hides splash screen
     */
    asyncOperationFinished:function (inSender, inEvent) {
		console.log('An async op finished');
		if (!inEvent.background) {
			this.setAsyncOperationsRunning(this.asyncOperationsRunning - 1);
		}
    },

    /**
     * Event handler for onSettingsChanged
     * Reloads the settings from localStorage
     */
    reloadSettings:function () {
		var settings = {
			password:'',
			drawMode:'simple',
			allowedPlayTime:20,
			levelSortMode:'sortByName',
			maxSessions: 25,
			maxTolerance: 40,
			weinreHost: '',
			dbInboxName: 'gs'
		};

		enyo.mixin(settings, enyo.json.parse(localStorage.settings || '{}'));

		settings.isDeveloperMode = (settings.password === this.$.passwordDialog.getDeveloperPassword());

		this.allowedPlayTime = settings.allowedPlayTime;

		if (settings.levelSortMode !== Grundschrift.Models.Level.sortMode) {
			Grundschrift.Models.Level.sortMode = settings.levelSortMode;
			this.bubble('onLevelsChanged', this.levels);
		}

		this.waterfall('onSettingsLoaded', {
			settings:settings
		});

    },

    /**
     * Event handler for onChildrenChanged
     * Reloads children from the database
     */
    reloadChildren:function (inSender, inEvent) {
		inEvent = inEvent || {};
		this.bubble('onAsyncOperationStarted', {background: !!inEvent.background});

        Grundschrift.Models.ready(this, function () {


            Grundschrift.Models.db.users.toArray(enyo.bind(this, function (children) {
				this.setChilds(children);
                this.waterfall('onChildrenLoaded', children);
                this.bubble('onAsyncOperationFinished', {background: !!inEvent.background});

            }));
        });
    },


	/**
	 * Event handler for onChildrenChanged
	 * Reloads children from the database
	 */
	reloadGroups:function (inSender, inEvent) {
		inEvent = inEvent || {};
		this.bubble('onAsyncOperationStarted', {background: !!inEvent.background});

		Grundschrift.Models.ready(this, function () {
			Grundschrift.Models.db.groups.toArray(enyo.bind(this, function (groups) {
				groups.sort(function(a, b) {
					return a.name > b.name;
				});
				this.waterfall('onGroupsLoaded', groups);
				this.bubble('onAsyncOperationFinished', {background: !!inEvent.background});
			}));
		});
	},

    /**
     * Event handler for onSessionsChanged
     * Reloads the current childs sessions from the database
     */
    reloadSessions:function (inSender, inEvent) {
		inEvent = inEvent || {};


		if (this.selectedChild) {
			this.bubble('onAsyncOperationStarted', {background: !!inEvent.background});
			Grundschrift.Models.ready(this, function () {
				Grundschrift.Models.db.sessions.filter(function(session) {
					return session.userId == this.child.id;
				}, {
					child: this.selectedChild
				}).toArray(enyo.bind(this, function(sessions) {
						this.waterfall('onSessionsLoaded', sessions);
						this.bubble('onAsyncOperationFinished', {background: !!inEvent.background});
					}));
			});
		} else {
			this.waterfall('onSessionsLoaded', []);
		}


    },

    /**
     * Event handler for onLevelsChanged
     * Reloads the Levels from the database
     */
    reloadLevels:function (inSender, inEvent) {
		inEvent = inEvent || {};
		this.bubble('onAsyncOperationStarted', {background: !!inEvent.background});

        Grundschrift.Models.db.levels.toArray(enyo.bind(this, function (levels) {
			this.setLevels(levels);
			this.sortLevels();
            this.waterfall('onLevelsLoaded', this.levels);
            this.bubble('onAsyncOperationFinished', {background: !!inEvent.background});
        }));
    },

	sortLevels: function() {
		if (this.levels && enyo.isFunction(Grundschrift.Models.Level[Grundschrift.Models.Level.sortMode])) {
			this.levels.sort(Grundschrift.Models.Level[Grundschrift.Models.Level.sortMode]);
		}
	},

    /**
     * Return to Child Menu (logout the child)
     */
    reset:function () {
        this.stopPlayTimeChecker();
        this.openChildMenu();
    },

	/**
	 * Starts the play time checker
	 */
    startPlayTimeChecker:function () {
        if (this.playTimeChecker == null) {
            console.log('Starting Play time checker');
            this.playTimeChecker = setInterval(enyo.bind(this, 'checkIfChildIsAllowedToPlay'), 1000 * 10);
        }
    },

	/**
	 * Stops the play time checker
	 */
    stopPlayTimeChecker:function () {
        if (this.playTimeChecker != null) {
            console.log('Stopping Play time checker');
            clearInterval(this.playTimeChecker);
            this.playTimeChecker = null;
        }

    },
	/**
	 * Cancels the current child's session if the play time is over
	 */
    checkIfChildIsAllowedToPlay:function () {
        if (this.currentChildIsAllowedToPlay() == false) {
            console.log('Time is over.');
            this.$.playTimeOverPopup.show();
            this.stopPlayTimeChecker();
        } else {
            console.log('Child may play!');
        }
    },

    /**
     * Opens the level Menu for the selected child
     *
     * @return void
     */
    openLevelMenu:function () {
        this.$.levelMenu.setChild(this.selectedChild);
        this.playStartTime = enyo.now();
        this.startPlayTimeChecker();
        this.$.levelMenu.setSelectedLevel(-1);
        this.pageName('levelMenu');
    },

	/**
	 * Go back to the level menu
	 */
    backToLevelMenu: function() {
        this.bubble('onSessionsChanged', {background:true});
        this.$.levelMenu.setSelectedLevel(-1);
        this.pageName('levelMenu');
    },

    /**
     * Opens the child menu
     *
     * @return void
     */
    openChildMenu:function () {
        this.pageName('childMenu');
        this.stopPlayTimeChecker();
    },

    /**
     * Opens the admin menu
     *
     * @return void
     */
    openAdminMenu:function () {
        this.pageName('adminMenu');
    },

    /**
     * Opens the Admin password menu
     *
     * @return void
     */
    settingsClicked:function () {
        this.$.passwordDialog.show();
        //
    },

    /**
     * Opens the main app view for a child and a level
     *
     * @param inSender
     * @param inEvent
     * @return void
     */
    levelSelected:function (inSender, inEvent) {
        console.log('Level was selected');
        this.$.main.setSessionCount(inEvent.sessionCount);
        this.$.main.setLevel(inEvent.level);
        this.$.main.setVariants(inEvent.variants);
        this.$.main.setChild(inEvent.child);
        this.pageName('main');
    },

    loadLevel:function (inSender, inEvent) {
        this.$.levelMenu.selectAndLoadLevel(inSender, inEvent);
    },

    /**
     * Is triggered when the maximum session count for a level is reached. Opens
     * the next level if there is one.
     *
     * @param inSender
     * @return void
     */
    maxReached:function (inSender) {
        var current = this.$.main.getLevel();
        var nextLevel = this.$.levelMenu.getNextLevel(current);
        if (nextLevel !== null) {
            this.$.levelFinishedPopup.setCurrentLevel(current);
            this.$.levelFinishedPopup.setCurrentSessionCount(this.$.levelMenu.getSessionCount(current));
            this.$.levelFinishedPopup.setNextLevel(nextLevel);
            this.$.levelFinishedPopup.setNextSessionCount(this.$.levelMenu.getSessionCount(nextLevel));
            this.$.levelFinishedPopup.show();
        } else {
            //this.openLevelMenu();
            this.openRememberMe(this, {category:current.category});
        }

    },

    /**
     * Returns true if the child is allowed to play
     */
    currentChildIsAllowedToPlay:function () {
        if (this.allowedPlayTime === 0) {
            return true;
        }
        var delta = enyo.now() - this.playStartTime,
            left = (1000 * 60 * this.allowedPlayTime) - delta;
        return left > 0;
    },

    /**
     * Opens the child password screen
     *
     * @param inSender
     * @param inIndex
     * @return void
     */
    childSelected:function (inSender, inEvent) {
        this.selectedChild = inEvent.child;
        if (inEvent.originator === this.$.childMenu) {
            if (this.currentChildIsAllowedToPlay() || this.selectedChild != this.$.levelMenu.getChild()) {
                this.$.password.setPassword(this.selectedChild.password);
                this.$.password.reset();
                this.pageName('password');
            } else {
                this.$.playTimeOverPopup.show();
            }
        }

    },

	/**
	 * Opens the level menu when a remember me game is finished
	 */
    rememberMeFinished:function () {
        this.pageName('levelMenu');
        this.startPlayTimeChecker();
    },

	/**
	 * Starts a remember me game with the events category
	 * @param inSender
	 * @param inEvent
	 */
    openRememberMe:function (inSender, inEvent) {
        this.stopPlayTimeChecker();
        this.$.rememberMe.setCategories([inEvent.category]);
        this.pageName('rememberMe');
    }
});


