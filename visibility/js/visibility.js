(function($) {		
		function ArrayFind(thisOb, predicate) {
		    if (thisOb == null) {
		      throw new TypeError('Array.prototype.find called on null or undefined');
		    }
		    if (typeof predicate !== 'function') {
		      throw new TypeError('predicate must be a function');
		    }
		    var list = Object(thisOb);
		    var length = list.length >>> 0;
		    var thisArg = arguments[2];
		    var value;

		    for (var i = 0; i < length; i++) {
		      value = list[i];
		      if (predicate.call(thisArg, value, i, list)) {
		        return value;
		      }
		    }
		    return undefined;
		  };
		
		

		function getField(f) {
			return $('[name="'+f+'"]:not([type="hidden"])');
		}

		function getAffectFields (map) {
			var r = function(prev, curr){
				var fPrev = prev === null ? [] : prev,
					fCurr = (curr[1] && curr[1][2] ? [curr[0]] : []);
				return fPrev.concat(fCurr);
			};

			var all = map.reduce(function(g, gcurr) {
				// debugger;
				var g = g === null ? [] : g;
				return g.concat(gcurr.reduce(r, null));
			}, null);

			
			// unique elements from here http://stackoverflow.com/questions/9229645/remove-duplicates-from-javascript-array
			var filt = all.filter(function(item, pos, self) { 
			    return self.indexOf(item) == pos;
			});

			
			return filt;
		}	

		function collectFieldsValues(frm) {
			
			var fieldsValues = $.map($.makeArray(frm.find('*').filter(function(i, el){
				return $(el).filter(':input').length && (el.type !== 'submit') && (el.type !=='button') && (el.type!=='hidden');
			})), function(el, i) {
				var pair = {};
				pair[el.name] = el.type === 'checkbox' ? $(el).prop('checked') : $(el).val();
				return pair;
			}).reduce(function (prev, next) {
				
				
				return $.extend(prev, next);
			});

			return fieldsValues;
		}
		/**
		* get visibility for all fields by given values with keys
		* @param object fieldsValues (fieldkey => fieldvalue)
		* @return object (fieldkey => fieldVisibility)
		*/
		function getVisibility (fieldsValues, map) {
			// console.log(fieldsValues);		

			var sortedMap = map.map(function (mapGroup) {
				return mapGroup.sort(function(fieldMapA, fieldMapB) {
					var affectsA = !!fieldMapA[1][2],
						affectsB = !!fieldMapB[1][2],
						levelA = !!fieldMapA[1][0] ? fieldMapA[1][0] : 0,
						levelB = !!fieldMapB[1][0] ? fieldMapB[1][0] : 0,
						bTop = (affectsA && affectsB) === true;

						if (bTop || (affectsA === affectsB)) {
							result = levelB - levelA;
						} else {
							result = affectsA ? -1 : 1;
						}

						return parseInt(result);
				});
			});
			

			// var keyedMap = sortedMap.map(
			// 		function(valueMapGroup, keyMapGroup) {
			// 			var mg = [];
			// 			mg[keyMapGroup] = valueMapGroup;
			// 			
			// 		return mg;
			// 	}), 

			var fieldsKeys = [];
			
			for(var key in fieldsValues) {
				fieldsKeys.push (key);
			}
			
			
			var groupWeightMap = fieldsKeys.map(function (fieldKey)  {
				
				var fieldWeightMap = sortedMap.reduce ( 

					function (res, mapGroupPair, mapGroupId) {
						var mapGroup = mapGroupPair;//.pop(),
									
						var resPrev = res !==null ? res : {},
						resCurr = {};
						// console.log('mapGroupId');
						// console.log(mapGroupId);
						if ((check = checkFieldVisibilityLevel(fieldKey, mapGroup, fieldsValues))>0) { // found and affects
							resCurr[mapGroupId] = normalizeFieldValue(fieldKey, fieldsValues[fieldKey], mapGroup);//incrementFieldLevel($fieldMap, $fieldValueNormalized)				
						} else if (check === 0) { // found but not affects
							resCurr[mapGroupId] = 0;					
						}
						
						
						var weightMap = Object.assign({}, resCurr, resPrev);
						// console.log('weightMap');
						// console.log(weightMap);
						return weightMap;		
						
					}, null);
				
				return (fieldWeightMap);
			});
			
			var groupAggregateMap = groupWeightMap.reduce(function (res, curr) {
						
						var resPrev = (res !== null) ? res : {},						
						keys = Object.keys(Object.assign({}, resPrev, curr ? curr : {})),
						
                        preResultAggregated = keys.map(function(key) {

							var valPrev = !!resPrev[key] ? resPrev[key] : 0,
								valCurr = !!curr[key] ? curr[key] : 0,
                                res = {};					
                            res[key] = valPrev + valCurr;
							return res;
						}); 

						var resultAggregated = preResultAggregated.reduce(function (p, c) {
                            return Object.assign({}, p ? p : {}, c ? c : {});
                        });
						
						
						return resultAggregated;
					}, null),

			// ksort($groupAggregateMap);
			
			// console.log('groupAggregateMap');
			// console.log(groupWeightMap);
			// console.log(groupAggregateMap);
			fieldsVisibilityMap = sortedMap.map(function (mapGroupPair, mapGroupId) {
				
				var mapGroup = mapGroupPair,
					aggregatedMapValue = !!groupAggregateMap [mapGroupId] ? groupAggregateMap[mapGroupId] : 0,
				
					fieldVisibilityGroup = mapGroup.map (function (mapPropsAll) {
						return getFieldVisibilityByMap(mapPropsAll[1], aggregatedMapValue);	
					});

				return fieldVisibilityGroup.map(function(v, i) {
					return [mapGroup[i][0], v];
				});
			}),
			

			fieldsVisibility = fieldsVisibilityMap.reduce(function (res, groupVisibilityMap, ind) {
						var resPrev =  res !==null ? res : [];
						
						var aggr = fieldsKeys.map (function (key, i) {
							
							var prev = ArrayFind(resPrev, function(el){ return el[0] === key}),
								curr = ArrayFind(groupVisibilityMap, function(el){ return el[0] === key}),
								visibilityPrev = !!prev && !!prev[1],
								visibilityCurr = !!curr && !!curr[1];
							return [key, visibilityPrev || visibilityCurr];
						});

						return aggr;
					}, null),


			fieldsVisibilityResult = fieldsVisibility;
			return fieldsVisibilityResult;
		}

		function checkFieldVisibilityLevel (fieldKey, mapGroup, fieldsValues) {
			var fieldMapAll, result;
			
			if (fieldMapAll = mapGroup && ArrayFind(mapGroup, function(element){return element[0] === fieldKey;})) {
				var fieldMap = !!fieldMapAll[1] && fieldMapAll[1];
			

				if (fieldMap[2]) {

					var prevFieldMap = null,
						prevAggrValue = 0,
						curFieldKey = null,	
						check = false,
						
					checkSome = mapGroup.some(function (curFieldMapAll, ind) {
						
						
				
						curFieldKey = curFieldMapAll[0];
				
					// debugger;
						var curFieldMap = curFieldMapAll[1],					
							normValue = normalizeFieldValue(curFieldKey,
														 fieldsValues[curFieldKey], mapGroup),
							aggrNormValue = (!!prevFieldMap && (prevFieldMap[0] !== curFieldMap[0]) 
												? prevAggrValue + normValue
												: (prevFieldMap === null
													? normValue
													: prevAggrValue
													)
												);

							check = getFieldVisibilityByMap(curFieldMap, aggrNormValue)
																		 && getFieldVisibilityByMap(curFieldMap, prevAggrValue);
							// console.log('getFieldVisibilityByMap');
							// console.log(check);
							// console.log([curFieldMap, aggrNormValue, prevAggrValue, normValue]);

							prevFieldMap = curFieldMap,
							prevAggrValue = aggrNormValue;

							return !(check && !!curFieldMap[2] && (fieldKey.localeCompare(curFieldKey) !==0));
					});

					
					if (check && (fieldKey.localeCompare(curFieldKey) ===0)) {
						result = 1;
					} 
				} 

				if (result===undefined) {
					result = 0;
				}
			} else {
				result = -1;
			}
			
			return result;
		}

		/**
		 * normalize field value for correct applying on visibility map
		 * @param mixed $fieldValue 
		 * @return int
		 */
		function normalizeFieldValue (fieldKey, fieldValue, mapGroup) {
			var mapField = ArrayFind(mapGroup, function(el) {return el[0] === fieldKey;}),
			
			fieldValuesMap = mapField && mapField[1] && mapField[1][2]
									? mapField[1][2]
									: null;
			
			
			
			// in case of checkbox
			if (fieldValuesMap === true || fieldValuesMap === 1) {
				var fieldValueNormalized = (fieldValue === true 
											? 1 
											: (fieldValue === false
												 ? 0 
												 : parseInt(fieldValue))
											);
			} else {
				
				var fieldValueNormalized = fieldValuesMap && (fieldValue in fieldValuesMap) 
							? parseInt(fieldValuesMap[fieldValue]) : ( isNaN(parseInt(fieldValue)) ? 0 : parseInt(fieldValue));
			}		
			// console.log(fieldKey + ' = '+fieldValue + ' normalized result is: ' + fieldValueNormalized);
			return fieldValueNormalized;
		}


		/**
		 * return visibility of element by given value and visibility map properties for this field
		 * @param array $mapProps 
		 * @param int $fieldValueNormalized 
		 * @return bool visible or not
		 */
		function getFieldVisibilityByMap(mapProps, fieldValueNormalized) {
			
			var visibility = undefined,
				defaultBase = 0,
				defaultOp = '>',
			
				newFieldLevel = incrementFieldLevel(mapProps, fieldValueNormalized),
				op = !!mapProps[1] ? mapProps [1] : defaultOp,
				base = parseInt(!!mapProps[3] ? mapProps [3] : defaultBase), // todo mapprops
                matches = false;

			if (matches = op.match(/^([+-]?\d+)(\.\.)([+-]?\d+)$/)) {
				op = matches[2]; // ..
				var var1 = parseInt(matches[1]),
					var2 = parseInt(matches[3]);
			}

			switch (op) {
				case '>':
					visibility = newFieldLevel > base;
					break;
				case '>=':
					visibility = newFieldLevel >= base;
					break;
				case '=':
					visibility = newFieldLevel === base;
					break;
				case '..':
					visibility = (newFieldLevel >= var1) && (newFieldLevel <= var2);
					
					break;
				default :
					visibility = false;
			}
			var resultVisibility = visibility !== undefined ? visibility : false;	

			return resultVisibility;
		}

		function incrementFieldLevel (mapProps, fieldValueNormalized) {
			var defaultLevel = 1,
			result = parseInt(!!mapProps[0] ? mapProps[0] : defaultLevel) + parseInt(fieldValueNormalized);
			
			return result;
		}

    window.emotion = $.extend(window.emotion ? window.emotion : {}, {'getVisibility':getVisibility});

})($);