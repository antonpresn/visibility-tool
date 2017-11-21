<?php
/* 
 * @file utils.php
 * @encoding UTF-8
 * 
 * Copyright (c) 2016, antonpresn@gmail.com
 * 
 * @author Anton Presnyakov <antonpresn@gmail.com>
 * @date 24.11.2016 8:54:07
 */
namespace app\components\emotion;

use yii\base\Component;
/**
 * Helper class
 */
class Utils extends Component {

	/**
	 * simple array merge helper for parameters merge 
	 * (unlike array_merge_recursive it merges sub arrays as array_merge)
	 * useful for merging default parameters like this
	 *	 $param = utils::mergeParam(array(
	*		'Folder' => array(
	*			'FolderClass' => 'IPF.Note',
	*			'DisplayName' => null
	*			),
	*		'ParentFolderId' => '...'
	 *		), $param);
	 * @param array $default array of defaults (merge into it)
	 * @param array $param array to merge from
	 * @return array 
	 */
	public static function mergeParam($default=array(), $param=array(), $extra = array()){
		if (!is_array($param)) {
			$param = array();
		}
		
		if (!is_array($default)) {
			$default = array();
		}
		$bExclude = !empty($extra['bExclude']);
		$level = array();
		foreach ($default as $k=> $d) {
			$b_exists = array_key_exists($k, $param);
			if (is_array($d)) {
				$level[$k] = self::mergeParam($d, $b_exists ? $param[$k] : null, $extra);
			} else if ($b_exists){
				$level[$k] = $param[$k];
			} else {
				$level[$k] = $d;
			}
		}		
		if (!$bExclude) {
			foreach ($param as $k=> $p) {
				$b_exists = array_key_exists($k, $default);
				if (!$b_exists) {
					$level[$k] = $p;
				}
			}
		}
		return $level;
	}
}