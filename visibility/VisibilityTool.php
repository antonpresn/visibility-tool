<?php

/* 
 * @file VisibilityTool.php
 * @encoding UTF-8
 * 
 * Copyright (c) 2016, antonpresn@gmail.com
 * 
 * @author Anton Presnyakov <antonpresn@gmail.com>
 * @date 30.11.2016 15:56:11
 */

namespace app\components\emotion\visibility;

require_once \dirname(__FILE__).'/functions.php';

use yii\base\Component;

/**
 * provides visibility of interface elements based on declarative array of visibility levels 
 * it supports complicated visibility shemes 
 */
class VisibilityTool extends Component {

    /**
     * visibility map
     *
     * @var array
     */
    public $map = [];
    
    /**
     * wrapper on getVisibility function 
     * passes current values and map to it
     * returns visibility state of elements
     * 
     * @param array $values
     * @return array
     */
    public function getVisibility($values) {
        return getVisibility($values, $this->map);
    }

    /**
     * returns visibility map 
     * if its not set then returns empty array 
     * 
     * @return array
     */
    public function getMap() {
        return (isset($this->map) && \is_array($this->map) ? $this->map : []);
    }

    /**
     * for js it should be little different array
     * 
     * @param array $params 
     * @return array
     */
    public function getMapJs($params) {
        $keyFormat = isset($params['key_format']) ? $params['key_format'] : false;
        $visMap = \array_map(function($g) use ($keyFormat) {	
            return \array_map(function($k, $m) use ($keyFormat)  {
                return array($keyFormat ? \str_replace("{key}", $k, $keyFormat) : $k, $m);
            }, \array_keys($g), $g);	
        }, $this->getMap());
        return $visMap;
    }
}