Grundschrift.Models.ZippedJson.extend('Grundschrift.Models.SessionData', {});


Grundschrift.Models.SessionData.create = function(data, context, callback) {
	var z = new Grundschrift.Models.SessionData()
	z.zip(data);
	z.save().then(function() {
		enyo.asyncMethod(context, callback, z);
	});
};

Grundschrift.Models.SessionData.update = function(id, data, context, callback) {
	Grundschrift.Models.db.sessionData
		.filter('id', '==', id)
		.take(1)
		.toArray(function(items) {
			if (items.length) {
				var z = items[0];
			} else {
				var z = new Grundschrift.Models.SessionData({id: id});
			}
			z.zip(data);
			z.save().then(function() {
				enyo.asyncMethod(context, callback, z);
			});
		});
};

Grundschrift.Models.SessionData.find = function(id, context, callback) {
	Grundschrift.Models.db.sessionData
		.filter('id', '==', id)
		.take(1)
		.toArray(function(items) {
			if (items.length) {
				var z = items[0];
				enyo.asyncMethod(context, callback, z.unzip());
			} else {
				enyo.asyncMethod(context, callback, []);
			}
		});
};

Grundschrift.Models.SessionData.remove = function(id, context, callback) {
	Grundschrift.Models.db.sessionData
		.filter('id', '==', id)
		.take(1)
		.toArray(function(items) {
			if (items.length) {
				items[0].remove().then(enyo.bind(context, callback));
			}
		});
};
