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

L.OSM.park_explication = function(osm_relation_id, f_fin_ok){
	this.OsmGDlib = new OsmGeoDocLib();
	this.osm_relation_id = osm_relation_id;
	this.f_fin_ok = f_fin_ok;
	this.get_data();
	var xhttp = new XMLHttpRequest();
	xhttp.__ = this;
	xhttp.onreadystatechange = function() {
	    if (this.readyState == 4 && this.status == 200) {
			this.__.osm = { data : JSON.parse(this.responseText)};
	    }
	};
	xhttp.open("GET", "osmdata.json", true);
	xhttp.setRequestHeader('Content-Type', 'application/json');
	xhttp.send();
};

	L.OSM.park_explication.prototype.getAllgeoData = function (osm_main_rel_xml) {
		var mr = this.OsmGDlib.osmRelationGeoJson(osm_main_rel_xml, this.osm_relation_id);
		var gJs = L.geoJSON(mr);

		var xhr = new XMLHttpRequest();
		xhr.url = 'https://www.openstreetmap.org/api/0.6/map?bbox=' + gJs.getBounds().toBBoxString();
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
		xhr = new XMLHttpRequest();
		xhr.url = this.OsmGDlib.OSM_URL('relation', this.osm_relation_id, 'full');
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
			if (el.properties.id == this.osm_relation_id)
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
					// К какому участку относится объект
					var SPGJ = nd_superParts(geoNd, участки, this); // К какому участку относится объект
					eo.superPartGeoJSON = SPGJ;
					var sP = (SPGJ.length == 1) ? superPart(SPGJ) : null;
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
				var l = L.geoJSON(eo.geoJSON, st);
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

		document.getElementById('status').innerText = '';
		var t1 = new Date().getTime();
		document.getElementById('note').innerText = 'Сформировано за ' + (t1 - t0) / 1000 + ' сек.';

		this.md = this.map(
			document.getElementById('map'),
			{
				tileLayers: L_mapLayer,
				Names: L_mapNames
			},
			map_params
		);
		// Вывод всех слоёв на карту по группам
		for (var oi in this.block) {
			var block = this.block[oi];
			this.md.Control.addOverlay(block.layerGroup, oi.replaceAll('_', ' '));
				if (map_params.obj && map_params.obj == oi)
					block.layerGroup.addTo(this.md.map);				
		}
		this.md.Control.expand();
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
		return (typeof prov === 'string') ? L.tileLayer.provider(prov) : prov;		
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
  	this.ini_layer = TileLayers[map_params.tile ?? 0] ?? TileLayers[0];
	if (controls) {
		this.Control = new L.Control.Layers();
		for (var i in TileLayers){
			var provStr = providerName[i] ?? ((typeof prov === 'string') ? prov : '?');
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
