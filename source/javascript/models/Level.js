$data.Entity.extend('Grundschrift.Models.Level', {
	id: {
		type: 'int',
		key: true,
		computed: true
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
	paths: {
		type: String
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
Grundschrift.Models.Level.prototype.getPaths = function () {
    return this.paths;
};

/**
 * Set the levels paths
 * @param paths
 * @return {*}
 */
Grundschrift.Models.Level.prototype.setPaths = function (paths) {
    this.paths = paths
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
            persistence.flush(callback);
        }
    };

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
                                    Grundschrift.Models.Level.load(jsonLevel.id, function (dbLevel) {
                                        if (dbLevel == null) {
                                            dbLevel = new Grundschrift.Models.Level(jsonLevel);
                                            dbLevel.id = jsonLevel.id;
                                            dbLevel._lastChange = jsonLevel._lastChange;
                                            console.log('Saving new level: ' + dbLevel.name);
                                            persistence.add(dbLevel);
                                        } else if (jsonLevel._lastChange > dbLevel._data._lastChange || forceReload) {
                                            enyo.mixin(dbLevel, jsonLevel);
                                            dbLevel.markDirty('paths');
                                            persistence.add(dbLevel);
                                            console.log('Saving new level version: ' + dbLevel.name);
                                        }
                                        next();
                                    }, next);
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
};
