(() => {
  const carousel = document.querySelector('[data-carousel]');

  if (!carousel) {
    return;
  }

  const track = carousel.querySelector('[data-carousel-track]');
  const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
  const previousButton = carousel.querySelector('[data-carousel-prev]');
  const nextButton = carousel.querySelector('[data-carousel-next]');
  const dots = Array.from(carousel.querySelectorAll('[data-carousel-dot]'));

  if (!track || slides.length === 0 || !previousButton || !nextButton || dots.length !== slides.length) {
    return;
  }

  let activeIndex = 0;
  let scrollFrame = null;

  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const getNearestSlideIndex = () => {
    const trackLeft = track.getBoundingClientRect().left;

    return slides.reduce((nearestIndex, slide, index) => {
      const currentDistance = Math.abs(slide.getBoundingClientRect().left - trackLeft);
      const nearestDistance = Math.abs(slides[nearestIndex].getBoundingClientRect().left - trackLeft);
      return currentDistance < nearestDistance ? index : nearestIndex;
    }, 0);
  };

  const getSlideScrollPosition = (slide) => {
    const trackRect = track.getBoundingClientRect();
    const slideRect = slide.getBoundingClientRect();
    return track.scrollLeft + slideRect.left - trackRect.left;
  };

  const updateActiveSlide = (index) => {
    activeIndex = Math.max(0, Math.min(index, slides.length - 1));
    previousButton.disabled = activeIndex === 0;
    nextButton.disabled = activeIndex === slides.length - 1;

    dots.forEach((dot, dotIndex) => {
      if (dotIndex === activeIndex) {
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.removeAttribute('aria-current');
      }
    });
  };

  const goToSlide = (index) => {
    const nextIndex = Math.max(0, Math.min(index, slides.length - 1));
    const left = getSlideScrollPosition(slides[nextIndex]);

    track.scrollTo({
      left,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });

    updateActiveSlide(nextIndex);
  };

  previousButton.addEventListener('click', () => {
    goToSlide(activeIndex - 1);
  });

  nextButton.addEventListener('click', () => {
    goToSlide(activeIndex + 1);
  });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToSlide(index);
    });
  });

  track.addEventListener('keydown', (event) => {
    if (event.target !== track) {
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goToSlide(activeIndex - 1);
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goToSlide(activeIndex + 1);
    }
  });

  track.addEventListener('scroll', () => {
    if (scrollFrame !== null) {
      return;
    }

    scrollFrame = window.requestAnimationFrame(() => {
      scrollFrame = null;
      updateActiveSlide(getNearestSlideIndex());
    });
  }, { passive: true });

  updateActiveSlide(0);
  carousel.classList.add('carousel-enhanced');
})();
