$data.Entity.extend('Grundschrift.Models.Level', {
	id: {
		type: $data.Guid,
		key: true,
		computed: true
	},
	_lastChange: {
		type: 'int'
	},
	name: {
		type: String
	},
	illustrations: {
		type: Array,
		elementType: String
	},
	category: {
		type: String
	},
	className: {
		type: String
	},
	unlockCondition: {
		type: String
	},
	lineWidth: {
		type: 'int'
	},
	pathsId: {
		type: String
	},
	pathsLength: {
		type: 'int'
	},
	leftPathsId: {
		type: String
	},
	leftPathsLength: {
		type: 'int'
	}
});

Grundschrift.Models.Level.pathColumns = ['x', 'y', 'isAnchor'];


/**
 * Collect the categories of the given levels
 * @param levels
 * @return {Array}
 */
Grundschrift.Models.Level.getCategories = function (levels) {
    var names = {},
        categories = [];

    enyo.forEach(levels, function (l) {
        if (names[l.category] === undefined) {
            names[l.category] = '';
            categories.push(l.category);
        }
    }, this);

    categories.sort();

    return categories;
};

Grundschrift.Models.Level.classNames = [
    'darkblue', 'red', 'blue', 'green', 'orange', 'violet', 'none'
];

/**
 * The sort mode can be either "sortByClassName" or "sortByLevelName"
 * @type {String}
 */
Grundschrift.Models.Level.sortMode = "sortByClassName"

Grundschrift.Models.Level.sortByClassName = function (a, b) {
    var indexOf = Array.prototype.indexOf || function (elt /*, from*/) {
        var len = this.length;

        var from = Number(arguments[1]) || 0;
        from = (from < 0)
            ? Math.ceil(from)
            : Math.floor(from);
        if (from < 0)
            from += len;

        for (; from < len; from++) {
            if (from in this &&
                this[from] === elt)
                return from;
        }
        return -1;
    };
    var ia = indexOf.call(Grundschrift.Models.Level.classNames, a.className),
        ib = indexOf.call(Grundschrift.Models.Level.classNames, b.className);
    return ia == ib ? Grundschrift.Models.Level.sortByName(a, b) : ia > ib ? 1 : -1;
};

Grundschrift.Models.Level.sortByName = function (a, b) {
    return a.category == b.category ?
        (a.name > b.name ? 1 : -1) : (a.category > b.category ? 1 : -1);
};


/**
 * Get the levels paths
 * @return {String}
 */
Grundschrift.Models.Level.prototype.getPaths = function (context, callback) {
	if (this.pathsId) {
		Grundschrift.Models.LevelData.find(this.pathsId, context, callback);
	} else {
		enyo.asyncMethod(context, callback, []);
	}
};

/**
 * Set the levels paths
 * @param paths
 * @return {*}
 */
Grundschrift.Models.Level.prototype.setPaths = function(paths, context, callback) {
	paths = paths || [];
    this.pathsLength = paths.length
	if (this.pathsId) {
		Grundschrift.Models.LevelData.update(this.pathsId, paths, context, callback);
	} else {
		Grundschrift.Models.LevelData.create(paths, this, function(z) {
			this.pathsId = z.id;
			enyo.asyncMethod(context, callback);
		});
	}
    return this;
};


/**
 * Reloads only changed levels into the database. Is used to handle Application updates.
 * @param callback
 * @param forceReload
 */
Grundschrift.Models.Level.checkUpdates = function (callback, forceReload) {
    var count = 1, next = function () {
        count--;
        if (count == 0) {
			console.log('Saving the changes');
            Grundschrift.Models.db.levels.saveChanges(callback);
        }
    };

	Grundschrift.Models.db.onReady(enyo.bind(this, function() {
		new enyo.Ajax({
			url:'assets/levels/index.json',
			cacheBust:false
		}).response(function (inSender, categories) {
				console.log('Level index file loaded.');
				for (var category in categories) {
					if (categories.hasOwnProperty(category)) {
						(function (category, levelNames) {

							console.log('Now loading levels in category ' + category);

							enyo.forEach(levelNames, function (levelName) {
								count++;
								new enyo.Ajax({
									url:'assets/levels/' + category + '/' + levelName + '/metadata.json',
									cacheBust:false
								}).response(function (inSender, jsonLevel) {
										console.log('Now loading level "' + jsonLevel.name + '"');
										Grundschrift.Models.db.levels.filter('id', '==', jsonLevel.id)
											.take(1)
											.toArray(enyo.bind(this, function(items) {
												var dbLevel = items[0];
												if (dbLevel) {
													if (jsonLevel._lastChange > dbLevel._lastChange) {
														console.log('Saving new level version: ' + jsonLevel.name);
														var paths = jsonLevel.paths;
														delete(jsonLevel.paths);
														Grundschrift.Models.db.levels.attach(dbLevel);
														enyo.mixin(dbLevel, jsonLevel);
														dbLevel.setPaths(paths, this, next);
													} else {
														next();
													}
												} else {
													console.log('Saving new level: ' + jsonLevel.name);
													Grundschrift.Models.LevelData.create(jsonLevel.paths, this, function(z) {
														jsonLevel.pathsLength = jsonLevel.paths.length;
														jsonLevel.pathsId = z.id;
														dbLevel = new Grundschrift.Models.Level(jsonLevel);
														Grundschrift.Models.db.levels.add(dbLevel);
														next();
													});
												}
											}));
									}).error(function (inSender, inError) {
										console.log(enyo.json.stringify(inError));
										next();
									}).go();
							});
						})(category, categories[category]);
					}
				}
				next();
			}).error(function () {
				console.error('Error loading assets/levels/index.json');
			}).go();
	}))


};


Grundschrift.Models.Level.export = function(context, callback) {
	var data = [];
	Grundschrift.Models.db.levels.toArray(function(levels) {
		function next() {
			if (levels.length) {
				var level = levels.shift();
				level.getPaths(this, function(paths) {
					data.push({
						id: level.id,
						name: level.name,
						category: level.category,
						className: level.className,
						_lastChange: level._lastChange,
						illustrations: level.illustrations,
						unlockCondition: level.unlockCondition,
						lineWidth: level.lineWidth,
						paths: paths
					});
					next();
				})
			} else {
				enyo.asyncMethod(context, callback, data);
			}
		}
		next()
	});
}
