	L.OSM.park_explication.prototype.getWikiData = function (Q) {
		var xhr = new XMLHttpRequest();
		xhr.url = "https://query.wikidata.org/sparql?query=";
		var WikiDataOsmP = { 'relation' : 'P402', 'way' : 'P10689', 'node' : 'P11693'};
		var SPQL = !Q ?
				   "SELECT ?item ?itemLabel ?wdComCat ?geoCoord " +
				   "WHERE " +
				   "{" +
				   "  ?item wdt:P373 ?wdComCat." +
				   "  ?item p:" + WikiDataOsmP[this.osm_obj_type] + " ?statement0." +
				   "  ?statement0 (ps:" + WikiDataOsmP[this.osm_obj_type] + ") \"" + this.osm_obj_id + "\".  " +
   				   "  OPTIONAL { ?item wdt:P625 ?geoCoord.} " +
				   "  SERVICE wikibase:label { bd:serviceParam wikibase:language \"ru\". }" +
				   "}"
				   :
				   "SELECT ?item ?itemLabel ?wdComCat ?geoCoord " +
				   "WHERE " +
				   "{" +
				   "  wd:" + Q + " wdt:P373 ?wdComCat. " +
   				   "  ?item wdt:P373 ?wdComCat. " +
   				   "  OPTIONAL { ?item wdt:P625 ?geoCoord.} " +
				   "  SERVICE wikibase:label { bd:serviceParam wikibase:language \"ru\". }" +
   				   "}";
		xhr.url += SPQL;
		// console.log('SPARQL ' + SPQL);
		xhr.ini_obj = this;
		xhr.open('GET', xhr.url, true);
		xhr.send();
		xhr.onreadystatechange = function () {
			if (xhr.readyState != 4) return;
			if (xhr.status != 200 && (xhr.status != 0 || xhr.response)) {
				alert("Ошибка WikiDataSparQL! " + xhr.url);
				return;
			} else {
				xhr.ini_obj.useWikiData(xhr.responseXML);
			}
		}
	};

	L.OSM.park_explication.prototype.useWikiData = function (wikiDataXml) {
		function getBindNode(xml, name, tag) {
			for (var cn in xml.childNodes)
			{
				var n = xml.childNodes[cn]
				if (n.nodeName != 'binding')
					continue;
				if (n.getAttribute("name") == name)
					return n.getElementsByTagName(tag)[0].textContent;
			}
			return null;
		}

		var Res0 = wikiDataXml.getElementsByTagName('sparql')[0].getElementsByTagName('results')[0].getElementsByTagName('result')[0];
		if (!Res0)
		{
			console.log('Данные по WikiData пусты');
			return;
		}
		this.wikidata = {
			uri : getBindNode(Res0, 'item', 'uri'),
			CommonsCat : getBindNode(Res0, 'wdComCat', 'literal'),
			Name : getBindNode(Res0, 'itemLabel', 'literal'),
			Geo : getBindNode(Res0, 'geoCoord', 'literal')
		};
		if (this.logWikiMedia) console.log('WikiData');
		if (this.logWikiMedia) console.log (this.wikidata);
		/* var Qa = this.wikidata.uri.split("/");
		var Qcode = Qa[Qa.length-1]; */
		this.iniWikiCommons(this.wikidata.CommonsCat);
		this.getWikiCommonsData("Category:" + this.wikidata.CommonsCat, -1);
	}

	L.OSM.park_explication.prototype.iniWikiCommons = function (WikiCommCat) {
		this.WikiCommons = {
		Cat : WikiCommCat,
		n_xhr : 0,
		Cat_OK : {},
		Img_OK : {},
		images : [],
		style : {weight : 2, color : '#ffffff', radius: 4, fillColor: '#ff0000', fillOpacity: 0.7},
		WCLG : new L.LayerGroup()
		};
		this.addWikiCommonsLayer();
	}

	L.OSM.park_explication.prototype.addWikiCommonsLayer = function () {
		if (!this.md || !this.md.Control || !this.WikiCommons)
		return;
		this.md.Control.addOverlay(this.WikiCommons.WCLG, "ВикиСклад");
		this.md.map.addLayer(this.WikiCommons.WCLG);
	}

	L.OSM.park_explication.prototype.getWikiCommonsData = function (categ, lv) {
		var xhr = new XMLHttpRequest();
/* xhr.url = //"https://cats-php.toolforge.org/?cat=" + this.WikiCommCat.replace(' ', '_') + "&depth=7&json=1&lang=commons&type=6";
		//"https://commons.wikimedia.org/w/api.php?origin=*&action=query&list=categorymembers&cmtitle=Category:" + this.WikiCommCat.replace(' ', '_') + "&format=json"; //&cmtype=file&prop=imageinfo&iiprop=extmetadata"
//			"https://wikimap.toolforge.org/api.php?origin=*&cat=" + this.WikiCommCat.replace(' ', '_') + "&lang=ru&subcats=&subcatdepth=7";*/
xhr.url = "https://commons.wikimedia.org/w/api.php?origin=*&action=query&generator=categorymembers&gcmtitle=" + encodeURIComponent(categ.replace(/ /g, '_')) + "&gcmtype=subcat|file&prop=imageinfo&iiprop=timestamp|user|url|size|mime|mediatype|extmetadata&format=json&gcmlimit=500&iiextmetadatalanguage=ru";
		xhr.ini_obj = this;
		this.WikiCommons.n_xhr++;
		xhr.lv = lv + 1;
		xhr.WCcateg = categ;
		xhr.open('GET', xhr.url, true);
		xhr.send();
		xhr.onreadystatechange = function () {
			if (xhr.readyState != 4) return;
			if (xhr.status != 200 && (xhr.status != 0 || xhr.response)) {
				alert("Ошибка получения данных с ВикиСклада! " + xhr.url);
				return;
			} else {
				xhr.ini_obj.addWikiCommonsCategoryData(xhr);
			}
		}
	};

	L.OSM.park_explication.prototype.addWikiCommonsCategoryData = function (xhr) {
		if (this.logWikiMedia) console.log("++ " + xhr.lv + " K " + xhr.WCcateg + " " + xhr.readyState + " " + xhr.status);
		try
		{
			var WCmeta = JSON.parse(xhr.responseText);
		}
		catch (e)
		{
			alert("Ошибка разбора данных с ВикиСклада! \n" + xhr.url);
			return;
		}
		if (WCmeta.batchcomplete != "")
		{
			if (this.logWikiMedia) console.log("Ошибка запроса данных с ВикиСклада! \n" + xhr.url);
			return;
		}

		if (!WCmeta.query)
		{
			log (WCmeta);
			return;
		}
		this.WikiCommons.Cat_OK[xhr.WCcateg] = true;
		for (var i in WCmeta.query.pages)
		{
			var mtobj = WCmeta.query.pages[i];
			if (mtobj.ns == 6) // file
			{
				if (!this.WikiCommons.Img_OK[mtobj.title])
				{
					this.WikiCommons.Img_OK[mtobj.title] = true;
					var ii = mtobj.imageinfo[0].extmetadata;
					delete mtobj.imageinfo;
					mtobj.meta = ii;
					this.WikiCommons.images.push(mtobj);
					this.addWikiCommonsData(mtobj);
				}
				else
					if (this.logWikiMedia) console.log(" File ++ " + mtobj.title);
			}
			if (mtobj.ns == 14) // subcat
			{
				var ct = mtobj.title;
				if (!this.WikiCommons.Cat_OK[ct])
				{
					this.getWikiCommonsData(ct, xhr.lv);
					if (this.logWikiMedia) console.log(" c+ " + xhr.lv + " K " + xhr.WCcateg + " -> " + ct);
				}
				else
					if (this.logWikiMedia) console.log(" c- " + xhr.lv + " K " + xhr.WCcateg + " -> " + ct);
			}
		}
		this.WikiCommons.n_xhr--;
		if (!this.WikiCommons.n_xhr)
		{
			if (this.logWikiMedia) console.log(' Изображений ' + this.WikiCommons.images.length);
		}
		return;
	}

	L.OSM.park_explication.prototype.addWikiCommonsData = function (im_data) {
		if (!im_data.meta.GPSLatitude || !im_data.meta.GPSLongitude)
			return false;
		var p = {lat: im_data.meta.GPSLatitude.value, lng: im_data.meta.GPSLongitude.value};
		var l = L.circleMarker(p, this.WikiCommons.style);
		l.im_data = im_data;
		var fn = im_data.title.split("File:")[1];
		fn = fn.replace(/ /g, '_');
		var s_md5 = new Md5(true).update(fn).hex();

		var wp = s_md5.substring(0, 1) + "/" + s_md5.substring(0, 2) + "/";
		var th_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/' + wp + encodeURI(fn) + '/320px-' + encodeURI(fn);
		var html = '<details><p align="center" role="popup_card">' + im_data.title +'</p><table role="popup_card"><tr><th role="popup_card">Свойство</th><th role="popup_card">Значение</th></tr>';
		for (var k in im_data.meta) {
			if (k[0] == '_' || k == 'No' || !im_data.meta[k] || im_data.meta[k] == '?' || im_data.meta[k] == '-')
				continue;
			html += '<tr role="popup_card"><td role="popup_card">' + k.replace('_', ' ').replace('_', ' ') + '</td><td role="popup_card">' + JSON.stringify(im_data.meta[k].value) + '</td></tr>';
		}
		html += '</table></details>';
		l.bindPopup('<a href="https://commons.wikimedia.org/wiki/' + encodeURI(im_data.title) + '" target="_blank"><center><img src="' + th_url + '" width="150"><p><small>' + fn + '</small></a><small><br>' + (im_data.meta.ImageDescription ?im_data.meta.ImageDescription.value : '') + '<br>' + im_data.meta.LicenseShortName.value + '<br>' + (im_data.meta.Artist ?im_data.meta.Artist.value : '') + '<br>' + (im_data.meta.DateTimeOriginal ? im_data.meta.DateTimeOriginal.value : '') + '</small></p></center>' + html);

		l.bindTooltip(im_data.meta.ImageDescription && im_data.meta.ImageDescription.value ? im_data.meta.ImageDescription.value : fn);
		l.on('mouseover', function (e) {
			var tt = e.target.getTooltip();
			if (!tt)
				return;
			tt.setLatLng(e.latlng);
			});
		this.WikiCommons.WCLG.addLayer(l);
	}

/**
 * [js-md5]{@link https://github.com/emn178/js-md5}
 *
 * @namespace md5
 * @version 0.7.3
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2014-2017
 * @license MIT
 */
  /**
   * @method hex
   * @memberof md5
   * @description Output hash as hex string
   * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
   * @returns {String} Hex string
   * @example
   * md5.hex('The quick brown fox jumps over the lazy dog');
   * // equal to
   * md5('The quick brown fox jumps over the lazy dog');
   */
  /**
   * @method digest
   * @memberof md5
   * @description Output hash as bytes array
   * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
   * @returns {Array} Bytes array
   * @example
   * md5.digest('The quick brown fox jumps over the lazy dog');
   */
  /**
   * @method array
   * @memberof md5
   * @description Output hash as bytes array
   * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
   * @returns {Array} Bytes array
   * @example
   * md5.array('The quick brown fox jumps over the lazy dog');
   */
  /**
   * @method arrayBuffer
   * @memberof md5
   * @description Output hash as ArrayBuffer
   * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
   * @returns {ArrayBuffer} ArrayBuffer
   * @example
   * md5.arrayBuffer('The quick brown fox jumps over the lazy dog');
   */
  /**
   * @method buffer
   * @deprecated This maybe confuse with Buffer in node.js. Please use arrayBuffer instead.
   * @memberof md5
   * @description Output hash as ArrayBuffer
   * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
   * @returns {ArrayBuffer} ArrayBuffer
   * @example
   * md5.buffer('The quick brown fox jumps over the lazy dog');
   */
  /**
   * @method base64
   * @memberof md5
   * @description Output hash as base64 string
   * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
   * @returns {String} base64 string
   * @example
   * md5.base64('The quick brown fox jumps over the lazy dog');
   */

  /**
   * Md5 class
   * @class Md5
   * @description This is internal class.
   * @see {@link md5.create}
   * var OUTPUT_TYPES = ['hex', 'array', 'digest', 'buffer', 'arrayBuffer', 'base64'];
   */
  function Md5(sharedMemory) {
   	var blocks = [];
   	this.buffer8 = {};
   	this.hex_chars = '0123456789abcdef'.split('');
   	this.err_input = 'input is invalid type';
	if (sharedMemory) {
	  blocks[0] = blocks[16] = blocks[1] = blocks[2] = blocks[3] =
	  blocks[4] = blocks[5] = blocks[6] = blocks[7] =
	  blocks[8] = blocks[9] = blocks[10] = blocks[11] =
	  blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
	  this.blocks = blocks;
	} else {
	  if (typeof ArrayBuffer !== 'undefined') {
		var buffer = new ArrayBuffer(68);
		this.buffer8 = new Uint8Array(buffer);
		this.blocks = new Uint32Array(buffer);
	  } else {
		this.blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	  }
	}
	this.h0 = this.h1 = this.h2 = this.h3 = this.start = this.bytes = this.hBytes = 0;
	this.finalized = this.hashed = false;
	this.first = true;
  }

  /**
   * @method update
   * @memberof Md5
   * @instance
   * @description Update hash
   * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
   * @returns {Md5} Md5 object.
   * @see {@link md5.update}
   */
  Md5.prototype.update = function (message) {
	if (this.finalized) {
	  return;
	}

	var notString, type = typeof message;
	if (type !== 'string') {
	  if (type === 'object') {
		if (message === null) {
		  throw this.err_input;
		} else if (typeof ArrayBuffer !== 'undefined' && message.constructor === ArrayBuffer) {
		  message = new Uint8Array(message);
		} else if (!Array.isArray(message)) {
		  if (!typeof ArrayBuffer !== 'undefined' || !ArrayBuffer.isView(message)) {
			throw this.err_input;
		  }
		}
	  } else {
		throw this.err_input;
	  }
	  notString = true;
	}
	var code, index = 0, i, length = message.length, blocks = this.blocks;
	var buffer8 = this.buffer8;

	while (index < length) {
	  if (this.hashed) {
		this.hashed = false;
		blocks[0] = blocks[16];
		blocks[16] = blocks[1] = blocks[2] = blocks[3] =
		blocks[4] = blocks[5] = blocks[6] = blocks[7] =
		blocks[8] = blocks[9] = blocks[10] = blocks[11] =
		blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
	  }

	  if (notString) {
		if (typeof ArrayBuffer !== 'undefined') {
		  for (i = this.start; index < length && i < 64; ++index) {
			buffer8[i++] = message[index];
		  }
		} else {
		  var shift = [0, 8, 16, 24];
		  for (i = this.start; index < length && i < 64; ++index) {
			blocks[i >> 2] |= message[index] << shift[i++ & 3];
		  }
		}
	  } else {
		if (typeof ArrayBuffer !== 'undefined') {
		  for (i = this.start; index < length && i < 64; ++index) {
			code = message.charCodeAt(index);
			if (code < 0x80) {
			  buffer8[i++] = code;
			} else if (code < 0x800) {
			  buffer8[i++] = 0xc0 | (code >> 6);
			  buffer8[i++] = 0x80 | (code & 0x3f);
			} else if (code < 0xd800 || code >= 0xe000) {
			  buffer8[i++] = 0xe0 | (code >> 12);
			  buffer8[i++] = 0x80 | ((code >> 6) & 0x3f);
			  buffer8[i++] = 0x80 | (code & 0x3f);
			} else {
			  code = 0x10000 + (((code & 0x3ff) << 10) | (message.charCodeAt(++index) & 0x3ff));
			  buffer8[i++] = 0xf0 | (code >> 18);
			  buffer8[i++] = 0x80 | ((code >> 12) & 0x3f);
			  buffer8[i++] = 0x80 | ((code >> 6) & 0x3f);
			  buffer8[i++] = 0x80 | (code & 0x3f);
			}
		  }
		} else {
		  var SHIFT = [0, 8, 16, 24];
		  for (i = this.start; index < length && i < 64; ++index) {
			code = message.charCodeAt(index);
			if (code < 0x80) {
			  blocks[i >> 2] |= code << SHIFT[i++ & 3];
			} else if (code < 0x800) {
			  blocks[i >> 2] |= (0xc0 | (code >> 6)) << SHIFT[i++ & 3];
			  blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
			} else if (code < 0xd800 || code >= 0xe000) {
			  blocks[i >> 2] |= (0xe0 | (code >> 12)) << SHIFT[i++ & 3];
			  blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
			  blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
			} else {
			  code = 0x10000 + (((code & 0x3ff) << 10) | (message.charCodeAt(++index) & 0x3ff));
			  blocks[i >> 2] |= (0xf0 | (code >> 18)) << SHIFT[i++ & 3];
			  blocks[i >> 2] |= (0x80 | ((code >> 12) & 0x3f)) << SHIFT[i++ & 3];
			  blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
			  blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
			}
		  }
		}
	  }
	  this.lastByteIndex = i;
	  this.bytes += i - this.start;
	  if (i >= 64) {
		this.start = i - 64;
		this.hash();
		this.hashed = true;
	  } else {
		this.start = i;
	  }
	}
	if (this.bytes > 4294967295) {
	  this.hBytes += this.bytes / 4294967296 << 0;
	  this.bytes = this.bytes % 4294967296;
	}
	return this;
  };

  Md5.prototype.finalize = function () {
	if (this.finalized) {
	  return;
	}
	this.finalized = true;
	var extra = [128, 32768, 8388608, -2147483648];
	var blocks = this.blocks, i = this.lastByteIndex;
	blocks[i >> 2] |= extra[i & 3];
	if (i >= 56) {
	  if (!this.hashed) {
		this.hash();
	  }
	  blocks[0] = blocks[16];
	  blocks[16] = blocks[1] = blocks[2] = blocks[3] =
	  blocks[4] = blocks[5] = blocks[6] = blocks[7] =
	  blocks[8] = blocks[9] = blocks[10] = blocks[11] =
	  blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
	}
	blocks[14] = this.bytes << 3;
	blocks[15] = this.hBytes << 3 | this.bytes >>> 29;
	this.hash();
  };

  Md5.prototype.hash = function () {
	var a, b, c, d, bc, da, blocks = this.blocks;

	if (this.first) {
	  a = blocks[0] - 680876937;
	  a = (a << 7 | a >>> 25) - 271733879 << 0;
	  d = (-1732584194 ^ a & 2004318071) + blocks[1] - 117830708;
	  d = (d << 12 | d >>> 20) + a << 0;
	  c = (-271733879 ^ (d & (a ^ -271733879))) + blocks[2] - 1126478375;
	  c = (c << 17 | c >>> 15) + d << 0;
	  b = (a ^ (c & (d ^ a))) + blocks[3] - 1316259209;
	  b = (b << 22 | b >>> 10) + c << 0;
	} else {
	  a = this.h0;
	  b = this.h1;
	  c = this.h2;
	  d = this.h3;
	  a += (d ^ (b & (c ^ d))) + blocks[0] - 680876936;
	  a = (a << 7 | a >>> 25) + b << 0;
	  d += (c ^ (a & (b ^ c))) + blocks[1] - 389564586;
	  d = (d << 12 | d >>> 20) + a << 0;
	  c += (b ^ (d & (a ^ b))) + blocks[2] + 606105819;
	  c = (c << 17 | c >>> 15) + d << 0;
	  b += (a ^ (c & (d ^ a))) + blocks[3] - 1044525330;
	  b = (b << 22 | b >>> 10) + c << 0;
	}

	a += (d ^ (b & (c ^ d))) + blocks[4] - 176418897;
	a = (a << 7 | a >>> 25) + b << 0;
	d += (c ^ (a & (b ^ c))) + blocks[5] + 1200080426;
	d = (d << 12 | d >>> 20) + a << 0;
	c += (b ^ (d & (a ^ b))) + blocks[6] - 1473231341;
	c = (c << 17 | c >>> 15) + d << 0;
	b += (a ^ (c & (d ^ a))) + blocks[7] - 45705983;
	b = (b << 22 | b >>> 10) + c << 0;
	a += (d ^ (b & (c ^ d))) + blocks[8] + 1770035416;
	a = (a << 7 | a >>> 25) + b << 0;
	d += (c ^ (a & (b ^ c))) + blocks[9] - 1958414417;
	d = (d << 12 | d >>> 20) + a << 0;
	c += (b ^ (d & (a ^ b))) + blocks[10] - 42063;
	c = (c << 17 | c >>> 15) + d << 0;
	b += (a ^ (c & (d ^ a))) + blocks[11] - 1990404162;
	b = (b << 22 | b >>> 10) + c << 0;
	a += (d ^ (b & (c ^ d))) + blocks[12] + 1804603682;
	a = (a << 7 | a >>> 25) + b << 0;
	d += (c ^ (a & (b ^ c))) + blocks[13] - 40341101;
	d = (d << 12 | d >>> 20) + a << 0;
	c += (b ^ (d & (a ^ b))) + blocks[14] - 1502002290;
	c = (c << 17 | c >>> 15) + d << 0;
	b += (a ^ (c & (d ^ a))) + blocks[15] + 1236535329;
	b = (b << 22 | b >>> 10) + c << 0;
	a += (c ^ (d & (b ^ c))) + blocks[1] - 165796510;
	a = (a << 5 | a >>> 27) + b << 0;
	d += (b ^ (c & (a ^ b))) + blocks[6] - 1069501632;
	d = (d << 9 | d >>> 23) + a << 0;
	c += (a ^ (b & (d ^ a))) + blocks[11] + 643717713;
	c = (c << 14 | c >>> 18) + d << 0;
	b += (d ^ (a & (c ^ d))) + blocks[0] - 373897302;
	b = (b << 20 | b >>> 12) + c << 0;
	a += (c ^ (d & (b ^ c))) + blocks[5] - 701558691;
	a = (a << 5 | a >>> 27) + b << 0;
	d += (b ^ (c & (a ^ b))) + blocks[10] + 38016083;
	d = (d << 9 | d >>> 23) + a << 0;
	c += (a ^ (b & (d ^ a))) + blocks[15] - 660478335;
	c = (c << 14 | c >>> 18) + d << 0;
	b += (d ^ (a & (c ^ d))) + blocks[4] - 405537848;
	b = (b << 20 | b >>> 12) + c << 0;
	a += (c ^ (d & (b ^ c))) + blocks[9] + 568446438;
	a = (a << 5 | a >>> 27) + b << 0;
	d += (b ^ (c & (a ^ b))) + blocks[14] - 1019803690;
	d = (d << 9 | d >>> 23) + a << 0;
	c += (a ^ (b & (d ^ a))) + blocks[3] - 187363961;
	c = (c << 14 | c >>> 18) + d << 0;
	b += (d ^ (a & (c ^ d))) + blocks[8] + 1163531501;
	b = (b << 20 | b >>> 12) + c << 0;
	a += (c ^ (d & (b ^ c))) + blocks[13] - 1444681467;
	a = (a << 5 | a >>> 27) + b << 0;
	d += (b ^ (c & (a ^ b))) + blocks[2] - 51403784;
	d = (d << 9 | d >>> 23) + a << 0;
	c += (a ^ (b & (d ^ a))) + blocks[7] + 1735328473;
	c = (c << 14 | c >>> 18) + d << 0;
	b += (d ^ (a & (c ^ d))) + blocks[12] - 1926607734;
	b = (b << 20 | b >>> 12) + c << 0;
	bc = b ^ c;
	a += (bc ^ d) + blocks[5] - 378558;
	a = (a << 4 | a >>> 28) + b << 0;
	d += (bc ^ a) + blocks[8] - 2022574463;
	d = (d << 11 | d >>> 21) + a << 0;
	da = d ^ a;
	c += (da ^ b) + blocks[11] + 1839030562;
	c = (c << 16 | c >>> 16) + d << 0;
	b += (da ^ c) + blocks[14] - 35309556;
	b = (b << 23 | b >>> 9) + c << 0;
	bc = b ^ c;
	a += (bc ^ d) + blocks[1] - 1530992060;
	a = (a << 4 | a >>> 28) + b << 0;
	d += (bc ^ a) + blocks[4] + 1272893353;
	d = (d << 11 | d >>> 21) + a << 0;
	da = d ^ a;
	c += (da ^ b) + blocks[7] - 155497632;
	c = (c << 16 | c >>> 16) + d << 0;
	b += (da ^ c) + blocks[10] - 1094730640;
	b = (b << 23 | b >>> 9) + c << 0;
	bc = b ^ c;
	a += (bc ^ d) + blocks[13] + 681279174;
	a = (a << 4 | a >>> 28) + b << 0;
	d += (bc ^ a) + blocks[0] - 358537222;
	d = (d << 11 | d >>> 21) + a << 0;
	da = d ^ a;
	c += (da ^ b) + blocks[3] - 722521979;
	c = (c << 16 | c >>> 16) + d << 0;
	b += (da ^ c) + blocks[6] + 76029189;
	b = (b << 23 | b >>> 9) + c << 0;
	bc = b ^ c;
	a += (bc ^ d) + blocks[9] - 640364487;
	a = (a << 4 | a >>> 28) + b << 0;
	d += (bc ^ a) + blocks[12] - 421815835;
	d = (d << 11 | d >>> 21) + a << 0;
	da = d ^ a;
	c += (da ^ b) + blocks[15] + 530742520;
	c = (c << 16 | c >>> 16) + d << 0;
	b += (da ^ c) + blocks[2] - 995338651;
	b = (b << 23 | b >>> 9) + c << 0;
	a += (c ^ (b | ~d)) + blocks[0] - 198630844;
	a = (a << 6 | a >>> 26) + b << 0;
	d += (b ^ (a | ~c)) + blocks[7] + 1126891415;
	d = (d << 10 | d >>> 22) + a << 0;
	c += (a ^ (d | ~b)) + blocks[14] - 1416354905;
	c = (c << 15 | c >>> 17) + d << 0;
	b += (d ^ (c | ~a)) + blocks[5] - 57434055;
	b = (b << 21 | b >>> 11) + c << 0;
	a += (c ^ (b | ~d)) + blocks[12] + 1700485571;
	a = (a << 6 | a >>> 26) + b << 0;
	d += (b ^ (a | ~c)) + blocks[3] - 1894986606;
	d = (d << 10 | d >>> 22) + a << 0;
	c += (a ^ (d | ~b)) + blocks[10] - 1051523;
	c = (c << 15 | c >>> 17) + d << 0;
	b += (d ^ (c | ~a)) + blocks[1] - 2054922799;
	b = (b << 21 | b >>> 11) + c << 0;
	a += (c ^ (b | ~d)) + blocks[8] + 1873313359;
	a = (a << 6 | a >>> 26) + b << 0;
	d += (b ^ (a | ~c)) + blocks[15] - 30611744;
	d = (d << 10 | d >>> 22) + a << 0;
	c += (a ^ (d | ~b)) + blocks[6] - 1560198380;
	c = (c << 15 | c >>> 17) + d << 0;
	b += (d ^ (c | ~a)) + blocks[13] + 1309151649;
	b = (b << 21 | b >>> 11) + c << 0;
	a += (c ^ (b | ~d)) + blocks[4] - 145523070;
	a = (a << 6 | a >>> 26) + b << 0;
	d += (b ^ (a | ~c)) + blocks[11] - 1120210379;
	d = (d << 10 | d >>> 22) + a << 0;
	c += (a ^ (d | ~b)) + blocks[2] + 718787259;
	c = (c << 15 | c >>> 17) + d << 0;
	b += (d ^ (c | ~a)) + blocks[9] - 343485551;
	b = (b << 21 | b >>> 11) + c << 0;

	if (this.first) {
	  this.h0 = a + 1732584193 << 0;
	  this.h1 = b - 271733879 << 0;
	  this.h2 = c - 1732584194 << 0;
	  this.h3 = d + 271733878 << 0;
	  this.first = false;
	} else {
	  this.h0 = this.h0 + a << 0;
	  this.h1 = this.h1 + b << 0;
	  this.h2 = this.h2 + c << 0;
	  this.h3 = this.h3 + d << 0;
	}
  };

  /**
   * @method hex
   * @memberof Md5
   * @instance
   * @description Output hash as hex string
   * @returns {String} Hex string
   * @see {@link md5.hex}
   * @example
   * hash.hex();
   */
  Md5.prototype.hex = function () {
	this.finalize();

	var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3;

	return this.hex_chars[(h0 >> 4) & 0x0F] + this.hex_chars[h0 & 0x0F] +
	  this.hex_chars[(h0 >> 12) & 0x0F] + this.hex_chars[(h0 >> 8) & 0x0F] +
	  this.hex_chars[(h0 >> 20) & 0x0F] + this.hex_chars[(h0 >> 16) & 0x0F] +
	  this.hex_chars[(h0 >> 28) & 0x0F] + this.hex_chars[(h0 >> 24) & 0x0F] +
	  this.hex_chars[(h1 >> 4) & 0x0F] + this.hex_chars[h1 & 0x0F] +
	  this.hex_chars[(h1 >> 12) & 0x0F] + this.hex_chars[(h1 >> 8) & 0x0F] +
	  this.hex_chars[(h1 >> 20) & 0x0F] + this.hex_chars[(h1 >> 16) & 0x0F] +
	  this.hex_chars[(h1 >> 28) & 0x0F] + this.hex_chars[(h1 >> 24) & 0x0F] +
	  this.hex_chars[(h2 >> 4) & 0x0F] + this.hex_chars[h2 & 0x0F] +
	  this.hex_chars[(h2 >> 12) & 0x0F] + this.hex_chars[(h2 >> 8) & 0x0F] +
	  this.hex_chars[(h2 >> 20) & 0x0F] + this.hex_chars[(h2 >> 16) & 0x0F] +
	  this.hex_chars[(h2 >> 28) & 0x0F] + this.hex_chars[(h2 >> 24) & 0x0F] +
	  this.hex_chars[(h3 >> 4) & 0x0F] + this.hex_chars[h3 & 0x0F] +
	  this.hex_chars[(h3 >> 12) & 0x0F] + this.hex_chars[(h3 >> 8) & 0x0F] +
	  this.hex_chars[(h3 >> 20) & 0x0F] + this.hex_chars[(h3 >> 16) & 0x0F] +
	  this.hex_chars[(h3 >> 28) & 0x0F] + this.hex_chars[(h3 >> 24) & 0x0F];
  };

  /**
   * @method toString
   * @memberof Md5
   * @instance
   * @description Output hash as hex string
   * @returns {String} Hex string
   * @see {@link md5.hex}
   * @example
   * hash.toString();
   */
  Md5.prototype.toString = Md5.prototype.hex;

  /**
   * @method digest
   * @memberof Md5
   * @instance
   * @description Output hash as bytes array
   * @returns {Array} Bytes array
   * @see {@link md5.digest}
   * @example
   * hash.digest();
   */
  Md5.prototype.digest = function () {
	this.finalize();

	var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3;
	return [
	  h0 & 0xFF, (h0 >> 8) & 0xFF, (h0 >> 16) & 0xFF, (h0 >> 24) & 0xFF,
	  h1 & 0xFF, (h1 >> 8) & 0xFF, (h1 >> 16) & 0xFF, (h1 >> 24) & 0xFF,
	  h2 & 0xFF, (h2 >> 8) & 0xFF, (h2 >> 16) & 0xFF, (h2 >> 24) & 0xFF,
	  h3 & 0xFF, (h3 >> 8) & 0xFF, (h3 >> 16) & 0xFF, (h3 >> 24) & 0xFF
	];
  };

  /**
   * @method array
   * @memberof Md5
   * @instance
   * @description Output hash as bytes array
   * @returns {Array} Bytes array
   * @see {@link md5.array}
   * @example
   * hash.array();
   */
  Md5.prototype.array = Md5.prototype.digest;

  /**
   * @method arrayBuffer
   * @memberof Md5
   * @instance
   * @description Output hash as ArrayBuffer
   * @returns {ArrayBuffer} ArrayBuffer
   * @see {@link md5.arrayBuffer}
   * @example
   * hash.arrayBuffer();
   */
  Md5.prototype.arrayBuffer = function () {
	this.finalize();

	var buffer = new ArrayBuffer(16);
	var blocks = new Uint32Array(buffer);
	blocks[0] = this.h0;
	blocks[1] = this.h1;
	blocks[2] = this.h2;
	blocks[3] = this.h3;
	return buffer;
  };

  /**
   * @method buffer
   * @deprecated This maybe confuse with Buffer in node.js. Please use arrayBuffer instead.
   * @memberof Md5
   * @instance
   * @description Output hash as ArrayBuffer
   * @returns {ArrayBuffer} ArrayBuffer
   * @see {@link md5.buffer}
   * @example
   * hash.buffer();
   */
  Md5.prototype.buffer = Md5.prototype.arrayBuffer;

  /**
   * @method base64
   * @memberof Md5
   * @instance
   * @description Output hash as base64 string
   * @returns {String} base64 string
   * @see {@link md5.base64}
   * @example
   * hash.base64();
   */
  Md5.prototype.base64 = function () {
    var BASE64_ENCODE_CHAR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');
	var v1, v2, v3, base64Str = '', bytes = this.array();
	for (var i = 0; i < 15;) {
	  v1 = bytes[i++];
	  v2 = bytes[i++];
	  v3 = bytes[i++];
	  base64Str += BASE64_ENCODE_CHAR[v1 >>> 2] +
		BASE64_ENCODE_CHAR[(v1 << 4 | v2 >>> 4) & 63] +
		BASE64_ENCODE_CHAR[(v2 << 2 | v3 >>> 6) & 63] +
		BASE64_ENCODE_CHAR[v3 & 63];
	}
	v1 = bytes[i];
	base64Str += BASE64_ENCODE_CHAR[v1 >>> 2] +
	  BASE64_ENCODE_CHAR[(v1 << 4) & 63] +
	  '==';
	return base64Str;
  };
