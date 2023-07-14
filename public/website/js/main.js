(function ($) {
  "use strict";
  jQuery(document).ready(function () {
    // mobile-menu
    $("#mobile-menu").meanmenu({
      meanMenuContainer: ".mobile-menu",
      meanScreenWidth: "991.99",
    });

    // ToTop [Hand-Code].
    $(".scrollup").on("click", function () {
      $("html").animate(
        {
          scrollTop: "0",
        },
        1200
      );
    });
    $(window).on("scroll", function () {
      var toTopVisible = $("html").scrollTop();
      if (toTopVisible > 500) {
        $(".scrollup").fadeIn();
      } else {
        $(".scrollup").fadeOut();
      }
    });

    // MouseHover Animation home 1
    var hoverLayer = $(".banner-area");
    var heroImgOne = $(".p-shape-1");
    var heroImgTwo = $(".p-shape-2");
    var heroImgThree = $(".p-shape-3");
    var heroImgFour = $(".p-shape-4");
    hoverLayer.mousemove(function (e) {
      var valueX = (e.pageX * -1) / 100;
      var valueY = (e.pageY * -1) / 120;
      heroImgOne.css({
        transform: "translate3d(" + valueX + "px," + valueY + "px, 0)",
      });
    });
    hoverLayer.mousemove(function (e) {
      var valueX = (e.pageX * -1) / 60;
      var valueY = (e.pageY * -1) / 80;
      heroImgTwo.css({
        transform: "translate3d(" + valueX + "px," + valueY + "px, 0)",
      });
    });
    hoverLayer.mousemove(function (e) {
      var valueX = (e.pageX * -1) / 40;
      var valueY = (e.pageY * -1) / 60;
      heroImgThree.css({
        transform: "translate3d(" + valueX + "px," + valueY + "px, 0)",
      });
    });
    hoverLayer.mousemove(function (e) {
      var valueX = (e.pageX * -1) / 80;
      var valueY = (e.pageY * -1) / 100;
      heroImgFour.css({
        transform: "translate3d(" + valueX + "px," + valueY + "px, 0)",
      });
    });

    // MouseHover Animation home 2
    var hoverLayer2 = $(".burger-promo-area");
    var heroImgfive = $(".bs1");
    var heroImgsix = $(".bs2");
    var heroImgseven = $(".bs5");
    var heroImgeight = $(".bs6");
    hoverLayer2.mousemove(function (e) {
      var valueX = (e.pageX * -1) / 100;
      var valueY = (e.pageY * -1) / 120;
      heroImgfive.css({
        transform: "translate3d(" + valueX + "px," + valueY + "px, 0)",
      });
    });
    hoverLayer2.mousemove(function (e) {
      var valueX = (e.pageX * -1) / 60;
      var valueY = (e.pageY * -1) / 80;
      heroImgsix.css({
        transform: "translate3d(" + valueX + "px," + valueY + "px, 0)",
      });
    });
    hoverLayer2.mousemove(function (e) {
      var valueX = (e.pageX * -1) / 40;
      var valueY = (e.pageY * -1) / 60;
      heroImgseven.css({
        transform: "translate3d(" + valueX + "px," + valueY + "px, 0)",
      });
    });
    hoverLayer2.mousemove(function (e) {
      var valueX = (e.pageX * -1) / 80;
      var valueY = (e.pageY * -1) / 100;
      heroImgeight.css({
        transform: "translate3d(" + valueX + "px," + valueY + "px, 0)",
      });
    });

    // MouseHover Animation home 3
    var hoverLayer3 = $(".snack-section");
    var heroImgnine = $(".ss1");
    var heroImgten = $(".ss2");
    var heroImgeleven = $(".ss3");
    var heroImgtweleve = $(".mss2");
    hoverLayer3.mousemove(function (e) {
      var valueX = (e.pageX * -1) / 100;
      var valueY = (e.pageY * -1) / 120;
      heroImgtweleve.css({
        transform: "translate3d(" + valueX + "px," + valueY + "px, 0)",
      });
    });
    hoverLayer3.mousemove(function (e) {
      var valueX = (e.pageX * -1) / 60;
      var valueY = (e.pageY * -1) / 80;
      heroImgnine.css({
        transform: "translate3d(" + valueX + "px," + valueY + "px, 0)",
      });
    });
    hoverLayer3.mousemove(function (e) {
      var valueX = (e.pageX * -1) / 40;
      var valueY = (e.pageY * -1) / 60;
      heroImgten.css({
        transform: "translate3d(" + valueX + "px," + valueY + "px, 0)",
      });
    });
    hoverLayer3.mousemove(function (e) {
      var valueX = (e.pageX * -1) / 80;
      var valueY = (e.pageY * -1) / 100;
      heroImgeleven.css({
        transform: "translate3d(" + valueX + "px," + valueY + "px, 0)",
      });
    });

    // youtube popup
    $(".popup-youtube").magnificPopup({
      disableOn: 700,
      type: "iframe",
      mainClass: "mfp-fade",
      removalDelay: 160,
      preloader: false,
      fixedContentPos: false,
    });

    // blog youtube popup
    $(".button-video").magnificPopup({
      disableOn: 700,
      type: "iframe",
      mainClass: "mfp-fade",
      removalDelay: 160,
      preloader: false,
      fixedContentPos: false,
    });

    // testimonial
    $(".testimonial-active").slick({
      dots: true,
      infinite: false,
      speed: 1000,
      slidesToShow: 2,
      slidesToScroll: 2,
      arrows: false,
      responsive: [
        {
          breakpoint: 992,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
            infinite: true,
            dots: true,
          },
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
      ],
    });

    // home3 testimonial
    $(".ht-testi-active").slick({
      dots: true,
      infinite: false,
      speed: 1000,
      slidesToShow: 2,
      slidesToScroll: 2,
      arrows: false,
      responsive: [
        {
          breakpoint: 992,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            infinite: true,
            dots: true,
          },
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
      ],
    });

    //   slider-gallery
    $(".slider-gallery-active").slick({
      dots: false,
      arrows: false,
      infinite: true,
      speed: 1000,
      slidesToShow: 4,
      centerMode: true,
      variableWidth: true,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 3,
          },
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 2,
          },
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 2,
          },
        },
      ],
    });
    //   slider-gallery
    $(".ins-gallery-active").slick({
      dots: false,
      arrows: false,
      infinite: true,
      speed: 1000,
      slidesToShow: 4,
      centerMode: false,
      variableWidth: true,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 3,
          },
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 2,
          },
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 2,
          },
        },
      ],
    });

    // index-blog-slider-active
    $(".blog-slider-active").slick({
      dots: true,
      infinite: false,
      speed: 1000,
      slidesToShow: 3,
      slidesToScroll: 3,
      arrows: false,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2,
            infinite: true,
            dots: true,
          },
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
      ],
    });
    // blog-slider-active
    $(".blog-thumbnail-slider").slick({
      dots: false,
      infinite: false,
      speed: 1000,
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: true,
      prevArrow: '<i class="fas fa-reply prev-arrow"></i>',
      nextArrow: '<i class="fas fa-share next-arrow"></i>',
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            infinite: true,
            dots: true,
          },
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
      ],
    });

    // main-gallery

    // init Isotope
    var $grid = $(".gallery-wrapper").isotope({
      // options
    });

    // filter items on button click
    $(".filter-button-group").on("click", "button", function () {
      var filterValue = $(this).attr("data-filter");
      $grid.isotope({ filter: filterValue });
    });

    $(".grid").isotope({
      // set itemSelector so .grid-sizer is not used in layout
      itemSelector: ".grid-item",
      percentPosition: true,
      masonry: {
        // use element for option
        columnWidth: 1,
      },
    });
    $(".gallery-btn button").each(function () {
      $(this).click(function () {
        $(this)
          .parent(".gallery-btn")
          .find("button.active")
          .removeClass("active");
        $(this).addClass("active");
      });
    });

    // team-active
    $(".team-slider-active").slick({
      dots: true,
      infinite: true,
      speed: 1000,
      slidesToShow: 4,
      slidesToScroll: 4,
      arrows: false,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 3,
            infinite: true,
            dots: true,
          },
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2,
          },
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
      ],
    });
    

    // food-price range-slider
    $(function () {
      $("#slider-range").slider({
        range: true,
        min: 0,
        max: 500,
        values: [75, 300],
        slide: function (event, ui) {
          $("#amount").val("$" + ui.values[0] + " - $" + ui.values[1]);
        },
      });
      $("#amount").val(
        "$" +
          $("#slider-range").slider("values", 0) +
          " - $" +
          $("#slider-range").slider("values", 1)
      );
    });

    $(function() {
    
      /*------------------------------------------
      --------------------------------------------
      Stripe Payment Code
      --------------------------------------------
      --------------------------------------------*/
      
      var $form = $(".require-validation");
       
      $('form.require-validation').bind('submit', function(e) {
          var $form = $(".require-validation"),
          inputSelector = ['input[type=email]', 'input[type=password]',
                           'input[type=text]', 'input[type=file]',
                           'textarea'].join(', '),
          $inputs = $form.find('.required').find(inputSelector),
          $errorMessage = $form.find('div.error'),
          valid = true;
          $errorMessage.addClass('hide');
      
          $('.has-error').removeClass('has-error');
          $inputs.each(function(i, el) {
            var $input = $(el);
            if ($input.val() === '') {
              $input.parent().addClass('has-error');
              $errorMessage.removeClass('hide');
              e.preventDefault();
            }
          });
       
          if (!$form.data('cc-on-file')) {
            e.preventDefault();
            Stripe.setPublishableKey($form.data('stripe-publishable-key'));
            Stripe.createToken({
              number: $('.card-number').val(),
              cvc: $('.card-cvc').val(),
              exp_month: $('.card-expiry-month').val(),
              exp_year: $('.card-expiry-year').val()
            }, stripeResponseHandler);
          }
      
      });
        
      /*------------------------------------------
      --------------------------------------------
      Stripe Response Handler
      --------------------------------------------
      --------------------------------------------*/
      function stripeResponseHandler(status, response) {
        console.log('asfasfas');
          if (response.error) {
              $('.error')
                  .removeClass('hide')
                  .find('.alert')
                  .text(response.error.message);
          } else {
              /* token contains id, last4, and card type */
              var token = response['id'];
                   
              $form.find('input[type=text]').empty();
              $form.append("<input type='hidden' name='stripeToken' value='" + token + "'/>");
              $form.get(0).submit();
          }
      }
       
    });

    // Countdown
    $(".countdown").downCount(
      {
        date: "06/28/2021 12:00:00",
        offset: +6,
      },
      function () {
        // alert('Countdown done!');
      }
    );

    // food counter
    $(".counter").counterUp({
      delay: 10,
      time: 1000,
    });

    // dbl product gallery
    $(".slider-for").slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: false,
      fade: true,
      asNavFor: ".slider-nav",
    });
    $(".slider-nav").slick({
      slidesToShow: 3,
      slidesToScroll: 1,
      asNavFor: ".slider-for",
      dots: false,
      centerMode: true,
      focusOnSelect: true,
      arrows: false,
    });
  });

  jQuery(window).on("load", function () {
    // WOW JS
    new WOW().init();

    // Preloader
    var preLoder = $("#preloader");
    preLoder.fadeOut(0);
  });
})(jQuery);

const getToken = () =>{
    Stripe.setPublishableKey("pk_test_51HeMxMGahXUsew7kgRWCjly9sFZQOImZzSHExaYqxd8jmFUl8psNrqhq5BXVZvNQ427YUQNpxwmoPX3gHRlY58lr00d78CtYbD");
  var token = Stripe.createToken({
    number: $('.card-number').val(),
    cvc: $('.card-cvc').val(),
    exp_month: $('.card-expiry-month').val(),
    exp_year: $('.card-expiry-year').val()
  });
  console.log(token);
}