# Node.js Style Guide
[原文地址](https://github.com/RisingStack/node-style-guide)

## Types
- Primitives 基础类型
  - string
  - number
  - boolean
  - null
  - undefined

当你访问一个基础类型的变量时，你是直接操作它的值

```javascript
  var foo = 1;
  var bar = foo;

  bar = 9;

  console.log(foo, bar); // => 1, 9

```  
- Complex 复合类型
  - object
  - array
  - function
  
当你访问一个复合类型的变量时，你是在操作它的值的引用

```javascript
  var foo = [1, 2];
  var bar = foo;

  bar[0] = 9;

  console.log(foo[0], bar[0]); // => 9, 9
```

## Objects
- 使用字面值来创建对象

```javascript
  // 糟糕的创建一个对象的方式
  var item = new Object();
  // 好的, {} 即一个空对象的字面值
  var item = {};
```

- 使用可读的同义词来代替保留关键字

```javascript
  // bad
  var superman = {
    class: 'alien'
  };

  // bad
  var superman = {
    klass: 'alien'
  };

  // good
  var superman = {
    type: 'alien'
  };
```

## Arrays
- 使用字面值来初始化一个数组对象

```javascript
  // bad
  var items = new Array();

  // good
  var items = [];
```

- 如果你不知道数组的长度，使用`Array.prototype.push`

```javascript

  var someStack = [];


  // bad
  someStack[someStack.length] = 'abracadabra';

  // good
  someStack.push('abracadabra');

``` 

- 使用 `Array.prototype.slice` 来复制数组

```javascript
  var len = items.length;
  var itemsCopy = [];
  var i;

  // bad
  for (i = 0; i < len; i++) {
    itemsCopy[i] = items[i];
  }

  // good
  itemsCopy = items.slice();
```

- 使用 `Array.prototype.slice` 来将一个类数组对象转换成数组

```javascript
  // 最常见的场合就是将函数的 arguments 转换成数组
  function trigger() {
    var args = Array.prototype.slice.call(arguments);
    ...
  }
```

## Strings

- 使用 `''` 表示字符串

```javascript
  // bad
  var name = "Bob Parr";

  // good
  var name = 'Bob Parr';

  // bad
  var fullName = "Bob " + this.lastName;

  // good
  var fullName = 'Bob ' + this.lastName;
``` 

- 当字符串长度大于80个字符时，使用字符串拼接的声明分成多行开写。

- 注意： 如果过度使用，长字符串的拼接会造成性能损耗。

```javascript
  // bad
  var errorMessage = 'This is a super long error that was thrown because of Batman. When you stop to think about how Batman had anything to do with this, you would get nowhere fast.';

  // bad
  var errorMessage = 'This is a super long error that was thrown because \
  of Batman. When you stop to think about how Batman had anything to do \
  with this, you would get nowhere \
  fast.';

  // good
  var errorMessage = 'This is a super long error that was thrown because ' +
    'of Batman. When you stop to think about how Batman had anything to do ' +
    'with this, you would get nowhere fast.';
```

- 当需要动态地构建一个字符串时，使用 `Array.prototype.join` 代替字符串拼接

```javascript
  var items;
  var messages;
  var length;
  var i;

  messages = [{
    state: 'success',
    message: 'This one worked.'
  }, {
    state: 'success',
    message: 'This one worked as well.'
  }, {
    state: 'error',
    message: 'This one did not work.'
  }];

  length = messages.length;

  // bad
  function inbox(messages) {
    items = '<ul>';

    for (i = 0; i < length; i++) {
      items += '<li>' + messages[i].message + '</li>';
    }

    return items + '</ul>';
  }

  // good
  function inbox(messages) {
    items = [];

    for (i = 0; i < length; i++) {
      items[i] = messages[i].message;
    }

    return '<ul><li>' + items.join('</li><li>') + '</li></ul>';
  }

```

## Functions

- 函数表达式：

```javascript
  // anonymous function expression
  var anonymous = function() {
    return true;
  };

  // named function expression
  var named = function named() {
    return true;
  };

  // immediately-invoked function expression (IIFE)
  (function() {
    console.log('Welcome to the Internet. Please follow me.');
  })();
```

- 永远别在一个非函数块中（if、while等）里面声明一个函数。 而是要将函数赋值与一个变量。

```javascript
  // bad
  if (currentUser) {
    function test() {
      console.log('Nope.');
    }
  }

  // good
  var test;
  if (currentUser) {
    // 这里将 函数 赋值与变量 test
    test = function test() {
      console.log('Yup.');
    };
  }
```

- 永远别将一个参数命名成 `arguments`，这样会覆盖原来每个函数的 `arguments`。

```javascript
  // bad
  function nope(name, options, arguments) {
    // ...stuff...
  }

  // good
  function yup(name, options, args) {
    // ...stuff...
  }
```

## Properties

- 使用点符号来访问一个属性

```javascript
  var luke = {
    jedi: true,
    age: 28
  };

  // bad
  var isJedi = luke['jedi'];

  // good
  var isJedi = luke.jedi;
```

- 当通过一个变量来访问属性时，使用下标符号`[]`来访问

```javascript
  var luke = {
    jedi: true,
    age: 28
  };

  function getProp(prop) {
    return luke[prop];
  }

  var isJedi = getProp('jedi');
```

## Variables

-  使用变量前总是先使用 `var` 来声明（ES6 中的 `let`、`const`）。 不这么做就会造成使用全局变量。 我们不希望污染全局命名空间。 

```javascript
  // bad
  superPower = new SuperPower();

  // good
  var superPower = new SuperPower();
```

- 每个变量都各用一个 `var`

```javascript
  // bad
  var items = getItems(),
        goSportsTeam = true,
        dragonball = 'z';

  // good
  var items = getItems();
  var goSportsTeam = true;
  var dragonball = 'z';
```

- 最后声明未初始化的变量。 当你需要使用之前已赋值的变量作为别的变量初始化的值时有帮助。

```javascript
  // bad
  var i;
  var items = getItems();
  var dragonball;
  var goSportsTeam = true;
  var len;

  // good
  var items = getItems();
  var goSportsTeam = true;
  var dragonball;
  var length;
  var i;
```

- 避免使用重复的变量名，使用 `Object` 来做一个简单的封装

```javascript
  // bad
  var kaleidoscopeName = '..';
  var kaleidoscopeLens = [];
  var kaleidoscopeColors = [];

  // good
  var kaleidoscope = {
    name: '..',
    lens: [],
    colors: []
  };
```

- 尽量将变量声明在它们作用域的顶部，避免变量声明与赋值的自动提升。（`let` 与 `const` 参考）

```javascript
  // bad
  function() {
    test();
    console.log('doing stuff..');

    //..other stuff..

    var name = getName();

    if (name === 'test') {
      return false;
    }

    return name;
  }

  // good
  function() {
    var name = getName();

    test();
    console.log('doing stuff..');

    //..other stuff..

    if (name === 'test') {
      return false;
    }

    return name;
  }

  // bad
  function() {
    var name = getName();

    if (!arguments.length) {
      return false;
    }

    return true;
  }

  // good
  function() {
    if (!arguments.length) {
      return false;
    }

    var name = getName();

    return true;
  }
```

## Requires

- 以下列的顺序来组织 `requires`
  1. 核心模块
  2. npm 引入的模块
  3. 其他模块
  
```javascript
  // bad
  var Car = require('./models/Car');
  var async = require('async');
  var http = require('http');

  // good
  var http = require('http');
  var fs = require('fs');

  var async = require('async');
  var mongoose = require('mongoose');

  var Car = require('./models/Car');
```

- require 模块时，不要使用 `.js` 后缀

```javascript
  // bad
  var Batmobil = require('./models/Car.js');

  // good
  var Batmobil = require('./models/Car');
```

## Callbacks

- 总是先检查回调函数的 `errors`

```javascript
  //bad
  database.get('pokemons', function(err, pokemons) {
    console.log(pokemons);
  });

  //good
  database.get('drabonballs', function(err, drabonballs) {
    if (err) {
      // handle the error somehow, maybe return with a callback
      return console.log(err);
    }
    console.log(drabonballs);
  });
```

- 处理完错误后返回

```javascript
  //bad
  database.get('drabonballs', function(err, drabonballs) {
    if (err) {
      // if not return here
      console.log(err);
    }
    // this line will be executed as well
    console.log(drabonballs);
  });

  //good
  database.get('drabonballs', function(err, drabonballs) {
    if (err) {
      // handle the error somehow, maybe return with a callback
      return console.log(err);
    }
    console.log(drabonballs);
  });
```

- 当回调函数是为别的地方做接口时，使用一个具有描述性的参数。 这样代码更具可读性。

```javascript
  // bad
  function getAnimals(done) {
    Animal.get(done);
  }

  // good
  function getAnimals(done) {
    Animal.get(function(err, animals) {
      if(err) {
        return done(err);
      }

      return done(null, {
        dogs: animals.dogs,
        cats: animals.cats
      })
    });
  }
```

## Try Catch

- 只有在同步函数中才使用 `throw` 来抛出错误/异常。 Try-Catch 块是不能用于包裹异步执行的代码的。 Try-Catch 代码块会一直向上冒泡，直到down掉整个进程。

```javascript

//bad
function readPackageJson (callback) {
  fs.readFile('package.json', function(err, file) {
    if (err) {
      throw err;
    }
    ...
  });
}
//good -- 就是在回调函数也要有处理错误的逻辑
function readPackageJson (callback) {
  fs.readFile('package.json', function(err, file) {
    if (err) {
      return  callback(err);
    }
    ...
  });
}

```

- 在同步调用中捕捉错误

```javascript

//bad
var data = JSON.parse(jsonAsAString);

//good
var data;
try {
  data = JSON.parse(jsonAsAString);
} catch (e) {
  //handle error - hopefully not with a console.log ;)
  console.log(e);
}

```


## Hoisting

- 变量的声明会提升到他们的作用域的顶部，而赋值操作则不会。

```javascript

// we know this wouldn't work (assuming there
// is no notDefined global variable)
function example() {
  console.log(notDefined); // => throws a ReferenceError
}

// creating a variable declaration after you
// reference the variable will work due to
// variable hoisting. Note: the assignment
// value of `true` is not hoisted.
function example() {
  console.log(declaredButNotAssigned); // => undefined
  var declaredButNotAssigned = true;
}

// The interpreter is hoisting the variable
// declaration to the top of the scope.
// Which means our example could be rewritten as:
function example() {
  var declaredButNotAssigned;
  console.log(declaredButNotAssigned); // => undefined
  declaredButNotAssigned = true;
}

```

- 匿名函数表达式会提升他们的变量的声明，但是函数的赋值却不会。

```javascript

function example() {
  // anonymous 变量在这里是有声明，但是没赋值的
  console.log(anonymous); // => undefined

  anonymous(); // => TypeError anonymous is not a function

  var anonymous = function() {
    console.log('anonymous function expression');
  };
}

```

- 命名函数表达式会提升变量的声明，而不是函数的声明与函数体本身

```javascript

function example() {
  console.log(named); // => undefined

  named(); // => TypeError named is not a function

  superPower(); // => ReferenceError superPower is not defined

  var named = function superPower() {
    console.log('Flying');
  };
}

// the same is true when the function name
// is the same as the variable name.
function example() {
  console.log(named); // => undefined

  named(); // => TypeError named is not a function

  var named = function named() {
    console.log('named');
  }
}

```

- 函数声明即提升他们的名字也提升他们的函数体

```javascript

function example() {
  superPower(); // => Flying

  function superPower() {
    console.log('Flying');
  }
}

```

## Conditional Expressions & Equality

- 使用 `===` 和 `!==` 来代替 `==` 和 `!=`。

- 条件表达式的计算会使用 `ToBoolean` 方法来强制转换，总是遵循如下几个简单的规则：

  - `Objects` 会被计算成 `true`
  - `Undefined` 为 `false`
  - `Null` 为 `false`
  - `Booleans` 为 `布尔变量本身的值`
  - `Numbers` 如果是 `+0`, `-0` 或者 `NaN` 的话为 `false`，其他情况为 `true`
  - `Strings` 如果是空字符串的话为 `false`,其他为 `true`
  
- 使用简单的表达方式

```javascript

// bad
if (name !== '') {
  // ...stuff...
}

// good
if (name) {
  // ...stuff...
}

// bad
if (collection.length > 0) {
  // ...stuff...
}

// good
if (collection.length) {
  // ...stuff...
}

```

## Blocks

- 使用大括号来包裹多行的代码块

```javascript

// bad
if (test)
  return false;

// bad
if (test) return false;

// good
if (test) {
  return false;
}

// bad
function() { return false; }

// good
function() {
  return false;
}

```

## Comments

- 使用 `/** ... */` 来做多行的注释。 
- 包括函数描述的话，指明所有参数的类型名字与返回值

```javascript

// bad
// make() returns a new element
// based on the passed in tag name
//
// @param <String> tag
// @return <Element> element
function make(tag) {

  // ...stuff...

  return element;
}

// good
/**
 * make() returns a new element
 * based on the passed in tag name
 *
 * @param <String> tag
 * @return <Element> element
 */
function make(tag) {

  // ...stuff...

  return element;
}

```

- 使用 `//` 来做单行的注释。 将单行注释放在需要被注释的地方上的一个新的一行。 在注释之上留一个空行。

```javascript

// bad
var active = true;  // is current tab

// good
// is current tab
var active = true;

// bad
function getType() {
  console.log('fetching type...');
  // set the default type to 'no type'
  var type = this._type || 'no type';

  return type;
}

// good
function getType() {
  console.log('fetching type...');

  // set the default type to 'no type'
  var type = this._type || 'no type';

  return type;
}

```

- 在你的注释之前添加 `FIXME` 或者 `TODO` 前缀来让别人快速明白你正在表明一个需要被重新审视的问题， 或者你建议一个实现一个问题的解决方法。 这些注释不同于普通的注释，因为他们需要开发者后面有所行动来处理。 `FIXME` 代表 `需要解决这个问题` 或者 `TODO` 表示 `需要实现`

- 使用 `// FIXME` 来注释问题

```javascript

function Calculator() {

  // FIXME: shouldn't use a global here
  total = 0;

  return this;
}

```

- 使用 `// TODO` 来注释一个问题的解决方式

```javascript

function Calculator() {

  // TODO: total should be configurable by an options param
  this.total = 0;

  return this;
}

```

## Whitespace

- 将 `tabs` 设置成2个空格

```javascript
// bad
function() {
∙∙∙∙var name;
}

// bad
function() {
∙var name;
}

// good
function() {
∙∙var name;
}

```
- 在起始的括号前添加一个空格

```javascript

// bad
function test(){
  console.log('test');
}

// good
function test() {
  console.log('test');
}

// bad
dog.set('attr',{
  age: '1 year',
  breed: 'Bernese Mountain Dog'
});

// good
dog.set('attr', {
  age: '1 year',
  breed: 'Bernese Mountain Dog'
});

```

- 将操作符用空格分开

```javascript
// bad
var x=y+5;

// good
var x = y + 5;
```

- 文件结尾处留一个新的行

```javascript

// bad
(function(global) {
  // ...stuff...
})(this);

// bad
(function(global) {
  // ...stuff...
})(this);↵
↵

// good
(function(global) {
  // ...stuff...
})(this);↵

```

- 当使用很长的方法链时使用缩进

```javascript

// bad
$('#items').find('.selected').highlight().end().find('.open').updateCount();

// good
$('#items')
  .find('.selected')
    .highlight()
    .end()
  .find('.open')
    .updateCount();

// bad
var leds = stage.selectAll('.led').data(data).enter().append('svg:svg').class('led', true)
    .attr('width',  (radius + margin) * 2).append('svg:g')
    .attr('transform', 'translate(' + (radius + margin) + ',' + (radius + margin) + ')')
    .call(tron.led);

// good
var leds = stage.selectAll('.led')
    .data(data)
  .enter().append('svg:svg')
    .class('led', true)
    .attr('width',  (radius + margin) * 2)
  .append('svg:g')
    .attr('transform', 'translate(' + (radius + margin) + ',' + (radius + margin) + ')')
    .call(tron.led);

```

## Commas

- 行首的逗号： Nope

```javascript

// bad
var hero = {
    firstName: 'Bob'
  , lastName: 'Parr'
  , heroName: 'Mr. Incredible'
  , superPower: 'strength'
};

// good
var hero = {
  firstName: 'Bob',
  lastName: 'Parr',
  heroName: 'Mr. Incredible',
  superPower: 'strength'
};

```

- 额外拖尾的逗号： Nope。 在IE6/7或者9中的`quirkmode`时会引出问题。 

## Semicolons

- 必须的。 Yup。

```javascript

// bad
(function() {
  var name = 'Skywalker'
  return name
})()

// good
(function() {
  var name = 'Skywalker';
  return name;
})();

// good
// 这个逗号是防止其他文件的未用分号结尾的
;(function() {
  var name = 'Skywalker';
  return name;
})();

```

## Type Casting & Coercion

- 在语句的开始处执行类型转换（perform type coercion at the beginning of the statement.）

- 字符串

```javascript

//  => this.reviewScore = 9;

// bad
var totalScore = this.reviewScore + '';

// good
var totalScore = '' + this.reviewScore;

// bad
var totalScore = '' + this.reviewScore + ' total score';

// good
var totalScore = this.reviewScore + ' total score';

```

- 使用 `parseInt` 来将字符串类型的变量转换成功 `Number` 类型的，转换时带上基数(几进制)

```javascript

var inputValue = '4';

// bad
var val = new Number(inputValue);

// bad
var val = +inputValue;

// bad
var val = inputValue >> 0;

// bad
var val = parseInt(inputValue);

// good
var val = Number(inputValue);

// good
var val = parseInt(inputValue, 10);

```

- 如果 `parseInt` 成为你的性能的瓶颈，需要使用位操作来解决性能问题，请加上注释

```javascript

// good
/**
 * parseInt was the reason my code was slow.
 * Bitshifting the String to coerce it to a
 * Number made it a lot faster.
 */
var val = inputValue >> 0;

```

- Note: 使用位操作时请小心。 `Numbers` 是有的 64位 的值，而位操作返回的是 32位的整数。 当对大于32位的整数进行位操作时，会导致不可预期的行为。 最大的带符号的32位整形数是 `2147483647`

```javascript

2147483647 >> 0 //=> 2147483647
2147483648 >> 0 //=> -2147483648
2147483649 >> 0 //=> -2147483647

``` 

- 布尔型

```javascript

var age = 0;

// bad
var hasAge = new Boolean(age);

// good
var hasAge = Boolean(age);

// good
var hasAge = !!age;

```

## 命名规则

- 别使用单个字母的名字，要使用具有描述性的名字：

```javascript

// bad
function q() {
  // ...stuff...
}

// good
function query() {
  // ..stuff..
}

```

- 使用驼峰命名来命名对象， 函数 与 实例

```javascript

// bad
var OBJEcttsssss = {};
var this_is_my_object = {};
function c() {}
var u = new user({
  name: 'Bob Parr'
});

// good
var thisIsMyObject = {};
function thisIsMyFunction() {}
var user = new User({
  name: 'Bob Parr'
});

```

- 使用大驼峰命名规则来命名构造函数或者类(Class)

```javascript

// bad
function user(options) {
  this.name = options.name;
}

var bad = new user({
  name: 'nope'
});

// good
function User(options) {
  this.name = options.name;
}

var good = new User({
  name: 'yup'
});

```

- 使用前置的下划线 `_` 来命名私有属性

```javascript

// bad
this.__firstName__ = 'Panda';
this.firstName_ = 'Panda';

// good
this._firstName = 'Panda';

```


- 当要保存一个 `this` 的引用时，使用 `_this`

```javascript

// bad
function() {
  var self = this;
  return function() {
    console.log(self);
  };
}

// bad
function() {
  var that = this;
  return function() {
    console.log(that);
  };
}

// good
function() {
  var _this = this;
  return function() {
    console.log(_this);
  };
}

```

- 给函数命名，有助于利用函数调用栈的追踪。

```javascript

// bad
var log = function(msg) {
  console.log(msg);
};

// good
var log = function log(msg) {
  console.log(msg);
};

```

## Accessors

- 访问器函数不是不必须的。

- 如果需要访问器函数 使用 `getVal()` 和 `setVal('hello')`

```javascript

// bad
dragon.age();

// good
dragon.getAge();

// bad
dragon.age(25);

// good
dragon.setAge(25);

```

- 如果属性是布尔类型的， 使用 `isVal()` 或 `hasVal()`

```javascript

// bad
if (!dragon.age()) {
  return false;
}

// good
if (!dragon.hasAge()) {
  return false;
}

```

- 可以创建 `get()/set()` 函数， 但请保持一致

```javascript

function Jedi(options) {
  options || (options = {});
  var lightsaber = options.lightsaber || 'blue';
  this.set('lightsaber', lightsaber);
}

Jedi.prototype.set = function(key, val) {
  this[key] = val;
};

Jedi.prototype.get = function(key) {
  return this[key];
};

```

## Constructors

- 给 `prototype` 对象添加方法， 而不是复写 `prototype` 对象。 复写一个 `prototype` 对象的话会造成不能使用继承： 因为会把 Base 对象也复写了。 （PS： 可以手动加上 Base 对象， 即 prototype.constructor = self）

```javascript

function Jedi() {
  console.log('new jedi');
}

// bad
Jedi.prototype = {
  fight: function fight() {
    console.log('fighting');
  },

  block: function block() {
    console.log('blocking');
  }
};

// good
Jedi.prototype.fight = function fight() {
  console.log('fighting');
};

Jedi.prototype.block = function block() {
  console.log('blocking');
};

```

- 方法可以返回 `this` 方便链式调用

```javascript

// bad
Jedi.prototype.jump = function() {
  this.jumping = true;
  return true;
};

Jedi.prototype.setHeight = function(height) {
  this.height = height;
};

var luke = new Jedi();
luke.jump(); // => true
luke.setHeight(20) // => undefined

// good
Jedi.prototype.jump = function() {
  this.jumping = true;
  return this;
};

Jedi.prototype.setHeight = function(height) {
  this.height = height;
  return this;
};

var luke = new Jedi();

luke.jump()
  .setHeight(20);

```

- 可以定制自己的 `toString()` 方法， 只要保证不会产生副作用即可

```javascript

function Jedi(options) {
  options || (options = {});
  this.name = options.name || 'no name';
}

Jedi.prototype.getName = function getName() {
  return this.name;
};

Jedi.prototype.toString = function toString() {
  return 'Jedi - ' + this.getName();
};

```