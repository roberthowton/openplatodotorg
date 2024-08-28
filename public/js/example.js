$(document).ready(function(){
	function hlclick() {
		fr = '';
		hlid = $(this).attr('id').substring(1);
		if($(this).attr('id').substring(0,3)=='fr-') { 
			fr = 'fr-'; 
			hlid = $(this).attr('id').substring(4);
		}
		greekid = '#g'+hlid;
		englishid = '#'+fr+'e'+hlid; 
		commentid = '#'+fr+'c'+hlid;
		if(!$(this).hasClass('current')){
			$('#comments p').hide();
			$('.current').removeClass('current');
			$(greekid).addClass('current');
			$(englishid).addClass('current');
		} else {
			$(greekid).removeClass('current');
			$(englishid).removeClass('current');
		}
		offset = $(englishid).offset().top-15 + 'px';
		$(commentid).css({'position':'absolute','top':offset,'margin-top':'0'});
		$(commentid).toggle();
	}
	$('.hl').click(hlclick);
	$('.hl').hover(function(){
		hlid = $(this).attr('id').substring(1);
		greekid = '#g'+hlid;
		englishid = '#e'+hlid;
		if($(this).attr('id')[0]=='g'){$(englishid).toggleClass('hovered');}
		if($(this).attr('id')[0]=='e'){$(greekid).toggleClass('hovered');}
	});
	cssGE = {
  		'grid-template-areas':    	'"title title" "greek english"',
		'grid-auto-columns': 		'485px 525px',
		'padding': 					'5rem 8%'
	};
	cssEC = {
  		'grid-template-areas':    	'"title title" "english comments"',
		'grid-auto-columns': 		'50rem 1fr',
		'padding': 					'5rem 8%'
	};
	cssE = {
		'grid-template-areas':    	'"title" "english"',
		'grid-auto-columns': 		'50rem',
		'padding': 					'5rem 8%'
	};
	cssGEC = {
  		'grid-template-areas':    	'"title title title" "greek english comments"',
		'grid-auto-columns': 		'485px 525px 1fr',
		'padding': 					'5rem 0rem'
	};
	$('#nav-greek').click(function(){
		if($('#greek:visible').length==1){
			$('#greek').hide();
			$(this).removeClass('current-view');
			$('#english .stephanus').show();
			if($('#comments:visible').length==1){ //no greek, english, comments
				$('article').css(cssEC);
				if($('#comments > p:visible').length==1) { //adjust comment offset
					comid = $('#comments > p:visible').attr('id').substring(1);
					eid = '#e'+comid;
					reoffset = $(eid).offset().top-15 + 'px';
					$('#comments > p:visible').css({'top':reoffset});
				}
			} else { //no greek, english, no comments
				$('article').css(cssE);
			}
		} else {
			$('#greek').show();
			$(this).addClass('current-view');
			$('#english .stephanus').hide();
			if($('#comments:visible').length==1){ //greek, english, comments
				$('article').css(cssGEC);
				if($('#comments > p:visible').length==1) { //adjust comment offset
					comid = $('#comments > p:visible').attr('id').substring(1);
					eid = '#e'+comid;
					reoffset = $(eid).offset().top-15 + 'px';
					$('#comments > p:visible').css({'top':reoffset});
				}
			} else { // greek, english, no comments
				$('article').css(cssGE);
			}
		}
	});
	$('#nav-comments').click(function(){
		if($('#comments:visible').length==1){
			$('#comments').hide();
			$(this).removeClass('current-view');
			$('.hl').off();
			$('.hl').addClass('hl-off').removeClass('hl');
			$('.current').addClass('current-off').removeClass('current');
			if($('#greek:visible').length==1){ //greek, english no comments
				$('#english .stephanus').hide();
				$('article').css(cssGE);
			} else { //no greek, english, no comments
				$('#english .stephanus').show();
				$('article').css(cssE);
			}
		} else {
			$('#comments').show();
			$(this).addClass('current-view');
			$('.hl-off').addClass('hl').removeClass('hl-off');
			$('.current-off').addClass('current').removeClass('current-off');
			$('.hl').click(hlclick);
			if($('#greek:visible').length==1){ //greek, english, comments
				$('#english .stephanus').hide();
				$('article').css(cssGEC);
			} else { // no greek, english, comments
				$('#english .stephanus').show();
				$('article').css(cssEC);
			}
		}
	});
	$('#nav-frs').click(function(){
		if($('#greek:visible').length==1){
			$('#greek').hide();
			$('#nav-greek').removeClass('current-view');
			$('#english .stephanus').show();
			if($('#comments:visible').length==1){ //no greek, english, comments
				$('article').css(cssEC);
				if($('#comments > p:visible').length==1) { //adjust comment offset
					comid = $('#comments > p:visible').attr('id').substring(1);
					eid = '#e'+comid;
					reoffset = $(eid).offset().top-15 + 'px';
					$('#comments > p:visible').css({'top':reoffset});
				}
			} else { //no greek, english, no comments
				$('article').css(cssE);
			}
		}
		if(!$(this).hasClass('current-view')){ //store scholarly and load fr
			$('article').append('<section id="english-tmp" style="display:none;">'+$('#english').html()+'</section>');
			$('article').append('<section id="comments-tmp" style="display:none;">'+$('#comments').html()+'</section>');
			$('#english').html($('#english-fr').html());
			$('#comments').html($('#comments-fr').html());	
			$('.hl').click(hlclick);
			$('#english .stephanus').show();
			$('#nav-greek').addClass('dis');
			$('#nav-sch').removeClass('current-view');
			$(this).addClass('current-view');
		} else { //restore scholarly
			
		}		
	});
	$('#nav-sch').click(function(){
		if(!$(this).hasClass('current-view')){ //store scholarly and load fr
			$('#english').html($('#english-tmp').html());
			$('#comments').html($('#comments-tmp').html());
			$('.hl').click(hlclick);
			$('#nav-greek').removeClass('dis');
			$('#nav-frs').removeClass('current-view');
			$(this).addClass('current-view');
		}	
	});
});
