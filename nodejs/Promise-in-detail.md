# Javascript Promises ... In Wicked Detail
[原文地址](http://dailyjs.com/2014/02/20/promises-in-detail/)


我现在已经一直在 Javascript 使用 Promises 一段时间了。 它们一开始使用起来可能会有点脑袋绕不过来的感觉。 我现在能非常高效地使用 Promises， 但是实际上我并不能完全理解它们是怎么样工作的。 这篇文章就是我对他们的解析。 如果你能坚持到最后，你也一样能够明白 Promises 的工作方式。

我们将会逐步地实现一样 Promise 满足 [Promise/A+ spec](https://promisesaplus.com/) 的大部分要求，并且弄明白 promises 是如何满足异步编程的要求的。 这篇文章假定你已经对 Promises 比较熟悉了。 如果你不熟悉，那么可以去 promisejs.org 去看看。

## Why?

为什么需要这么麻烦去了解 Promises 的实现细节到这个地步呢？ 真正的了解一样东西是怎么样工作能够使你更有效的使用他，并且在发生问题时能够更有效的调试问题。 我是因为我和一个同事在一个奇怪的 Promise 情景下被难住了才有了写这篇文章的想法。 如果当时我知道了我现在所知道，那么我们就不会被难住了。 

## The Simplest Use Case

让我们从实现一个最简单的 Promise 开始。 我们想从如下的使用方式：

```javascript

doSomething(function(value) {  
  console.log('Got a value:' value);
});

```

变成如下的：

```javascript

doSomething().then(function(value) {  
  console.log('Got a value:' value);
});

```

为了做到这一点，我们只需改变一下 `doSomething()`，从：

```javascript

function doSomething(callback) {  
  var value = 42;
  callback(value);
}

```

变成这个 `"Promise"` 的最基本的解决方法：

```javascript

function doSomething() {  
  return {
    then: function(callback) {
      var value = 42;
      callback(value);
    }
  };
}

```

当然这只是回调模式的一个小小的语法糖，目前为止也是非常没有意义的语法糖。 但是这也是一个起点，我们已经开始无意中发现了在 Promises 后面的核心思想：

> Promises 将一个最终值的概念（符号）放进了一个对象中。

> Promises capture the notion of an eventual value into an object.

这就是 Promises 为什么这么有意思的主要原因。 一旦最终值的概念像这样被获取，我们就可以开始构建一些强大的东西了。我们稍后就会展开探索。

## Defining the Promise Type

一个简单的对象字面值并不能支撑 Promise。 我们将定义一个实际的 `Promise` 类型，然后在这基础上持续的扩展。

```javascript

function Promise(fn) {  
  var callback = null;
  this.then = function(cb) {
    callback = cb;
  };

  function resolve(value) {
    callback(value);
  }

  fn(resolve);
}

```

并且重新实现 `doSomething()` 来使用这个 Promise

```javascript

function doSomething() {  
  return new Promise(function(resolve) {
    var value = 42;
    resolve(value);
  });
}

```

这里有一个问题。 如果你追踪执行过程，你就会发现 `resolve()` 在 `then()` 之前执行的话， `callback` 就是 `null` 的。 我们使用 `setTimeout` 来屏蔽这个问题。

```javascript

function Promise(fn) {  
  var callback = null;
  this.then = function(cb) {
    callback = cb;
  };

  function resolve(value) {
    // force callback to be called in the next
    // iteration of the event loop, giving
    // callback a chance to be set by then()
    setTimeout(function() {
      callback(value);
    }, 1);
  }

  fn(resolve);
}

```

使用了适当的 hack 手段， 这段代码已经可以工作了， 一定程度上。。。。


## Thie Code is Brittle and Bad

我们这个天真的、简单的 Promise 实现方式必须使用一个异步方式才能工作。 非常容易就能够让它再次运行失败，只要异步地调用 `then()` 我们就能够立马回到 `callback` 变成 `null` 的情况。 为什么我要陷害你让你这么快就失败呢？ 因为上面的实现方式能够让你相当容易的理解。 `then()` 和 `resolve` 不会远离。 他们是 Promises 的核心概念。

## Promises have State

我们上面实现的脆弱的代码暴露了一些问题。 Promises 是有状态的。 我们在处理前需要知道他们正处于一个什么状态，并且要保证我们正确的实现状态的迁移。 以此来除去代码的脆弱性。

- 一个 Promise 可以处于 `pending` 状态，等待一个新值；或者处于 `resolved` 状态，已经保有一个值。
- 一旦一个 Promise 解析成了一个值(resolve to a value)， 那么它将保留这个值不会再发生变化。

一个 Promise 也可以被拒绝，但是我们会在下一步再来做错误处理。

在我们的实现中显式的记录状态，这样我们就可以去掉我们之前的 hack 了。

```javascript

function Promise(fn) {  
  var state = 'pending';
  var value;
  var deferred;

  function resolve(newValue) {
    value = newValue;
    state = 'resolved';

    if(deferred) {
      handle(deferred);
    }
  }

  function handle(onResolved) {
    if(state === 'pending') {
      deferred = onResolved;
      return;
    }

    onResolved(value);
  }

  this.then = function(onResolved) {
    handle(onResolved);
  };

  fn(resolve);
}

```

这变得更复杂了，但是现在调用者可以随时调用 `then()` 方法和 `resolve` 方法了。 它可以在异步与同步的代码中正确工作。

这是因为 `state` 状态标记。 `then()` 和 `resolve()` 都切换到了新的方法 `handle()` 来工作， 这个方法会根据状态来决定做两件事的其中一件：

- 当调用者在调用 `resolve()` 之前先调用 `then()` 方法，这就意味着没有一个已经准备好的值来供回调函数使用。 这种情形状态为 `pending`，我们先把回调函数保存起来后面使用。 稍后在调用 `resolve()` 时，我们可以调用这个回调函数，并将值传给这个回调函数。

- 如果调用 `resolve()` 先于 `then()`： 这个情形下我们先保存我们的值。 一旦 `then()` 被调用，我们就可以使用这个值。

注意到 `setTimeout` 已经不见了。 这只是暂时的，它会回来的。 但是咱一件一件事来。

利用这个 Promise ，我们调用它们的顺序已经没关系了。 我们可以根据我们的需要随时调用 `then()` 和 `resolve`。 这也是将最终结果的符号放到一个对象中的其中一个强大的地方。

我们依然有相当多的规范需要实现，但是我们的 Promises 已经非常有用的。 这个实现允许我们重复调用 `then()`方法，我们总能够得到相同的值。

```javascript

var promise = doSomething();

promise.then(function(value) {  
  console.log('Got a value:', value);
});

promise.then(function(value) {  
  console.log('Got the same value again:', value);
});

```

使用我们目前为止对 Promise 的实现的话上述的代码不一样完全正确。 如果相反的顺序发生，比如先多次调用 `then()` 方法然后再调用 `resolve` 方法，只有最后一个 `then()` 方法的回调函数会被执行。 修补这个bug的方法是保存一个需要延后执行的回调函数的列表。 为了保持代码简单易懂，我决定不这么做了，现在的代码已经够长了。

## Chaining Promises

因为 Promises 会捕获异步性的符号到一个对象中（Since Promises capture the notion of asynchronicity in an object, 不知道怎么翻译- -），所以我们能够把他们串联起来，映射，将他们并行或者顺序执行等各种有用的事情。 像下面的代码在 Promises 中是非常常见的。

```javascript

getSomeData()  
.then(filterTheData)
.then(processTheData)
.then(displayTheData);

```

`getSomeData` 返回的是一个 Promise，证据是它也调用了一个 `then()` 方法，但是第一个 then 的结果也是一个 Promise ，因为我们又调用了一次 `then()`（并且又再后面调用了一次!）。 这就是确确实实发生的，如果我们能够确认 `then()` 返回一个 Promise， 事情将会变得有趣起来。

> `then()` 总是返回一个 Promise

这里是我们添加了链式处理后的 Promise 类型

```javascript

function Promise(fn) {  
  var state = 'pending';
  var value;
  var deferred = null;

  function resolve(newValue) {
    value = newValue;
    state = 'resolved';

    if(deferred) {
      handle(deferred);
    }
  }

  function handle(handler) {
    if(state === 'pending') {
      deferred = handler;
      return;
    }

    if(!handler.onResolved) {
      handler.resolve(value);
      return;
    }

    var ret = handler.onResolved(value);
    handler.resolve(ret);
  }

  this.then = function(onResolved) {
    return new Promise(function(resolve) {
      handle({
        onResolved: onResolved,
        resolve: resolve
      });
    });
  };

  fn(resolve);
}

```

呼呼， 它已经变得有点古怪了。 你不是在庆幸我们可以慢慢地构建它吗？ 这里真正的关键在于 `then()` 返回一个新的 Promise。

因为 `then()` 总是返回一个新的 Promise 对象， 那么总会至少有一个 Promise 被创建， 被 resolved ， 然后被忽略。 这看起来有点浪费。 回调的方式并没有这种问题。 这是一种反对 Promises 的理由。 你会开始发现为什么有些 Javascript 社区会回避使用 Promises 了。

这第二个 Promise 会 resolve 到一个什么的值呢？ 它会接受第一个 Promise 的返回值。 这个发生在 `handle()` 的底部， `handler` 对象的持有 `onResolved` 回调函数 和 `resolve()` 函数的引用（注： 这个 resolve 是新的 Promise 内部的 resolve 函数， 而不是原来的 Promise 的）。 上面有不止一份 `resolve()` 函数的拷贝在传来传去， 每个 Promise 都会得到一个属于它们自己的拷贝， 并通过闭包传递的方式来使用。 这是第一个 Promise 与第二个 Promise 之间的桥梁。 我们在这一行总结第一个 Promise：

```javascript

var ret = handler.onResolved(value);  

```

在这个例子中，`handler.onResolved` 是

```javascript

function(value) {  
  console.log("Got a value:", value);
}

```

换句话来说，就是我们传到第一个 `then()` 的参数。 其返回值将作为 resolve 第二个 Promise 的值。 这样链式调用就完成了。

```javascript

doSomething().then(function(result) {  
  console.log('first result', result);
  return 88;
}).then(function(secondResult) {
  console.log('second result', secondResult);
});

// the output is
//
// first result 42
// second result 88


doSomething().then(function(result) {  
  console.log('first result', result);
  // not explicitly returning anything
}).then(function(secondResult) {
  console.log('second result', secondResult);
});

// now the output is
//
// first result 42
// second result undefined

```

`then()` 总是返回一个新的 Promise ，那么链式调用可以多深都没问题了。

```javascript

doSomething().then(function(result) {  
  console.log('first result', result);
  return 88;
}).then(function(secondResult) {
  console.log('second result', secondResult);
  return 99;
}).then(function(thirdResult) {
  console.log('third result', thirdResult);
  return 200;
}).then(function(fourthResult) {
  // on and on...
});

```

在上面的例子中，如果我们想在咀咒得到的结果，该怎么做呢？ 使用链式的话，我们只能手动的构建这个结果。

```javascript

doSomething().then(function(result) {  
  var results = [result];
  results.push(88);
  return results;
}).then(function(results) {
  results.push(99);
  return results;
}).then(function(results) {
  console.log(results.join(', ');
});

// the output is
//
// 42, 88, 99

```

Promise 总是会 resolve 一个值。 如果你需要传递多于单一一个的值，你需要创建一个复合类型的值，如数组，对象等。

一个可能较好的办法是使用 Promise 库提供的 `all()` 方法或者其他有用的工具方法来提升 Promises 的有用性，这个就留给你们自己去发现了。


## The Callback is Optional

`then()` 的回调函数不是必须的。 如果你不传递一个回调函数，那么新的 Promise resolve 值将跟上一个 Promise 一样。

```javascript

doSomething().then().then(function(result) {  
  console.log('got a result', result);
});

// the output is
//
// got a result 42

```

你可以看到在 `handle()`里面，如果没有回调函数的话，就直接 resolve 这个 Promise 并退出。 `value` 直接使用上一个的值。

```javascript

if(!handler.onResolved) {  
  handler.resolve(value);
  return;
}

```

## Returning Promises Inside the Chain

我们链式实现的方式有点 naive。 它只是简单的将 resolved 的值往下传递。 那么如果传递的值是一个 Promise呢？ 例如：

```javascript

doSomething().then(result) {  
  // doSomethingElse returns a Promise
  return doSomethingElse(result)
}.then(function(finalResult) {
  console.log("the final result is", finalResult);
});

```

正如上面所示，我们不会得到我们想要的结果。 `finalResult` 不是一个完全解析过的值，他本身就是一个 Promise。 为了得到想要的值，我们需要这么做：

```javascript

doSomething().then(result) {  
  // doSomethingElse returns a Promise
  return doSomethingElse(result)
}.then(function(anotherPromise) {
  anotherPromise.then(function(finalResult) {
    console.log("the final result is", finalResult);
  });
});

```

谁会想这样来糟蹋自己的代码？ 让我们的 Promise 实现无缝地来处理这种情况吧。 很简单就可以， 在`resolve`内部，只要添加一个特殊的分支来解析这个 Promise。

```javascript

function resolve(newValue) {  
  // 通过 duck-typing 方法判断，如果是一个 promise 的话
  if(newValue && typeof newValue.then === 'function') {
    newValue.then(resolve);
    return;
  }
  state = 'resolved';
  value = newValue;

  if(deferred) {
    handle(deferred);
  }
}

```

我们会一直递归调用 `resolve()` 方法，直到它不是一个 Promise。
（注： 这里的 newValue.then(resolve) 意思是调用这个 Promise 的 then 方法， 将原来的 promise 的 resolve 函数作为回调函数传递给上述 Promise 的 then 方法）

这可能会造成一个无限的循环。 `Promise/A+` 规范中建议在实现中检测这种无限循环，但不是必须的。 另外，我们的实现并不满足要求。 我们也不打算在这篇文章中完全支持规范。 好奇的话，我建议你去看看 `Promise resolution procedure`。

注意到对 `newValue` 是否是一个 Promise 的判断是有多松吗？ 我们只是查找了一下有没有 `then()` 方法。 这是 duck typing 判定， 它可以允许多种不同的 Promise 实现能够互相调用。 多种不同的 Promise 库混合使用是很常见的，你使用的不同的第三方库可能各自用着自己的不同的 Promise 实现。

不同的 Promise 实现能够相互操作，只要他们都满足上述的 Promise/A+ 规范。

适当的使用链式调用，我们的实现已经相当完整了。 但是我们完全把错误处理遗忘了。

 
## Rejecting Promises

当在 Promise 期间发生错误时，它需要以某个原因来拒绝（rejected with a reason）。 那么调用者怎么知道这个发生了呢？ 他们可以通过在 `then()` 的再传递第二个回调函数来发现。 

```javascript

doSomething().then(function(value) {  
  console.log('Success!', value);
}, function(error) {
  console.log('Uh oh', error);
});

```

之前提过， Promise 的状态会从 `pending` 迁移到 `resolved` 或者 `rejected` 状态的其中一种，只能一种。 换句话来说，上面的两个回调函数，只有其中一个会执行。

Promises 依靠 `reject()` 来实现拒绝， `resolve` 的邪恶的双胞胎兄弟。 这是添加了错误处理支持后的 `doSomething()`：

```javascript

function doSomething() {  
  return new Promise(function(resolve, reject) {
    var result = somehowGetTheValue(); 
    if(result.error) {
      reject(result.error);
    } else {
      resolve(result.value);
    }
  });
}

```

在 Promise 的实现中，我们必须负责处理拒绝的情况。 只要一个 Promise 被拒绝了， 所有在下游的 Promises 都必须被拒绝。

再看一下一个完整的 Promise 实现，这次添加了错误处理支持

```javascript

function Promise(fn) {  
  var state = 'pending';
  var value;
  var deferred = null;

  function resolve(newValue) {
    if(newValue && typeof newValue.then === 'function') {
      newValue.then(resolve, reject);
      return;
    }
    state = 'resolved';
    value = newValue;

    if(deferred) {
      handle(deferred);
    }
  }

  function reject(reason) {
    state = 'rejected';
    value = reason;

    if(deferred) {
      handle(deferred);
    }
  }

  function handle(handler) {
    if(state === 'pending') {
      deferred = handler;
      return;
    }

    var handlerCallback;

    if(state === 'resolved') {
      handlerCallback = handler.onResolved;
    } else {
      handlerCallback = handler.onRejected;
    }

    if(!handlerCallback) {
      if(state === 'resolved') {
        handler.resolve(value);
      } else {
        handler.reject(value);
      }

      return;
    }

    var ret = handlerCallback(value);
    handler.resolve(ret);
  }

  this.then = function(onResolved, onRejected) {
    return new Promise(function(resolve, reject) {
      handle({
        onResolved: onResolved,
        onRejected: onRejected,
        resolve: resolve,
        reject: reject
      });
    });
  };

  fn(resolve, reject);
}

```

除了添加了 `reject()` 方法，`handle()` 里面也需要识别拒绝的情形。 在 `handle()` 究竟是执行拒绝的逻辑还是解析的逻辑取决于 `state` 的值。 这个 `state` 同样也会推送到下一个 Promise 中，因为调用下一个 Promise 的 `resolve()` 或 `reject()` 会继承上个 Promise 的执行路径。（即上一个 Promise 调用了 reoslve 的话， 下一个也会调用 resolve， 当然错误处理的情况例外。）

当使用 Promises 的时候，很容易忽略错误的回调函数。 但是如果你这么做，你就会没法知道有哪些东西发生错误了。 至少，你需要在你的链式调用的最后一个 Promise 中添加错误处理的回调函数。 看看下面的章节以获取更多关于隐藏了错误的情形的信息。

## Unexpected Errors Should Also Lead to Rejection

目前为止错误处理的逻辑只处理已知的错误。 但是很有可能有意想不到的异常出现，完全毁掉一切。 非常有必要在 Promise 的实现中捕捉这种异常，然后做出相应的拒绝行为。

这意味着 `resolve()` 需要在 `try/catch` 块中包裹。 

```javascript

function resolve(newValue) {  
  try {
    // ... as before
  } catch(e) {
    reject(e);
  }
}

```

保证传递给我们的回调函数不能抛出不被处理的异常非常重要。 这些回调函数在 `handle()` 中执行， 所以我们最后需要：

```javascript

function handle(deferred) {  
  // ... as before

  var ret;
  try {
    ret = handlerCallback(value);
  } catch(e) {
    handler.reject(e);
    return;
  }

  handler.resolve(ret);
}

```

## Promise can Swallow Errors!

有可能对 Promise 的误解会导致完全吞掉了一个错误。 这坑了很多人。

考虑下面的例子：

```javascript

function getSomeJson() {  
  return new Promise(function(resolve, reject) {
    var badJson = "<div>uh oh, this is not JSON at all!</div>";
    resolve(badJson);
  });
}

getSomeJson().then(function(json) {  
  var obj = JSON.parse(json);
  console.log(obj);
}, function(error) {
  console.log('uh oh', error);
});

```

这里会发生什么呢？ 我们在 `then()` 的回调函数期望着合法的 JSON 数据。 所以这个函数会非常 naively 地尝试解析传入的数据， 这会导致异常。但是我们已经有了一个错误处理的回调函数，所以应该没问题，对吧？

不！ 这个错误回调函数并不会被调用。 如果你执行上面的例子， 你不会得到任何输出。 没有错误， 没有任何东西。 纯粹的冰冷的沉默。

为什么呢？ 因为这个没有被处理的异常发生在我们的 `then()` 的回调函数中，它是在 `hanlde()` 中被捕捉。 这个会引起 `handle()` reject 这个 Promise，然后 `then()` 返回，这时候已经不是我们响应的 Promise 了， 因为这个 Promise 已经正确的 resolved 了。 （其实就是 onResolved 与 onRejected 只有一个会被执行， 同一个 then 中的 onResolved 发生的异常不会导致 onRejected 被调用，需要一下一个 Promise 来处理）。

请时刻记住，在 `then()` 内部的回调函数执行时， 这个响应的 Promise 已经解析过了。 你的回调函数的结果对这个 Promise 没有任何影响。

如果你相爱那个捕捉到上述的错误，你必须在下游的错误处理的回调函数。

```javascript

getSomeJson().then(function(json) {  
  var obj = JSON.parse(json);
  console.log(obj);
}).then(null, function(error) {
  console.log("an error occured: ", error);
});

```

现在我们就能够正确记录错误了。

以我的经验看来，这个就是 Promises 的最大的缺陷了。 继续阅读下一节可能提供一个较好的解决方法。

## done() to the Rescue

大多数(但并非全部) Promise 的库都有一个 `done()` 方法。 它跟 `then()` 非常相似， 除了它能够避免上述 `then()` 的缺陷。

`done()` 可以在使用 `then()` 的任何地方使用。 最关键的不同点在与它不会返回一个 Promise， 且在 `done()` 方法内的任何未处理的异常都不会被 Promise 的实现处理。 换句话说， `done()` 代表整个 Promise 链已经完全被解析了。 我们的 `getSomeJson()` 例子能够通过使用 `done()` 方法变得更加健壮了。

```javascript

getSomeJson().done(function(json) {  
  // when this throws, it won't be swallowed
  var obj = JSON.parse(json);
  console.log(obj);
});

```

`done()` 也有一个 错误回调函数参数， `done(callback, errback)`，就像 `then()`一样。 因为整个 Promise 链已经完全解析了， 你就能够保证不会有任何突发的错误发生了。

## Promise Resolution Needs to be Async

在这篇文章的开始部分，我们通过 `setTimeout` 耍了点小手段。 一旦我们修补那个 hack， 我们就不需要使用 setTimeout 了。 但是根据 `Promise/A+` 规范的要求，Promise 的解析一定是异步的。 满足这个要求非常简单， 我们只需要简单的在 `handle()` 的内部实现中包裹在 setTimeout 调用之内。

```javascript

function handle(handler) {  
  if(state === 'pending') {
    deferred = handler;
    return;
  }
  setTimeout(function() {
    // ... as before
  }, 1);
}

```

这就是全部所需要做的。 但实际上，真正的 Promise 库都不倾向于使用 setTimeout。 如果是一个面向 NodeJS 的库它很可能会使用 `process.nextTick`， 面向浏览器的可能会使用新的 `setImmediate` 或者一个 `setImmediate shim`（目前为止只有 IE 支持 setImmediate）,又或者一个异步库如 Kris Kowal 的 `assp`（Kris Kowal 也写看 Q， 一个流行的 Promise 库）。

## Why Is This Asyn REquirement in the Spec

因为它能保证了执行控制流的一致性和可靠性。 考虑下面的认为的例子

```javascript

var promise = doAnOperation();  
invokeSomething();  
promise.then(wrapItAllUp);  
invokeSomethingElse();  

```

这里的调用流（call flow, 执行顺序？）是什么呢？ 根据命名，你可能会认为是 `invokeSomething()` -> `invokeSomethingElse()` -> `wrapItAllUp()`。 但是这完全取决于 promise 的 resolve 是同步还是异步的。 如果 `doAnOperation()` 是异步的工作方式， 那么就是上述的执行顺序。 但是如果它是同步工作的，那么执行顺序将是 `invokeSomething()` -> `wrapItAllUp()` -> `invokeSomethingElse()`，这就非常不好了。 

为了避开这一点， Promise 总是异步的解析，即使有时候他们不是必须那么做。 这样做减少了不可预料的情况出现，让人们使用 Promise 的时候不需要考虑是同步还是异步的。

Promise 总是要求至少在事件循环的下一个迭代中做解析。 但这不是一般标准函数回调函数的规定。

## Before We Wrap Up ... then/promise

在外边有很多全特性支持的 Promise 库实现。 `then 组织` 的 promise 库采用一个较简单的实习那方式，就是说它只实现了规范要求的，一点也不多。 如果你去看看它的实现的话，你会觉得非常的熟悉。 `then/promise` 是这篇文章的代码的基础， 我们几乎实现了相同的 Promise。 感谢 Nathan Zadoks 和 Forbes Lindsay 提供的好用的库与在 Javascript Promise 上的工作。 Forbes Lindsay 也是一个在 promise.org 网站后的工作人员。

这篇文章里的实现跟真正的 Promise 的实现还有一些不同。 因为还有更多的在 `Promise/A+` 规定的细节我没有去处理。 我建议去阅读这个规范， 它文章篇幅短，而且内容简明。

## Conclusion

如果你能够到达这里，非常感谢你的时间阅读！ 我们已经覆盖了 Promises 的核心了， 也是规范唯一规定的东西。 大部分实现都会提供一些额外的功能，如 `all()`， `spread()`，`race()`，`denodeify()` 等。 我建议浏览 `API docs for Bluebird` 来看看 Promise 更多的可能。

一旦我开始明白 Promise 的工作机制和 caveats，我开始真的喜欢他们了。 他们给我的工程带来了非常简洁和优雅的代码。 还有很多可以说的，这篇文章只是开始。 

如果你喜欢这篇文章， 你可以去　Twitter 上订阅我，看看我啥时候又写了像这样的指导文章。

## Further Reading

