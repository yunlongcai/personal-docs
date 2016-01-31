# Understanding Scope and Context in Javascript
[原文地址](http://ryanmorr.com/understanding-scope-and-context-in-javascript/)

Javascript 对`作用域`与`上下文`的实现是这个语言的一个特色，一部分原因是它的灵活性。 函数可以被运用到各种上下文里，作用域可以被封装与保留。 这些概念引出了 Javascript 所提供的大部分强大的设计模式。 然后这也是在开发者间引起大量的疑惑的根源，作为一个正当的理由。下面将是关于作用域与上下文的详细解释，它们之间的不同点，以及使用它们的不同方式。

## 个人理解
- 作用域就是一个变量的可访问范围，不同变量有不同的值，是一个规范约束。
- 上下文就是 `this` 指针的值， 是一个具体可访问的值。

## 术语表
1. 作用域 - scope：
2. 上下文 - context：
3. 执行上下文 - execution context：
4. 变量对象 - variable object：
5. 作用域链 - scope chain：

## Context VS. Scope

最重要的一件事是搞清楚上下文与作用域是不一样的。 我注意到很多开着发经常会混淆这两个术语（包括我）。 说实话，这两个术语的区别确实比较模糊。

每次函数的调用都伴随着一个作用域和一个上下文。 从根本上来讲，作用域是基于函数（function-based）的，而上下文则是基于对象（object-based）的。 换句话来说，
- 作用域：属于当一个函数被调用时的变量访问控制，并且每次调用的作用域都是唯一的。
- 上下文：则总是 `this` 关键字的值，这个 `this` 指的是拥有当前执行代码的对象的引用。

## Variable Scope

一个变量可以定义在局部作用域或者全局作用中，使得一个变量在运行时在不同的作用域下有不同的访问控制。 每个定义在全局的变量意味着这个变量被定义在一个函数体之外，并且生命周期贯穿整个运行时，可以在任何作用域中被获取与修改。 局部变量则只存在在定义它的函数体之内，并且每次对该函数的调用都会有不同的作用域。 它的主旨是只能在当次调用中进行 赋值、取值与值的操作，并且不能在该作用域外的地方被访问。

Javacript 当前不支持块级作用域：在 `if` 语句、`switch` 语句、`for` 循环 或者 `while` 循环中定义一个变量，并使得变量的作用域属于上述块级作用域。 块级作用域指的是变量不能在开闭括号（`{}`） 之外被访问。 当前定义在块中的变量可以被块之外的地方被访问。 然而，这将很快得到改变, 在 `ES6` 规范中将正式添加 `let` 关键字。 它能用来取代 `var` 关键字，用来支持块级作用域的局部变量。

## What is "this" Context
 
`上下文` 最主要由一个函数的调用方式决定。 当一个函数作为一个对象的一个方法来调用时， `this` 就会被设成这个被调用方式所属的对象的值。

```javascript
var obj = {
    foo: function(){
        alert(this === obj);    
    }
};

obj.foo(); // true
```

同样的原理也适用于使用 `new` 操作符来调用一个函数用来创建一个对象的新的实例。 当以这种方式调用函数时， 在函数内的 `this` 的值会被设置成新创建对象实例的。

```javascript
function foo(){
    alert(this);
}

foo() // window
new foo() // foo
```

当调用一个全局函数（unbound function）时， `this` 默认地会设置成全局上下文或者在浏览器中的 `window` 对象。然而， 如果一个函数在 `strict mode` 下执行的话，这个上下文会被默认设置成 `undefined`。

## Execution Context

Javascript 是一种单线程语言，意味着同时只可能有一个人任务在执行。 当一个 Javascript 解释器开始执行代码时，它默认地首先会进入一个全局执行上下文。 每次从一个函数调用的那一刻起就会导致一个新的执行上下文的创建。

这就是经常导致疑惑的地方， 术语 `execution context` 实际上的所有意图和目的更多的指向作用域而不是上面讨论的上下文。 这是一个不幸的命名约定，然而这个术语是由 `ECMAScript` 规范定义的，所以我们只能被迫接受它。

每次一个新的执行上下文被创建后都会加到执行栈的顶部。 浏览器总是会执行处于执行栈顶部的执行上下文。 一旦一个执行上下文结束运行，它就会从栈中被移除，控制流将重新回到下面的执行上下文中。

一个执行上下文可以分成`创建阶段`与`执行阶段`两个阶段。 在创建阶段，解释器会首先创建一个`变量对象`（`variable object`），（也叫做 `activate object`），这个对象由所有定义在这个执行上下文中的所有`变量`、`函数声明`和`参数`组成。 紧接着`作用域链`（`scope chain`） 初始化，最后 `this` 的值将会被设置。然后进入执行阶段，代码将会解析被执行。

## The Scope Chain

对于每个执行上下文都会有一个作用域链伴随。 这个作用域链包含了在执行栈中的每一个执行上下文的变量对象（就是说栈上的所有对象对象）。 它的作用是决定一个变量的访问控制与一个标识符的解析。 例如：

```javascript

function first(){
    second();
    function second(){
        third();
        function third(){
            fourth();
            function fourth(){
                // do something
            }
        }
    }   
}
first();

``` 

运行上面的代码会使得嵌套的函数会被一路执行下来直到函数`fourth`。 在这个点上，作用域链，从上到下，应该是： fourth, third, second, first, global。 `fourth` 函数将能访问全局变量和所有定义在 `first`、`second`、`third` 函数中的变量，当然也包括自身的变量。

简单来讲，每一次你试图访问一个在这个函数执行上下文中的变量时，查找过程（look-up process）首先会从自身的变量对象开始查找。 如果该标识符在当前的变量对象中找到，那么就会到作用域链中继续查找。 它会一直沿着作用域链向上查找，在每个执行上下文对应的变量对象中查找匹配的变量名。

## Closures

访问在即时词法作用域（immediate lexical scope）范围之外的变量时就会产生一个闭包。 换句话说，一个闭包是一个定义在另一个函数内的嵌套的函数允许访问函数之外的变量时形成的。 返回嵌套函数可以使得你能够在函数之外保持对局部变量、参数以及内部函数声明的访问。 这种封装使得我们能够在外部作用域隐藏和保留执行上下文，通过暴露一个公用的借口来对函数内部的状态进行进一步的操作。 一个简单的例子如下：

```javascript

function foo(){
    var localVariable = 'private variable';
    return function bar(){
        return localVariable;
    }
}

var getLocalVariable = foo();
getLocalVariable() // private variable

```

一个最常用的闭包的使用方式是广为人知的模块模式（`module pattern`），这个模式允许你模拟公有、私有和特权成员变量和函数。

```javascript

var Module = (function(){
    var privateProperty = 'foo';

    function privateMethod(args){
        // do something
    }

    return {

        publicProperty: '',

        publicMethod: function(args){
            // do something
        },

        privilegedMethod: function(args){
            return privateMethod(args);
        }
    };
})();

```

这个模块就像是一个单实例，当编译器解析它时就同时开始执行了，因此有一个开闭括号跟在函数的后面表示对函数的调用。 唯一能够在闭包的执行上下文之外可以访问到的成员就是你在`return` 中定义的公共的方法和属性（如 `Module.publicMethod`）。 然而，所有的私有属性和方法的声明周期会一直贯穿整个程序，因为执行上下文被保留了，意味着这个变量可以通过这个公用方法来进行交互。

另一种闭包类型是叫做`立即调用的函数表达式`（`immediately-invoked function expression, `IIFE`），就是一个在 `window` 的上下文内自我调用的匿名函数。

```javascript

(function(window){
          
    var foo, bar;

    function private(){
        // do something
    }

    window.Module = {

        public: function(){
            // do something 
        }
    };

})(this);

```

这个表达式是最有用的时候是试图保留全局命名空间，因为任意声明在函数体内的变量都会是属于闭包内部的，但却可以在整个运行期保留。 这是一个为程序和框架封装源代码的常用方法，通常会暴露单一一个全局借口用于交互。
如：

```javascript
// 自己加的例子
var a  = {};

(function(w){
          
    var foo, bar;

    function private(){
        // do something
    }

    w.Module = {
        mem: "a-mem",  
        public: function(){
            console.log(this == a.Module);  // 注意这里 this 是 a.Module，而不是 a
            console.log(this.mem); 
        }
    };

})(a);

// 通过 Module 访问
a.Module.public(); // 输出  a-mem

```

## Call and Apply
 
这两个方法是所有方法的固有方法，允许你以任何希望的上下文来执行任意函数。 这会产生难以置信的强大能力。 `call` 函数需要参数显式的列举，而 `apply` 则要将参数放到一个数组中。

```javascript

function user(firstName, lastName, age){
    // do something 
}

user.call(window, 'John', 'Doe', 30);
user.apply(window, ['John', 'Doe', 30]);

```

两个调用的结果是完全一样的， `user` 函数会在 `window` 的上下文内调用和3个一样的参数。

`ECMAScript 5 (ES5)` 引进了 `Function.prototype.bind` 方法来操作上下文。 它返回一个新的函数，这个新的函数是绑定到 `bind` 方法的第一个参数上的，而不管这个函数是怎么使用的。 它可以这么工作：通过使用一个闭包来负责将调用重定向到正确的上下文。 如下是不支持 `bind` 的浏览器的 `polyfill`。

```javascript

if(!('bind' in Function.prototype)){       // 1. 如果没有 bind 方法
    Function.prototype.bind = function(){  // 2. 为所有函数添加 bind 方法
        var fn = this,                     // 3. this 就是调用这个 bind 方法的 函数， 上面有说，当方法以对象的方法来调用时，this 就是指向这个对象， 此时调用这个方法的就是 函数本身。 fn.bind();
        context = arguments[0],            // 4. 第一个参数就是我们要重定向到的上下文 
        args = Array.prototype.slice.call(arguments, 1);  // 5. 剩下的参数就是普通的参数
        return function(){   // 6. 返回一个函数，这个函数不带参数
            return fn.apply(context, args.concat([].slice.call(arguments)));  // 7. 最后返回的函数通过闭包来获取上下文，使用原来的参数和函数，调用apply方法实现 bind 方法。
        }
    }
}


var a = {
  name: "a"
};

var b = {
  name: "b",
  print: function(param1) {
    console.log(this.name);
    console.log(param1);
  }
}

var print_a = b.print.bind(a, "param1");
print_a();  // this 指向了 a， 所有 this.name = a

```

> 这段的代码不太理解

它经常会使用在上下文缺失的地方；面向对象和事件处理（object-orientation and event handling）。 这是必须的因为一个 node 的 `addEventLinstener` 方法总是执行在事件处理器绑定的节点的上下文的回调函数，它就应该这么执行。 然而如果你使用高级的面向对象技术且要求你的回调函数是实例的方法，那么你就会需要手动的调整上下文，这就是 `bind` 方法迟早起作用的时候。

```javascript

function MyClass(){
    this.element = document.createElement('div');
    this.element.addEventListener('click', this.onClick.bind(this), false);
}

MyClass.prototype.onClick = function(e){
    // do something
};

```

当重新审阅 `Function.prototype.bind` 函数的 polyfill 代码时，你会注意到两处 `Array` 的 `slice` 方法的调用。

```javascript

Array.prototype.slice.call(arguments, 1);
[].slice.call(arguments);

```

有趣的是 `arguments` 对象并不是一个正真的数组，然后它经常被描述成一个类数组对象就像一个节点列点（由 `element.childNodes` 返回的任何对象）。 他们包括一个 `length` 属性和可索引的值，但是他们依然不是数组，所以也不支持任何数组原生的方法如 `slice` 和 `push` 等。 然后因为他们彼此相似的行为，`Array` 的方法可以通过改变上下文的方式，将上下文执行在一个类数组对象。

这个技术可以运用到面向对象编程时模拟对象间的继承关系。

```javascript

MyClass.prototype.init = function(){
    // call the superclass init method in the context of the "MyClass" instance
    MySuperClass.prototype.init.apply(this, arguments);
}

```

通过以当前对象（`MyClass`）的实例的调用父对象 （`MySuperClass`） 的方法，我们能够模拟调用方法的父方法来充分利用这种强大的设计模式。

## Conclusion

在你开始使用高级的设计模式之前，理解这些概念是非常重要的，因为作用域和上下文在现代 Javascript 开发中扮演了一个非常基础的角色。 不管是谈论闭包、面向对象、继承还是各种本地实现，上下文和作用域都扮演了一个非常重要的角色。 如果你的目标是掌握 Javascript 语言希望更好的了解它的所涵盖的一切，那么作用域和上下文应该是你的学习的起点。