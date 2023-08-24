L.OSM = {};

L.OSM.park_explication_block = function(f_obj){
	this.obj = [];
	this.webTable = {};
	this.layerGroup = new L.LayerGroup();
	this.f_obj = f_obj;
};

L.OSM.park_explication_obj = function(f_obj){
	return {
		data : null,
		webData : null,
		geoNodes : null,
		geoJSON : null,
		layer : null,
		superPartGeoJSON : null
	};
};

L.OSM.park_explication = function(osm_obj_type, osm_obj_id, f_fin_ok){
	this.OsmGDlib = new OsmGeoDocLib();
	this.osm_obj_type = osm_obj_type;
	this.osm_obj_id =  osm_obj_id;
	this.f_fin_ok = f_fin_ok;
	this.get_data();
	this.osm = {};
	this.osm.data = JSON.parse('{	"leaf_type":{		"broadleaved":{			"ru" : "Широколиственная",			"color" : "#8DB600"		},		"needleleaved":{			"ru" : "Хвойная",			"color" : "#397262"		},		"mixed":{			"ru" : "Смешанный",			"color" : "#888888"		},		"leafless":{			"ru" : "Безлистная",			"color" : "#000000"		},		"null":{			"ru" : "?",			"color" : "#ffff00"		}	},	"leaf_cycle":{		"evergreen":{			"ru" : "Вечнозелёные",			"color" : "#397262"		},		"deciduous":{			"ru" : "Листопадные",			"color" : "#8DB600"		},		"semi_evergreen":{			"ru" : "Полулистопадные",			"color" : "#00ffa0"		},		"semi_deciduous":{			"ru" : "С коротким безлиственным периодом",			"color" : "#476300"		},		"mixed":{			"ru" : "смешанные",			"color" : "#888888"		},		"null":{			"ru" : "?",			"color" : "#ffff00"		}	},	"natural":{		"wood" : "Древесная посадка",		"tree" : "Отдельное дерево",		"tree_row" : "Ряд деревьев",		"scrub" : "Кусты",		"null" : "?"	},	"water":{		"spring" : "Родник",		"pond" : "Водная гладь",		"river" : "Речка",		"stream" : "Ручей",		"drain" : "Сток",		"ditch" : "Канава",		"waterfall" : "Водопад",		"weir" : "Плотина",		"riverbank" : "Большая река",		"fountain" : "Фонтан",		"null" : "?"	},	"highway":{		"path" : "Тропинка",		"footway" : "Дорожка",		"footpath" : "Дорожка",		"service" : "Проезжая дорога",		"track" : "Парковая дорога",		"steps" : "Лестница",		"pedestrian" : "Пешеходная улица",		"null" : "?"	},	"surface":{		"dirt" : "Грязь",		"ground" : "Земля",		"unpaved" : "Земля",		"compacted" : "Утрамбовано",		"tiles" : "Плитка",		"paving_stones" : "Мощение",		"asphalt" : "Асфальт",		"gravel" : "Гравий",		"paved" : "Твёрдое",		"wood" : "Дерево",		"metal" : "Металл",		"pebblestone" : "Галька",		"fine_gravel" : "Камнегравийный слой",		"grass" : "Трава",		"null" : ""	},	"surface_color":{		"dirt" : "#9b7653",		"ground" : "#9b76ff",		"compacted" : "#442d25",		"tiles" : "#303030",		"paving_stones" : "#774444",		"asphalt" : "#444444",		"gravel" : "yellow",		"paved" : "#111111",		"wood" : "#0a5F38",		"pebblestone" : "#888888",		"fine_gravel" : "#f8f32b",		"grass" : "#8DB600",		"null" : "red"	},	"leisure": {		"pitch" : "Спортивная площадка",		"playground" : "Игровая площадка",		"dog_park" : "Собачья площадка"	},	"sport": {		"fitness" : "фитнес",		"table_tennis" : "настольный тенис"	},	"artwork":{		"sculpture" : "скульптура"	},	"material":{		"wood" : "дерево",		"metal" : "металл",		"stone" : "камень",		"marble" : "мрамор",		"glass" : "стекло",		"steel" : "сталь",		"concrete" : "заливной бетон"	},	"artwork_type":{		"sculpture" : "скульптура",		"statue" : "статуя",		"painting" : "живописное",		"mosaic" : "мозаика",		"mural" : "фреска",		"architecture" : "архитектурный объект",		"installation" : "инсталляция"	},	"source_taxon":{		"board" : "Щит с описанием",		"survey" : "Осмотр",		"label" : "Бирка на саженцах",		"null" : "нет"	},	"information":{		"board" : "Щит с описанием",		"office" : "Cправочная служба",		"terminal" : "Терминал информационной системы",		"audioguide" : "Аудиогид",		"map" : "Карта или план",		"tactile_map" : "Тактильная карта",		"tactile_model" : "Тактильная модель",		"guidepost" : "Указатель направлений",		"trail_blaze" : "Маршрутная метка или табличка",		"route_marker" : "Маршрутная метка или табличка"	},	"board_type":{		"geology" : "о геологии",		"history" : "об истории",		"nature" : "о природе или климате",		"plants" : "о растительности",		"notice" : "о мероприятиях",		"wildlife" : "о животном мире",		"null" : "не указан"	},	"source_direction":{		"isoline" : "Пересекает изолинию или видимый наклон",		"survey" : "Осмотр, зафиксировано направление течения",		"null" : "нет"	},	"building":{		"yes": "Здание общего типа",		"shed": "Вспомогательная постройка",		"farm_auxiliary": "Сельскохозяйственное здание",		"roof": "Навес",		"kiosk": "Будка",		"cabin": "Кабина",		"null": "не указан"	}}');
	/*var xhttp = new XMLHttpRequest();
	xhttp.__ = this;
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			this.__.osm = { data : JSON.parse(this.responseText)};
		}
	};
	xhttp.open("GET", "osmdata.json", true);
	xhttp.setRequestHeader('Content-Type', 'application/json');
	xhttp.send(); */
};

	L.OSM.park_explication.prototype.getAllgeoData = function (osm_main_obj_xml) {
		var mr =  (this.osm_obj_type == 'relation') ? this.OsmGDlib.osmRelationGeoJson(osm_main_obj_xml, this.osm_obj_id) : ((this.osm_obj_type == 'way') ? this.OsmGDlib.osmWayGeoJson(osm_main_obj_xml, this.osm_obj_id) : null);
		var t = mr.tags;
		if (t && t.wikidata)
		{
			var wikiDataQ = t.wikidata;
			log('WikiData ' + wikiDataQ);
		}
		var gJs = L.geoJSON(mr);
		this.get_wikidata(t ? t.wikidata : null);
		var b = gJs.getBounds();
		console.log(b, gJs, this.osm_obj_type);

		var xhr = new XMLHttpRequest();
		xhr.url = "https://overpass-api.de/api/interpreter?data=[out:xml];(++node(" + b.getSouth() + "," + b.getWest() + "," + b.getNorth() + "," + b.getEast() + ");<;);(._;>;);out+meta;";
		// 'https://www.openstreetmap.org/api/0.6/map?bbox=' + gJs.getBounds().toBBoxString();
		xhr.open('GET', xhr.url, true);
		xhr.ini_obj = this;
		xhr.send();
		xhr.onreadystatechange = function () {
			if (xhr.readyState != 4) return;
			if (xhr.status != 200 && (xhr.status != 0 || xhr.response)) {
				alert("Ошибка БД OSM! " + xhr.url);
			} else {
				if (typeof (xhr.ini_obj.f_fin_ok) == 'function')
					xhr.ini_obj.f_fin_ok(xhr);
			}
		}
	};
	L.OSM.park_explication.prototype.get_data = function () {
		var xhr = new XMLHttpRequest();
		xhr.url = this.OsmGDlib.OSM_URL(this.osm_obj_type, this.osm_obj_id, 'full');
		xhr.ini_obj = this;
		xhr.open('GET', xhr.url, true);
		xhr.send();
		xhr.onreadystatechange = function () {
			if (xhr.readyState != 4) return;
			if (xhr.status != 200 && (xhr.status != 0 || xhr.response)) {
				alert("Ошибка БД OSM! " + xhr.url);
				return;
			} else {
				log('Данные по контуру получены ');
				xhr.ini_obj.getAllgeoData(xhr.responseXML);
				return;
			}
			console.log (xhr.status);
		}
	};
	L.OSM.park_explication.prototype.get_wikidata = function (Q) {
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
		// log('SPARQL ' + SPQL);
		xhr.ini_obj = this;
		xhr.open('GET', xhr.url, true);
		xhr.send();
		xhr.onreadystatechange = function () {
			if (xhr.readyState != 4) return;
			if (xhr.status != 200 && (xhr.status != 0 || xhr.response)) {
				alert("Ошибка WikiDataSparQL! " + xhr.url);
				return;
			} else {
				var Res0 = xhr.responseXML.getElementsByTagName('sparql')[0].getElementsByTagName('results')[0].getElementsByTagName('result')[0];
				if (!Res0)
				{
					log('Данные по WikiData пусты');
					return;
				}
				log('Данные по WikiData получены');
				var Quri = getBindNode(Res0, 'item', 'uri');
				var WikiCommCat = getBindNode(Res0, 'wdComCat', 'literal');
				var WikiDataName = getBindNode(Res0, 'itemLabel', 'literal');
				var WikiDataGeo = getBindNode(Res0, 'geoCoord', 'literal');
				var Qa = Quri.split("/");
				var Qcode = Qa[Qa.length-1];
				log (Quri + "  " + WikiCommCat + "  " + WikiDataName + "  " + Qcode + " " + WikiDataGeo );
				xhr.ini_obj.wikidataQ = Qcode;
				xhr.ini_obj.iniWikiCommons(WikiCommCat);
				xhr.ini_obj.getWikiCommonsData("Category:" + WikiCommCat.replace(/ /g, '_'), -1);
				return;
			}
			console.log (xhr.status);
		}
	};

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
/*
	xhr.url = //"https://cats-php.toolforge.org/?cat=" + this.WikiCommCat.replace(' ', '_') + "&depth=7&json=1&lang=commons&type=6";
		//"https://commons.wikimedia.org/w/api.php?origin=*&action=query&list=categorymembers&cmtitle=Category:" + this.WikiCommCat.replace(' ', '_') + "&format=json"; //&cmtype=file&prop=imageinfo&iiprop=extmetadata"
//			"https://wikimap.toolforge.org/api.php?origin=*&cat=" + this.WikiCommCat.replace(' ', '_') + "&lang=ru&subcats=&subcatdepth=7";
//list=allcategories&
//categorymembers */
xhr.url = "https://commons.wikimedia.org/w/api.php?origin=*&action=query&generator=categorymembers&gcmtitle=" + categ + "&gcmtype=subcat|file&prop=imageinfo&iiprop=timestamp|user|url|size|mime|mediatype|extmetadata&format=json&gcmlimit=500&iiextmetadatalanguage=ru";
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
			console.log (xhr.status);
		}
	};

	L.OSM.park_explication.prototype.addWikiCommonsCategoryData = function (xhr) {
		console.log("++ " + xhr.lv + " K " + xhr.WCcateg + " " + xhr.readyState + " " + xhr.status);
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
			log("Ошибка запроса данных с ВикиСклада! \n" + xhr.url);
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
					console.log(" File ++ " + mtobj.title);
			}
			if (mtobj.ns == 14) // subcat
			{
				var ct = mtobj.title.replace(/ /g, '_')
				if (!this.WikiCommons.Cat_OK[ct])
				{
					this.getWikiCommonsData(encodeURIComponent(ct), xhr.lv);
					console.log(" c+ " + xhr.lv + " K " + xhr.WCcateg + " -> " + ct);
				}
				else
					console.log(" c- " + xhr.lv + " K " + xhr.WCcateg + " -> " + ct);
			}
		}
		this.WikiCommons.n_xhr--;
		if (!this.WikiCommons.n_xhr)
		{
			console.log(' Изображений ' + this.WikiCommons.images.length);
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
		var s_md5 = md5(fn)

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

	L.OSM.park_explication.prototype.map = function (div, map_prov, map_params) {
		var cen = this.geoJsonGeneral.features[0].geometry.coordinates[0][0];
		var md = new mapDiv(
			div,
			[cen[1], cen[0]],
			map_prov.tileLayers,
			map_prov.Names,
			{
				ini: 14,
				min: 8,
				max: 20
			},
			true,
			map_params
		);
		var mrg = this.general_rel_geoJson(this.geoJsonGeneral);
		var n = mrg.properties.tags.name;
		var mr = L.geoJSON(mrg, { fillOpacity: 0, color: "#F2872F" });
		md.map.fitBounds(mr.getBounds());
		md.Control.addOverlay(mr, n);
		md.map.addLayer(mr);
		return md;
	};
	L.OSM.park_explication.prototype.general_rel_geoJson = function() {
		for (var i in this.geoJsonGeneral.features) {
			var el = this.geoJsonGeneral.features[i];
			if (el.properties.id == this.osm_obj_id && el.properties.type == this.osm_obj_type)
				return el;
		}
		return null;
	};
	L.OSM.park_explication.prototype.function_general = function (
		участки,
		L_mapLayer,
		L_mapNames,
		map_params,
		explicationDataProcess
	) {
		log('Получены исходные данные ');
		var hronofiltr = map_params.start_date ?? null;
		var main_rel = this.general_rel_geoJson();
		document.getElementById('obj_title').innerText = main_rel.properties.tags.name +  (map_params.start_date ? (" (" + map_params.start_date + ")") : "");
		this.block = {};
		for (var oi in expl_func_blocks) {
			this.block[oi] = new L.OSM.park_explication_block(expl_func_blocks[oi]);
		}

		for (var i in this.geoJsonGeneral.features) {
			var osmGeoJSON_obj = this.geoJsonGeneral.features[i];
			if (hronofiltr) { // Фильтрация по дате
				if (!osmGeoJSON_obj.properties.tags['start_date'])
					continue;
				var s0 = osmGeoJSON_obj.properties.tags['start_date'];
				if (s0.indexOf('x') != -1 || s0.indexOf('s') != -1)
				{
					var max_date = s0.replace('x', '9').replace('s', '9');
				} else {
					var inter_d = s0.split('..');
					var d1 = inter_d[0].split('-');
					var min_date = new Number(d1[0]);
					if (inter_d[1]) {
						var maxd_0 = inter_d[1].split('-');
						var max_date = new Number(maxd_0[0]);
					} else {
						var max_date = min_date;
					}
				}
				if (max_date > hronofiltr)
					continue;
				console.log(min_date + " " + max_date + " " + osmGeoJSON_obj.properties.tags['start_date']);
			}

			var geoNd = this.OsmGDlib.γεωμετρία.geo_nodes(osmGeoJSON_obj);

			var ok = false;
			for (var j_n in geoNd) {
				ok = ok || (this.OsmGDlib.γεωμετρία.booleanPointInPolygon(geoNd[j_n], main_rel, { ignoreBoundary: true }));
			}

   			// Проход по всем блокам для фильтрации объекта и определения принадлежности к участку
			for (var oi in this.block) {
				block = this.block[oi];
				if (ok && block.f_obj.filter(this, osmGeoJSON_obj)) {
					var eo = new L.OSM.park_explication_obj();
					eo.geoJSON = osmGeoJSON_obj;
					eo.geoNodes = geoNd;
					var sP = null;
					if (участки.length > 0)
					{
					// К какому участку относится объект
						var SPGJ = nd_superParts(geoNd, участки, this); // К какому участку относится объект
						eo.superPartGeoJSON = SPGJ;
						var sP = (SPGJ.length == 1) ? superPart(SPGJ) : null;
					}	   
	   				// Заполняем основные данные объекта
	   				var data = block.f_obj.data_object(this, osmGeoJSON_obj, sP);
	   				// Декорируем данные объекта для веб
	   				var wD = block.f_obj.webData_object(this, osmGeoJSON_obj, Object.assign({}, data));
	   				wD.OSM = OSM_href(osmGeoJSON_obj);
	   				eo.webData = wD;

	   				OSM_data(osmGeoJSON_obj, data);
	   				eo.data = data;

	   				block.obj.push(eo);
				}
			}
		}
		log('Первичная фильтрация объектов завершена');
		for (var i in участки) {
			var osmGeoJSON_obj = участки[i];

			var geoNd = this.OsmGDlib.γεωμετρία.geo_nodes(osmGeoJSON_obj);
			var ok = false;
			for (var j_n in geoNd) {
				ok = ok || (this.OsmGDlib.γεωμετρία.booleanPointInPolygon(geoNd[j_n], main_rel, { ignoreBoundary: true }));
			}
			block = this.block['Участки'];

			var eo = new L.OSM.park_explication_obj();
			eo.geoJSON = osmGeoJSON_obj;
			eo.geoNodes = geoNd;
			var data = block.f_obj.data_object(this, osmGeoJSON_obj, null);
			// Декорируем данные объекта для веб
			var wD = block.f_obj.webData_object(this, osmGeoJSON_obj, Object.assign({}, data));
			wD.OSM = OSM_href(osmGeoJSON_obj);
			eo.webData = wD;

			OSM_data(osmGeoJSON_obj, data);
			eo.data = data;

			block.obj.push(eo);
		}

		function Участок_всех_точек (уч_geoJson) {
			if (уч_geoJson.length == 0) // Нет точек ни в одном участке
				return null;
			if (уч_geoJson.length == 1)
				return уч_geoJson[0];
			for (var c in уч_geoJson) {
				var ok = true;
				for (var i_n in nd) {
					ok = ok && (this.OsmGDlib.γεωμετρία.booleanPointInPolygon(nd[i_n], уч_geoJson[c], { ignoreBoundary: true }));
				}
				if (ok)
					return уч_geoJson[c]; // Первый Участок, к которому относятся все точки
			}
		}
		function nd_superParts (nd, участки, b)
		{ // Участки, к которым относятся переданные точки
			function uniq(value, index, self) {
				return self.indexOf(value) === index;
			}
			var уч_geoJson = []; // Перечень участков, которым принадлежат точки данного объекта
			for (var i_u in участки) {
				var pol = участки[i_u];
				for (var i_n in nd) {
					if (b.OsmGDlib.γεωμετρία.booleanPointInPolygon(nd[i_n], pol, { ignoreBoundary: true })) {
						уч_geoJson.push(pol);
					}
				}
			}
			return уч_geoJson.filter(uniq);
		}

		function superPart (Уч_geoJSON) {
				if (!Уч_geoJSON || Уч_geoJSON.length == 0)
					return null;
				var Уч = '';
				if (!Уч_geoJSON.length)
					return Уч_geoJSON.properties.tags.name;
				for (var j in Уч_geoJSON) {
					Уч += ' ' + Уч_geoJSON[j].properties.tags.name;
					}
				return Уч.slice(1);
		}

		function OSM_href (osmGeoJSON_obj) {
			var osmt = osmGeoJSON_obj.properties.type[0];
			var osmt_ = (osmt == 'n') ? 'Точка' : ((osmt == 'w') ? 'Линия' : 'Отношение');
			return "<a href='https://www.openstreetmap.org/" + osmGeoJSON_obj.id + "'>" + osmt_ + "</a>";
		};

		function OSM_data (osmGeoJSON_obj, obj) {
			obj.OSMid = osmGeoJSON_obj.properties.id;
			obj.OSMt  = osmGeoJSON_obj.properties.type;
		};

		// Сортировка и нумерация всех массивов для экспликации
		function No_(bo) {
			for (var i in bo) {
				var o = bo[i];
				o.data.No = Number(i) + 1;
				o.webData.No = Number(i) + 1;
			}
		}
		for (var oi in this.block) {
			var block = this.block[oi];
			if (block.f_obj.sort) {
				block.obj.sort(block.f_obj.sort);
			}
			No_(block.obj);
		}
		log('Данные отсортированы');
		// Подготовка стилей слоёв на карте
		for (var oi in this.block) {
			var block = this.block[oi];
			for (var i in block.obj) {
				var eo = block.obj[i];
				var gj = eo.geoJSON;
				var act = block.f_obj.interactive(this, oi, eo.webData);

				var st = block.f_obj.geoJSON_style(this, gj, data);
				var l = L.geoJSON(eo.geoJSON, {
					style: st,
					pointToLayer: function(feature, latlng) {
						return L.circleMarker(latlng, { radius: 4, weight: 3 });
					}
				});

				if (eo.geoJSON.properties.showDirection)
					l.setText(st.text, st.textStyle);
				if (act.popup){
					l.bindPopup(act.popup);
					l.on('click', l.openPopup);
				}
				if (act.tooltip){
					l.bindTooltip(act.tooltip);
					l.on('mouseover', function (e) {
						var tt = e.target.getTooltip();
						if (!tt)
							return;
						tt.setLatLng(e.latlng);
					});
				}
				eo.layer = l;
				block.layerGroup.addLayer(l);
			}
		}
	 	log('Отрисовка данных подготовлена');

		if (main_rel.properties.tags.name == 'Бирюлёвский дендропарк'){
			this.привязка_указателей(this.block);
		 	log('Маточные площадки привязаны к указателям');
		}

	 	if (typeof explicationDataProcess == "function"){
	 		try {
	 			explicationDataProcess(this.block);
	 			} catch (e) {
	 			console.log("explicationDataProcess ERR");
	 			console.log(e);
	 			}
		}

		log('Экспликация показана ');

		var t1 = new Date().getTime();
		document.getElementById('note').innerText = 'Сформировано за ' + (t1 - t0) / 1000 + ' сек.';
		document.getElementById('status').innerText = '';

		this.md = this.map(
			document.getElementById('map'),
			{
				tileLayers: L_mapLayer,
				Names: L_mapNames
			},
			map_params
		);

		this.addWikiCommonsLayer();
		// Вывод всех слоёв на карту по группам
		for (var oi in this.block) {
			var block = this.block[oi];
			this.md.Control.addOverlay(block.layerGroup, oi.replaceAll('_', ' '));
				if (map_params.obj && map_params.obj == oi)
					block.layerGroup.addTo(this.md.map);
		}

		this.md.Control.expand();

		L.GridLayer.GridDebug = L.GridLayer.extend({
			createTile: function (coords) {
				const tile = document.createElement('div');
				tile.style.outline = '1px solid green';
				tile.style.fontWeight = 'bold';
				tile.style.fontSize = '14pt';
				tile.style.color = '#ffff00';
				tile.innerHTML = [coords.z, coords.x, coords.y].join('/');
				return tile;
			},
		});

		L.gridLayer.gridDebug = function (opts) {
			return new L.GridLayer.GridDebug(opts);
		};

		this.md.Control.addOverlay(L.gridLayer.gridDebug(), "сетка WMS");
	}; // Конец основной алгоритмической ветви

	L.OSM.park_explication.prototype.activate = function (id, object_class){
		var b = this.block[object_class];
		if (!this.md.map.hasLayer(b.layerGroup))
			this.md.map.addLayer(b.layerGroup);
		var obj_id_ok = null;
		for (var i in b.obj){
			if (b.obj[i].data.No == id)
				obj_id_ok = i;
		}
		if (obj_id_ok){
			var l = b.obj[obj_id_ok].layer;
			l.openPopup();
			this.md.map.fitBounds(l.getBounds(), {maxZoom: 18});
		}
//		this.md.map.addLayer();
	};

		L.OSM.park_explication.prototype.exportJSON = function (exportObj, exportFile){
			 var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
			 var specialNode = document.createElement('a');
			 specialNode.setAttribute("href",	  dataStr);
			 specialNode.setAttribute("download", exportFile + ".json");
			 document.body.appendChild(specialNode); // required for firefox
			 specialNode.click();
			 specialNode.remove();
		};
		L.OSM.park_explication.prototype.exportSQL = function (exportObj, tableName, exportFile){
			 var SQL = "";
			 for (var i in exportObj){
				var ins = "INSERT INTO " + tableName + " ("
				for (var a in exportObj[i])
						ins += "\"" + a + "\", ";
				ins.slice(0, -2);
				ins += ") VALUES (";
				for (var a in exportObj[i]){
						var v = exportObj[i][a];
						if (v == null)
							 ins += "NULL, ";
						else {
							if (v)
								v = v.toString().replaceAll("'", "''");
							ins += "'" + v + "', ";
						}
				}
				ins.slice(0, -2);
				ins += ");\n";
					SQL += ins;
			 }
			 var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(SQL);
			 var specialNode = document.createElement('a');
			 specialNode.setAttribute("href",	  dataStr);
			 specialNode.setAttribute("download", exportFile + ".sql");
			 document.body.appendChild(specialNode); // required for firefox
			 specialNode.click();
			 specialNode.remove();
		};
		L.OSM.park_explication.prototype.exportObj = function (id_block, element){
			var obj = this.block[id_block].obj;
			data = [];
			for (var i in obj)
				data.push(obj[i][element]);
			return data;
		}

		L.OSM.park_explication.prototype.exportData = function (id_block, element, format, exportFile, tableName){
			var eo = this.exportObj(id_block, element);
			exportFile = exportFile ?? ('"' + id_block.replaceAll('_', ' ') + '"');
			tableName = tableName ?? ('"' + id_block.replaceAll('_', ' ') + '"');
			if (format == "SQL")
				this.exportSQL(eo, tableName, exportFile);
			else
				this.exportJSON(eo, exportFile);
		}

/**
* Представляет карту, действующую в блоке
* @constructor
* @param {div} div - Блок для размещенеия карты.
* @param {LonLat} centerGeo - Координаты центра карты.
* @param {int} zoom - Условный масштаб.
* @param {int} minZ - мимнимальный условный масштаб.
* @param {int} maxZ - максимальный условный масштаб.
* @param {bool} controls - включать ли преключатель своёв.
*/
function mapDiv(div, centerGeo, provider, providerName, Z, controls, map_params) {
	function L_TileSource (prov) {
		if(typeof prov === 'string')
		{
			var p = L.tileLayer.provider(prov);
			if (!p.options)
				p.options = {};
			p.options.id = prov;
			return p;
		}
		else
			return prov;
	}
	this.div = div;
	this.map = L.map(div.getAttribute('id'), { keyboard: false });
	if (!isNaN(centerGeo[0]) && !isNaN(centerGeo[1]) && !isNaN(Z.ini))
		this.map.setView(centerGeo, Z.ini);
	if (Z) {
		this.map.setMinZoom(Z.min);
		this.map.setMaxZoom(Z.max);
	}
	var TileLayers = [];
	if (!Array.isArray(provider)){
		TileLayers.push(L_TileSource(provider));
	} else {
		for (var i in provider)
			TileLayers.push(L_TileSource(provider[i]));
	}
  	this.ini_layer = TileLayers[0];
	   
  	if (map_params.tile)
  	{  
		for (var i in TileLayers) {
			var tl = TileLayers[i];
			if (!tl.options || !tl.options.id)
				continue;
			if (tl.options.id == map_params.tile)
			{
				this.ini_layer = tl;
				break;
			}
		}
  	}
  
	if (controls) {
		this.Control = new L.Control.Layers();
		for (var i in TileLayers){
			var provStr = providerName[i] ?? ((typeof prov === 'string') ? prov : (TileLayers[i].options && TileLayers[i].options) ? TileLayers[i].options.id : '?');
			this.Control.addBaseLayer(TileLayers[i], provStr);
		}
		this.map.addControl(this.Control);
	}
	this.ini_layer.addTo(this.map);
}

// '<a href="#' + block + "_" + webData_obj.No + '">' + webData_obj.No + '</a>
L.OSM.park_explication.prototype.popup = function (webData_obj, title, block) {  // Возвращает гипертекст учётной карточки
		var html = '<p align="center" role="popup_card">' + title + webData_obj.No +'</p><table role="popup_card"><tr><th role="popup_card">Свойство</th><th role="popup_card">Значение</th></tr>';
		for (var k in webData_obj) {
			if (k[0] == '_' || k == 'No' || !webData_obj[k] || webData_obj[k] == '?' || webData_obj[k] == '-')
				continue;
			html += '<tr role="popup_card"><td role="popup_card">' + k.replace('_', ' ').replace('_', ' ') + '</td><td role="popup_card">' + webData_obj[k] + '</td></tr>';
		}
		html += '</table>';
		return html;
	};

L.OSM.park_explication.prototype.biolog_format = function (bio) { // Получает каноническое разложение полей классификации
		if (!bio.taxon) {
			return [{ genus: bio.genus, taxon: null, spieces: bio.spieces }];
		}
		var a = bio.taxon.split(';');
		canon = [];
		for (var ti in a) {
			gt = bio.genus ? bio.genus.split(';')[ti] : null;
			st = bio.spieces ? bio.spieces.split(';')[ti] : null;
			tt = a[ti] ? a[ti].split(' ') : null;
			canon.push({
				genus: gt ? gt : a[ti].split(' ')[0],
				spieces: st ? st : tt.slice(1, tt.length)
			});
		}
		return canon;
	};

L.OSM.park_explication.prototype.привязка_указателей = function(osm_tables){
		function привязка(мп, со, x){
			if (x)
				console.log(мп.webData, со.webData);
			мп.webData.Табличка = со.webData.OSM;
			со.webData.Площадка = мп.webData.OSM;
		}
		var мп = osm_tables["Маточные_площадки"].obj;
		var со = osm_tables["Справочные_объекты"].obj;
		var index_мп = {};
		for (var i in мп){
			var u = мп[i].data.Участок;
			if (!index_мп[u])
				index_мп[u] = [];
			index_мп[u].push(мп[i]);
		}
		var index_со = {};
		for (var i in со){
			var u = со[i].data.Участок;
			if (!index_со[u])
				index_со[u] = [];
			index_со[u].push(со[i]);
		}
		for (var i in мп){
			var мп_ = мп[i].data;
			var u = мп_.Участок;
			if (!index_со[u])
				continue;
			var мп_в = мп_.Вид;
			var мп_р = мп_.Род;
			var мп_s = мп_.Spieces;
			var мп_g = мп_.Genus;
			var iu = index_со[u];
			for (var j in iu){
				var со_ = iu[j].data;
				var со_в = со_.Вид;
				var со_р = со_.Род;
				var со_s = со_.Spieces;
				var со_g = со_.Genus;
				var со_n = со_.Название;
				if(!со_n || (!мп_в && !мп_р && !мп_g && !мп_s))
					continue;
				if ((мп_в==со_в && мп_р==со_р) || (мп_s==со_s && мп_g==со_g)) // || (n.indexOf(в) != -1 && n.indexOf(р) != -1 && n.indexOf(g) != -1 && n.indexOf(s) != -1)
					привязка(мп[i], iu[j], 0);
			}
		}

		for (var i in мп){
			var o = мп[i];
			var п = o.data.Подтверждение_вида;
			if (п != "Щит с описанием")
				continue;
			if (!o.webData.Табличка)
				o.webData.Подтверждение_вида = '<b><span style="color: red">' + п + '</span></b>';
			else
				o.webData.Подтверждение_вида = '<span style="color: green">' + п + '</span>';
		}
		for (var i in со){
			var o = со[i];
			var п = o.data.Тип_информации;
			if (п != "о растительности")
				continue;
			if (!o.webData.Площадка)
				o.webData.Тип_информации = '<b><span style="color: red">' + п + '</span></b>';
			else
				o.webData.Тип_информации = '<span style="color: green">' + п + '</span>';
		}
	};

/**
 * [js-md5]{@link https://github.com/emn178/js-md5}
 *
 * @namespace md5
 * @version 0.7.3
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2014-2017
 * @license MIT
 */
(function () {
  'use strict';

  var ERROR = 'input is invalid type';
  var WINDOW = typeof window === 'object';
  var root = WINDOW ? window : {};
  if (root.JS_MD5_NO_WINDOW) {
	WINDOW = false;
  }
  var WEB_WORKER = !WINDOW && typeof self === 'object';
  var NODE_JS = !root.JS_MD5_NO_NODE_JS && typeof process === 'object' && process.versions && process.versions.node;
  if (NODE_JS) {
	root = global;
  } else if (WEB_WORKER) {
	root = self;
  }
  var COMMON_JS = !root.JS_MD5_NO_COMMON_JS && typeof module === 'object' && module.exports;
  var AMD = typeof define === 'function' && define.amd;
  var ARRAY_BUFFER = !root.JS_MD5_NO_ARRAY_BUFFER && typeof ArrayBuffer !== 'undefined';
  var HEX_CHARS = '0123456789abcdef'.split('');
  var EXTRA = [128, 32768, 8388608, -2147483648];
  var SHIFT = [0, 8, 16, 24];
  var OUTPUT_TYPES = ['hex', 'array', 'digest', 'buffer', 'arrayBuffer', 'base64'];
  var BASE64_ENCODE_CHAR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

  var blocks = [], buffer8;
  if (ARRAY_BUFFER) {
	var buffer = new ArrayBuffer(68);
	buffer8 = new Uint8Array(buffer);
	blocks = new Uint32Array(buffer);
  }

  if (root.JS_MD5_NO_NODE_JS || !Array.isArray) {
	Array.isArray = function (obj) {
	  return Object.prototype.toString.call(obj) === '[object Array]';
	};
  }

  if (ARRAY_BUFFER && (root.JS_MD5_NO_ARRAY_BUFFER_IS_VIEW || !ArrayBuffer.isView)) {
	ArrayBuffer.isView = function (obj) {
	  return typeof obj === 'object' && obj.buffer && obj.buffer.constructor === ArrayBuffer;
	};
  }

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
  var createOutputMethod = function (outputType) {
	return function (message) {
	  return new Md5(true).update(message)[outputType]();
	};
  };

  /**
   * @method create
   * @memberof md5
   * @description Create Md5 object
   * @returns {Md5} Md5 object.
   * @example
   * var hash = md5.create();
   */
  /**
   * @method update
   * @memberof md5
   * @description Create and update Md5 object
   * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
   * @returns {Md5} Md5 object.
   * @example
   * var hash = md5.update('The quick brown fox jumps over the lazy dog');
   * // equal to
   * var hash = md5.create();
   * hash.update('The quick brown fox jumps over the lazy dog');
   */
  var createMethod = function () {
	var method = createOutputMethod('hex');
	if (NODE_JS) {
	  method = nodeWrap(method);
	}
	method.create = function () {
	  return new Md5();
	};
	method.update = function (message) {
	  return method.create().update(message);
	};
	for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
	  var type = OUTPUT_TYPES[i];
	  method[type] = createOutputMethod(type);
	}
	return method;
  };

  var nodeWrap = function (method) {
	var crypto = eval("require('crypto')");
	var Buffer = eval("require('buffer').Buffer");
	var nodeMethod = function (message) {
	  if (typeof message === 'string') {
		return crypto.createHash('md5').update(message, 'utf8').digest('hex');
	  } else {
		if (message === null || message === undefined) {
		  throw ERROR;
		} else if (message.constructor === ArrayBuffer) {
		  message = new Uint8Array(message);
		}
	  }
	  if (Array.isArray(message) || ArrayBuffer.isView(message) ||
		message.constructor === Buffer) {
		return crypto.createHash('md5').update(new Buffer(message)).digest('hex');
	  } else {
		return method(message);
	  }
	};
	return nodeMethod;
  };

  /**
   * Md5 class
   * @class Md5
   * @description This is internal class.
   * @see {@link md5.create}
   */
  function Md5(sharedMemory) {
	if (sharedMemory) {
	  blocks[0] = blocks[16] = blocks[1] = blocks[2] = blocks[3] =
	  blocks[4] = blocks[5] = blocks[6] = blocks[7] =
	  blocks[8] = blocks[9] = blocks[10] = blocks[11] =
	  blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
	  this.blocks = blocks;
	  this.buffer8 = buffer8;
	} else {
	  if (ARRAY_BUFFER) {
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
		  throw ERROR;
		} else if (ARRAY_BUFFER && message.constructor === ArrayBuffer) {
		  message = new Uint8Array(message);
		} else if (!Array.isArray(message)) {
		  if (!ARRAY_BUFFER || !ArrayBuffer.isView(message)) {
			throw ERROR;
		  }
		}
	  } else {
		throw ERROR;
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
		if (ARRAY_BUFFER) {
		  for (i = this.start; index < length && i < 64; ++index) {
			buffer8[i++] = message[index];
		  }
		} else {
		  for (i = this.start; index < length && i < 64; ++index) {
			blocks[i >> 2] |= message[index] << SHIFT[i++ & 3];
		  }
		}
	  } else {
		if (ARRAY_BUFFER) {
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
	var blocks = this.blocks, i = this.lastByteIndex;
	blocks[i >> 2] |= EXTRA[i & 3];
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

	return HEX_CHARS[(h0 >> 4) & 0x0F] + HEX_CHARS[h0 & 0x0F] +
	  HEX_CHARS[(h0 >> 12) & 0x0F] + HEX_CHARS[(h0 >> 8) & 0x0F] +
	  HEX_CHARS[(h0 >> 20) & 0x0F] + HEX_CHARS[(h0 >> 16) & 0x0F] +
	  HEX_CHARS[(h0 >> 28) & 0x0F] + HEX_CHARS[(h0 >> 24) & 0x0F] +
	  HEX_CHARS[(h1 >> 4) & 0x0F] + HEX_CHARS[h1 & 0x0F] +
	  HEX_CHARS[(h1 >> 12) & 0x0F] + HEX_CHARS[(h1 >> 8) & 0x0F] +
	  HEX_CHARS[(h1 >> 20) & 0x0F] + HEX_CHARS[(h1 >> 16) & 0x0F] +
	  HEX_CHARS[(h1 >> 28) & 0x0F] + HEX_CHARS[(h1 >> 24) & 0x0F] +
	  HEX_CHARS[(h2 >> 4) & 0x0F] + HEX_CHARS[h2 & 0x0F] +
	  HEX_CHARS[(h2 >> 12) & 0x0F] + HEX_CHARS[(h2 >> 8) & 0x0F] +
	  HEX_CHARS[(h2 >> 20) & 0x0F] + HEX_CHARS[(h2 >> 16) & 0x0F] +
	  HEX_CHARS[(h2 >> 28) & 0x0F] + HEX_CHARS[(h2 >> 24) & 0x0F] +
	  HEX_CHARS[(h3 >> 4) & 0x0F] + HEX_CHARS[h3 & 0x0F] +
	  HEX_CHARS[(h3 >> 12) & 0x0F] + HEX_CHARS[(h3 >> 8) & 0x0F] +
	  HEX_CHARS[(h3 >> 20) & 0x0F] + HEX_CHARS[(h3 >> 16) & 0x0F] +
	  HEX_CHARS[(h3 >> 28) & 0x0F] + HEX_CHARS[(h3 >> 24) & 0x0F];
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

  var exports = createMethod();

  if (COMMON_JS) {
	module.exports = exports;
  } else {
	/**
	 * @method md5
	 * @description Md5 hash function, export to global in browsers.
	 * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
	 * @returns {String} md5 hashes
	 * @example
	 * md5(''); // d41d8cd98f00b204e9800998ecf8427e
	 * md5('The quick brown fox jumps over the lazy dog'); // 9e107d9d372bb6826bd81d3542a419d6
	 * md5('The quick brown fox jumps over the lazy dog.'); // e4d909c290d0fb1ca068ffaddf22cbd0
	 *
	 * // It also supports UTF-8 encoding
	 * md5('中文'); // a7bac2239fcdcb3a067903d8077c4a07
	 *
	 * // It also supports byte `Array`, `Uint8Array`, `ArrayBuffer`
	 * md5([]); // d41d8cd98f00b204e9800998ecf8427e
	 * md5(new Uint8Array([])); // d41d8cd98f00b204e9800998ecf8427e
	 */
	root.md5 = exports;
	if (AMD) {
	  define(function () {
		return exports;
	  });
	}
  }
})();
	
