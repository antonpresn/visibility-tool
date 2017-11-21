<?php

/* 
 * @file PolyfillAsset.php
 * @encoding UTF-8
 * 
 * Copyright (c) 2016, antonpresn@gmail.com
 * 
 * @author Anton Presnyakov <antonpresn@gmail.com>
 * @date 30.11.2016 16:22:48
 */

namespace app\components\emotion\visibility\assets;

use yii\web\AssetBundle;

/**
 */
class PolyfillAsset extends AssetBundle
{
    public $sourcePath = '@app/components/emotion/visibility';
    public $js = [
        'js/polyfills.js',
    ];
}
