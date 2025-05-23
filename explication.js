L.OSM = {};

L.OSM.park_explication_block = function(f_obj){
	this.obj = [];
	this.webTable = {};
	this.layerGroup = new L.LayerGroup();
	this.textLayers = new L.LayerGroup();
	this.f_obj = f_obj;
};

L.OSM.park_explication_obj = function(f_obj){
	return {
		data : null,
		webData : null,
		geoNodes : null,
		geoJSON : null,
		layer : null,
		superPartGeoJSON : null,
		bbox: null
	};
};

L.OSM.park_explication = function(osm_obj_type, osm_obj_id, f_fin_ok){
	this.OsmGDlib = new OsmGeoDocLib();
	this.osm_obj_type = osm_obj_type;
	this.osm_obj_id =  osm_obj_id;
	this.f_fin_ok = f_fin_ok;
	this.logWikiMedia = false;
	this.get_data();
	this.osm = {};
	this.osm.data = JSON.parse('{	"leaf_type":{		"broadleaved":{			"ru" : "Широколиственная",			"color" : "#8DB600"		},		"needleleaved":{			"ru" : "Хвойная",			"color" : "#397262"		},		"mixed":{			"ru" : "Смешанный",			"color" : "#888888"		},		"leafless":{			"ru" : "Безлистная",			"color" : "#000000"		},		"null":{			"ru" : "?",			"color" : "#ffff00"		}	},	"leaf_cycle":{		"evergreen":{			"ru" : "Вечнозелёные",			"color" : "#397262"		},		"deciduous":{			"ru" : "Листопадные",			"color" : "#8DB600"		},		"semi_evergreen":{			"ru" : "Полулистопадные",			"color" : "#00ffa0"		},		"semi_deciduous":{			"ru" : "С коротким безлиственным периодом",			"color" : "#476300"		},		"mixed":{			"ru" : "смешанные",			"color" : "#888888"		},		"null":{			"ru" : "?",			"color" : "#ffff00"		}	},	"natural":{		"wood" : "Древесная посадка",		"tree" : "Отдельное дерево",		"tree_row" : "Ряд деревьев",		"scrub" : "Кусты",		"null" : "?"	},	"water":{		"spring" : "Родник",		"pond" : "Водная гладь",		"river" : "Речка",		"stream" : "Ручей",		"drain" : "Сток",		"ditch" : "Канава",		"waterfall" : "Водопад",		"weir" : "Плотина",		"riverbank" : "Большая река",		"fountain" : "Фонтан",		"wetland" : "Болото",		"null" : "?"	},	"highway":{		"path" : "Тропинка",		"footway" : "Дорожка",		"footpath" : "Дорожка",		"service" : "Проезжая дорога",		"track" : "Парковая дорога",		"steps" : "Лестница",		"pedestrian" : "Пешеходная улица",		"null" : "?"	},	"surface":{		"dirt" : "Грязь",		"ground" : "Земля",		"unpaved" : "Земля",		"compacted" : "Утрамбовано",		"tiles" : "Плитка",		"paving_stones" : "Мощение",		"asphalt" : "Асфальт",		"gravel" : "Гравий",		"paved" : "Твёрдое",		"wood" : "Дерево",		"metal" : "Металл",		"pebblestone" : "Галька",		"fine_gravel" : "Камнегравийный слой",		"grass" : "Трава",		"null" : ""	},	"surface_color":{		"dirt" : "#9b7653",		"ground" : "#9b76ff",		"compacted" : "#442d25",		"tiles" : "#303030",		"paving_stones" : "#774444",		"asphalt" : "#444444",		"gravel" : "yellow",		"paved" : "#111111",		"wood" : "#0a5F38",		"pebblestone" : "#888888",		"fine_gravel" : "#f8f32b",		"grass" : "#8DB600",		"null" : "red"	},	"leisure": {		"pitch" : "Спортивная площадка",		"playground" : "Игровая площадка",		"dog_park" : "Собачья площадка"	},	"sport": {		"fitness" : "фитнес",		"table_tennis" : "настольный тенис"	},	"artwork":{		"sculpture" : "скульптура"	},	"material":{		"wood" : "дерево",		"metal" : "металл",		"stone" : "камень",		"marble" : "мрамор",		"glass" : "стекло",		"steel" : "сталь",		"concrete" : "заливной бетон"	},	"artwork_type":{		"sculpture" : "скульптура",		"statue" : "статуя",		"painting" : "живописное",		"mosaic" : "мозаика",		"mural" : "фреска",		"architecture" : "архитектурный объект",		"installation" : "инсталляция"	},	"source_taxon":{		"board" : "Щит с описанием",		"survey" : "Осмотр",		"label" : "Бирка на саженцах",		"null" : "нет"	},	"information":{		"board" : "Щит с описанием",		"office" : "Cправочная служба",		"terminal" : "Терминал информационной системы",		"audioguide" : "Аудиогид",		"map" : "Карта или план",		"tactile_map" : "Тактильная карта",		"tactile_model" : "Тактильная модель",		"guidepost" : "Указатель направлений",		"trail_blaze" : "Маршрутная метка или табличка",		"route_marker" : "Маршрутная метка или табличка"	},	"board_type":{		"geology" : "о геологии",		"history" : "об истории",		"nature" : "о природе или климате",		"plants" : "о растительности",		"notice" : "о мероприятиях",		"wildlife" : "о животном мире",		"null" : "не указан"	},	"source_direction":{		"isoline" : "Пересекает изолинию или видимый наклон",		"survey" : "Осмотр, зафиксировано направление течения",		"null" : "нет"	},	"building":{		"yes": "Здание общего типа",		"shed": "Вспомогательная постройка",		"farm_auxiliary": "Сельскохозяйственное здание",		"roof": "Навес",		"kiosk": "Будка",		"cabin": "Кабина",		"null": "не указан"	}}');
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
		this.osm_main_obj_xml = osm_main_obj_xml;
		var main_osm_obj =  (this.osm_obj_type == 'relation') ? this.OsmGDlib.osmRelationGeoJson(osm_main_obj_xml, this.osm_obj_id) : ((this.osm_obj_type == 'way') ? this.OsmGDlib.osmWayGeoJson(osm_main_obj_xml, this.osm_obj_id) : null);
		if (!main_osm_obj)
		{
			alert("Основной объект OSM не указан");
			return;
		}
		this.main_osm_obj = main_osm_obj.features[0];
		var t = this.main_osm_obj.tags;
		if (t && t.wikidata)
		{
			var wikiDataQ = t.wikidata;
			console.log('OSM: WikiData - ' + wikiDataQ);
		}

		if (this.getWikiData)
			this.getWikiData(t ? t.wikidata : null);
		var xhr = new XMLHttpRequest();
		xhr.url = 'https://overpass-api.de/api/interpreter?data=[out:xml];(relation(' + this.osm_obj_id +'););map_to_area;(nwr(area);>;<;);out+meta;';
		xhr.open('GET', xhr.url, true);
		xhr.ini_obj = this;
		xhr.send();
		xhr.onreadystatechange = function () {
			if (xhr.readyState != 4) return;
			if (xhr.status != 200 && (xhr.status != 0 || xhr.response)) {
				alert("Ошибка БД OSM! " + xhr.url);
			} else {
				if (typeof (xhr.ini_obj.f_fin_ok) == 'function')
				{
					log('Внутренние данные парка получены, выделяем участки ');
					var xml = xhr.responseXML;
					xhr.ini_obj.geoJsonGeneral = osmtogeojson(xml);
					xhr.ini_obj.f_fin_ok(xhr.ini_obj);
				}
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
				log('Данные по контуру парка получены, ожидаем внутренние объекты ... ');
				xhr.ini_obj.getAllgeoData(xhr.responseXML);
				return;
			}
			console.log (xhr.status);
		}
	};

	L.OSM.park_explication.prototype.map = function (div, map_prov, map_params, context) {
		var cen = context.OsmGDlib.γεωμετρία.centroid(context.main_osm_obj);
		var md = new mapDiv(
			div,
			cen,
			map_prov.tileLayers,
			map_prov.Names,
			{
				ini: 14,
				min: 8,
				max: 22
			},
			true,
			map_params
		);
		var n = context.main_osm_obj.properties.tags.name;
		var mr = L.geoJSON(context.main_osm_obj, { fillOpacity: 0, color: "#F2872F" });
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
		explicationScriptBlocks,
		explicationDataProcess,
		mapDivIni,
		layerOutputFunc
	) {
		this.mapDivIni = mapDivIni;
		this.layerOutputFunc = layerOutputFunc;
		this.map_params = map_params;
		log('Данные по участкам готовы, фильтруем по датам и окрестностям');
		var hronofiltr = map_params.start_date ?? null;
		// this.exportJSON(this.geoJsonGeneral, "1");
		console.log(Object.keys(this.geoJsonGeneral.features).length);
		var del = [];
		var main_bbox = this.OsmGDlib.γεωμετρία.bbox(this.main_osm_obj);

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
					del.push(osmGeoJSON_obj);
				console.log(min_date + " " + max_date + " " + osmGeoJSON_obj.properties.tags['start_date']);
			}
			var f_bbox = this.OsmGDlib.γεωμετρία.bbox(osmGeoJSON_obj);
			if (! this.OsmGDlib.γεωμετρία.bboxIntersect(main_bbox, f_bbox))
				del.push(osmGeoJSON_obj);
		}
		
		for (var i_d in del) {
			var d = del[i_d];
			for (var i_f in this.geoJsonGeneral.features) {
				var f = this.geoJsonGeneral.features[i_f];
				if (d == f) {
					this.geoJsonGeneral.features.splice(i_f, 1);
					break;
				}
			}
		}

		log('Отфильтровано по времени появления ' + Object.keys(this.geoJsonGeneral.features).length + ' объектов, выявляем на каких участках объекты ');

		this.block = {};
		for (var oi in explicationScriptBlocks) {
			this.block[oi] = new L.OSM.park_explication_block(explicationScriptBlocks[oi]);
		}		
		for (var i in this.geoJsonGeneral.features) {
			var osmGeoJSON_obj = this.geoJsonGeneral.features[i];

   			// Проход по всем блокам для фильтрации объекта и определения принадлежности к участку
			for (var oi in this.block) {
				block = this.block[oi];
				if (block.f_obj.filter(this, osmGeoJSON_obj)) {
					var eo = new L.OSM.park_explication_obj();
					eo.geoJSON = osmGeoJSON_obj;
					eo.bbox = this.OsmGDlib.γεωμετρία.bbox(osmGeoJSON_obj);
					eo.geoNodes = geoNd;
					var sP = null;
					if (участки.length > 0)
					{
						// К какому участку относится объект
						var уч_geoJson = []; // Перечень участков, которым принадлежат точки данного объекта
						// Предварительный проход					
						for (var i_u in участки) {
							var polyg = участки[i_u];
							if (! this.OsmGDlib.γεωμετρία.bboxIntersect(polyg.bbox, eo.bbox))
								continue;
							var geoNd = this.OsmGDlib.γεωμετρία.geo_nodes(osmGeoJSON_obj);
							for (var i_n in geoNd) {
								if (this.OsmGDlib.γεωμετρία.booleanPointInPolygon(
										geoNd[i_n],
										polyg,
										{ ignoreBoundary: true })
									)
								уч_geoJson.push(polyg);
							}
						}
						var SPGJ = уч_geoJson.filter(
							function (value, index, self) {	return self.indexOf(value) === index; }
							);
						eo.superPartGeoJSON = SPGJ;
						sP = (SPGJ.length == 1) ? superPart(SPGJ) : null;
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
		log('Участки для объектов выяснены, проверяем принадлежность');
		for (var i in участки) {
			var osmGeoJSON_obj = участки[i];

			var geoNd = this.OsmGDlib.γεωμετρία.geo_nodes(osmGeoJSON_obj);
			var ok = false;
			for (var j_n in geoNd) {
				ok = ok || (this.OsmGDlib.γεωμετρία.booleanPointInPolygon(geoNd[j_n], this.main_osm_obj, { ignoreBoundary: true }));
			}
			var block = this.block['Участки'];

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
				var act = block.f_obj.interactive(this, oi, eo.webData, eo);

				var st = block.f_obj.geoJSON_style(this, gj, data);
				var l = L.geoJSON(eo.geoJSON, {
					style: st,
					pointToLayer: function(feature, latlng) {
						return L.circleMarker(latlng, { radius: 4, weight: 3 });
					}
				});

				if (eo.geoJSON.properties.showTextLabel)
					l.setText(st.text, st.textStyle);
				if (act.popup){
					l.bindPopup(act.popup);
					l.on('click', l.openPopup);
				}
				if (act.tooltip){
					l.bindTooltip(act.tooltip, { sticky: true });
				}
				eo.layer = l;
				block.layerGroup.addLayer(l);
			}
		}
	 	log('Отрисовка данных подготовлена');

		if (this.main_osm_obj.properties.tags.name == 'Бирюлёвский дендропарк'){
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

		var t1 = new Date().getTime();
		document.getElementById('note').innerText = 'Сформировано за ' + (t1 - t0) / 1000 + ' сек.';
		document.getElementById('status').innerText = '';

		var mapDivFunc = this.mapDivIni ?? L.OSM.park_explication.prototype.map;
		this.md = mapDivFunc(
			document.getElementById('map'),
			{
				tileLayers: L_mapLayer,
				Names: L_mapNames
			},
			this.map_params,
			this
		);

		if (this.addWikiCommonsLayer)
			this.addWikiCommonsLayer();

		if (!this.layerOutputFunc) {
			// Вывод всех слоёв на карту по группам
			for (var oi in this.block) {
				var block = this.block[oi];
				var full = new L.LayerGroup();
				full.addLayer(block.layerGroup);
				full.addLayer(block.textLayers);
				this.md.Control.addOverlay(full, oi.replaceAll('_', ' '));
				if (this.map_params.obj && this.map_params.obj == oi)
				{
					block.layerGroup.addTo(this.md.map);
					block.textLayers.addTo(this.md.map);					
				}
			}
		}
		else
		{
			this.layerOutputFunc(this);
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
		log('Экспликация показана ');
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
			this.md.map.fitBounds(l.getBounds(), {max: 18});
		}
	};

		L.OSM.park_explication.exportJSON = function (exportObj, exportFile){
			 var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
			 var specialNode = document.createElement('a');
			 specialNode.setAttribute("href",	  dataStr);
			 specialNode.setAttribute("download", exportFile + ".json");
			 document.body.appendChild(specialNode); // required for firefox
			 specialNode.click();
			 specialNode.remove();
		};
		L.OSM.park_explication.exportSQL = function (exportObj, tableName, exportFile){
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
	function degr60(c60){
		var degree = Math.floor(c60);
		var rawMinute = Math.abs((c60 % 1) * 60);		
		var minute = Math.floor(rawMinute);
		var  second = Math.floor(Math.round((rawMinute % 1) * 60));
		return degree + '°' + minute + '′' + second + '″';
	}
	this.map.on('mousemove', function(e) {
		if (!document.getElementById('coordpanel'))
			return;

		var x = Math.floor(e.layerPoint.x);
		var y = Math.floor(e.layerPoint.y);

		var zoom = this.getZoom();
		var z_px = 1 << zoom + 8;
		var ltrad = e.latlng.lat * Math.PI / 180;
		var xabsf = (e.latlng.lng + 180) / 360;
		var yabsf = (1 - Math.log(Math.tan(ltrad) + 1 / Math.cos(ltrad)) / Math.PI) / 2;
		var xabs = Math.floor(xabsf * z_px);
		var yabs = Math.floor(yabsf * z_px);
		
	    document.getElementById('rx').innerHTML = "&nbspx " + x;
    	document.getElementById('ry').innerHTML = "&nbspy " + y;
	    document.getElementById('px').innerHTML = "&nbspx₀ " + xabs;
    	document.getElementById('py').innerHTML = "&nbspy₀ " + yabs;
	    document.getElementById('tx').innerHTML = "&nbspx□ " + (xabs >> 8);
    	document.getElementById('ty').innerHTML = "&nbspy□ " + (yabs >> 8);
	    document.getElementById('lat').innerHTML = "&nbspφ " + e.latlng.lat.toFixed(5);
	    document.getElementById('lon').innerHTML = "&nbspλ " + e.latlng.lng.toFixed(5);
	    document.getElementById('lat_60').innerHTML = "&nbspφ " + degr60(e.latlng.lat);
	    document.getElementById('lon_60').innerHTML = "&nbspλ " + degr60(e.latlng.lng);
	});
	this.map.on('dblclick', function(e) {
		var x = Math.floor(e.layerPoint.x);
		var y = Math.floor(e.layerPoint.y);
		var zoom = this.getZoom();
		var ltrad = e.latlng.lat * Math.PI / 180;
		var q = 1 << zoom + 8;
		let xabs = Math.floor((e.latlng.lng + 180) / 360 * q);
		let yabs = Math.floor((1 - Math.log(Math.tan(ltrad) + 1 / Math.cos(ltrad)) / Math.PI) / 2 * q);
	    var coord_obj = {
		    "xabs" : xabs,
	    	"yabs" : yabs,
			"φ" : e.latlng.lat,
		    "λ" : e.latlng.lng,
		    "φ60" : degr60(e.latlng.lat),
		    "λ60" : degr60(e.latlng.lng),
		    "z" : zoom
	    };
		L.OSM.park_explication.exportJSON (coord_obj, 'φλ');
	});
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
