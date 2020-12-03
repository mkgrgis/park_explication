explication = {};

explication.get_data = function (osm_relation_id, fin_ok) {
	var xhr = new XMLHttpRequest();
	xhr.url = geoAlb_lib.OSM_URL('relation', osm_relation_id, 'full');
	xhr.osm_relation_id = osm_relation_id;
	xhr.open('GET', xhr.url, true);
	xhr.send();
	xhr.onreadystatechange = function () {
		if (xhr.readyState != 4) return;
		if (xhr.status != 200 && (xhr.status != 0 || xhr.response)) {
			alert("Ошибка БД OSM! " + xhr.url);
			return;
		}
		if (xhr.status == 200){
			log('Данные по контуру получены ');
			explication.getAllgeoData(xhr.responseXML, xhr.osm_relation_id, fin_ok);
			return;
		}
		console.log (xhr.status);
	}
}

// По образу главного отношения заполняет карту нужного типа в элементе div
explication.map = function (div, geoJsonGeneral, map_prov, map_params) {
	var cen = geoJsonGeneral.features[0].geometry.coordinates[0][0];
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
	var mrg = explication.main_rel(geoJsonGeneral);
	var n = mrg.properties.tags.name;
	var mr = L.geoJSON(mrg, { fillOpacity: 0, color: "#F2872F" });
	md.map.fitBounds(mr.getBounds());
	md.Control.addOverlay(mr, n);
	md.map.addLayer(mr); 
	return md;
}

explication.getAllgeoData = function (osm_main_rel_xml, osm_main_rel_id, f_ok) {
	var mr = geoAlb_lib.osmRelationGeoJson(osm_main_rel_xml, osm_main_rel_id);
	var gJs = L.geoJSON(mr);

	var xhr = new XMLHttpRequest();
	xhr.url = 'https://www.openstreetmap.org/api/0.6/map?bbox=' + gJs.getBounds().toBBoxString();
	xhr.open('GET', xhr.url, true);
	xhr.osm_relation_id = osm_main_rel_id;
	xhr.send();
	xhr.onreadystatechange = function () {
		if (xhr.readyState != 4) return;
		if (xhr.status != 200 && (xhr.status != 0 || xhr.response)) {
			alert("Ошибка БД OSM! " + xhr.url);
		} else {
			if (typeof (f_ok) == 'function')
				f_ok(xhr);
		}
	}
}

// Выделение основного отношения из массива geoJSON
explication.main_rel = function (geoJsonGeneral) {
	if (!geoJsonGeneral.osm_relation_id)
		throw (".osm_relation_id !");
	for (var i in geoJsonGeneral.features) {
		var el = geoJsonGeneral.features[i];
		if (el.properties.id == geoJsonGeneral.osm_relation_id)
			return el;
	}
	return null;
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
		TileLayers.add(L_TileSource(provider));
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

// БЛОК ГЕОМЕТРИИ
explication.γεωμετρία = {};

// БЛОК ВЫЧИСЛЕНИЯ ДЛИНЫ
explication.γεωμετρία.len = function (geometry) {
	if (geometry.type === 'LineString')
		return geoJSON_len(geometry.coordinates);
	else if (geometry.type === 'MultiLineString')
		return geometry.coordinates.reduce(function (memo, coordinates) {
			return memo + geoJSON_len(coordinates);
		}, 0);
	else
		return null;

	function geoJSON_len(lineString) {
		if (lineString.length < 2)
			return 0;
		var result = 0;
		for (var i = 1; i < lineString.length; i++)
			result += distance(lineString[i - 1][0], lineString[i - 1][1],
				lineString[i][0], lineString[i][1]);
		return result;
	}

	/**
	 * Calculate the approximate distance between two coordinates (lat/lon)
	 *
	 * © Chris Veness, MIT-licensed,
	 * http://www.movable-type.co.uk/scripts/latlong.html#equirectangular
	 */
	function distance(λ1, φ1, λ2, φ2) {
		var R = 6371000;
		var Δλ = (λ2 - λ1) * Math.PI / 180;
		φ1 = φ1 * Math.PI / 180;
		φ2 = φ2 * Math.PI / 180;
		var x = Δλ * Math.cos((φ1 + φ2) / 2);
		var y = (φ2 - φ1);
		var d = Math.sqrt(x * x + y * y);
		return R * d;
	};
}

// БЛОК ВЫЧИСЛЕНИЯ ПЛОЩАДИ
explication.γεωμετρία.sqf = function (_) {
	var area = 0, i;
	switch (_.type) {
		case 'LineString':
		case 'MultiLineString':
		case 'Polygon':
			return polygonArea(_.coordinates);
		case 'MultiPolygon':
			for (i = 0; i < _.coordinates.length; i++) {
				area += polygonArea(_.coordinates[i]);
			}
			return area;
		case 'Point':
			return 0;
		case 'GeometryCollection':
			for (i = 0; i < _.geometries.length; i++) {
				area += explication.γεωμετρία.sqf(_.geometries[i]);
			}
			return area;
	}

	function polygonArea(coords) {
		var area = 0;
		if (coords && coords.length > 0) {
			area += Math.abs(ringArea(coords[0]));
			for (var i = 1; i < coords.length; i++) {
				area -= Math.abs(ringArea(coords[i]));
			}
		}
		return area;
	}

	/**
	 * Calculate the approximate area of the polygon were it projected onto
	 *	 the earth.  Note that this area will be positive if ring is oriented
	 *	 clockwise, otherwise it will be negative.
	 *
	 * Reference:
	 * Robert. G. Chamberlain and William H. Duquette, "Some Algorithms for
	 *	 Polygons on a Sphere", JPL Publication 07-03, Jet Propulsion
	 *	 Laboratory, Pasadena, CA, June 2007 http://trs-new.jpl.nasa.gov/dspace/handle/2014/40409
	 *
	 * Returns:
	 * {float} The approximate signed geodesic area of the polygon in square
	 *	 meters.
	 */

	function ringArea(coords) {
		var p1, p2, p3, lowerIndex, middleIndex, upperIndex, i,
			area = 0,
			coordsLength = coords.length;

		var wgs84 = {};
		wgs84.RADIUS = 6378137;
		wgs84.FLATTENING_DENOM = 298.257223563
		wgs84.FLATTENING = 1 / wgs84.FLATTENING_DENOM.FLATTENING_DENOM;
		wgs84.POLAR_RADIUS = wgs84.RADIUS * (1 - wgs84.FLATTENING);

		if (coordsLength > 2) {
			for (i = 0; i < coordsLength; i++) {
				if (i === coordsLength - 2) {// i = N-2
					lowerIndex = coordsLength - 2;
					middleIndex = coordsLength - 1;
					upperIndex = 0;
				} else if (i === coordsLength - 1) {// i = N-1
					lowerIndex = coordsLength - 1;
					middleIndex = 0;
					upperIndex = 1;
				} else { // i = 0 to N-3
					lowerIndex = i;
					middleIndex = i + 1;
					upperIndex = i + 2;
				}
				p1 = coords[lowerIndex];
				p2 = coords[middleIndex];
				p3 = coords[upperIndex];
				area += (rad(p3[0]) - rad(p1[0])) * Math.sin(rad(p2[1]));
			}

			area = area * wgs84.RADIUS * wgs84.RADIUS / 2;
		}
		return area;
	}

	function rad(_) {
		return _ * Math.PI / 180;
	}
}

////// БЛОК ГЕОМЕТРИЧЕСКОГО АНАЛИЗА ///////
explication.γεωμετρία.geo_nodes = function (geoJSONel) {
	var nd = [];
	var g = geoJSONel.geometry;
	if (g.type == 'Point') {
		nd.push(g.coordinates);
		return nd;
	}
	if (g.type == 'LineString' || g.type == 'MultiPoint')
		return g.coordinates;
	if (g.type == 'Polygon' || g.type == 'MultiLineString') {
		for (var i in g.coordinates) {
			Array.prototype.push.apply(nd, g.coordinates[i]);
		}
		return nd;
	}
	if (g.type == 'MultiPolygon') {
		for (var i in g.coordinates) {
			var ci = g.coordinates[i];
			for (var j in ci) {
				Array.prototype.push.apply(nd, ci[j]);
			}
		}
		return nd;
	}
	return null;
}

// Блок геометрического анализа из библиотеки https://turfjs.org/docs/
explication.γεωμετρία.booleanPointInPolygon = function (point, polygon, options) {
	function inRing(pt, ring, ignoreBoundary) {
		var isInside = false;
		if (ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]) ring = ring.slice(0, ring.length - 1);

		for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
			var xi = ring[i][0], yi = ring[i][1];
			var xj = ring[j][0], yj = ring[j][1];
			var onBoundary = (pt[1] * (xi - xj) + yi * (xj - pt[0]) + yj * (pt[0] - xi) === 0) &&
				((xi - pt[0]) * (xj - pt[0]) <= 0) && ((yi - pt[1]) * (yj - pt[1]) <= 0);
			if (onBoundary)
				return !ignoreBoundary;
			var intersect = ((yi > pt[1]) !== (yj > pt[1])) &&
				(pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi);
			if (intersect) isInside = !isInside;
		}
		return isInside;
	}
	function getCoord(obj) {
		if (!obj) throw new Error('obj is required');

		var coordinates = getCoords(obj);

		// getCoord() must contain at least two numbers (Point)
		if (coordinates.length > 1 && isNumber(coordinates[0]) && isNumber(coordinates[1])) {
			return coordinates;
		} else {
			throw new Error('Coordinate is not a valid Point');
		}
	}
	function getCoords(obj) {
		if (!obj) throw new Error('obj is required');
		var coordinates;

		// Array of numbers
		if (obj.length) {
			coordinates = obj;

			// Geometry Object
		} else if (obj.coordinates) {
			coordinates = obj.coordinates;

			// Feature
		} else if (obj.geometry && obj.geometry.coordinates) {
			coordinates = obj.geometry.coordinates;
		}
		// Checks if coordinates contains a number
		if (coordinates) {
			containsNumber(coordinates);
			return coordinates;
		}
		throw new Error('No valid coordinates');
	}
	function containsNumber(coordinates) {
		if (coordinates.length > 1 && isNumber(coordinates[0]) && isNumber(coordinates[1])) {
			return true;
		}

		if (Array.isArray(coordinates[0]) && coordinates[0].length) {
			return containsNumber(coordinates[0]);
		}
		throw new Error('coordinates must only contain numbers');
	}

	function isNumber(num) {
		return !isNaN(num) && num !== null && !Array.isArray(num);
	}

	// Optional parameters
	options = options || {};
	if (typeof options !== 'object') throw new Error('options is invalid');
	var ignoreBoundary = options.ignoreBoundary;

	// validation
	if (!point) throw new Error('point is required');
	if (!polygon) throw new Error('polygon is required');

	var pt = getCoord(point);
	var polys = getCoords(polygon);
	var type = (polygon.geometry) ? polygon.geometry.type : polygon.type;
	var bbox = polygon.bbox;

	// Quick elimination if point is not inside bbox
	if (bbox && inBBox(pt, bbox) === false) return false;

	// normalize to multipolygon
	if (type === 'Polygon') polys = [polys];

	for (var i = 0, insidePoly = false; i < polys.length && !insidePoly; i++) {
		// check if it is in the outer ring first
		if (inRing(pt, polys[i][0], ignoreBoundary)) {
			var inHole = false;
			var k = 1;
			// check for the point in any of the holes
			while (k < polys[i].length && !inHole) {
				if (inRing(pt, polys[i][k], !ignoreBoundary)) {
					inHole = true;
				}
				k++;
			}
			if (!inHole) insidePoly = true;
		}
	}
	return insidePoly;
}

geoAlb_lib = {};

// Три типа ОСМ объектов - теги для разбора, части адреса, необходимость выборки внутренностей и название
geoAlb_lib.osm_tag = ['osm_nd_id', 'osm_w_id', 'osm_rl_id'];
geoAlb_lib.osm_type = ['node', 'way', 'relation'];
geoAlb_lib.osm_suff = ['', 'full', 'full'];
geoAlb_lib.osm_title = ['Точка', 'Линия', 'Отношение'];
// Теги, определяющие, что графический блок имеет географические координаты
geoAlb_lib.geoImageDivTags = ['lon', 'lat', ...geoAlb_lib.osm_tag, 'coordinates', 'flickr_id'/*, 'panoramio_id'*/];

geoAlb_lib.OSM_baseURL = 'https://www.openstreetmap.org'; // Хранилище ОСМ данных здесь
geoAlb_lib.OSM_API_URL = geoAlb_lib.OSM_baseURL + '/api/0.6/' //Выборка объектов отсюда;

// Формирует одрес ОСМ объекта
geoAlb_lib.OSM_URL = function (type, id, suff) {
	var _smod = (suff != '') ? '/' + suff : '';
	return geoAlb_lib.OSM_API_URL + type + '/' + id + _smod;
}

// Получает из документа ветвь отношения с данным кодом
geoAlb_lib.getRelationXmlTree = function (xml, osm_rl_id) {
	var relations = xml.getElementsByTagName('relation');
	for (var i = 0; i < relations.length; i++) {
		if (relations[i].getAttribute('id') == osm_rl_id)
			return relations[i];
	}
	return null;
};

// Удаляет точки из geoJSON отношения или линии
geoAlb_lib.geoJsonRemoveOsmNodes = function (geoJson) {
	for (var i = 0; i < geoJson.features.length; i++) {
		if (geoJson.features[i].geometry.type == 'Point') {
			geoJson.features.splice(i, 1);
			i--;
		}
	}
	return geoJson;
};

// Получает массив номеров отношений, содержащих подчинённые территории
geoAlb_lib.getSubAreas = function (xml, osm_rl_id) {
	var relXml = geoAlb_lib.getRelationXmlTree(xml, osm_rl_id);
	if (!relXml)
		return null;
	var subAreas = [];
	var members = relXml.getElementsByTagName('member');
	var j = 0;
	for (var i = 0; i < members.length; i++) {
		if (members[i].getAttribute('type') == 'relation' && members[i].getAttribute('role') == 'subarea')
			subAreas[j++] = members[i].getAttribute('ref');
	}
	return subAreas;
};

// Удаляет чужие полигоны из документа, оставляя собственный полигон заданного отношения
geoAlb_lib.geoJsonDecomposeSubAreas = function (geoJson, osm_rl_id) {
	var subrel = []; var j = 0;
	for (var i = 0; i < geoJson.features.length; i++) {
		if (geoJson.features[i].geometry.type.indexOf('Polygon') + 1)
			if (geoJson.features[i].id.indexOf('relation/') + 1) {
				if (geoJson.features[i].id != 'relation/' + osm_rl_id) {
					geoJson.features.splice(i--, 1);
				}
			}
			else // Полигоны от линий удаляем
				geoJson.features.splice(i--, 1);
	}
	return geoJson;
};

// Оставляет собственный полигон заданного отношения
geoAlb_lib.relationSelfPolygon = function (geoJson, osm_rl_id) {
	for (var i = 0; i < geoJson.features.length; i++) {
		if ((geoJson.features[i].geometry.type.indexOf('Polygon') + 1) &&
			(geoJson.features[i].id == 'relation/' + osm_rl_id))
			return i;
	}
	return null;
};

// Создание GeoJson из основного контура отношения, представленного в xml документе
geoAlb_lib.osmRelationGeoJson = function (xml, rel_id) {
	var geoJson0 = osmtogeojson(xml);
	var geoJson1 = geoAlb_lib.geoJsonRemoveOsmNodes(geoJson0);
	var geoJson2 = geoAlb_lib.geoJsonDecomposeSubAreas(geoJson1, rel_id);
	geoJson2.osm_rel_id = rel_id;
	return geoJson2;
};

explication.osm = {
	function_general: function (
	    geoJsonGeneral,
	    участки,
	    L_mapLayer,
	    L_mapNames,
	    map_params,
	    explicationDataProcess
	) {
		log('Получены исходные данные ');
		var hronofiltr = map_params.start_date ?? null;
		var main_rel = explication.main_rel(geoJsonGeneral);
		document.getElementById('obj_title').innerText = main_rel.properties.tags.name;

		for (var oi in explication.osm.object) {
			obj = explication.osm.object[oi];
			obj.data = [];
			obj.lGr = [];
		}

		for (var i in geoJsonGeneral.features) {
			var osmGeoJSON_obj = geoJsonGeneral.features[i];
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

			var nd = explication.γεωμετρία.geo_nodes(osmGeoJSON_obj);
			var ok = false;
			for (var i_n in nd) {
				ok = ok || (explication.γεωμετρία.booleanPointInPolygon(nd[i_n], main_rel, { ignoreBoundary: true }));
			}

			for (var oi in explication.osm.object) {
				obj = explication.osm.object[oi];
				if (ok && obj.filter(osmGeoJSON_obj)) {
					var data_obj = obj.data_object(osmGeoJSON_obj, участки);
					data_obj._osmGeoJSON_obj = osmGeoJSON_obj;
					obj.data.push(data_obj);
				}
			}
		}
				if (main_rel.properties.id == 5851116){
			explication.osm.привязка_указателей(explication.osm.object);
		} 

		// Сортировка и нумерация всех массивов для экспликации
		function No_(data_obj) {
			for (var i in data_obj) {
				data_obj[i].No = Number(i) + 1;
			}
		}
		for (var oi in explication.osm.object) {
			var obj = explication.osm.object[oi];
			if (obj.sort) {
				obj.data.sort(obj.sort);
			}
			No_(obj.data);
		}
		log('Данные отсортированы');
		// Подготовка стилей слоёв на карте
		for (var oi in explication.osm.object) {
			var obj = explication.osm.object[oi];
			for (var i in obj.data) {
				var data_obj = obj.data[i];
				obj.active(data_obj);
				explication.osm.l_osmGeoJSON_objData(
					data_obj._osmGeoJSON_obj,
					obj.geoJSON_style(data_obj._osmGeoJSON_obj, data_obj),
					data_obj,
					obj.lGr
				);
			}
		}
	 	log('Отрисовка данных подготовлена');

	 	if (typeof explicationDataProcess == "function"){
	 	    try {
	 		    explicationDataProcess(explication.osm.object);
	 		    } catch (e) {
	 		    console.log("explicationDataProcess ERR");
	 		    console.log(e);
	 		    }
        }
		
		log('Экспликация показана ');
		document.getElementById('status').innerText = '';
		var t1 = new Date().getTime();
		document.getElementById('note').innerText = 'Сформировано за ' + (t1 - t0) / 1000 + ' сек.';

		var md = explication.map(
			document.getElementById('map'),
			geoJsonGeneral,
			{
				tileLayers: L_mapLayer,
				Names: L_mapNames
			},
			map_params
		);
		// Вывод всех слоёв на карту по группам
		for (var oi in explication.osm.object) {
			var obj = explication.osm.object[oi];
			var ogroup = new L.LayerGroup(obj.lGr);
			md.Control.addOverlay(ogroup, oi.replaceAll('_', ' '));
				if (map_params.obj && map_params.obj == oi)
				ogroup.addTo(md.map);				
		}
		md.Control.expand();

		if (main_rel.properties.id == 5851116){
			explication.osm.сверка_маточных_площадок(explication.osm.object["Маточная_площадка"]);
			}
	}, // Конец основной алгоритмической ветви
	object: {
		Маточные_площадки: {
			filter: function (osmGeoJSON_obj) {
				var t = osmGeoJSON_obj.properties.tags;
				var ref = t['ref'];
				var ref_start = t['ref:start_date'];							  
				if (!ref)
					return false;
				var bar = t['barrier'];
				if (bar == 'gate')
					return false;
				var nt = t['natural'];
				if (nt != 'wood' && nt != 'scrub' && nt != 'tree_row' && nt != 'tree' && bar != 'hedge')
					return false;
				return true;
			},
			data_object: function (osmGeoJSON_obj, участки) {
				var nd = explication.γεωμετρία.geo_nodes(osmGeoJSON_obj);
				var Уч_geoJSON = explication.osm.γεωμετρία.Участок_всех_точек(nd, участки);
				var Уч = explication.osm.γεωμετρία.Участок(Уч_geoJSON);
				var t = osmGeoJSON_obj.properties.tags;

				var ref = t['ref'];
				var ref_start = t['ref:start_date'];
				var nt = t['natural'];
				if (t['barrier'] == 'hedge')
					nt = 'scurb';
				var stx =  t['source:taxon'];
				var stx1 = explication.osm.data.source_taxon[stx];
				stx = stx1 ? stx1 : (stx ? stx : null);
				var bio_lat = explication.osm.biolog_format({
					genus: t['genus'],
					spieces: t['spieces'],
					taxon: t['taxon'] ? t['taxon'] : t['was:taxon']
				});
				var bio_rus = explication.osm.biolog_format({
					genus: t['genus:ru'],
					spieces: t['spieces:ru'],
					taxon: t['taxon:ru'] ? t['taxon:ru'] : t['was:taxon:ru']
				});
				var note = t['note'];
				var start = t['start_date'];
				var descr = t['description'];
				var lc = t['leaf_cycle'];
				var lt = t['leaf_type'];
				lc = lc ? lc : null;
				lt = lt ? lt : null;
				nt = nt ? nt : null;
				var fm = t['fixme'];
				fm = fm ? fm : null;
				var sq = explication.γεωμετρία.sqf(osmGeoJSON_obj.geometry);
				sq = sq ? '≈' + sq.toFixed(1) + 'м²' : '';
				var sortNo = ref.replace(/\D+/g,"");
				sortNo = (sortNo.length == 1) ? ('0' + sortNo) : sortNo;
				var маточная_площадка = {
					No: null,
					Участок: Уч_geoJSON ? Уч_geoJSON.properties.tags.name : null,
					Год_учёта: ref_start ? ref_start : '',
					Номер_площадки: ref,
					Подтверждение_вида: stx,
					Род: bio_rus[0].genus ? bio_rus[0].genus : '',
					Вид: bio_rus[0].spieces ? (Array.isArray(bio_rus[0].spieces) ? bio_rus[0].spieces.join(' ') : bio_rus[0].spieces) : '',
					Genus: bio_lat[0].genus ? bio_lat[0].genus : '',
					Spieces: bio_lat[0].spieces ? (Array.isArray(bio_lat[0].spieces) ? bio_lat[0].spieces.join(' ') : bio_lat[0].spieces) : '',
					Род2: bio_rus[1] ? bio_rus[1].genus : '',
					Вид2: bio_rus[1] ? bio_rus[1].spieces.join(' ') : '',
					Genus2: bio_lat[1] ? bio_lat[1].genus : '',
					Spieces2: bio_lat[1] ? bio_lat[1].spieces.join(' ') : '',
					Тип: explication.osm.data.natural[nt] ?? null,
					Сезонность: explication.osm.data.leaf_cycle[lc].ru,
					Листва: explication.osm.data.leaf_type[lt].ru,
					Площадь: sq,
					Заметки: note ? note : null,
					Датировка: start ? start : '',
					Описание: descr ? descr : '',
					Вырублен: t['was:taxon'] ? '<span style="color: red"><b>Да</b></span>' : null,
					Нужно_доработать: fm ? '<span style="color: red">' + fm + '</span>' : null,
					Объект_OSM: explication.osm.href(osmGeoJSON_obj),
					Табличка: null,
					_Участок: Уч ? (Уч.length == 1 ? ('0' + Уч) : Уч) : null,
					_Код: sortNo,
					_geoJSON_Участка: Уч_geoJSON,
					_nd: nd,
					_ref: ref
				};
				return маточная_площадка;
			},
			active: function (маточная_площадка) {
				// маточная_площадка.На_Моск_Парках = "<a href='http://moscowparks.narod.ru/piptsar/birdend/" + мато	чная_площадка._Участок + "/" + norm(маточная_площадка.Номер_площадки.replace('*', '')) + ".htm'> площадка №" + мато	чная_площадка.Номер_площадки + "</a>";
				if (маточная_площадка._geoJSON_Участка) {
					маточная_площадка._tooltip = маточная_площадка.Участок + "×" + маточная_площадка.Номер_площадки + (маточная_площадка.Род ? (' : ' + маточная_площадка.Род + ' ' + маточная_площадка.Вид) : '');

					маточная_площадка._popup = explication.osm.popup(маточная_площадка, '<b>Учётная карточка</br>маточной площадки</b></br><i>№ в таблице экспликации</i> ');
					//var УчМоскПарки = "<a href='http://moscowparks.narod.ru/piptsar/birdend/" + маточная_площадка._Участок + "/'>Моск.Парки</a>";
					var УчOSM = "<a href='https://www.openstreetmap.org/" + маточная_площадка._geoJSON_Участка.id + "'>osm</a>";
					// маточная_площадка.Участок += ' <small>' + УчМоскПарки + " " + УчOSM + "</small>";
					//	маточная_площадка.Номер_площадки = маточная_площадка.На_Моск_Парках.replace('площадка №', '');
					//	delete маточная_площадка.На_Моск_Парках;
				}
			},
			geoJSON_style: function (osmGeoJSON_obj, маточная_площадка) {
				var S = {};
				if (маточная_площадка.Тип == 'Кусты')
					S.weight = 1;
				else if (маточная_площадка.Тип == '?')
					S.weight = 2;
				else
					S.weight = 2;

				var lc = osmGeoJSON_obj.properties.tags['leaf_cycle'];
				var lt = osmGeoJSON_obj.properties.tags['leaf_type'];
				if (explication.osm.data.leaf_type[lt])
					S.color = explication.osm.data.leaf_type[lt].color;
				else
					S.color = "#88FF88";
				if (explication.osm.data.leaf_cycle[lc])
					S.fillColor = explication.osm.data.leaf_cycle[lc].color;
				else
					S.fillColor = "#88FF88";
				S.fillOpacity = 0.2;
				return S;
			},
			sort: function (a, b) {
				var ka = a._Код;
				var kb = b._Код;
				if (a._Участок < b._Участок) return -1;
				if (a._Участок > b._Участок) return 1;
				if (ka < kb) return -1;
				if (ka > kb) return 1;
				if (a._ref < b._ref) return -1;
				if (a._ref > b._ref) return 1;
				return 0;
			}
		},
		Водотоки: {
			filter: function (osmGeoJSON_obj) {
				var t = osmGeoJSON_obj.properties.tags;
				var nt = t['natural'];
				var ww = t['waterway'];
				var am = t['amenity'];
				if (!ww && nt != 'water' && nt != 'spring' && am != 'fountain')
					return false;
				if (ww == 'dam')
					return false;
				if (osmGeoJSON_obj.geometry.type == 'LineString' && ww)
					osmGeoJSON_obj.properties.showDirection = true;
				return true;
			},
			data_object: function (osmGeoJSON_obj, участки) {
				var nd = explication.γεωμετρία.geo_nodes(osmGeoJSON_obj);
				var Уч_geoJSON = explication.osm.γεωμετρία.Участки_точек(nd, участки);
				var Уч = explication.osm.γεωμετρία.Участок(Уч_geoJSON);
				var t = osmGeoJSON_obj.properties.tags;

				var nt = t['natural'];
				var ww = t['waterway'];
				var am = t['amenity'];
				var note = t['note'];
				var start = t['start_date'];
				var descr = t['description'];
				if (nt == 'water')
					ww = 'pond';
				if (nt == 'spring')
					ww = 'spring';
				if (am == 'fountain')
					ww = 'fountain';

				var wt = explication.osm.data.water[ww];
				var n = t['name'];
				n = n ? n : t['alt_name'];
				n = n ? n : t['local_name'];
				n = n ? n : '';
				var wd = t['width'];
				wd = wd ? wd : '';
				var mt_len = explication.γεωμετρία.len(osmGeoJSON_obj.geometry);
				var sq = explication.γεωμετρία.sqf(osmGeoJSON_obj.geometry);
				sq = sq ? '≈' + sq.toFixed(1) + 'м²' : '';
				var водоток = {
					No: null,
					Название: n,
					Другое_название: t['alt_name'] ? t['alt_name'] : '',
					Местное: t['local_name'] ? t['local_name'] : '',
					Тип: wt,
					Пересыхает: t['intermittent'] ? 'Есть' : 'Нет',
					Сезонность: t['seasonal'] ? 'Есть' : 'Нет',
					Расположение: t['tunnel'] ? 'Подземный' : 'Наземный',
					Длина_части: mt_len ? '≈' + mt_len.toFixed(1) + 'м' : '',
					Ширина: wd,
					Площадь: sq,
					Заметки: note ? note : null,
					Датировка: start ? start : '',
					Описание: descr ? descr : '',
					Датировка: start ? start : '',
					Подтверждение_направления_течения: explication.osm.data.source_direction[t['source:direction']],
					Объект_OSM: explication.osm.href(osmGeoJSON_obj),
					_Участок: Уч ? (Уч.length == 1 ? ('0' + Уч) : Уч) : null,
					_geoJSON_Участков: Уч_geoJSON,
					_nd: null
				};
				return водоток;
			},
			active: function (водоток) {
				водоток._tooltip = водоток.Название ? водоток.Название : водоток.Местное ? водоток.Местное : водоток.Другое_название ? водоток.Другое_название : '';

				водоток._popup = explication.osm.popup(водоток, '<b>Учётная карточка водотока</b></br><i>№ в таблице экспликации</i> ');
			},
			geoJSON_style: function (osmGeoJSON_obj, вт) {
				var S = {};
				S.color='#7EBCEB';
				if (osmGeoJSON_obj.properties.showDirection)
				{
					S.textStyle = {repeat: true,
								  offset: 4,
								  attributes: {fill: '#07E1F5'}};
					S.text = '\u25BA		';
				}
				if (вт.Тип == 'Речка')
					S.weight = 4;
				else if (вт.Тип == 'Водопад')
					S.weight = 4;
				else if (вт.Тип == 'Ручей')
					S.weight = 3;
				else if (вт.Тип == 'Сток')
					S.weight = 3;
				else if (вт.Тип == 'Канава')
					S.weight = 2;
				else if (вт.Тип == '?')
					S.weight = 2;
				else
					S.weight = 1;
				if (osmGeoJSON_obj.properties.tags.tunnel && osmGeoJSON_obj.properties.tags.tunnel != 'no')
					S.dashArray = '4, 4';
				if (вт.Подтверждение_направления_течения == 'Пересекает изолинию или видимый наклон')
					S.color = '#729FCF';
				else if (вт.Подтверждение_направления_течения == 'Осмотр, зафиксировано направление течения')
					S.color = '#3DECFA';					
				return S;
			},
			sort: function (a, b) {
				if (a.Название === b.Название) {
					return 0;
				}
				else if (!a.Название) {
					return 1;
				}
				else if (!b.Название) {
					return -1;
				}
				else {
					return (a.Название < b.Название) ? -1 : 1;
				}
			}
		},
		Дорожно_тропиночая_сеть: {
			filter: function (osmGeoJSON_obj) {
				var t = osmGeoJSON_obj.properties.tags;
				var hw = t['highway'];
				if (['path', 'footway', 'footpath', 'service', 'track', 'steps', 'pedestrian'].indexOf(hw) < 0)
					return false;
				return true;
			},
			data_object: function (osmGeoJSON_obj, участки) {
				var nd = explication.γεωμετρία.geo_nodes(osmGeoJSON_obj);
				var Уч_geoJSON = explication.osm.γεωμετρία.Участки_точек(nd, участки);
				var Уч = explication.osm.γεωμετρία.Участок(Уч_geoJSON);
				var t = osmGeoJSON_obj.properties.tags;

				var hw = t['highway'];
				var hs = t['surface'];
				var ht = explication.osm.data.highway[hw];
				var hst = '';
				if (hs)
					hst = explication.osm.data.surface[hs];
				hst = hst ? hst : hs;
				var n = t['name'];
				n = n ? n : '';
				var an = t['alt_name'];
				an = an ? an : '';
				var ln = t['local_name'];
				ln = ln ? ln : '';

				var wd = t['width'];
				wd = wd ? wd : '';

				var note = t['note'];
				var start = t['start_date'];
				var descr = t['description'];
				var mt_len = explication.γεωμετρία.len(osmGeoJSON_obj.geometry);

				var Уч_geoJSON = explication.osm.γεωμετρία.Участки_точек(nd, участки);
				var Уч = explication.osm.γεωμετρία.Участок(Уч_geoJSON);
				var дорожка = {
					No: null,
					Название: n,
					Другое_название: an,
					Местное: ln,
					Тип: ht,
					Покрытие: hst ? hst : '',
					Длина_части: mt_len ? '≈' + mt_len.toFixed(1) + 'м' : '',
					Ширина: wd,
					Мост: t['bridge'] ? 'Да' : '',
					Заметки: note ? note : null,
					Датировка: start ? start : '',
					Описание: descr ? descr : '',
					Объект_OSM: explication.osm.href(osmGeoJSON_obj),
					_Участок: Уч ? (Уч.length == 1 ? ('0' + Уч) : Уч) : null,
				};
				return дорожка;
			},
			active: function (дорожка) {
				дорожка._tooltip = (дорожка.Название ? дорожка.Название : дорожка.Местное ? дорожка.Местное : дорожка.Другое_название ? дорожка.Другое_название : '') + (дорожка.Покрытие ? (' (' + дорожка.Покрытие + ')') : '');
				дорожка._popup = explication.osm.popup(дорожка, '<b>Учётная карточка элемента</br>дорожно-тропиночной сети</b></br><i>№ в таблице экспликации</i> ');
			},
			geoJSON_style: function (osmGeoJSON_obj, др) {
				var S = {};
				if (др.Тип == 'Тропинка')
					S.weight = 2;
				else if (др.Тип == 'Дорожка')
					S.weight = 3;
				else if (др.Тип == 'Проезжая дорога')
					S.weight = 5;
				else if (др.Тип == 'Парковая дорога')
					S.weight = 4;
				else if (др.Тип == '?')
					S.weight = 4;
				else if (др.Тип == 'Лестница')
					S.weight = 4;
				else
					S.weight = 1;

				var hs = osmGeoJSON_obj.properties.tags['surface'];
				if (explication.osm.data.surface_color[hs])
					S.color = explication.osm.data.surface_color[hs];
				else
					S.color = 'white';
				return S;
			},
			sort: function (a, b) {
				if (a.Название === b.Название) {
					return 0;
				}
				else if (!a.Название) {
					return 1;
				}
				else if (!b.Название) {
					return -1;
				}
				else {
					return (a.Название < b.Название) ? -1 : 1;
				}
			}
		},
		Обсадки: {
			filter: function (osmGeoJSON_obj) {
				var t = osmGeoJSON_obj.properties.tags;
				return (t['natural'] == 'tree_row' || t['barrier'] == 'hedge');
			},
			data_object: function (osmGeoJSON_obj, участки) {
				var nd = explication.γεωμετρία.geo_nodes(osmGeoJSON_obj);
				var Уч_geoJSON = explication.osm.γεωμετρία.Участки_точек(nd, участки);
				var Уч = explication.osm.γεωμετρία.Участок(Уч_geoJSON);
				var t = osmGeoJSON_obj.properties.tags;

				var mt_len = explication.γεωμετρία.len(osmGeoJSON_obj.geometry);
				var bio_rus = explication.osm.biolog_format({
					genus: t['genus:ru'],
					spieces: t['spieces:ru'],
					taxon: t['taxon:ru'] ? t['taxon:ru'] : t['was:taxon:ru']
				});
				var bio_lat = explication.osm.biolog_format({
					genus: t['genus'],
					spieces: t['spieces'],
					taxon: t['taxon'] ? t['taxon'] : t['was:taxon']
				});
				var обсадка = {
					No: null,
					Род: bio_rus[0].genus ? bio_rus[0].genus : bio_lat[0].genus ? bio_lat[0].genus : '',
					Вид: bio_rus[0].spieces ? bio_rus[0].spieces.join(' ') : bio_lat[0].spieces ? bio_lat[0].spieces : '',
					Длина_части: mt_len,
					Объект_OSM: explication.osm.href(osmGeoJSON_obj),
					_nd: null
				};
				return обсадка;
			},
			active: function (обсадка) {
				обсадка._tooltip = обсадка.Род + ' ' + обсадка.Вид;
				обсадка._popup = explication.osm.popup(обсадка, '<b>Карточка обсадки</b></br><i>№ в таблице экспликации</i> ');
			},
			geoJSON_style: function (osmGeoJSON_obj) {
				var S = {};
				S.weight = 1;
				var lc = osmGeoJSON_obj.properties.tags['leaf_cycle'];
				var lt = osmGeoJSON_obj.properties.tags['leaf_type'];
				if (explication.osm.data.leaf_type[lt])
					S.color = explication.osm.data.leaf_type[lt].color;
				else
					S.color = "#88FF88";
				/*			if (explication.osm.data.leaf_cycle[lc])
								S.fillColor = explication.osm.data.leaf_cycle[lc].color;
							else
								S.fillColor = "#88FF88";
							S.fillOpacity = 0.2;*/
				return S;
			},
			sort: null
		},
		Площадки: {
			filter: function (osmGeoJSON_obj) {
				var t = osmGeoJSON_obj.properties.tags;
				var l = t['leisure'];
				if (!l)
					return false;
				if (l == 'playground' || l == 'pitch' || l == 'dog_park')
					return true;
				return false;
			},
			data_object: function (osmGeoJSON_obj, участки) {
				var nd = explication.γεωμετρία.geo_nodes(osmGeoJSON_obj);
				var Уч_geoJSON = explication.osm.γεωμετρία.Участок_всех_точек(nd, участки);
				var Уч = explication.osm.γεωμετρία.Участок(Уч_geoJSON);
				var t = osmGeoJSON_obj.properties.tags;

				var l = t['leisure'];
				var lt = explication.osm.data.leisure[l];
				var sp = t['sport'];
				var st = explication.osm.data.sport[sp];
				var sq = explication.γεωμετρία.sqf(osmGeoJSON_obj.geometry);
				sq = sq ? '≈' + sq.toFixed(1) + 'м²' : '';
				var площадка = {
					No: null,
					Участок: Уч,
					Тип: lt,
					Спорт: st ? st : '',
					Площадь: sq,
					//Заметки: note ? note : null,
					//Датировка: start ? start : '',
					//Описание: descr ? descr : '',
					Объект_OSM: explication.osm.href(osmGeoJSON_obj),
					_Участок: Уч ? (Уч.length == 1 ? ('0' + Уч) : Уч) : null,
					_geoJSON_Участков: Уч_geoJSON,
					_nd: null
				};
				return площадка;
			},
			active: function (площадка) {
				площадка._tooltip = площадка.Тип + площадка.Спорт ? ('(' + площадка.Спорт + ')') : '';
				площадка._popup = explication.osm.popup(площадка, '<b>Учётная карточка площадки</b></br><i>№ в таблице экспликации</i> ');
			},
			geoJSON_style: function (osmGeoJSON_obj, пл) {
				var S = {};
				S.weight = 1;
				if (пл.Тип == 'Спортивная площадка')
					S.color = 'ffff00';
				else if (пл.Тип == 'Игровая площадка')
					S.color = '88ff00';
				else if (пл.Тип == 'Собачья площадка')
					S.color = 'bbbbbb';
					
				S.dashArray = '2, 2';
				return S;
			},
			sort: function (a, b) {
				if (a._Участок < b._Участок) return -1;
				if (a._Участок > b._Участок) return 1;
				return 0;
			}
		},
		Справочные_объекты: {
			filter: function (osmGeoJSON_obj) {
				var t = osmGeoJSON_obj.properties.tags;
				var tr = t['tourism'];
				var i = t['information'];
				if (!tr || !i)
					return false;
				return true;
			},
			data_object: function (osmGeoJSON_obj, участки) {
				var nd = explication.γεωμετρία.geo_nodes(osmGeoJSON_obj);
				var Уч_geoJSON = explication.osm.γεωμετρία.Участки_точек(nd, участки);
				var Уч = explication.osm.γεωμετρία.Участок(Уч_geoJSON);
				var t = osmGeoJSON_obj.properties.tags;

				var i = t['information'];
				var bt = t['board_type'];
				var note = t['note'];
				var name = t['name'];
				var start = t['start_date'];
				var descr = t['description'];
				var справочный_объект = {
					No: null,
					Тип_справки: explication.osm.data.information[i],
					Тип_информации: (i == 'board' && bt) ? explication.osm.data.board_type[bt] : null,
					Участок : Уч,
					Название : name ? name : null,
					Заметки: note ? note : null,
					Датировка: start ? start : '',
					Описание: descr ? descr : '',
					Объект_OSM: explication.osm.href(osmGeoJSON_obj),
					Площадка: null,
					_Участок: Уч ? (Уч.length == 1 ? ('0' + Уч) : Уч) : null,
					_geoJSON_Участков: Уч_geoJSON,
					_nd: null
				};
				return справочный_объект;
			},
			active: function (справочный_объект) {
				справочный_объект._tooltip = '';
				справочный_объект._popup = explication.osm.popup(справочный_объект, '<b>Учётная карточка справочного объекта</b></br><i>№ в таблице экспликации</i> ');
			},
			geoJSON_style: function (osmGeoJSON_obj, пл) {
				var S = {};
				S.weight = 4;				
				return S;
			},
			sort: function (a, b) {
				if (a._Участок < b._Участок) return -1;
				if (a._Участок > b._Участок) return 1;
				return 0;
			}
		},
		Объекты_культурного_наследия: {
			filter: function (osmGeoJSON_obj) {
				var t = osmGeoJSON_obj.properties.tags;
				var r = t['ref:ЕГРОКН'];
				var r1 = t['ref:okn'];
				if (!r && !r1)
					return false;
				return true;
			},
			data_object: function (osmGeoJSON_obj, участки) {
				var nd = explication.γεωμετρία.geo_nodes(osmGeoJSON_obj);
				var Уч_geoJSON = explication.osm.γεωμετρία.Участки_точек(nd, участки);
				var Уч = explication.osm.γεωμετρία.Участок(Уч_geoJSON);
				var t = osmGeoJSON_obj.properties.tags;

				var r = t['ref:ЕГРОКН'];
				var r1 = t['ref:okn'];				
				var ref = r ? r : r1;				
				var name = t['name'];
				var start = t['start_date'];
				var descr = t['description'];
				var note = t['note'];
				var at = t['architect'];
				var ar = t['artist_name'];				
				ref = '<a href="https://ru_monuments.toolforge.org/get_info.php?id=' + ref + '">' + ref + '</a>';
				
				var ОКН = {
					No: null,					
					Участок : Уч ?? null,
					Код_ЕГРОКН : ref ?? null,
					Название : name ?? null,
					Датировка: start ?? '',
					Архитектор: at ?? null,
					Автор_худ_решения: ar ?? null,					
					Заметки: note ?? null,
					Описание: descr ?? '',
					Объект_OSM: explication.osm.href(osmGeoJSON_obj),
					_Участок: Уч ? (Уч.length == 1 ? ('0' + Уч) : Уч) : null,
					_geoJSON_Участков: Уч_geoJSON,
					_nd: null
				};
				return ОКН;
			},
			active: function (ОКН) {
				ОКН._tooltip = ОКН.Название;
				ОКН._popup = explication.osm.popup(ОКН, '<b>Учётная карточка объекта культурного наследия</b></br><i>№ в таблице экспликации</i> ');
			},
			geoJSON_style: function (osmGeoJSON_obj, ОКН) {
				var S = {};
				S.weight = 1;
				S.color = '#ff0000';
				return S;
			},
			sort: function (a, b) {
				if (a._Участок < b._Участок) return -1;
				if (a._Участок > b._Участок) return 1;
				if (a.Название < b.Название) return -1;
				if (a.Название > b.Название) return 1;
				return 0;
			}
		},
		Урны: {
			filter: function (osmGeoJSON_obj) {
				var t = osmGeoJSON_obj.properties.tags;
				var l = t['amenity'];
				if (!l || l != 'waste_basket')
					return false;
				return true;
			},
			data_object: function (osmGeoJSON_obj, участки) {
				var nd = explication.γεωμετρία.geo_nodes(osmGeoJSON_obj);
				var Уч_geoJSON = explication.osm.γεωμετρία.Участки_точек(nd, участки);
				var Уч = explication.osm.γεωμετρία.Участок(Уч_geoJSON);
				var t = osmGeoJSON_obj.properties.tags;

				var l = t['leisure'];
				var урна = {
					No: null,					
				/*	Заметки: note ? note : null,
					Датировка: start ? start : '',
					Описание: descr ? descr : '',*/
					Участок : Уч,
					Объект_OSM: explication.osm.href(osmGeoJSON_obj),
					_Участок: Уч ? (Уч.length == 1 ? ('0' + Уч) : Уч) : null,
					_geoJSON_Участков: Уч_geoJSON,
					_nd: null
				};
				return урна;
			},
			active: function (урна) {
				урна._tooltip = '';
				урна._popup = explication.osm.popup(урна, '<b>Учётная карточка урны</b></br><i>№ в таблице экспликации</i> ');
			},
			geoJSON_style: function (osmGeoJSON_obj, урна) {
				var S = {};
				S.weight = 4;				
				return S;
			},
			sort: function (a, b) {
				if (a._Участок < b._Участок) return -1;
				if (a._Участок > b._Участок) return 1;
				return 0;
			}
		},
		Скамейки: {
			filter: function (osmGeoJSON_obj) {
				var t = osmGeoJSON_obj.properties.tags;
				var l = t['amenity'];
				if (!l || l != 'bench')
					return false;
				return true;
			},
			data_object: function (osmGeoJSON_obj, участки) {
				var nd = explication.γεωμετρία.geo_nodes(osmGeoJSON_obj);
				var Уч_geoJSON = explication.osm.γεωμετρία.Участки_точек(nd, участки);
				var Уч = explication.osm.γεωμετρία.Участок(Уч_geoJSON);
				var t = osmGeoJSON_obj.properties.tags;

				var l = t['amenity'];
				var bc = t['backrest'];
				var mt = t['material'];
				var cl = t['color'];
				var mtt = explication.osm.data.material[mt];
				var скамейка = {
					No: null,
					Спинка: (bc == 'yes') ? 'есть' : 'нет',					
					Метариал: mtt ? mtt : (mt ? mt : ''),
					Цвет: cl ? cl : '',
				/*	Заметки: note ? note : null,
					Датировка: start ? start : '',
					Описание: descr ? descr : '',*/
					Объект_OSM: explication.osm.href(osmGeoJSON_obj),
					Участок: Уч,
					_Участок: Уч ? (Уч.length == 1 ? ('0' + Уч) : Уч) : null,
					_geoJSON_Участков: Уч_geoJSON,
					_nd: null
				};
				return скамейка;
			},
			active: function (скамейка) {
				скамейка._tooltip = '';
				скамейка._popup = explication.osm.popup(скамейка, '<b>Учётная карточка скамейки</b></br><i>№ в таблице экспликации</i> ');
			},
			geoJSON_style: function (osmGeoJSON_obj, скамейка) {
				var S = {};
				S.weight = 4;				
				return S;
			},
			sort: function (a, b) {
				if (a._Участок < b._Участок) return -1;
				if (a._Участок > b._Участок) return 1;
				return 0;
			}
		},
		Достопримечательности: {
			filter: function (osmGeoJSON_obj) {
				var t = osmGeoJSON_obj.properties.tags;
				var l = t['tourism'];
				if (!l)
					return false;
				if (l != 'attraction' && l != 'artwork')
					return false;
				return true;
			},
			data_object: function (osmGeoJSON_obj, участки) {
				var nd = explication.γεωμετρία.geo_nodes(osmGeoJSON_obj);
				var Уч_geoJSON = explication.osm.γεωμετρία.Участки_точек(nd, участки);
				var Уч = explication.osm.γεωμετρία.Участок(Уч_geoJSON);
				var t = osmGeoJSON_obj.properties.tags;

				var n = t['name'];
				var at = t['artwork_type'];
				var mt = t['material'];
				var au = t['artist_name'];
				var start = t['start_date'];				
				var note = t['note'];
				var mtt = explication.osm.data.material[mt];
				var Уч_geoJSON = explication.osm.γεωμετρία.Участок_всех_точек(nd, участки);
				var дпр = {
					No: null,
					Тип: at ? explication.osm.data.artwork_type[at] : '',
					Название: n ? n : '',
					Автор: au ? au : '',
					Участок: explication.osm.γεωμετρία.Участок(Уч_geoJSON),
					Заметки: note ? note : '',
					Датировка: start ? start : '',					
					Объект_OSM: explication.osm.href(osmGeoJSON_obj),
					Участок: Уч,
					_Участок: Уч ? (Уч.length == 1 ? ('0' + Уч) : Уч) : null,
					_geoJSON_Участков: Уч_geoJSON,
					_nd: null
				};
				return дпр;
			},
			active: function (дпр) {
				дпр._tooltip = '';
				дпр._popup = explication.osm.popup(дпр, '<b>Учётная карточка достопримечательности</b></br><i>№ в таблице экспликации</i> ');
			},
			geoJSON_style: function (osmGeoJSON_obj, дпр) {
				var S = {};
				S.weight = 4;				
				return S;
			},
			sort: function (a, b) {
				return 0;
				/*if (a.Название === b.Название) {
					return 0;
				}
				else if (!a.Название) {
					return 1;
				}
				else if (!b.Название) {
					return -1;
				}
				else {
					return (a.Название < b.Название) ? -1 : 1;
				}*/
			}
		},
		Малые_формы: {
			filter: function (osmGeoJSON_obj) {
				var t = osmGeoJSON_obj.properties.tags;
				var tr = t['tourism'];
				var hs = t['historic'];
				if (!tr && !hs)
					return false;
				if (hs == 'memorial' || tr == 'artwork')
					return true;
				return false;
			},
			data_object: function (osmGeoJSON_obj, участки) {
				var nd = explication.γεωμετρία.geo_nodes(osmGeoJSON_obj);
				var Уч_geoJSON = explication.osm.γεωμετρία.Участки_точек(nd, участки);
				var Уч = explication.osm.γεωμετρία.Участок(Уч_geoJSON);
				var t = osmGeoJSON_obj.properties.tags;

				var l = t['amenity'];
				var bc = t['backrest'];
				var mt = t['material'];
				var n = t['name'];
				var mtt = explication.osm.data.material[mt];
				var Уч_geoJSON = explication.osm.γεωμετρία.Участок_всех_точек(nd, участки);
				var малая_форма = {
					No: null,
					Название: n ? n : '',
					Метариал: mtt ? mtt : (mt ? mt : ''),					
				/*	Заметки: note ? note : null,
					Датировка: start ? start : '',
					Описание: descr ? descr : '',*/
					Участок: Уч,
					_Участок: Уч ? (Уч.length == 1 ? ('0' + Уч) : Уч) : null,
					Объект_OSM: explication.osm.href(osmGeoJSON_obj),
					_geoJSON_Участков: Уч_geoJSON,
					_nd: null
				};
				return малая_форма;
			},
			active: function (малая_форма) {
				малая_форма._tooltip = '';
				малая_форма._popup = explication.osm.popup(малая_форма, '<b>Учётная карточка малой формы</b></br><i>№ в таблице экспликации</i> ');
			},
			geoJSON_style: function (osmGeoJSON_obj, малая_форма) {
				var S = {};
				S.weight = 4;				
				return S;
			},
			sort: function (a, b) {
				return 0;
				/*if (a.Название === b.Название) {
					return 0;
				}
				else if (!a.Название) {
					return 1;
				}
				else if (!b.Название) {
					return -1;
				}
				else {
					return (a.Название < b.Название) ? -1 : 1;
				}*/
			}
		},
		Ref_Sirius_msk: {
			filter: function (osmGeoJSON_obj) {
				var t = osmGeoJSON_obj.properties.tags;
				if (!t['ref:sirius_msk'])
					return false;
				return true;
			},
			data_object: function (osmGeoJSON_obj, участки) {
				// var nd = explication.γεωμετρία.geo_nodes(osmGeoJSON_obj);
				var t = osmGeoJSON_obj.properties.tags;

				var mt_len = explication.γεωμετρία.len(osmGeoJSON_obj.geometry);
				var ref_obj = {
					No: null,
					Обозначение: t['ref:sirius_msk'],
					Название: t['name'] ? t['name'] : '',
					Длина_части: mt_len,
					Объект_OSM: explication.osm.href(osmGeoJSON_obj),
					_nd: null
				};
				return ref_obj;
			},
			active: function (ref_obj) {
				ref_obj._tooltip = "«Московские парки» : " + ref_obj.Обозначение;
				ref_obj._popup = explication.osm.popup(ref_obj, '<b>Карточка объекта, имеющего</br>обозначение фотосайта «Московские парки»</b></br><i>№ в таблице экспликации</i> ');
			},
			geoJSON_style: function (osmGeoJSON_obj) {
				return {};
			},
			sort: function (a, b) {
				function norm(v) {
					return v ? ('000' + v).slice(-3) : v;
				}
				var a_ = norm(a.Обозначение);
				var b_ = norm(b.Обозначение);
				if (a_ === b_) {
					return 0;
				}
				else if (!a_) {
					return 1;
				}
				else if (!b_) {
					return -1;
				}
				else {
					return (a_ < b_) ? -1 : 1;
				}
			}
		}
	},
	l_osmGeoJSON_objData: function (osmGeoJSON_obj, style, data_obj, layer_group) {
		var l = L.geoJSON(osmGeoJSON_obj, style);
		if (osmGeoJSON_obj.properties.showDirection)
				l.setText(style.text, style.textStyle);
		if (data_obj._popup)
			l.bindPopup(data_obj._popup);
		if (data_obj._tooltip)
			l.bindTooltip(data_obj._tooltip);
		l.on('click', l.openPopup);
			l.on('mouseover', function (e) {
			var tt = e.target.getTooltip();
			if (!tt)
				return;
			tt.setLatLng(e.latlng);
		});
		layer_group.push(l);
	},
	data: { // Данные для пояснения свойств и оформления объектов ОСМ
		leaf_type: {
			broadleaved: {
				ru: 'Широколиственная',
				color: '#8DB600'
			},
			needleleaved: {
				ru: 'Хвойная',
				color: '#397262'
			},
			mixed: {
				ru: 'Смешанный',
				color: '#888888'
			},
			leafless: {
				ru: 'Безлистная',
				color: '#000000'
			},
			null: {
				ru: '?',
				color: '#ffff00'
			}
		},
		leaf_cycle: {
			evergreen: {
				ru: 'Вечнозелёные',
				color: '#397262'
			},
			deciduous: {
				ru: 'Листопадные',
				color: '#8DB600'
			},
			semi_evergreen: {
				ru: 'Полулистопадные',
				color: '#00ffa0'
			},
			semi_deciduous: {
				ru: 'С коротким безлиственным периодом',
				color: '#476300'
			},
			mixed: {
				ru: 'смешанные',
				color: '#888888'
			},
			null: {
				ru: '?',
				color: '#ffff00'
			}
		},
		natural: {
			wood: 'Древесная посадка',
			tree: 'Отдельное дерево',
			tree_row: 'Ряд деревьев',
			scrub: 'Кусты',
			null: '?'
		},
		water: {
			spring: 'Родник',
			pond: 'Водная гладь',
			river: 'Речка',
			stream: 'Ручей',
			drain: 'Сток',
			ditch: 'Канава',
			waterfall: 'Водопад',
			weir: 'Плотина',
			riverbank: 'Большая река',
			fountain: 'Фонтан',
			null: '?'
		},
		highway: {
			path: 'Тропинка',
			footway: 'Дорожка',
			footpath: 'Дорожка',
			service: 'Проезжая дорога',
			track: 'Парковая дорога',
			steps: 'Лестница',
			pedestrian: 'Пешеходная улица',
			null: '?'
		},
		surface: {
			dirt: 'Грязь',
			ground: 'Земля',
			unpaved: 'Земля',
			compacted: 'Утрамбовано',
			tiles: 'Плитка',
			paving_stones: 'Мощение',
			asphalt: 'Асфальт',
			gravel: 'Гравий',
			paved: 'Твёрдое',
			wood: 'Дерево',
			metal: 'Металл',
			pebblestone: 'Галька',
			fine_gravel: 'Камнегравийный слой',
			grass: 'Трава',
			null: ''
		},
		surface_color: {
			dirt: '#9b7653',
			ground: '#9b76ff',
			compacted: '#442d25',
			tiles: '#303030',
			paving_stones: '#774444',
			asphalt: '#444444',
			gravel: 'yellow',
			paved: '#111111',
			wood: '#0a5F38',
			pebblestone: '#888888',
			fine_gravel: '#f8f32b',
			grass: '#8DB600',
			null: 'red'
		},
		leisure:{
			pitch: "Спортивная площадка",
			playground: "Игровая площадка",
			dog_park: "Собачья площадка"
		},
		sport:{
			fitness: "фитнес",
			table_tennis: "настольный тенис"
		},
		artwork: {
			sculpture: "скульптура"
		},
		material: {
			wood: "дерево",
			metal: "металл",
			stone: "камень",
			marble: "мрамор",
			glass: "стекло",
			steel: "сталь",
			concrete: "заливной бетон"
		},
		artwork_type: {
			sculpture: "скульптура",
			statue: "статуя",
			painting: "живописное",
			mosaic: "мозаика",
			mural: "фреска",
			architecture: "архитектурный объект",
			installation: "инсталляция",
		},
		source_taxon: {
			board: "Щит с описанием",
			survey: "Осмотр",
			label: "Бирка на саженцах",
			null: "нет"
		},
		information: {
			board: "Щит с описанием",
			office: "Cправочная служба",
			terminal: "Терминал информационной системы",
			audioguide: "Аудиогид",
			map: "Карта или план",
			tactile_map: "Тактильная карта",
			tactile_model: "Тактильная модель",
			guidepost: "Указатель направлений",
			trail_blaze: "Маршрутная метка или табличка",
			route_marker: "Маршрутная метка или табличка"
		},
		board_type: {
			geology: "о геологии",
			history: "об истории",
			nature: "о природе или климате",
			plants: "о растительности",
			notice: "о мероприятиях",
			wildlife: "о животном мире",
			null: "не указан"
		},
		source_direction: {
			isoline: "Пересекает изолинию или видимый наклон",
			survey: "Осмотр, зафиксировано направление течения",			
			null: "нет"
		},
	},
	popup: function (obj, title) {  // Возвращает гипертекст учётной карточки
		var html = '<p align="center">' + title + '<a href="#' + obj.No + '">' + obj.No + '</a></p><table><tr><th>Свойство</th><th>Значение</th></tr>';
		for (var k in obj) {
			if (k[0] == '_' || k == 'No' || !obj[k] || obj[k] == '?' || obj[k] == '-')
				continue;
			html += '<tr><td>' + k.replace('_', ' ').replace('_', ' ') + '</td><td>' + obj[k] + '</td></tr>';
		}
		html += '</table>';
		return html;
	},
	biolog_format: function (bio) { // Получает каноническое разложение полей классификации
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
	},
	href: function(osmGeoJSON_obj) {
		var osmt = osmGeoJSON_obj.properties.type[0];
		var osmt_ = (osmt == 'n') ? 'Точка' : ((osmt == 'w') ? 'Линия' : 'Отношение');
		return "<a href='https://www.openstreetmap.org/" + osmGeoJSON_obj.id + "'>" + osmt_ + "</a>";
	},
	γεωμετρία: {
		Участки_точек: function (nd, участки)
		{
			function uniq(value, index, self) {
				return self.indexOf(value) === index;
			}
			var уч_geoJson = []; // Перечень участков, которым принадлежат точки данного объекта
			for (var i_u in участки) {
				var pol = участки[i_u];
				for (var i_n in nd) {
					if (explication.γεωμετρία.booleanPointInPolygon(nd[i_n], pol, { ignoreBoundary: true })) {
						уч_geoJson.push(pol);
					}
				}
			}
			return уч_geoJson.filter(uniq);
		},
		Участок_всех_точек: function (nd, участки) {
			var уч_geoJson = explication.osm.γεωμετρία.Участки_точек(nd, участки);			
			if (уч_geoJson.length == 0) // Нет точек ни в одном участке
				return null;
			if (уч_geoJson.length == 1)
				return уч_geoJson[0];
			for (var c in уч_geoJson) {
				var ok = true;
				for (var i_n in nd) {
					ok = ok && (explication.γεωμετρία.booleanPointInPolygon(nd[i_n], уч_geoJson[c], { ignoreBoundary: true }));
				}
				if (ok)
					return уч_geoJson[c]; // Первый Участок, к которому относятся все точки
			}
		},
		Участок : function (Уч_geoJSON) {
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
	}, // γεωμετρία
	сверка_маточных_площадок: function (маточные_площадки) {
		var xhr = new XMLHttpRequest();
		xhr.url = 'https://raw.githubusercontent.com/mkgrgis/park_explication/master/МаточныеПлощадкиБД.txt';
		xhr.open('GET', xhr.url, true);
		xhr.маточные_площадки = маточные_площадки;
		xhr.send();
		xhr.onreadystatechange = function () {
			if (xhr.readyState != 4) return;
			if (xhr.status != 200 && (xhr.status != 0 || xhr.response)) {
				alert("Ошибка! " + xhr.url);
			} else {
				log('Текстовая экспликация получена');
				var tn = xhr.responseText.split('\r').join('').split('\n');
				var мп0 = [];
				for (var i in tn) {
					if (tn[i].indexOf('×') < 0)
						continue;
					var t0 = tn[i].split('\t');
					if (!t0[1])
						continue;
					var g = t0[1].split(' ')[0];
					var мп = {
						Участок: t0[0].split('×')[0],
						Код: t0[0].split('×')[1],
						Род: (g == '?') ? null : g.replace(',', ''),
						Вид: (t0[1] == '?') ? null : t0[1].split(' ')[1].split(',').join('')
					};
					мп0.push(мп);
				}
				console.log('Расхождения экспликаций');
				var мп1 = xhr.маточные_площадки;
				var diff = [];
				for (var i in мп1) {
					var e1 = мп1[i];
					for (var j in мп0) {
						var e0 = мп0[j];
						if (e0.Участок == e1.Участок && e0.Код == e1._Код) {
							var e2 = Object.assign(e0);
							e2.опознан_род = (e1.Род && e0.Род && e1.Род.toLowerCase().indexOf(e0.Род.toLowerCase()) >= 0);
							e2.url = e1.Объект_OSM;
							if (e0.Род && e1.Род && e0.Род != e1.Род)
								diff.push(e2);
						}
					}
				}
				console.table(diff);
			}
		}
	},
	привязка_указателей: function(osm_tables){
		function привязка(мп, со){
			if (мп.Табличка)
					console.log(мп);
			мп.Табличка = со.Объект_OSM;
			if (со.Площадка)
				console.log(со);
			со.Площадка = мп.Объект_OSM;
		}
		var мп = osm_tables["Маточные_площадки"].data;
		var со = osm_tables["Справочные_объекты"].data;
		var index_мп = {};
		for (var i in мп){
			var u = мп[i].Участок;
			if (!index_мп[u])
				index_мп[u] = [];
			index_мп[u].push(мп[i]);
		}
		var index_со = {};
		for (var i in со){
			var u = со[i].Участок;
			if (!index_со[u])
				index_со[u] = [];
			index_со[u].push(со[i]);
		}
		for (var i in мп){
			var u = мп[i].Участок;
			if (!index_со[u])
				continue;
			var в = мп[i].Вид;
			var р = мп[i].Род;
			var s = мп[i].Spieces;
			var g = мп[i].Genus;
			for (var j in index_со[u]){
				var со_ = index_со[u][j];
				var n = со_.Название;
				if(!n || (!в && !р && !g && !s))
					continue;
				if (n.indexOf(в) != -1 && n.indexOf(р) != -1 && n.indexOf(g) != -1 && n.indexOf(s) != -1)
					привязка(мп[i], со_);
			}
		}
	} // f
}; // 
