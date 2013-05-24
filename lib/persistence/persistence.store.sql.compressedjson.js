(function (defaultTypeMapper) {


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

    var original = {
        dbValToEntityVal:defaultTypeMapper.dbValToEntityVal,
        columnType:defaultTypeMapper.columnType,
        entityValToDbVal:defaultTypeMapper.entityValToDbVal
    };

    defaultTypeMapper.dbValToEntityVal = function (val, type) {
        switch (type) {
            case 'JSONC':
                return JSON.parse(LZW.decompress(val));
            case 'JSONH':
                return JSONH.unpack(JSON.parse(val));
            case 'JSONHC':
                return JSONH.unpack(JSON.parse(LZW.decompress(val)));
            default:
                return original.dbValToEntityVal(val, type);
        }
    };

    defaultTypeMapper.columnType = function (type) {
        switch (type) {
            case 'JSONC':
            case 'JSONH':
            case 'JSONHC':
                return 'TEXT';
            default:
                return original.columnType(type);
        }
    };

    defaultTypeMapper.entityValToDbVal = function (val, type) {
        switch (type) {
            case 'JSONC':
                return LZW.compress(JSON.stringify(val));
            case 'JSONH':
                return JSON.stringify(JSONH.pack(val));
            case 'JSONHC':
                return LZW.compress(JSON.stringify(JSONH.pack(val)));
            default:
                return original.entityValToDbVal(val, type);
        }
    };

})(persistence.store.sql.defaultTypeMapper);