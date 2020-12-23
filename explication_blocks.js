expl_func_blocks = {
	Маточные_площадки: {
		filter: function (base, osmGeoJSON_obj) {
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
		webData_object: function (base, osmGeoJSON_obj, data_obj){
				data_obj.Вырублен = data_obj.Вырублен ? '<span style="color: red"><b>Да</b></span>' : null;
				data_obj.Нужно_доработать = data_obj.Нужно_доработать ? ('<span style="color: red">' + data_obj.Нужно_доработать + '</span>') : null;
				return data_obj;
			},
		SQL: function(){
			return {
				No: "integer not null",
				Участок: "varchar(8)",
				Год_учёта: "timestamp",
				Номер_площадки:  "varchar(8)",
				Подтверждение_вида:  "varchar(256)",
				Род: "varchar(256)",
				Вид: "varchar(256)",
				Genus: "varchar(256)",
				Spieces: "varchar(256)",
				Род2: "varchar(256)",
				Вид2: "varchar(256)",
				Genus2: "varchar(256)",
				Spieces2: "varchar(256)",
				Тип: "varchar(256)",
				Сезонность: "varchar(256)",
				Листва: "varchar(256)",
				Площадь: "varchar(256)",
				Заметки: "varchar(256)",
				Датировка: "varchar(256)",
				Описание: "varchar(256)",
				Вырублен: "varchar(256)",
				Нужно_доработать: "varchar(256)",
				Табличка: "varchar(256)",
				_ref: "varchar(256)"
			}
		},
		data_object: function (base, osmGeoJSON_obj, Уч) {
			var t = osmGeoJSON_obj.properties.tags;

			var ref = t['ref'];
			var ref_start = t['ref:start_date'];
			var nt = t['natural'];
			if (t['barrier'] == 'hedge')
				nt = 'scurb';
			var stx =  t['source:taxon'];
			var stx1 = base.osm.data.source_taxon[stx];
			stx = stx1 ? stx1 : (stx ? stx : null);
			var bio_lat = base.biolog_format({
				genus: t['genus'],
				spieces: t['spieces'],
				taxon: t['taxon'] ? t['taxon'] : t['was:taxon']
			});
			var bio_rus = base.biolog_format({
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
			var sq = base.OsmGDlib.γεωμετρία.sqf(osmGeoJSON_obj.geometry);
			sq = sq ? '≈' + sq.toFixed(1) + 'м²' : '';
			var маточная_площадка = {
				No: null,
				Участок: Уч,
				Год_учёта: ref_start ? ref_start : '',
				Номер_площадки: ref,
				Подтверждение_вида: stx,
				Род: bio_rus[0].genus ?? '',
				Вид: bio_rus[0].spieces ? (Array.isArray(bio_rus[0].spieces) ? bio_rus[0].spieces.join(' ') : bio_rus[0].spieces) : '',
				Genus: bio_lat[0].genus ? bio_lat[0].genus : '',
				Spieces: bio_lat[0].spieces ? (Array.isArray(bio_lat[0].spieces) ? bio_lat[0].spieces.join(' ') : bio_lat[0].spieces) : '',
				Род2: bio_rus[1] ? bio_rus[1].genus : '',
				Вид2: bio_rus[1] ? bio_rus[1].spieces.join(' ') : '',
				Genus2: bio_lat[1] ? bio_lat[1].genus : '',
				Spieces2: bio_lat[1] ? bio_lat[1].spieces.join(' ') : '',
				Тип: base.osm.data.natural[nt] ?? null,
				Сезонность: base.osm.data.leaf_cycle[lc].ru,
				Листва: base.osm.data.leaf_type[lt].ru,
				Площадь: sq,
				Заметки: note ? note : null,
				Датировка: start ? start : '',
				Описание: descr ? descr : '',
				Вырублен: t['was:taxon'] ? '1' : null,
				Нужно_доработать: fm ?? null,
				Табличка: null,
				_ref: ref
			};
			return маточная_площадка;
		},
		interactive: function (base, block, маточная_площадка) {
			return {
				tooltip : маточная_площадка.Участок + "×" + маточная_площадка.Номер_площадки + (маточная_площадка.Род ? (' : ' + маточная_площадка.Род + ' ' + маточная_площадка.Вид) : ''),
				popup : base.popup(маточная_площадка, '<b>Карточка</br>маточной площадки</b></br><i>№ в таблице</i> ', block)
					};			
		},
		geoJSON_style: function (base, osmGeoJSON_obj, маточная_площадка) {
			var S = {};
			if (маточная_площадка.Тип == 'Кусты')
				S.weight = 1;
			else if (маточная_площадка.Тип == '?')
				S.weight = 2;
			else
				S.weight = 2;

			var lc = osmGeoJSON_obj.properties.tags['leaf_cycle'];
			var lt = osmGeoJSON_obj.properties.tags['leaf_type'];
			if (base.osm.data.leaf_type[lt])
				S.color = base.osm.data.leaf_type[lt].color;
			else
				S.color = "#88FF88";
			if (base.osm.data.leaf_cycle[lc])
				S.fillColor = base.osm.data.leaf_cycle[lc].color;
			else
				S.fillColor = "#88FF88";
			S.fillOpacity = 0.2;
			return S;
		},
		sort: function (a, b) {
			var ka = ('000' + a.data._ref.replace(/\D+/g,"")).substr(-3);
			var kb = ('000' + b.data._ref.replace(/\D+/g,"")).substr(-3);
			var au = ('00' + a.data.Участок).substr(-2);
			var bu = ('00' + b.data.Участок).substr(-2);
			if (au < bu) return -1;
			if (au > bu) return 1;
			if (ka < kb) return -1;
			if (ka > kb) return 1;
			if (a.data._ref < b.data._ref) return -1;
			if (a.data._ref > b.data._ref) return 1;
			return 0;
		}
	},
	Водотоки: {
		filter: function (base, osmGeoJSON_obj) {
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
		webData_object: function (base, osmGeoJSON_obj, data_obj){
			return data_obj;
			},
		SQL: function(){
			return {
				No: "integer not null",
				Участок: "varchar(8)"
			}
		},
		data_object: function (base, osmGeoJSON_obj, Уч) {
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

			var wt = base.osm.data.water[ww];
			var n = t['name'];
			n = n ? n : t['alt_name'];
			n = n ? n : t['local_name'];
			n = n ? n : '';
			var wd = t['width'];
			wd = wd ? wd : '';
			var mt_len = base.OsmGDlib.γεωμετρία.len(osmGeoJSON_obj.geometry);
			var sq = base.OsmGDlib.γεωμετρία.sqf(osmGeoJSON_obj.geometry);
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
				Подтверждение_направления_течения: base.osm.data.source_direction[t['source:direction']],
			};
			return водоток;
		},
		interactive: function (base, block, водоток) {
			return {
				tooltip : водоток.Название ? водоток.Название : водоток.Местное ? водоток.Местное : водоток.Другое_название ? водоток.Другое_название : '',
				popup : base.popup(водоток, '<b>Карточка водотока</b></br><i>№ в таблице</i> ', block)
					};
		},
		geoJSON_style: function (base, osmGeoJSON_obj, вт) {
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
			if (a.data.Название === b.data.Название) {
				return 0;
			}
			else if (!a.data.Название) {
				return 1;
			}
			else if (!b.data.Название) {
				return -1;
			}
			else {
				return (a.data.Название < b.data.Название) ? -1 : 1;
			}
		}
	},
	Дорожно_тропиночая_сеть: {
		filter: function (base, osmGeoJSON_obj) {
			var t = osmGeoJSON_obj.properties.tags;
			var hw = t['highway'];
			if (['path', 'footway', 'footpath', 'service', 'track', 'steps', 'pedestrian'].indexOf(hw) < 0)
				return false;
			return true;
		},
		webData_object: function (base, osmGeoJSON_obj, data_obj){
			return data_obj;
			},
		data_object: function (base, osmGeoJSON_obj, Уч) {
			var t = osmGeoJSON_obj.properties.tags;

			var hw = t['highway'];
			var hs = t['surface'];
			var ht = base.osm.data.highway[hw];
			var hst = '';
			if (hs)
				hst = base.osm.data.surface[hs];
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
			var mt_len = base.OsmGDlib.γεωμετρία.len(osmGeoJSON_obj.geometry);

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
			};
			return дорожка;
		},
		interactive: function (base, block, дорожка) {
			return {
				tooltip : (дорожка.Название ? дорожка.Название : дорожка.Местное ? дорожка.Местное : дорожка.Другое_название ? дорожка.Другое_название : '') + (дорожка.Покрытие ? (' (' + дорожка.Покрытие + ')') : ''),
				popup : base.popup(дорожка, '<b>Карточка элемента</br>дорожно-тропиночной сети</b></br><i>№ в таблице</i> ', block)
					};
		},
		geoJSON_style: function (base, osmGeoJSON_obj, др) {
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
			if (base.osm.data.surface_color[hs])
				S.color = base.osm.data.surface_color[hs];
			else
				S.color = 'white';
			return S;
		},
		sort: function (a, b) {
			if (a.data.Название === b.data.Название) {
				return 0;
			}
			else if (!a.data.Название) {
				return 1;
			}
			else if (!b.data.Название) {
				return -1;
			}
			else {
				return (a.data.Название < b.data.Название) ? -1 : 1;
			}
		}
	},
	Обсадки: {
		filter: function (base, osmGeoJSON_obj) {
			var t = osmGeoJSON_obj.properties.tags;
			return (t['natural'] == 'tree_row' || t['barrier'] == 'hedge');
		},
		webData_object: function (base, osmGeoJSON_obj, data_obj){
			return data_obj;
			},
		data_object: function (base, osmGeoJSON_obj, Уч) {
			var t = osmGeoJSON_obj.properties.tags;

			var mt_len = base.OsmGDlib.γεωμετρία.len(osmGeoJSON_obj.geometry);
			var bio_rus = base.biolog_format({
				genus: t['genus:ru'],
				spieces: t['spieces:ru'],
				taxon: t['taxon:ru'] ? t['taxon:ru'] : t['was:taxon:ru']
			});
			var bio_lat = base.biolog_format({
				genus: t['genus'],
				spieces: t['spieces'],
				taxon: t['taxon'] ? t['taxon'] : t['was:taxon']
			});
			var обсадка = {
				No: null,
				Род: bio_rus[0].genus ? bio_rus[0].genus : bio_lat[0].genus ? bio_lat[0].genus : '',
				Вид: bio_rus[0].spieces ? bio_rus[0].spieces.join(' ') : bio_lat[0].spieces ? bio_lat[0].spieces : '',
				Длина_части: mt_len
			};
			return обсадка;
		},
		interactive: function (base, block, обсадка) {
			return {
				tooltip : обсадка.Род + ' ' + обсадка.Вид,
				popup : base.popup(обсадка, '<b>Карточка обсадки</b></br><i>№ в таблице</i> ', block)
					};
		},
		geoJSON_style: function (base, osmGeoJSON_obj) {
			var S = {};
			S.weight = 1;
			var lc = osmGeoJSON_obj.properties.tags['leaf_cycle'];
			var lt = osmGeoJSON_obj.properties.tags['leaf_type'];
			if (base.osm.data.leaf_type[lt])
				S.color = base.osm.data.leaf_type[lt].color;
			else
				S.color = "#88FF88";
			/*			if (base.osm.data.leaf_cycle[lc])
							S.fillColor = base.osm.data.leaf_cycle[lc].color;
						else
							S.fillColor = "#88FF88";
						S.fillOpacity = 0.2;*/
			return S;
		},
		sort: null
	},
	Площадки: {
		filter: function (base, osmGeoJSON_obj) {
			var t = osmGeoJSON_obj.properties.tags;
			var l = t['leisure'];
			if (!l)
				return false;
			if (l == 'playground' || l == 'pitch' || l == 'dog_park')
				return true;
			return false;
		},
		webData_object: function (base, osmGeoJSON_obj, data_obj){
			return data_obj;
			},
		data_object: function (base, osmGeoJSON_obj, Уч) {
			var t = osmGeoJSON_obj.properties.tags;

			var l = t['leisure'];
			var lt = base.osm.data.leisure[l];
			var sp = t['sport'];
			var st = base.osm.data.sport[sp];
			var sq = base.OsmGDlib.γεωμετρία.sqf(osmGeoJSON_obj.geometry);
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
			};
			return площадка;
		},
		interactive: function (base, block, площадка) {
			return {
				tooltip : площадка.Тип + площадка.Спорт ? ('(' + площадка.Спорт + ')') : '',
				popup : base.popup(площадка, '<b>Карточка площадки</b></br><i>№ в таблице</i> ', block)
					};
		},
		geoJSON_style: function (base, osmGeoJSON_obj, пл) {
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
			au = ('00' + a.data.Участок).substr(-2);
			bu = ('00' + b.data.Участок).substr(-2);
			if ( au < bu) return -1;
			if ( au > bu) return 1;
			return 0;
		}
	},
	Справочные_объекты: {
		filter: function (base, osmGeoJSON_obj) {
			var t = osmGeoJSON_obj.properties.tags;
			var tr = t['tourism'];
			var i = t['information'];
			if (!tr || !i)
				return false;
			return true;
		},
		webData_object: function (base, osmGeoJSON_obj, data_obj){
			return data_obj;
			},
		data_object: function (base, osmGeoJSON_obj, Уч) {
			var t = osmGeoJSON_obj.properties.tags;

			var i = t['information'];
			var bt = t['board_type'];
			var note = t['note'];
			var name = t['name'];
			var start = t['start_date'];
			var descr = t['description'];
			var bio_lat = base.biolog_format({
				genus: t['genus'],
				spieces: t['spieces'],
				taxon: t['taxon'] ? t['taxon'] : t['was:taxon']
			});
			var bio_rus = base.biolog_format({
				genus: t['genus:ru'],
				spieces: t['spieces:ru'],
				taxon: t['taxon:ru'] ? t['taxon:ru'] : t['was:taxon:ru']
			});
			var справочный_объект = {
				No: null,
				Тип_справки: base.osm.data.information[i],
				Тип_информации: (i == 'board' && bt) ? base.osm.data.board_type[bt] : null,
				Участок : Уч,
				Название : name ? name : null,
				Род: bio_rus[0].genus ?? '',
				Вид: bio_rus[0].spieces ? (Array.isArray(bio_rus[0].spieces) ? bio_rus[0].spieces.join(' ') : bio_rus[0].spieces) : '',
				Genus: bio_lat[0].genus ? bio_lat[0].genus : '',
				Spieces: bio_lat[0].spieces ? (Array.isArray(bio_lat[0].spieces) ? bio_lat[0].spieces.join(' ') : bio_lat[0].spieces) : '',
				Род2: bio_rus[1] ? bio_rus[1].genus : '',
				Вид2: bio_rus[1] ? bio_rus[1].spieces.join(' ') : '',
				Genus2: bio_lat[1] ? bio_lat[1].genus : '',
				Spieces2: bio_lat[1] ? bio_lat[1].spieces.join(' ') : '',
				Заметки: note ? note : null,
				Датировка: start ? start : '',
				Описание: descr ? descr : '',
				Площадка: null
			};
			return справочный_объект;
		},
		interactive: function (base, block, справочный_объект) {
			return {
				tooltip : '',
				popup : base.popup(справочный_объект, '<b>Карточка справочного объекта</b></br><i>№ в таблице</i> ', block)
					};
		},
		geoJSON_style: function (base, osmGeoJSON_obj, пл) {
			var S = {};
			S.weight = 4;				
			return S;
		},
		sort: function (a, b) {
			au = ('00' + a.data.Участок).substr(-2);
			bu = ('00' + b.data.Участок).substr(-2);
			if ( au < bu) return -1;
			if ( au > bu) return 1;
			return 0;
		}
	},
	Объекты_культурного_наследия: {
		filter: function (base, osmGeoJSON_obj) {
			var t = osmGeoJSON_obj.properties.tags;
			var r = t['ref:ЕГРОКН'];
			var r1 = t['ref:okn'];
			if (!r && !r1)
				return false;
			return true;
		},
		webData_object: function (base, osmGeoJSON_obj, data_obj){
			return data_obj;
			},
		data_object: function (base, osmGeoJSON_obj, Уч) {

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
				Описание: descr ?? ''
			};
			return ОКН;
		},
		interactive: function (base, block, ОКН) {
			return {
				tooltip : ОКН.Название,
				popup : base.popup(ОКН, '<b>Карточка объекта культурного наследия</b></br><i>№ в таблице</i> ', block)
					};
		},
		geoJSON_style: function (base, osmGeoJSON_obj, ОКН) {
			var S = {};
			S.weight = 1;
			S.color = '#ff0000';
			return S;
		},
		sort: function (a, b) {
			au = ('00' + a.data.Участок).substr(-2);
			bu = ('00' + b.data.Участок).substr(-2);
			if ( au < bu) return -1;
			if ( au > bu) return 1;
			if (a.data.Название < b.data.Название) return -1;
			if (a.data.Название > b.data.Название) return 1;
			return 0;
		}
	},
	Урны: {
		filter: function (base, osmGeoJSON_obj) {
			var t = osmGeoJSON_obj.properties.tags;
			var l = t['amenity'];
			if (!l || l != 'waste_basket')
				return false;
			return true;
		},
		webData_object: function (base, osmGeoJSON_obj, data_obj){
			return data_obj;
			},
		data_object: function (base, osmGeoJSON_obj, Уч) {

			var t = osmGeoJSON_obj.properties.tags;

			var l = t['leisure'];
			var урна = {
				No: null,					
			/*	Заметки: note ? note : null,
				Датировка: start ? start : '',
				Описание: descr ? descr : '',*/
				Участок : Уч
			};
			return урна;
		},
		interactive: function (base, block, урна) {
			return {
				tooltip : '',
				popup : base.popup(урна, '<b>Карточка урны</b></br><i>№ в таблице</i> ', block)
			};
		},
		geoJSON_style: function (base, osmGeoJSON_obj, урна) {
			var S = {};
			S.weight = 4;				
			return S;
		},
		sort: function (a, b) {
			au = ('00' + a.data.Участок).substr(-2);
			bu = ('00' + b.data.Участок).substr(-2);
			if ( au < bu) return -1;
			if ( au > bu) return 1;
			return 0;
		}
	},
	Скамейки: {
		filter: function (base, osmGeoJSON_obj) {
			var t = osmGeoJSON_obj.properties.tags;
			var l = t['amenity'];
			if (!l || l != 'bench')
				return false;
			return true;
		},
		webData_object: function (base, osmGeoJSON_obj, data_obj){
			return data_obj;
			},
		data_object: function (base, osmGeoJSON_obj, Уч) {

			var t = osmGeoJSON_obj.properties.tags;

			var l = t['amenity'];
			var bc = t['backrest'];
			var mt = t['material'];
			var cl = t['color'];
			var mtt = base.osm.data.material[mt];
			var скамейка = {
				No: null,
				Спинка: (bc == 'yes') ? 'есть' : 'нет',					
				Метариал: mtt ? mtt : (mt ? mt : ''),
				Цвет: cl ? cl : '',
			/*	Заметки: note ? note : null,
				Датировка: start ? start : '',
				Описание: descr ? descr : '',*/				
				Участок: Уч
			};
			return скамейка;
		},
		interactive: function (base, block, скамейка) {
			return {
				tooltip : '',
				popup : base.popup(скамейка, '<b>Карточка скамейки</b></br><i>№ в таблице</i> ', block)
			};
		},
		geoJSON_style: function (base, osmGeoJSON_obj, скамейка) {
			var S = {};
			S.weight = 4;				
			return S;
		},
		sort: function (a, b) {
			au = ('00' + a.data.Участок).substr(-2);
			bu = ('00' + b.data.Участок).substr(-2);
			if ( au < bu) return -1;
			if ( au > bu) return 1;
			return 0;
		}
	},
	Достопримечательности: {
		filter: function (base, osmGeoJSON_obj) {
			var t = osmGeoJSON_obj.properties.tags;
			var l = t['tourism'];
			if (!l)
				return false;
			if (l != 'attraction' && l != 'artwork')
				return false;
			return true;
		},
		webData_object: function (base, osmGeoJSON_obj, data_obj){
			return data_obj;
			},
		data_object: function (base, osmGeoJSON_obj, Уч) {
			var t = osmGeoJSON_obj.properties.tags;

			var n = t['name'];
			var at = t['artwork_type'];
			var mt = t['material'];
			var au = t['artist_name'];
			var start = t['start_date'];				
			var note = t['note'];
			var mtt = base.osm.data.material[mt];
			var дпр = {
				No: null,
				Тип: at ? base.osm.data.artwork_type[at] : '',
				Название: n ? n : '',
				Автор: au ? au : '',
				Заметки: note ? note : '',
				Датировка: start ? start : '',					
				Участок: Уч
			};
			return дпр;
		},
		interactive: function (base, block, дпр) {
			return {
				tooltip : '',
				popup : base.popup(дпр, '<b>Карточка достопримечательности</b></br><i>№ в таблице</i> ', block)
					};
		},
		geoJSON_style: function (base, osmGeoJSON_obj, дпр) {
			var S = {};
			S.weight = 4;				
			return S;
		},
		sort: function (a, b) {
			return 0;
			/*if (a.data.Название === b.data.Название) {
				return 0;
			}
			else if (!a.data.Название) {
				return 1;
			}
			else if (!b.data.Название) {
				return -1;
			}
			else {
				return (a.data.Название < b.data.Название) ? -1 : 1;
			}*/
		}
	},
	Малые_формы: {
		filter: function (base, osmGeoJSON_obj) {
			var t = osmGeoJSON_obj.properties.tags;
			var tr = t['tourism'];
			var hs = t['historic'];
			if (!tr && !hs)
				return false;
			if (hs == 'memorial' || tr == 'artwork')
				return true;
			return false;
		},
		webData_object: function (base, osmGeoJSON_obj, data_obj){
			return data_obj;
			},
		data_object: function (base, osmGeoJSON_obj, Уч) {
			var t = osmGeoJSON_obj.properties.tags;

			var l = t['amenity'];
			var bc = t['backrest'];
			var mt = t['material'];
			var n = t['name'];
			var mtt = base.osm.data.material[mt];
			var малая_форма = {
				No: null,
				Название: n ? n : '',
				Метариал: mtt ? mtt : (mt ? mt : ''),					
			/*	Заметки: note ? note : null,
				Датировка: start ? start : '',
				Описание: descr ? descr : '',*/
				Участок: Уч
			};
			return малая_форма;
		},
		interactive: function (base, block, малая_форма) {
			return {
				tooltip : '',
				popup : base.popup(малая_форма, '<b>Карточка малой формы</b></br><i>№ в таблице</i> ', block)
					};
		},
		geoJSON_style: function (base, osmGeoJSON_obj, малая_форма) {
			var S = {};
			S.weight = 4;				
			return S;
		},
		sort: function (a, b) {
			return 0;
			/*if (a.data.Название === b.data.Название) {
				return 0;
			}
			else if (!a.data.Название) {
				return 1;
			}
			else if (!b.data.Название) {
				return -1;
			}
			else {
				return (a.data.Название < b.data.Название) ? -1 : 1;
			}*/
		}
	}
};
