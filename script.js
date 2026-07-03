
(() => {
  const carousel = document.querySelector('[data-carousel]');

  if (!carousel) {
    return;
  }

  const track = carousel.querySelector('[data-carousel-track]');
  const slides = Array.from(carousel.querySelectorAll('.case-slide'));
  const controls = carousel.querySelector('.case-controls');
  const prevButton = carousel.querySelector('[data-carousel-prev]');
  const nextButton = carousel.querySelector('[data-carousel-next]');
  const dots = Array.from(carousel.querySelectorAll('[data-carousel-dot]'));

  if (!track || !controls || !prevButton || !nextButton || slides.length === 0 || dots.length !== slides.length) {
    return;
  }

  let activeIndex = 0;
  let rafId = 0;

  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const slidePosition = (slide) => {
    const trackRect = track.getBoundingClientRect();
    const slideRect = slide.getBoundingClientRect();
    return track.scrollLeft + slideRect.left - trackRect.left;
  };

  const setActive = (index) => {
    activeIndex = Math.max(0, Math.min(index, slides.length - 1));
    prevButton.disabled = activeIndex === 0;
    nextButton.disabled = activeIndex === slides.length - 1;

    dots.forEach((dot, dotIndex) => {
      if (dotIndex === activeIndex) {
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.removeAttribute('aria-current');
      }
    });
  };

  const closestSlideIndex = () => {
    const trackRect = track.getBoundingClientRect();
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    slides.forEach((slide, index) => {
      const distance = Math.abs(slide.getBoundingClientRect().left - trackRect.left);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  };

  const updateFromScroll = () => {
    rafId = 0;
    setActive(closestSlideIndex());
  };

  const requestScrollUpdate = () => {
    if (!rafId) {
      rafId = window.requestAnimationFrame(updateFromScroll);
    }
  };

  const goTo = (index) => {
    const nextIndex = Math.max(0, Math.min(index, slides.length - 1));
    track.scrollTo({
      left: slidePosition(slides[nextIndex]),
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
    setActive(nextIndex);
  };

  prevButton.addEventListener('click', () => goTo(activeIndex - 1));
  nextButton.addEventListener('click', () => goTo(activeIndex + 1));

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => goTo(index));
  });

  track.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(activeIndex - 1);
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(activeIndex + 1);
    }
  });

  track.addEventListener('scroll', requestScrollUpdate, { passive: true });

  carousel.classList.add('carousel-enhanced');
  controls.hidden = false;
  setActive(0);
})();
