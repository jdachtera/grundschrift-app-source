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

Grundschrift.Models.defaultCallback = function () {
    if (persistence.debug === true) {
        console.log(arguments);
    }
};

/**
 * Initialize persistence js and the models
 * @param cb
 */
Grundschrift.Models.create = function (cb) {
    var dbName = 'Grundschrift';

	// Move the database to /media/external to gain more space on webOS
    if (device && (device.platform === 'webOS' || device.platform === 'palm' || device.platform === 'HP webOS' )) {
        dbName = 'ext:Grundschrift';
    }

    persistence.debug = false;
    persistence.store.websql.config(persistence, dbName, 'Grundschrift', 5 * 1024 * 1024);

    document.addEventListener("online", enyo.bind(this, 'onOnline'), false);
    document.addEventListener("offline", enyo.bind(this, 'onOffline'), false);


    enyo.forEach(Grundschrift.Models.Migrations, function (migration) {
        persistence.defineMigration(migration[0], migration[1]);
    }, this);


    var syncFinishCb = enyo.bind(this, function () {
        this.init = true;
        this.clearStack();
        cb && cb();
    });

    var schemaSyncCb = enyo.bind(this, function () {
        console.log('Schema synced');

        persistence.migrations.init(enyo.bind(this, function () {
            persistence.migrate(enyo.bind(this, function () {
                this.flushAndSync(['Child', 'Level', 'Session'], syncFinishCb);
            }));
        }));


    });

    persistence.schemaSync(schemaSyncCb, schemaSyncCb);
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
        cb();
    });
    this.stack.length = 0;
};

Grundschrift.Models.onOnline = function () {
    this.online = true;
    this.serialSync(enyo.bind(this, function () {
        console.log('Sync requests processed!');
    }), enyo.bind(this, function () {
        console.log('Sync requests could not be processed!');
    }));
};

Grundschrift.Models.onOffline = function () {
    this.online = false;
};

/**
 * A serial sync method
 * @param successCallback
 * @param errorCallback
 */
Grundschrift.Models.serialSync = function (successCallback, errorCallback) {
    var modelName = this.syncRequests.shift(),
        self = enyo.bind(this, 'serialSync');
    if (modelName) {
        var model = this[modelName];
        if (model) {
            console.log(modelName + ' syncing');
            model.syncAll(persistence.sync.preferRemoteConflictHandler, enyo.bind(this, function () {
                console.log(modelName + ' synced');
                self(successCallback, errorCallback);
            }), enyo.bind(this, function () {
                this.syncRequests.unshift('modelName');
                console.log(modelName + ' sync failed. Network is down.');
                errorCallback(arguments);
            }));
        } else if (this.syncRequests.length > 0) {
            self(successCallback, errorCallback);
        }

    } else {
        successCallback();
    }
};

/**
 * Sync the given models with the server consecutively
 * @param modelNames
 * @param successCallback
 * @param errorCallback
 */
Grundschrift.Models.sync = function (modelNames, successCallback, errorCallback) {
    successCallback = successCallback || this.defaultCallback;
    errorCallback = errorCallback || this.defaultCallback;

    if (enyo.isString(modelNames)) {
        modelNames = [modelNames];
    }

    enyo.forEach(modelNames, function (modelName) {
        if (enyo.indexOf(modelName, this.syncRequests) === -1) {
            this.syncRequests.push(modelName);
        }
    }, this);
    if (this.online === true) {
        this.serialSync(successCallback, errorCallback);
    } else {
        errorCallback();
    }
};

/**
 * Flush the model changes and sync with the server
 * @param modelNames
 * @param flushCallback
 * @param successCallback
 * @param errorCallback
 */
Grundschrift.Models.flushAndSync = function (modelNames, flushCallback, successCallback, errorCallback) {
    flushCallback = flushCallback || Grundschrift.Models.defaultCallback;
    persistence.flush(function () {
        flushCallback();
        Grundschrift.Models.sync(modelNames, successCallback, errorCallback);
    });
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
















