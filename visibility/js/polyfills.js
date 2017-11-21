
		// Шаги алгоритма ECMA-262, 5-е издание, 15.4.4.21
		// Ссылка (en): http://es5.github.io/#x15.4.4.21
		// Ссылка (ru): http://es5.javascript.ru/x15.4.html#x15.4.4.21
		if (!Array.prototype.reduce) {
		  Array.prototype.reduce = function(callback/*, initialValue*/) {
		    'use strict';
		    if (this == null) {
		      throw new TypeError('Array.prototype.reduce called on null or undefined');
		    }
		    if (typeof callback !== 'function') {
		      throw new TypeError(callback + ' is not a function');
		    }
		    var t = Object(this), len = t.length >>> 0, k = 0, value;
		    if (arguments.length >= 2) {
		      value = arguments[1];
		    } else {
		      while (k < len && ! k in t) {
		        k++; 
		      }
		      if (k >= len) {
		        throw new TypeError('Reduce of empty array with no initial value');
		      }
		      value = t[k++];
		    }
		    for (; k < len; k++) {
		      if (k in t) {
		        value = callback(value, t[k], k, t);
		      }
		    }
		    return value;
		  };
		}

		// Шаги алгоритма ECMA-262, 5-е издание, 15.4.4.19
		// Ссылка (en): http://es5.github.com/#x15.4.4.19
		// Ссылка (ru): http://es5.javascript.ru/x15.4.html#x15.4.4.19
		if (!Array.prototype.map) {

		  Array.prototype.map = function(callback, thisArg) {

		    var T, A, k;

		    if (this == null) {
		      throw new TypeError(' this is null or not defined');
		    }

		    // 1. Положим O равным результату вызова ToObject с передачей ему
		    //    значения |this| в качестве аргумента.
		    var O = Object(this);

		    // 2. Положим lenValue равным результату вызова внутреннего метода Get
		    //    объекта O с аргументом "length".
		    // 3. Положим len равным ToUint32(lenValue).
		    var len = O.length >>> 0;

		    // 4. Если вызов IsCallable(callback) равен false, выкидываем исключение TypeError.
		    // Смотрите (en): http://es5.github.com/#x9.11
		    // Смотрите (ru): http://es5.javascript.ru/x9.html#x9.11
		    if (typeof callback !== 'function') {
		      throw new TypeError(callback + ' is not a function');
		    }

		    // 5. Если thisArg присутствует, положим T равным thisArg; иначе положим T равным undefined.
		    if (arguments.length > 1) {
		      T = thisArg;
		    }

		    // 6. Положим A равным новому масиву, как если бы он был создан выражением new Array(len),
		    //    где Array является стандартным встроенным конструктором с этим именем,
		    //    а len является значением len.
		    A = new Array(len);

		    // 7. Положим k равным 0
		    k = 0;

		    // 8. Пока k < len, будем повторять
		    while (k < len) {

		      var kValue, mappedValue;

		      // a. Положим Pk равным ToString(k).
		      //   Это неявное преобразование для левостороннего операнда в операторе in
		      // b. Положим kPresent равным результату вызова внутреннего метода HasProperty
		      //    объекта O с аргументом Pk.
		      //   Этот шаг может быть объединён с шагом c
		      // c. Если kPresent равен true, то
		      if (k in O) {

		        // i. Положим kValue равным результату вызова внутреннего метода Get
		        //    объекта O с аргументом Pk.
		        kValue = O[k];

		        // ii. Положим mappedValue равным результату вызова внутреннего метода Call
		        //     функции callback со значением T в качестве значения this и списком
		        //     аргументов, содержащим kValue, k и O.
		        mappedValue = callback.call(T, kValue, k, O);

		        // iii. Вызовем внутренний метод DefineOwnProperty объекта A с аргументами
		        // Pk, Описатель Свойства
		        // { Value: mappedValue,
		        //   Writable: true,
		        //   Enumerable: true,
		        //   Configurable: true }
		        // и false.

		        // В браузерах, поддерживающих Object.defineProperty, используем следующий код:
		        // Object.defineProperty(A, k, {
		        //   value: mappedValue,
		        //   writable: true,
		        //   enumerable: true,
		        //   configurable: true
		        // });

		        // Для лучшей поддержки браузерами, используем следующий код:
		        A[k] = mappedValue;
		      }
		      // d. Увеличим k на 1.
		      k++;
		    }

		    // 9. Вернём A.
		    return A;
		  };
		}
		
		// Шаги алгоритма ECMA-262, 5-е издание, 15.4.4.14
		// Ссылка (en): http://es5.github.io/#x15.4.4.14
		// Ссылка (ru): http://es5.javascript.ru/x15.4.html#x15.4.4.14
		if (!Array.prototype.indexOf) {
		  Array.prototype.indexOf = function(searchElement, fromIndex) {
		    var k;

		    // 1. Положим O равным результату вызова ToObject с передачей ему
		    //    значения this в качестве аргумента.
		    if (this == null) {
		      throw new TypeError('"this" is null or not defined');
		    }

		    var O = Object(this);

		    // 2. Положим lenValue равным результату вызова внутреннего метода Get
		    //    объекта O с аргументом "length".
		    // 3. Положим len равным ToUint32(lenValue).
		    var len = O.length >>> 0;

		    // 4. Если len равен 0, вернём -1.
		    if (len === 0) {
		      return -1;
		    }

		    // 5. Если был передан аргумент fromIndex, положим n равным
		    //    ToInteger(fromIndex); иначе положим n равным 0.
		    var n = +fromIndex || 0;

		    if (Math.abs(n) === Infinity) {
		      n = 0;
		    }

		    // 6. Если n >= len, вернём -1.
		    if (n >= len) {
		      return -1;
		    }

		    // 7. Если n >= 0, положим k равным n.
		    // 8. Иначе, n<0, положим k равным len - abs(n).
		    //    Если k меньше нуля 0, положим k равным 0.
		    k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

		    // 9. Пока k < len, будем повторять
		    while (k < len) {
		      // a. Положим Pk равным ToString(k).
		      //   Это неявное преобразование для левостороннего операнда в операторе in
		      // b. Положим kPresent равным результату вызова внутреннего метода
		      //    HasProperty объекта O с аргументом Pk.
		      //   Этот шаг может быть объединён с шагом c
		      // c. Если kPresent равен true, выполним
		      //    i.  Положим elementK равным результату вызова внутреннего метода Get
		      //        объекта O с аргументом ToString(k).
		      //   ii.  Положим same равным результату применения
		      //        Алгоритма строгого сравнения на равенство между
		      //        searchElement и elementK.
		      //  iii.  Если same равен true, вернём k.
		      if (k in O && O[k] === searchElement) {
		        return k;
		      }
		      k++;
		    }
		    return -1;
		  };
		}
		
		if (!Array.isArray) {
		  Array.isArray = function(arg) {
		    return Object.prototype.toString.call(arg) === '[object Array]';
		  };
		}

		// Шаги алгоритма ECMA-262, 5-е издание, 15.4.4.18
		// Ссылка (en): http://es5.github.io/#x15.4.4.18
		// Ссылка (ru): http://es5.javascript.ru/x15.4.html#x15.4.4.18
		if (!Array.prototype.forEach) {

		  Array.prototype.forEach = function (callback, thisArg) {

		    var T, k;

		    if (this == null) {
		      throw new TypeError(' this is null or not defined');
		    }

		    // 1. Положим O равным результату вызова ToObject passing the |this| value as the argument.
		    var O = Object(this);

		    // 2. Положим lenValue равным результату вызова внутреннего метода Get объекта O с аргументом "length".
		    // 3. Положим len равным ToUint32(lenValue).
		    var len = O.length >>> 0;

		    // 4. Если IsCallable(callback) равен false, выкинем исключение TypeError.
		    // Смотрите: http://es5.github.com/#x9.11
		    if (typeof callback !== 'function') {
		        throw new TypeError(callback + ' is not a function');
		    }

		    // 5. Если thisArg присутствует, положим T равным thisArg; иначе положим T равным undefined.
		    if (arguments.length > 1) {
		      T = thisArg;
		    }

		    // 6. Положим k равным 0
		    k = 0;

		    // 7. Пока k < len, будем повторять
		    while (k < len) {

		      var kValue;

		      // a. Положим Pk равным ToString(k).
		      //   Это неявное преобразование для левостороннего операнда в операторе in
		      // b. Положим kPresent равным результату вызова внутреннего метода HasProperty объекта O с аргументом Pk.
		      //   Этот шаг может быть объединён с шагом c
		      // c. Если kPresent равен true, то
		      if (k in O) {

		        // i. Положим kValue равным результату вызова внутреннего метода Get объекта O с аргументом Pk.
		        kValue = O[k];

		        // ii. Вызовем внутренний метод Call функции callback с объектом T в качестве значения this и
		        // списком аргументов, содержащим kValue, k и O.
		        callback.call(T, kValue, k, O);
		      }
		      // d. Увеличим k на 1.
		      k++;
		    }
		    // 8. Вернём undefined.
		  };
		}


		if (!window.JSON) {
		  window.JSON = {
		    parse: function(sJSON) { return eval('(' + sJSON + ')'); },
		    stringify: function(vContent) {
		      if (vContent instanceof Object) {
		        var sOutput = '';
		        if (vContent.constructor === Array) {
		          for (var nId = 0; nId < vContent.length; sOutput += this.stringify(vContent[nId]) + ',', nId++);
		          return '[' + sOutput.substr(0, sOutput.length - 1) + ']';
		        }
		        if (vContent.toString !== Object.prototype.toString) {
		          return '"' + vContent.toString().replace(/"/g, '\\$&') + '"';
		        }
		        for (var sProp in vContent) {
		          sOutput += '"' + sProp.replace(/"/g, '\\$&') + '":' + this.stringify(vContent[sProp]) + ',';
		        }
		        return '{' + sOutput.substr(0, sOutput.length - 1) + '}';
		     }
		     return typeof vContent === 'string' ? '"' + vContent.replace(/"/g, '\\$&') + '"' : String(vContent);
		    }
		  };
		}
// trim polyfill
		if (!String.prototype.trim) {
		  (function() {
		    // Вырезаем BOM и неразрывный пробел
		    String.prototype.trim = function() {
		      return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
		    };
		  })();
		}

		// Шаги алгоритма ECMA-262, 5-е издание, 15.4.4.17
		// Ссылка (en): http://es5.github.io/#x15.4.4.17
		// Ссылка (ru): http://es5.javascript.ru/x15.4.html#x15.4.4.17
		if (!Array.prototype.some) {
		  Array.prototype.some = function(fun/*, thisArg*/) {
		    'use strict';

		    if (this == null) {
		      throw new TypeError('Array.prototype.some called on null or undefined');
		    }

		    if (typeof fun !== 'function') {
		      throw new TypeError();
		    }

		    var t = Object(this);
		    var len = t.length >>> 0;

		    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
		    for (var i = 0; i < len; i++) {
		      if (i in t && fun.call(thisArg, t[i], i, t)) {
		        return true;
		      }
		    }

		    return false;
		  };
		}

		if (!Object.assign) {
  Object.defineProperty(Object, 'assign', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function(target, firstSource) {
      'use strict';
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert first argument to object');
      }

      var to = Object(target);
      for (var i = 1; i < arguments.length; i++) {
        var nextSource = arguments[i];
        if (nextSource === undefined || nextSource === null) {
          continue;
        }

        var keysArray = Object.keys(Object(nextSource));
        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
          var nextKey = keysArray[nextIndex];
          var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
          if (desc !== undefined && desc.enumerable) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
      return to;
    }
  });
}

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
  Object.keys = (function() {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function(obj) {
      if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      var result = [], prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}
