$data.Entity.extend('Grundschrift.Models.Session', {
	id: {
		type: $data.Guid,
		key: true,
		computed: true
	},
	_lastChange: {
		type: 'int'
	},
	pathsId: {
		type: String,
	},
	pathsLength: {
		type: 'int'
	},
	success: {
		type: Boolean
	},
	aid: {
		type: Boolean
	},
	levelId: {
		type: String
	},
	userId : {
		type: String
	}
});


/**
 * Get the sessions paths
 * @return {String}
 */
Grundschrift.Models.Session.prototype.getPaths = function (context, callback) {
	if (this.pathsId) {
		Grundschrift.Models.SessionData.find(this.pathsId, context, callback);
	} else {
		enyo.asyncMethod(context, callback, []);
	}
};

/**
 * Set the sessions paths
 * @param paths
 * @return {*}
 */
Grundschrift.Models.Session.prototype.setPaths = function(paths, context, callback) {
	paths = paths || [];
	this.pathsLength = paths.length
	if (this.pathsId) {
		Grundschrift.Models.SessionData.update(this.pathsId, paths, context, callback);
	} else {
		Grundschrift.Models.SessionData.create(paths, this, function(z) {
			this.pathsId = z.id;
			enyo.asyncMethod(context, callback);
		});
	}
	return this;
};

Grundschrift.Models.Session.export = function(context, callback) {
	var data = [];
	Grundschrift.Models.db.sessions.toArray(function(sessions) {
		function next() {
			if (sessions.length) {
				var session = sessions.shift();
				session.getPaths(this, function(paths) {
					data.push({
						success: session.success,
						levelId: session.levelId,
						userId: session.userId,
						paths: paths
					});
					next();
				});
			} else {
				enyo.asyncMethod(context, callback, data);
			}
		}
		next();
	});
};