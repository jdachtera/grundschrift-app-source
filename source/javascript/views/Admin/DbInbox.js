enyo.kind({
	name: 'DbInbox',
	kind: 'Async',
	iframe: false,
	constructor: function(config) {
		this.inherited(arguments);
		config = config || {};
		this.url = config.url;
	},
	go: function(data) {
		if (this.iframe == true) {
			var iframe = document.createElement('iframe');
			iframe.setAttribute('style', 'display:none');
			iframe.setAttribute('id', 'dbInbox');

			var form = document.createElement('form');
			var html = '';
			for (var key in data) {
				if (data.hasOwnProperty(key)) {
					var textarea = document.createElement('textarea');
					textarea.setAttribute('name', key);
					textarea.innerHTML =  data[key];
					form.appendChild(textarea);
				}
			}
			form.setAttribute('action', this.url);
			form.setAttribute('target', 'dbInbox');
			form.setAttribute('method', 'POST');

			document.body.appendChild(iframe);

			iframe.onload = enyo.bind(this, function() {
				document.body.removeChild(iframe);
				this.respond();
			});
			iframe.onerror = enyo.bind(this, function() {
				document.body.removeChild(iframe);
				this.fail();
			});

			form.submit();
		} else {
			var request = new enyo.Ajax({url: this.url, postBody: new enyo.FormData()});
			request.postBody.append('files[]', data.message, data.filename);

			request.response(this, 'respond');
			request.error(this, 'fail');

			request.go();
		}
	}
});
