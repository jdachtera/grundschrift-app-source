/*
This file bootstraps the Models. The support for live server syncing is implemented but not currently used.

 */
var Grundschrift = Grundschrift || {};
Grundschrift.Models = Grundschrift.Models || {};

Grundschrift.Models.init = false;
Grundschrift.Models.stack = [];
Grundschrift.Models.syncServer = 'http://192.168.0.100:8888';

Grundschrift.Models.syncRequests = [];
Grundschrift.Models.online = false;
Grundschrift.Models.version = 1;

Grundschrift.Models.assetPath = '';

Grundschrift.Models.developerEmail = 'jascha.dachtera@googlemail.com';

Grundschrift.Models.defaultCallback = function () {};


/**
 * Initialize jayData and the models
 * @param cb
 */
Grundschrift.Models.create = function (context, callback) {
    var dbName = 'Grundschrift';

	// Move the database to /media/external to gain more space on webOS
    if (device && (device.platform === 'webOS' || device.platform === 'palm' || device.platform === 'HP webOS' )) {
        dbName = 'ext:Grundschrift';
    }

	$data.EntityContext.extend("Grundschrift.Models.Database", {
		levels: {
			type: $data.EntitySet,
			elementType: Grundschrift.Models.Level
		},
		sessions: {
			type: $data.EntitySet,
			elementType: Grundschrift.Models.Session
		},
		users: {
			type: $data.EntitySet,
			elementType: Grundschrift.Models.User
		},
		groups: {
			type: $data.EntitySet,
			elementType: Grundschrift.Models.Group
		},
		levelData: {
			type: $data.EntitySet,
			elementType: Grundschrift.Models.LevelData
		},
		sessionData: {
			type: $data.EntitySet,
			elementType: Grundschrift.Models.SessionData
		}
	});

	var db = Grundschrift.Models.db = new Grundschrift.Models.Database({
		provider: 'local', databaseName: dbName//, dbCreation: $data.storageProviders.DbCreationType.Merge
	});

	db.onReady(enyo.bind(this, function() {
		var cb = enyo.bind(this, function() {
			this.init = true;
			enyo.call(context, callback);
			this.clearStack();
		});
		var version = parseInt(localStorage['grundschrift_version'] || 0, 10);
		if (Grundschrift.Models.version > version) {
			Grundschrift.Models.Level.checkUpdates(enyo.bind(this, function() {
				localStorage['grundschrift_version'] = Grundschrift.Models.version;
				cb();
			}));
		} else {
			cb();
		}

	}));

};

/**
 * Register a handler to call when the models are ready
 * @param context
 * @param callback
 */
Grundschrift.Models.ready = function (context, callback) {
    if (this.init === true) {
        enyo.asyncMethod(context, callback);
    } else {
		var func = enyo.bind(context, callback);
        this.stack.push(func);
    }
};

/**
 * Clears the callback stack
 */
Grundschrift.Models.clearStack = function () {
    enyo.forEach(this.stack, function (cb) {
        enyo.asyncMethod(this, cb);
    });
    this.stack.length = 0;
};


/**
 * Json compression
 * @param inJson The json to compress
 * @param inColumns The columns of the schema
 * @return {Object}
 */
Grundschrift.Models.compressJson = function (inJson, inColumns) {
    var outJson = {
        _length:inJson.length
    };
    enyo.forEach(inJson, function (row) {
        enyo.forEach(inColumns, function (column) {
            outJson[column] = outJson[column] || [];
            outJson[column].push(row[column]);
        });
    }, this);
    return outJson;
};

/**
 * Json decompression
 * @param inJson The json to compress
 * @param inColumns The columns of the schema
 * @return {*}
 */
Grundschrift.Models.deCompressJson = function (inJson, inColumns) {
    if (typeof inJson._length === 'undefined') return inJson;
    var outJson = [];
    for (var i = 0; i < inJson._length; i++) {
        var obj = {};
        enyo.forEach(inColumns, function (column) {
            obj[column] = inJson[column][i];
        }, this);
        outJson.push(obj);
    }
    return outJson;
};

Grundschrift.Models.uuid2guid = function(uuid) {
	var guid = (uuid.slice(0, 8) + '-' +
		uuid.slice(8, 12) + '-' +
		uuid.slice(12, 16) + '-' +
		uuid.slice(16, 20) + '-' +
		uuid.slice(20));
	return guid;
};

Grundschrift.Models.guid2uuid = function(guid) {
	return guid.split('-').join('');
};



















