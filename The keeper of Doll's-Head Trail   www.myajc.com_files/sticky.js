(function($) {

	var iosPttn=/(ipad)/i;
	if(!iosPttn.test(navigator.userAgent)){
		$.fn.sticky = function(options) {
			var default_options = {
					'enabled': true,
					'parent': $('.parent_div'),
					'object': $('.object_div'),
					'windowTopMin': 150,
					'windowTopMax': 200,
					'adjustPosition': 20
				}

			var extended_options = $.extend({}, default_options, options);

			var enabled = extended_options.enabled,
				sticky = $(this),
				parent = $(extended_options.parent),
				object = $(extended_options.object),
				windowTopMin = extended_options.windowTopMin,
				windowTopMax = extended_options.windowTopMax,
				adjustPosition = extended_options.adjustPosition,
				clearSticky = {position: 'relative', top: 'auto', bottom: 'auto', height: 'auto'};

			if (enabled) {
				var objectHeight = object.height();

				if (!!sticky.offset() && objectHeight >= parent.height()) {
					var stickyHeight = sticky.height(),
						objectTop = object.offset().top,
						objectBottom = objectTop + objectHeight - stickyHeight - adjustPosition,
						stickyTop = sticky.offset().top - adjustPosition;

					$(window).scroll(function() {
						var windowTop = $(window).scrollTop();

						if (windowTop > windowTopMin && windowTop < windowTopMax) {
							objectHeight = object.height();
							objectBottom = objectTop + objectHeight - stickyHeight - adjustPosition;
							stickyTop = sticky.offset().top - adjustPosition;
						}

						if (stickyTop <= windowTop) {
							if (objectBottom > windowTop) {
								sticky.css({position: 'fixed', top: adjustPosition + 'px', height: stickyHeight});
							}
							else {
								parent.height(objectHeight);
								sticky.css({position: 'absolute', top: 'auto', bottom: 0, height: 'auto'});
							}
						}
						else {
							parent.height('auto');
							sticky.css(clearSticky);
						}
					});
				}
			} else {
				parent.height('auto');
				sticky.css(clearSticky);
				$(window).scroll(function() {
					parent.height('auto');
					sticky.css(clearSticky);
				});
			}
		}
	}

})(cmg.query);