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
			log('OSM: WikiData - ' + wikiDataQ);
		}
		var gJs = L.geoJSON(mr);
		if (this.getWikiData)
			this.getWikiData(t ? t.wikidata : null);
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

	L.OSM.park_explication.prototype.map = function (div, map_prov, map_params) {
		var mrg = this.general_rel_geoJson(this.geoJsonGeneral);
		var cen = turf_centroid(mrg);
		var md = new mapDiv(
			div,
			cen,
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
				if (this.OsmGDlib.γεωμετρία.booleanPointInPolygon(geoNd[j_n], main_rel, { ignoreBoundary: true }));
				{
					ok = true;
					break;
				}
			}

			function uniq(value, index, self) {
				return self.indexOf(value) === index;
			}

   			// Проход по всем блокам для фильтрации объекта и определения принадлежности к участку
			for (var oi in this.block) {
				block = this.block[oi];
				if (ok && block.f_obj.filter(this, osmGeoJSON_obj)) {
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
							for (var i_n in geoNd) {
								if (this.OsmGDlib.γεωμετρία.booleanPointInPolygon(
										geoNd[i_n],
										polyg,
										{ ignoreBoundary: true })
								    )
								уч_geoJson.push(polyg);
							}
						}
						var SPGJ = уч_geoJson.filter(uniq)
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

				if (eo.geoJSON.properties.showDirection)
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

		if (this.addWikiCommonsLayer)
			this.addWikiCommonsLayer();
		// Вывод всех слоёв на карту по группам
		for (var oi in this.block) {
			var block = this.block[oi];
			var full = new L.LayerGroup();
			full.addLayer(block.layerGroup);
			full.addLayer(block.textLayers);
			this.md.Control.addOverlay(full, oi.replaceAll('_', ' '));
			if (map_params.obj && map_params.obj == oi)
			{
				block.layerGroup.addTo(this.md.map);
				block.textLayers.addTo(this.md.map);					
			}
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

function turf_centroid(geojson) {
    var xSum = 0;
    var ySum = 0;
    var len = 0;
    turf_coordEach(geojson, function (coord) {
        xSum += coord[0];
        ySum += coord[1];
        len++;
    }, true);
    return [ySum / len, xSum / len];
}

/**
 * Iterate over coordinates in any GeoJSON object, similar to Array.forEach()
 *
 * @name coordEach
 * @param {FeatureCollection|Feature|Geometry} geojson any GeoJSON object
 * @param {Function} callback a method that takes (currentCoord, coordIndex, featureIndex, multiFeatureIndex)
 * @param {boolean} [excludeWrapCoord=false] whether or not to include the final coordinate of LinearRings that wraps the ring in its iteration.
 * @returns {void}
 * @example
 * var features = turf.featureCollection([
 *   turf.point([26, 37], {"foo": "bar"}),
 *   turf.point([36, 53], {"hello": "world"})
 * ]);
 *
 * turf.coordEach(features, function (currentCoord, coordIndex, featureIndex, multiFeatureIndex, geometryIndex) {
 *   //=currentCoord
 *   //=coordIndex
 *   //=featureIndex
 *   //=multiFeatureIndex
 *   //=geometryIndex
 * });
 */
function turf_coordEach(geojson, callback, excludeWrapCoord) {
  // Handles null Geometry -- Skips this GeoJSON
  if (geojson === null) return;
  var j,
    k,
    l,
    geometry,
    stopG,
    coords,
    geometryMaybeCollection,
    wrapShrink = 0,
    coordIndex = 0,
    isGeometryCollection,
    type = geojson.type,
    isFeatureCollection = type === "FeatureCollection",
    isFeature = type === "Feature",
    stop = isFeatureCollection ? geojson.features.length : 1;

  // This logic may look a little weird. The reason why it is that way
  // is because it's trying to be fast. GeoJSON supports multiple kinds
  // of objects at its root: FeatureCollection, Features, Geometries.
  // This function has the responsibility of handling all of them, and that
  // means that some of the `for` loops you see below actually just don't apply
  // to certain inputs. For instance, if you give this just a
  // Point geometry, then both loops are short-circuited and all we do
  // is gradually rename the input until it's called 'geometry'.
  //
  // This also aims to allocate as few resources as possible: just a
  // few numbers and booleans, rather than any temporary arrays as would
  // be required with the normalization approach.
  for (var featureIndex = 0; featureIndex < stop; featureIndex++) {
    geometryMaybeCollection = isFeatureCollection
      ? geojson.features[featureIndex].geometry
      : isFeature
      ? geojson.geometry
      : geojson;
    isGeometryCollection = geometryMaybeCollection
      ? geometryMaybeCollection.type === "GeometryCollection"
      : false;
    stopG = isGeometryCollection
      ? geometryMaybeCollection.geometries.length
      : 1;

    for (var geomIndex = 0; geomIndex < stopG; geomIndex++) {
      var multiFeatureIndex = 0;
      var geometryIndex = 0;
      geometry = isGeometryCollection
        ? geometryMaybeCollection.geometries[geomIndex]
        : geometryMaybeCollection;

      // Handles null Geometry -- Skips this geometry
      if (geometry === null) continue;
      coords = geometry.coordinates;
      var geomType = geometry.type;

      wrapShrink =
        excludeWrapCoord &&
        (geomType === "Polygon" || geomType === "MultiPolygon")
          ? 1
          : 0;

      switch (geomType) {
        case null:
          break;
        case "Point":
          if (
            callback(
              coords,
              coordIndex,
              featureIndex,
              multiFeatureIndex,
              geometryIndex
            ) === false
          )
            return false;
          coordIndex++;
          multiFeatureIndex++;
          break;
        case "LineString":
        case "MultiPoint":
          for (j = 0; j < coords.length; j++) {
            if (
              callback(
                coords[j],
                coordIndex,
                featureIndex,
                multiFeatureIndex,
                geometryIndex
              ) === false
            )
              return false;
            coordIndex++;
            if (geomType === "MultiPoint") multiFeatureIndex++;
          }
          if (geomType === "LineString") multiFeatureIndex++;
          break;
        case "Polygon":
        case "MultiLineString":
          for (j = 0; j < coords.length; j++) {
            for (k = 0; k < coords[j].length - wrapShrink; k++) {
              if (
                callback(
                  coords[j][k],
                  coordIndex,
                  featureIndex,
                  multiFeatureIndex,
                  geometryIndex
                ) === false
              )
                return false;
              coordIndex++;
            }
            if (geomType === "MultiLineString") multiFeatureIndex++;
            if (geomType === "Polygon") geometryIndex++;
          }
          if (geomType === "Polygon") multiFeatureIndex++;
          break;
        case "MultiPolygon":
          for (j = 0; j < coords.length; j++) {
            geometryIndex = 0;
            for (k = 0; k < coords[j].length; k++) {
              for (l = 0; l < coords[j][k].length - wrapShrink; l++) {
                if (
                  callback(
                    coords[j][k][l],
                    coordIndex,
                    featureIndex,
                    multiFeatureIndex,
                    geometryIndex
                  ) === false
                )
                  return false;
                coordIndex++;
              }
              geometryIndex++;
            }
            multiFeatureIndex++;
          }
          break;
        case "GeometryCollection":
          for (j = 0; j < geometry.geometries.length; j++)
            if (
              coordEach(geometry.geometries[j], callback, excludeWrapCoord) ===
              false
            )
              return false;
          break;
        default:
          throw new Error("Unknown Geometry Type");
      }
    }
  }
}
