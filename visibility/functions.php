<?php

/* 
 * @file functions.php
 * @encoding UTF-8
 * 
 * Copyright (c) 2016, antonpresn@gmail.com
 * 
 * @author Anton Presnyakov <antonpresn@gmail.com>
 * @date 30.11.2016 15:55:49
 */

namespace app\components\emotion\visibility;

/**
 * normalize field value for correct applying on visibility map
 * @param mixed $fieldValue 
 * @return int
 */
function normalizeFieldValue ($fieldKey, $fieldValue, $mapGroup) {

	$fieldValuesMap = \is_array($mapGroup) && \array_key_exists($fieldKey, $mapGroup) && !empty($mapGroup[$fieldKey][2]) 
							? $mapGroup[$fieldKey][2]
							: null;

	// in case of checkbox
	if ($fieldValuesMap === true || $fieldValuesMap === 1) {
		$fieldValueNormalized = ($fieldValue ==='N' 
									? 0 
									: ($fieldValue ==='Y' 
										? 1 
										: (int)($fieldValue)
									)	
								);
	} else {
		$fieldValueNormalized = isset($fieldValuesMap[$fieldValue]) ? (int)$fieldValuesMap[$fieldValue] : (int)$fieldValue;
	}
	
	return $fieldValueNormalized;
}

/**
 * get visibility for all fields by given values with keys
 * @param array $fieldsValues (fieldkey => fieldvalue)
 * @param array $map visibility map 
 * @return array (fieldkey => fieldVisibility)
 */
function getVisibility ($fieldsValues, $map) {
	
	$sortedMap = \array_map(function ($mapGroup) {
		\uasort($mapGroup, function ($fieldMapA, $fieldMapB) {
			$affectsA = !empty($fieldMapA[2]);
			$affectsB = !empty($fieldMapB[2]);

			$levelA = isset($fieldMapA[0]) ? $fieldMapA[0] : 0;
			$levelB = isset($fieldMapB[0]) ? $fieldMapB[0] : 0;
			
			$bTop = ($affectsA && $affectsB) === true;

			if ($bTop || ($affectsA === $affectsB)) {
				$result = ($levelB - $levelA);
			} else {
				$result = $affectsA ? -1 : 1;
			}

			$result = isset($result) ? $result : 0;

			return $result;
		});
		return $mapGroup;
	}, $map);


	$keyedMap = \array_map(
			function($keyMapGroup, $valueMapGroup) {
			return array($keyMapGroup => $valueMapGroup);
		}, \array_keys($sortedMap), $sortedMap);
 	$fieldsKeys = \array_keys($fieldsValues);

	$groupWeightMap = \array_map(function ($fieldKey, $fieldValue) use ($keyedMap, $fieldsValues) {
		
		$fieldWeightMap = \array_reduce($keyedMap, 

		function ($res, $mapGroupPair) use ($fieldKey, $fieldValue, $fieldsValues) {
			list($mapGroupId, $mapGroup) = \each($mapGroupPair);
			
			// \Uralsib\Utils::addLog($fieldValueNormalized, '', 'class', array(null, 'normalizeFieldValue', array($fieldKey,$fieldValue)));
	
			$resPrev = isset($res) ? $res : array();

			if (($check = checkFieldVisibilityLevel($fieldKey, $mapGroup, $fieldsValues))>0) { // found and affects
				$resCurr = array($mapGroupId => normalizeFieldValue($fieldKey, $fieldValue, $mapGroup));//incrementFieldLevel($fieldMap, $fieldValueNormalized)				
			} else if ($check === 0) { // found but not affects
				$resCurr = array($mapGroupId => 0);					
			} else {
				$resCurr = array();
			}
			
			$weightMap = $resCurr + $resPrev;

			return $weightMap;		
			
		});
		
		return ($fieldWeightMap);

	}, $fieldsKeys, $fieldsValues);
	
	$groupAggregateMap = \array_reduce($groupWeightMap, function ($res, $curr) {
				$resPrev = (isset($res) ? $res: array());
				$keys = \array_keys($resPrev + $curr);
				
				$resultAggregated = \array_combine($keys, \array_map(function($key) use ($resPrev, $curr){

					$valPrev = \array_key_exists($key, $resPrev) ? $resPrev[$key] : 0;
					$valCurr = \array_key_exists($key, $curr) ? $curr[$key] : 0;
					
					return $valPrev + $valCurr;
				}, $keys));
				
				return $resultAggregated;
			});
            \ksort($groupAggregateMap);

	$fieldsVisibilityMap = \array_map(function ($mapGroupPair) use ($groupAggregateMap) {
		
		list($mapGroupId, $mapGroup) = \each($mapGroupPair);
		$aggregatedMapValue = \array_key_exists($mapGroupId, $groupAggregateMap) ? $groupAggregateMap[$mapGroupId] : 0;
		
		$fieldVisibilityGroup = \array_map(function ($mapProps) use ($aggregatedMapValue) {
			return getFieldVisibilityByMap($mapProps, $aggregatedMapValue);	
		}, $mapGroup);

		return $fieldVisibilityGroup;

	}, $keyedMap);

	$fieldsVisibility = \array_reduce($fieldsVisibilityMap, function ($res, $groupVisibilityMap) use ($fieldsKeys) {
				$resPrev = (isset($res) ? $res: array());
				
				$aggr = \array_combine($fieldsKeys, \array_map(function ($key) use ($resPrev, $groupVisibilityMap) {
					$visibilityPrev = !empty($resPrev[$key]);
					$visibilityCurr = !empty($groupVisibilityMap[$key]);
					return $visibility = $visibilityPrev || $visibilityCurr;
				}, $fieldsKeys));
				return $aggr;
			});


	$fieldsVisibilityResult = $fieldsVisibility;
	return $fieldsVisibilityResult;
}

function checkFieldVisibilityLevel ($fieldKey, $mapGroup, $fieldsValues) {
	if (\array_key_exists($fieldKey, $mapGroup)) {
		$fieldMap = $mapGroup[$fieldKey];

		if (!empty($fieldMap[2])) {

			$prevFieldMap = null;
			$prevAggrValue = 0;
			
			do {
				list ($curFieldKey, $curFieldMap) = \each($mapGroup);

				$normValue = normalizeFieldValue($curFieldKey, $fieldsValues[$curFieldKey], $mapGroup);
				$aggrNormValue = (isset($prevFieldMap) && ($prevFieldMap[0] !==$curFieldMap[0]) 
										? $prevAggrValue + $normValue  
										: (!isset($prevFieldMap) 
											? $normValue 
											: $prevAggrValue
										)
								);


				$check = getFieldVisibilityByMap ($curFieldMap, $aggrNormValue) 
															&& getFieldVisibilityByMap ($curFieldMap, $prevAggrValue);
				$prevFieldMap = $curFieldMap;
				$prevAggrValue = $aggrNormValue;
				
			} while ($check && !empty($curFieldMap[2]) && (\strcmp($fieldKey, $curFieldKey) !==0));
			 
			if ($check && (\strcmp($fieldKey, $curFieldKey) ===0)) {
				$result = 1;
			} 
		} 

		if (!isset($result)) {
			$result = 0;
		}
	} else {
		$result = -1;
	}
	return $result;
}
/**
 * return visibility of element by given value and visibility map properties for this field
 * @param array $mapProps 
 * @param int $fieldValueNormalized 
 * @return bool visible or not
 */
function getFieldVisibilityByMap($mapProps, $fieldValueNormalized) {
	
	$defaultBase = 0;
	$defaultOp = '>';
	
	$newFieldLevel = incrementFieldLevel($mapProps, $fieldValueNormalized);
	$op = isset($mapProps[1]) ? $mapProps [1] : $defaultOp;
	$base = (int)(isset($mapProps[3]) ? $mapProps [3] : $defaultBase); // todo mapprops

	if (\preg_match("/^([+-]?\d+)(\.\.)([+-]?\d+)$/", $op, $matches) === 1) {
		$op = $matches[2]; // ..
		$var1 = (int)$matches[1];
		$var2 = (int)$matches[3];
	}
	switch ($op) {
		case '>':
			$visibility = $newFieldLevel > $base;
			break;
		case '>=':
			$visibility = $newFieldLevel >= $base;
			break;
		case '=':
			$visibility = $newFieldLevel === $base;
			break;
		case '..':
			$visibility = ($newFieldLevel >= $var1) && ($newFieldLevel <= $var2);
			break;
		default :
			$visibility = false;
	}
	$resultVisibility = isset($visibility) ? $visibility : false;

	return $resultVisibility;
}

function incrementFieldLevel ($mapProps, $fieldValueNormalized) {
	$defaultLevel = 1;
	$result = (int)(isset($mapProps[0]) ? $mapProps[0] : $defaultLevel) + (int) $fieldValueNormalized;

	return $result;
}