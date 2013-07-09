/*~~~~~~~~
with dances

	called: placeHolder

	version: 1.2_dev

	firstDate: 2012.11.03

	lastDate: 2013.03.15

	import: [
		"jQuery"
	],


	effect: [
		+. 兼容 html5 方式, 对placeHolder,
		+. {effects}
	];

	log: {
		"v1.0": [
			+. 实现功能
		],

		"v1.1": [
			+. 简化插件调用方式
			+. 提供 jQuery 接口
			+. 指定属性作为 placeHolder 参考(永远不提供)
			+.fixBug 非 HTML5 清空输入框 失去焦点 没有placeHolder 默认值
		],

		"v2.0": [
			+ TODO 与 dances.amd 适配
			+ TODO 修正 ctrl+v 判定
		]
	}

~~~~~~~~*/

/*~~~~~~~
	settings:

		dances.placeHolder(".demo",{
			rootEl: "element"
		});

~~~~~~~*/

/*~~~~~~~~
	syntax:
		// 配置 dances.placeHolder
		dances.placeHolder.conf({
			// 配置jQuery 版本
			baseJquery: window.jQuery || window._$1_72
		})

		// 初始化 dances.placeHolder
		// 必须手动初始化
		dances.placeHolder.init()

		// 适用于 实例模式
		inst = dances.placeHolder(".demo5",{

			// 允许 html5 mode
			// 注意 html5 mode 下,没有 fInHolder fOuterHolder
			b5: "true",

			// 额外监听事件
			event: "keydown",

			// 事件监听元素
			rootEl: "element",

			// placeHolder 状态的挂钩
			sClassIn: "d-in",

			// 是否启用 focus 监听
			// 注意,当开启时 与dances.form 使用会有 bug
			bOnFocus: true,

			fInHolder: "function",
			fOuterHolder: "function",

		});

~~~~~~~*/
/*~~~~~~~
 	API:
 		// 开启(非HTML5)
 		// inst.init() 会自动开启
 		inst.on

 		// 自动扫描 placeHolder 值(非HTML5)
 		inst.update()

 		// 关闭(非HTML5)
 		inst.off()

 		// 清除实例(非HTML5)
 		inst.remove()

~~~~~~~*/

// 命名扩展
if ("function" !== typeof window.dances &&  "object" !== typeof window.dances){
	window.dances = {};

	// $log
	window.$log = (function(){
		var $log = Boolean;

		if(window.console && window.console.log){
			$log = console.log;

			try{
				$log("_____" + (new Date).toString() + "_____");

			}catch(e){
				$log = null;
			}

			$log || ($log = function(){ console.log.apply(console, arguments); }) && $log("_____" + (new Date).toString() + "_____");

		}

		return $log;
	})();
}
dances.placeHolder = (function(){
	var placeHolder,
		PlaceHolder,

		fConf,
		fInit,

		fValidArgs,
		requireType,
		defaultConf,

		bNative,

		fHolderFocus,
		fMove2First,

		hackTime,

		$ = window.jQuery
	;

	fConf = function(conf){
		conf = fValidArgs(conf, {
			baseJquery: "function"
		}, {
			baseJquery: window.jQuery
		});

		$ = conf.baseJquery;

		arguments.callee = function(){
			return this;
		};

		return this;
	};

	fInit = function(foo){
		bNative = "placeholder" in document.createElement("input");

		requireType = {
			event : "string",
			rootEl: "element,string,document",
			scope : "element,string",

			sClassIn: "string",

			fInHolder   : "function",
			fOuterHolder: "function",
			b5          : "boolean",

			// 解决与 dances.form 搭配有冲突
			// 是否监听 focus 事件
			bOnFocus    : "boolean"
		};

		defaultConf = {
			event      : "keydown",
			rootEl     : document,
			sClassIn   : "dances-inHolder",
			b5         : true,
			bOnFocus   : true
		};

		fHolderFocus = function(){
			// 移动光标
			this.value === this.getAttribute("placeholder") && fMove2First(this);
		};

		fMove2First = function(el){
			var l,
				range
			;

			// 防止锁死页面
			if(hackTime && new Date - hackTime > 25){
				return ;
			}

			hackTime = new Date();

			setTimeout(function(){
				hackTime = null;
			}, 25);

			if(el.createTextRange){
				el.focus();
				l = el.value.length;
				range = el.createTextRange();
				range.moveStart("character", 0);
				range.moveEnd("character", -l);
				setTimeout(function(){
					range.select();
				}, 0);
			}else if(el.setSelectionRange){
				el.focus();
				el.setSelectionRange(0, 0);
			}

		};

		// 确保类只实例化一次
		arguments.callee = function(foo){
			"function" === typeof foo && foo.call(this);
			return this;
		};

		"function" === typeof foo && foo.call(this);

		return this;
	};

	fValidArgs = function(conf, requireType, defaultConf){
		var fType = dances.type
		;

		for(var prop in requireType){
			// 可配置参数
			if(requireType.hasOwnProperty(prop)){

				// 不符合的必须配置参数
				if(!conf.hasOwnProperty(prop) || requireType[prop].indexOf(fType(conf[prop])) === -1){
					// 必须配置参数 有推荐值
					if( defaultConf.hasOwnProperty(prop)){
						conf[prop] = defaultConf[prop];

					// 必须配置参数 没有推荐值
					}else{
						conf[prop] = null;
					}
				}
			}
		}

		return conf;
	};


	PlaceHolder = function(){
		var args = Array.prototype.slice.call(arguments, 0),

			// 依据 最后一个实参作为配置对象
			conf = (args.pop() || {})
		;

		// 判断 html5 特性
		// 若启用并支持,则放弃构造
		if(false === conf.b5 || !bNative){
			this.conf = conf;
			this.bOn = false;
			this.bInit = false;

			args = args[0];
			if(args && "string" === typeof args){
				this.conf.scope = args;
			}

		}else{
			this.bHTML5();
		}

	};

	PlaceHolder.prototype = {
		constructor: PlaceHolder,

		// 支持 html5 伪造原型
		bHTML5: function(){
			var fn = function(){
					return this;
				},

				_base = PlaceHolder.prototype,
				prop
			;

			for(prop in _base){
				if(_base.hasOwnProperty(prop) && "function" === typeof _base[prop]){
					this[prop] = fn;
				}
			}

			return this;
		},

		init: function(){
			var conf = fValidArgs(this.conf, requireType, defaultConf)
			;

			// 惰性装载 事件处理
			this.fHolder = function(e){
				var v = this.getAttribute("placeholder"),
					_this,

					kCode = e.keyCode
				;

				// 达到执行条件
				if(v &&
					!e.ctrlKey &&
						!e.altKey &&
							16 !== kCode &&
								17 !== kCode &&
									18 !== kCode
					){

					_this = this;

					if(v === _this.value){
						if(8 !== kCode &&
							46 !== kCode &&
								9 !== kCode
							){

							$(_this).removeClass(conf.sClassIn)[0].value = "";
							"function" === typeof conf.fOuterHolder && conf.fOuterHolder(_this);

						}else if(
							8 === kCode||
								46 === kCode
							){
							return false
						}

					}else if(
						8 === kCode ||
							46 === kCode
						){
						setTimeout(function(){
							if(_this.value){
								$(_this).removeClass(conf.sClassIn);

							}else{
								$(_this).addClass(conf.sClassIn)[0].value = v;
								fMove2First(_this);
								"function" === typeof conf.fInHolder && conf.fInHolder(_this);
							}
						}, 0);

					}else{
						setTimeout(function(){
							_this.value && $(_this).removeClass(conf.sClassIn);
						},0);
					}
				}

			};

			this.fBlur = function(){
				var v = this.getAttribute("placeholder"),
					_this = this
				;

				setTimeout(function(){
					v && !_this.value && ($(_this).addClass(conf.sClassIn)[0].value = v);
				}, 0);

			};

			// 重载实例
			this.init = function(){
				return this;
			};

			this.bInit = true;

			return this.on();
		},

		on: function(){

			this.bInit || this.init();

			var conf,
				$El,

				_this
			;

			if(!this.bOn){

				conf = this.conf;
				$El = $(conf.rootEl);
				_this = this;

				// 私有
				if(conf.scope){
					$El
						.on(conf.event, conf.scope, _this.fHolder)
					;

					conf.bOnFocus && $El
						.on("focus.dancesPH", conf.scope, fHolderFocus)
						.on("blur.dancesPH", conf.scope, _this.fBlur)
						.on("mousedown.dancesPH", conf.scope, fHolderFocus)
					;

				}else{

				// 全局
					$El
						.on(conf.event + ".dancesPH", "input", _this.fHolder)
						.on(conf.event + ".dancesPH", "textarea", _this.fHolder)
					;

					conf.bOnFocus && $El
						.on("focus.dancesPH", "input", fHolderFocus)
						.on("focus.dancesPH", "textarea", fHolderFocus)
						.on("blur.dancesPH", "input", _this.fBlur)
						.on("blur.dancesPH", "textarea", _this.fBlur)
						.on("mousedown.dancesPH", "input", fHolderFocus)
						.on("mousedown.dancesPH", "textarea", fHolderFocus)
					;
				}

				(false === conf.b5 || !bNative) && this.update();

				this.bOn = true;
			}

			return this;
		},

		off: function(){
			var conf,
				$El,
				_this
			;

			if(this.bOn){

				conf = this.conf;
				$El = $(conf.rootEl);
				_this = this;

				if(conf.scope){
					$El
						.off(conf.event + ".dancesPH", conf.scope, _this.fHolder)
					;

					conf.bOnFocus && $El
						.off("focus.dancesPH", conf.scope, fHolderFocus)
						.off("blur.dancesPH", conf.scope, _this.fBlur)
						.off("mousedown.dancesPH", conf.scope, fHolderFocus)
					;
				}else{
					$El
						.off(conf.event + ".dancesPH", "input", _this.fHolder)
						.off(conf.event + ".dancesPH", "textarea", _this.fHolder)
					;

					conf.bOnFocus && $El
						.off("focus.dancesPH", "input", fHolderFocus)
						.off("focus.dancesPH", "textarea", fHolderFocus)
						.off("blur.dancesPH", "input", _this.fBlur)
						.off("blur.dancesPH", "textarea", _this.fBlur)
						.off("mousedown.dancesPH", "input", fHolderFocus)
						.off("mousedown.dancesPH", "textarea", fHolderFocus)
					;
				}

				this.bOn = false;
			}

			return this;
		},

		remove: function(){
			var prop;

			this.bOn && this.off();

			// project! 删除实例模式
			for(prop in this){
				if(this.hasOwnProperty(prop)){
					this[prop] = null;
				}
			}

			return null;
		},

		update: function(){
			var conf,
				sClass
			;

			conf = this.conf;
			sClass = conf.sClassIn;

			$((conf.scope || ":input"), conf.rootEl).each(function(){
				var v = this.getAttribute("placeholder");
				if(v && !this.value){
					this.value = v;
					$(this).addClass(sClass);
				}
			});

			return this;
		}
	};

	placeHolder = function(sSelector,conf){
		return new PlaceHolder(sSelector, conf);
	};

	placeHolder.bNative = bNative;

	placeHolder.PlaceHolder = PlaceHolder;

	placeHolder.conf = fConf;

	placeHolder.init = fInit;

	return placeHolder;
})();