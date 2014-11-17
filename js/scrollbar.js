(function($, window, document, undefined){

	var defaultSettings = {

		//width of visible scroll area
		width : 'auto',

		//height of visible area
		height : '250px',

		//width of scrollbar or rail
		size : '7px',

		// scrollbar color
		color : '#000',

		//scrollbar position
		position : 'right',

		//distance between sideedge and scrollbar
		distance : '1px',

		//on load scrollbar position
		start : 'top',

		// scrollbar opacity
		opacity : .4,

		//scrollbar always visible
		alwaysvisible : false,

		// hide scrollbar
		disableFadeOut : false,

		//border radius
		borderRadius: '7px',

		// sets visibility of rail
		railVisible: false,

		//set railcolor
		railcolor : '#333',

		//rail opacity
		railOpacity : .2,

		//draggable rail
		railDraggable: true,

		//railborder radius
		railBorderRadius: '7px',

		wheelStep: 20,
	};

	$.fn.simpleScrollbar = function (suppliedsettings, option){

		return this.each(function(){
			var settings = $.extend(true, {}, defaultSettings);
			var $this = $(this);
			var $parent = $this.parent()

			if (typeof suppliedsettings === "object"){
				$.extend(true, settings, suppliedsettings);
			}

			var isOverPanel, isOverBar, isDragg, queueHide, touchDif,
				barHeight, percentScroll, lastscroll, divS = '<div></div>',
				minBarHeight = 30,
				releaseScroll = false;

			if ($parent.hasClass('wrapper')){
				// start from last bar position
				var offset = $this.scrollTop();

				// find bar and rail
				bar = $parent.find('.scroll-bar');
				rail = $parent.find('.scroll-rail');

				getBarHeight();
			}

			if ($.isPlainObject(settings)){

				if ('height' in settings && settings.height == 'auto'){
					$parent.css('height', 'auto');
					$this.css('height', 'auto');
					var height = $parent.parent().height();
					$parent.css('height', height);
					$this.css('height', height);
				}
			}

			settings.height = (settings.height == 'auto') ? $parent.height() : settings.height;

			var wrapper = $(divS).addClass('wrapper').css({
				position: 'relative',
				overflow: 'hidden',
				width: settings.width,
				height: settings.height,
			});

			$this.css({
				overflow: 'hidden',
				width: settings.width,
				height: settings.height,
			});

			// cerate rail

			var rail = $(divS).addClass('scroll-rail').css({
				width: settings.size,
				height: '100%',
				position: 'absolute',
				top: 0,
				display: (settings.alwaysvisible && settings.railVisible) ? 'block' : 'none',
				'border-radius': settings.railBorderRadius,
				background: settings.railcolor,
				opacity: settings.railOpacity,
				zIndex: 90,
			});

			//create scrolbar

			var bar = $(divS).addClass('scroll-bar').css({
				background: settings.color,
				width: settings.size,
				position: 'absolute',
				top: 0,
				opacity: settings.opacity,
				display: settings.alwaysvisible ? 'block' : 'none',
				'border-radius': settings.borderRadius,
				borderRadius: settings.borderRadius,
				MozBorderRadius: settings.borderRadius,
				WebkitBorderRadius: settings.borderRadius,
				zIndex: 99,
			});

			//set position
			var posCss = (settings.position == 'right') ? { right: settings.distance } : { left: settings.distance };
			rail.css(posCss);
			bar.css(posCss);

			$this.wrap(wrapper);
			$this.parent().append(bar);
			$this.parent().append(rail);			
			getBarHeight();
			if (settings.railDraggable){
				
				bar.bind("mousedown", function(e){
					var $doc = $(document);
					isDragg = true;
					t = parseFloat(bar.css('top'));
					pageY = e.pageY
					$doc.bind("mousemove.scroll", function(e){
						currTop = t + e.pageY - pageY;
						bar.css('top', currTop);
						scrollContent(0, bar.position().top, false);
					});
					$doc.bind("mouseup.scroll", function(e) {
		              	isDragg = false;
		              	$doc.unbind('.scroll');
		            });
		            return false;
		        	}).bind("selectstart.scroll", function(e){
		            	e.stopPropagation();
		            	e.preventDefault();
		            	return false;
				});
			}
		rail.hover(function(){
          showBar();
        }, function(){
          hideBar();
        });

        // on bar over
        bar.hover(function(){
          isOverBar = true;
        }, function(){
          isOverBar = false;
        });

        // show on parent mouseover
        $this.hover(function(){
          isOverPanel = true;
          showBar();
          hideBar();
        }, function(){
          isOverPanel = false;
          hideBar();
        });
			attachWheel();

			function _onWheel(e)
        {
          // use mouse wheel only when mouse is over
          if (!isOverPanel) { return; }

          var e = e || window.event;

          var delta = 0;
          if (e.wheelDelta) { delta = -e.wheelDelta/120; }
          if (e.detail) { delta = e.detail / 3; }

          var target = e.target || e.srcTarget || e.srcElement;
          if ($(target).closest('.wrapper').is($this.parent())) {
            // scroll content
            scrollContent(delta, true);
          }

          // stop window scroll
          if (e.preventDefault && !releaseScroll) { e.preventDefault(); }
          if (!releaseScroll) { e.returnValue = false; }
        }

			function scrollContent(y, isWheel, isJump){

				releaseScroll = false;
				var delta = y;
				var maxTop = $this.outerHeight() - bar.outerHeight();

				if(isWheel){
					delta = parseInt(bar.css('top')) + y * parseInt(settings.wheelStep) / 100 * bar.outerHeight();
					delta = Math.min(Math.max(delta,0), maxTop);

					delta = (y > 0) ? Math.ceil(delta) : Math.floor(delta);

					bar.css({top: delta + 'px' });
				}

				percentScroll = parseInt(bar.css('top'))/($this.outerHeight() - bar.outerHeight());
				delta = percentScroll * ($this[0].scrollHeight - $this.outerHeight());

				$this.scrollTop(delta);

				$this.trigger('scrolling', ~~delta);

				if (isJump)
		          {
		            delta = y;
		            var offsetTop = delta / $this[0].scrollHeight * $this.outerHeight();
		            offsetTop = Math.min(Math.max(offsetTop, 0), maxTop);
		            bar.css({ top: offsetTop + 'px' });
		          }
			}

			function attachWheel()
	        {
	          if (window.addEventListener)
	          {
	            this.addEventListener('DOMMouseScroll', _onWheel, false );
	            this.addEventListener('mousewheel', _onWheel, false );
	          }
	          else
	          {
	            document.attachEvent("onmousewheel", _onWheel)
	          }
	        }
	        
	        function showBar(){
	        	return;
	        }

	        function hideBar(){
	        	return;
	        }

			function getBarHeight(){
	            // calculate scrollbar height and make sure it is not too small
	            barHeight = Math.max(($this.outerHeight() / $this[0].scrollHeight) * $this.outerHeight(), minBarHeight);
	            bar.css({ height: barHeight + 'px' });

	            // hide scrollbar if content is not long enough
	            var display = barHeight == $this.outerHeight() ? 'none' : 'block';
	            bar.css({ display: display });
	        }

		});
	}

})(jQuery, window, document);