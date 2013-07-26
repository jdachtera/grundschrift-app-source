(function(){
	var LZW = {
		// LZW-compress a string
		compress:function (s) {
			var dict = {};
			var data = (s + "").split("");
			var out = [];
			var currChar;
			var phrase = data[0];
			var code = 256;
			for (var i = 1; i < data.length; i++) {
				currChar = data[i];
				if (dict[phrase + currChar] != null) {
					phrase += currChar;
				}
				else {
					out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
					dict[phrase + currChar] = code;
					code++;
					phrase = currChar;
				}
			}
			out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
			for (var i = 0; i < out.length; i++) {
				out[i] = String.fromCharCode(out[i]);
			}
			return out.join("");
		},

		// Decompress an LZW-encoded string
		decompress:function (s) {
			var dict = {};
			var data = (s + "").split("");
			var currChar = data[0];
			var oldPhrase = currChar;
			var out = [currChar];
			var code = 256;
			var phrase;
			for (var i = 1; i < data.length; i++) {
				var currCode = data[i].charCodeAt(0);
				if (currCode < 256) {
					phrase = data[i];
				}
				else {
					phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
				}
				out.push(phrase);
				currChar = phrase.charAt(0);
				dict[code] = oldPhrase + currChar;
				code++;
				oldPhrase = phrase;
			}
			return out.join("");
		}
	};

	$data.Entity.extend('Grundschrift.Models.ZippedJson', {
		id: {
			type: $data.Guid,
			key: true,
			computed: true
		},
		_lastChange: {
			type: 'int'
		},
		data: {
			type: String
		}
	});

	Grundschrift.Models.ZippedJson.prototype.unzippedData = undefined;

	Grundschrift.Models.ZippedJson.prototype.unzip = function() {
		if (!this.unzippedData) {
			var data = (this.data && this.data !== '') ? this.data : '[]';
			this.unzippedData = JSON.parse(LZW.decompress(data));
		}
		return this.unzippedData;

	};

	Grundschrift.Models.ZippedJson.prototype.zip = function(data) {
		this.data = LZW.compress(JSON.stringify(data));
		this.unzippedData = undefined;
	};

})();

