var r_app = window.r_app || {};

r_app.scroll_loader = function() {

    /**
    * If height of div below sidebar is > 500px, the size of two IAB Medium-Rectangle ads, then create a div and automatically append one Medium-Rectangle ad placement.
    */
  $(document).ready(function() {
    if ($("#content > div > div > article" ).height() - $("#sidebar").height() > ($("#auto_boxy").outerHeight(true)*3) + $("#more_from_ut").outerHeight(true)){

        window.addEventListener('scroll', article_loader);
        window.addEventListener('scroll', ad_loader);
        ad_box_draw();
    }
  });

    function  ad_box_draw() { 
        var right_side = document.getElementById("sidebar");
        var box_wrap = document.getElementById("ad_box_wrapper");
        var real_wrap_height = $("#content > div > div > article" ).height() - $("#sidebar").height();
        var para = document.createElement("div");
            $('<div id="ad_box_wrapper" class="span3 column alpha omega"></div>').insertAfter("#sidebar");
            $("#ad_box_wrapper").height($("#content > div > div > article" ).height() - $("#sidebar").height());
                
        var element = document.getElementById("ad_box_wrapper");
            para.setAttribute("id","auto_boxy");
            element.appendChild(para);
            $( "#auto_boxy" ).append('<div id="dfp_300x250_2" data-slot="300x250_2" data-size="300x250"></div>');
            app.adsLazy.init($('[data-slot=300x250_2]'));
    }

    /**
    * Begin loading ads as user scrolls past top of threshold div
    */
        var count = 1;
        var box_count = 0;

    function ad_loader() {  
        var real_wrap_height = $("#content > div > div > article" ).height() - $("#sidebar").height();
        var para = document.createElement("div");
        var auto_box_height =  $( "#auto_boxy" ).outerHeight(true);
        var real_box_height = $("[class^=boxy").outerHeight(true);
        var total_box_height = real_box_height * count + auto_box_height + $('#more_from_ut').outerHeight(true);
        var element = document.getElementById("ad_box_wrapper");
        var side_bottom = $("#sidebar").offset().top + $("#sidebar").height();
        var ad_box_ceiling = 0;
        var scroller = ($(window).scrollTop() + $(window).height()) - $("#ad_box_wrapper").offset().top;
            para.setAttribute("class","boxy"+box_count);
    /**
    * Begin load ads until total height of content divs is > than box wrapper.
    */
      if ( scroller > ad_box_ceiling && count*200 < scroller && scroller < (count+1)*200 && total_box_height < real_wrap_height ){

        var real_wrap_height = $("#content > div > div > article" ).height() - $("#sidebar").height();    
              element.appendChild(para);
              $( ".boxy"+box_count).append('<div id="dfp_300x250_2" data-slot="300x250_2" data-size="300x250"></div>');
              app.adsLazy.init($('[class^=boxy] > [data-slot=300x250_2]'));
              $("[class^=boxy] > [data-slot=300x250_2]").removeAttr("data-slot");
          
              count = count+1;
              box_count++;
      }
    }
    /**
    * Abstract query parameters for ease of maintenance. 
    */
    function get_data() {
        var data = {};
            data.limit = r_app.sectionLimit;

      if(r_app.photoWidth){
          data.photo_width = r_app.photoWidth;
      }

      if(r_app.photoHeight){
          data.photo_height = r_app.photoHeight;
      }
      data.lead_photo__isnull =  'False';

        return data;
    }

    function create_html(item){

        return '<a href="'+ item.url +'">' + item.lead_photo +'<h3 '+ item.h3_class + '>'+ item.title +'</h3><span style="display:none">'+ item.url +' nav-stories</span></a>';
    }

    function get_error_message(){

        return "<li><h3>Something went wrong fetching the stories. Please try again later.</h3></li>";
    }

    function render_item(item, element) {
        var element = document.getElementById("link_wrapper");
        var article_link = document.createElement("li");

      if(item.start_time) {
          return null;
      }
      item.h3_class = '';

      if(item.lead_photo) {
          if(item.lead_photo.indexOf('img src') === -1){
              item.lead_photo = '<div class="scroller_img_wrap"><img src="'+ item.lead_photo + '" /></div>';
          }
      } else {
          item.lead_photo = '';
          item.h3_class = 'class="nav-stories-no-photo"';
      }
          article_link.setAttribute("class","scroll_loader_stories");
          element.appendChild(article_link);
          article_link.innerHTML = create_html(item);  
    }

    function callback_receiver(json, element) {
        var i;

      if(json.items.length === 1){
    /**
    * If we are here then nothing was returned from the api (empty section?)
    */
        element.empty();
        element.prepend(get_error_message());
      } 
      else {
        for(i=0; i < json.items.length; i++){
            render_item(json.items[i], element);
        }
      }
    }

    function article_loader() {  
        var wrapper = document.getElementById("ad_box_wrapper");
        var module = document.createElement("div");
        var side_bottom = $("#sidebar").offset().top + $("#sidebar").height();
        var ad_box_ceiling = $("#ad_box_wrapper").offset().top - $("#ad_box_wrapper").offset().top;
        var scroller = ($(window).scrollTop() + $(window).height()) - $("#ad_box_wrapper").offset().top;
        var more_title = document.createElement("h3");
        var link_wrap = document.createElement("ul");
            module.setAttribute("id","more_from_ut");
            more_title.innerHTML = "Recent "+r_app.section_name;
            link_wrap.setAttribute("id","link_wrapper");

      if (scroller > ad_box_ceiling){

            wrapper.appendChild(module);
            module.appendChild(more_title);
            module.appendChild(link_wrap);

        $.ajax({
            url: "http://api.utsandiego.com/api/widgets/v1/news/section/"+ r_app.section_url +"/",
            
            data: get_data(), 
            type: "GET",
            dataType : "jsonp",
            cache: true,
          success: function( json, element ) {
              callback_receiver(json, element);
          },
          error: function( xhr, status, errorThrown ) {
              console.dir( xhr );
          },
          complete: function( xhr, status ) {
              console.log( "Run a message regarless of success." );
          }
        });
          /**
          *Prevent article module from loading more than once.
          */
          window.removeEventListener('scroll', article_loader);
      }
    }
}();
