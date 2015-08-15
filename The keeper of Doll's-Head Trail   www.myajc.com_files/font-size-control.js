cmg.query(document).ready(function($) {
	var font_cookie_value = $.cookie('font_size');
	// NOTE: if jquery.cookie.min.js is updated to v.1.3, the next test should be changed to _.isUndefined()
	font_cookie_value = cmg._.isNull(font_cookie_value) ? 'font-default' : font_cookie_value;
	cmg.utility.set_font_size(font_cookie_value);
	$('.font-size-control button').on('click', function(e){
		var $this = $(this);
		if(!$this.hasClass('disabled')){
			cmg.utility.set_font_size($this.data('fontvalue'));
		}
	});
});
