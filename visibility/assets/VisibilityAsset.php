<?php

/* 
 * @file VisibilityAsset.php
 * @encoding UTF-8
 * 
 * Copyright (c) 2016, antonpresn@gmail.com
 * 
 * @author Anton Presnyakov <antonpresn@gmail.com>
 * @date 30.11.2016 16:13:14
 */

namespace app\components\emotion\visibility\assets;

use yii\web\AssetBundle;

/**
 */
class VisibilityAsset extends AssetBundle
{
    public $sourcePath = '@app/components/emotion/visibility';
    public $js = [
        'js/visibility.js',
    ];
    public $depends = [
        'yii\web\JqueryAsset',
        'app\components\emotion\visibility\assets\PolyfillAsset',
    ];
}


