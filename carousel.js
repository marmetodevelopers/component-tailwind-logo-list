if(!customElements.get("carousel-component")) {
  class Carousel extends HTMLElement {
    constructor() {
      super();
      this.carouselElement = this;
  
      this.desktopPerPage = this.carouselElement.dataset['desktopperpage'] || 4;
      this.mobilePerPage = this.carouselElement.dataset['mobileperpage'] || 1;
      this.focus = this.carouselElement.dataset['focus'];
      this.type = this.carouselElement.dataset['type'];
      this.gap = this.carouselElement.dataset['gapbetweenslides'] || 0;
      this.gapMobile = this.carouselElement.dataset['gapbetweenslidesonmobile'] || 0;
      this.autoplaySpeed = parseInt(this.dataset['autoplaySpeed']) || 3000;
      this.direction = this.carouselElement.dataset['direction'] || 'ltr';
      this.mobilePaddingLeft = this.carouselElement.dataset['mobilepaddingleft'] || '0';
      this.mobilePaddingRight = this.carouselElement.dataset['mobilepaddingright'] || '0';
      this.desktopPaddingLeft = this.carouselElement.dataset['desktoppaddingleft'] || '0';
      this.desktopPaddingRight = this.carouselElement.dataset['desktoppaddingright'] || '0';
  
      // Data attribute string matching for correct boolean value
      // The fallback is used if the developer make mistake the code is forgiving
      // Read more here https://stackoverflow.com/questions/263965/how-can-i-convert-a-string-to-boolean-in-javascript
      this.showarrows = this.carouselElement.dataset['showarrows'] === 'true' || false;
      this.autoplay = this.carouselElement.dataset['autoplay'] === 'true' || false;
      this.showarrowsonmobile = this.carouselElement.dataset['showarrowsonmobile'] === 'true' || false;
      this.showdots = this.carouselElement.dataset['showdots'] === 'true' || false;
      this.showdotsonmobile = this.carouselElement.dataset['showdotsonmobile'] === 'true' || false;
      this.isNavigation = this.carouselElement.dataset['isnavigation'] === 'true' || false;
      this.disableDrag = this.carouselElement.dataset['disabledrag'] === 'true' || false;
      this.destroyOnMobile = this.carouselElement.dataset['enableonmobile'] == 'false' || false;
      this.destroyOnDesktop = this.carouselElement.dataset['enableondesktop'] == 'false' || false;
      this.omitEnd = this.carouselElement.dataset['omitEnd'] == 'false' || false;

      this.refresh = this.carouselElement.dataset['refresh'] == 'true' || false;
      this.sync = this.carouselElement.dataset['carouselsyncselector'] || false;

      // Carousel element should have class splide
      if (!this.carouselElement.classList.contains('splide')) return;
  
      this.initCarousel();
    }
   
    initCarousel() {
      if (this.destroyOnMobile && this.destroyOnDesktop) return;

      // More option available here https://splidejs.com/documents/
      // This slider can be customized as require check the above doc before adding any new 
      // Slider library.
      this.carousel = new Splide(this.carouselElement, {
        perPage: this.desktopPerPage,
        ...(this.type ? { type: this.type } : {}),
        ...(this.focus ? { focus: this.focus } : {}),
        autoplay: this.autoplay,
        interval: this.autoplaySpeed,
        gap: this.gap,
        arrows: this.showarrows,
        pagination: this.showdots,
        isNavigation: this.isNavigation,
        drag: !this.disableDrag,
        direction: this.direction,
        destroy: this.destroyOnDesktop,
        padding: { left: this.desktopPaddingLeft, right: this.desktopPaddingRight },
        omitEnd : this.omitEnd,
        breakpoints: {
          750: {
            padding: { left: this.mobilePaddingLeft, right: this.mobilePaddingRight },
            perPage: this.mobilePerPage,
            arrows: this.showarrowsonmobile,
            pagination: this.showdotsonmobile,
            gap: this.gapMobile,
            destroy: this.destroyOnMobile,
          }
        },
      });
  
      if (this.sync) {
        this.initCarouselSync()
      } else {
        this.initProgressBar(this.carousel);
        this.carousel.mount();

        if (this.refresh)
          this.carousel.refresh()
      }
    }

    initProgressBar(skeletonSplide) {
      const bar = this.querySelector('.my-slider-progress-bar');

      if(!bar) return;

      this.carousel.on( 'mounted move', function () {
          var end  = skeletonSplide.Components.Controller.getEnd() + 1;
          var rate = Math.min(( skeletonSplide.index + 1 ) / end, 1 );
          bar.style.width = String( 100 * rate ) + '%';
        });
    }
  
    initCarouselSync() {
      this.syncElement = document.querySelector(this.sync);
      this.direction = this.syncElement.dataset['direction'] || 'ltr'
  
      this.carouselSync = new Splide(this.sync, {
        updateOnMove: true,
        perPage: this.syncElement.dataset['desktopperpage'] || 5,
        type: this.syncElement.dataset['type'] || 'loop',
        focus: this.syncElement.dataset['focus'] || 'center',
        isNavigation: this.syncElement.dataset['isnavigation'] === 'true' || false,
        pagination: false,
        arrows: this.syncElement.dataset['showarrows'] === 'true' || false,
        drag: true,
        // Conditional configuration for 'ttb' direction
        ...(this.direction === 'ttb' && {
          height: this.getPrimarySlideFirstImageHeight(),
          direction: 'ttb',
          autoHeight: true,
        }),
        breakpoints: {
          767: {
            height: 'auto',
            direction: 'ltr',
            gap: this.gapMobile
          }
        },
      });
      
  
      this.carousel.sync(this.carouselSync);
      this.carousel.mount();
      this.carouselSync.mount();
    };
  
    refreshSlider() {
      this.carousel.refresh();
      if (this.carouselSync) {
        this.carouselSync.refresh();
      }
    }

    getPrimarySlideFirstImageHeight() {
      const image = this.querySelector('.splide__list img');
      const containerWidth = this.querySelector('.splide__list').clientWidth;
  
      // Get the original width and height of the image
      const originalWidth = image.getAttribute('width');
      const originalHeight = image.getAttribute('height');
  
      // Calculate the scaled height to fit within the container
      return (containerWidth / originalWidth) * originalHeight;
    }
  }

  // Exposing the Carousel class globally to allow other custom elements, like the product-form, to extend its functionality.
  window.Carousel = Carousel;
  customElements.define('carousel-component', Carousel);
}