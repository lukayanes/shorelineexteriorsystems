/* Shoreline Exterior Systems — site behaviour */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- current year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- sticky nav state ---------- */
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('is-stuck', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- desktop dropdowns ---------- */
  var dropdowns = Array.prototype.slice.call(document.querySelectorAll('.nav-dd'));

  function closeAll(except) {
    dropdowns.forEach(function (dd) {
      if (dd === except) return;
      dd.dataset.open = 'false';
      var b = dd.querySelector('.navlink');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  }

  dropdowns.forEach(function (dd) {
    var btn = dd.querySelector('.navlink');
    var menu = dd.querySelector('.dropmenu');
    if (!btn || !menu) return;
    var hoverTimer;

    var open = function () {
      clearTimeout(hoverTimer);
      closeAll(dd);
      dd.dataset.open = 'true';
      btn.setAttribute('aria-expanded', 'true');
    };
    var close = function () {
      dd.dataset.open = 'false';
      btn.setAttribute('aria-expanded', 'false');
    };

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      dd.dataset.open === 'true' ? close() : open();
    });

    dd.addEventListener('mouseenter', open);
    dd.addEventListener('mouseleave', function () {
      hoverTimer = setTimeout(close, 140);
    });

    // keyboard: escape closes and returns focus, arrow-down enters the menu
    dd.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        close();
        btn.focus();
      }
      if (e.key === 'ArrowDown' && dd.dataset.open === 'true') {
        e.preventDefault();
        var first = menu.querySelector('a');
        if (first) first.focus();
      }
    });

    // close when focus leaves the whole dropdown
    dd.addEventListener('focusout', function (e) {
      if (!dd.contains(e.relatedTarget)) close();
    });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-dd')) closeAll(null);
  });

  /* ---------- mobile drawer ---------- */
  var burger = document.querySelector('.hamburger');
  var drawer = document.querySelector('.drawer');
  var scrim = document.querySelector('.drawer-scrim');
  var drawerClose = document.querySelector('.drawer-close');

  function setDrawer(open) {
    if (!drawer) return;
    drawer.dataset.open = open ? 'true' : 'false';
    if (scrim) scrim.dataset.open = open ? 'true' : 'false';
    if (burger) burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      var firstLink = drawer.querySelector('a, button');
      if (firstLink) firstLink.focus();
    } else if (burger) {
      burger.focus();
    }
  }

  if (burger) burger.addEventListener('click', function () {
    setDrawer(drawer.dataset.open !== 'true');
  });
  if (scrim) scrim.addEventListener('click', function () { setDrawer(false); });
  if (drawerClose) drawerClose.addEventListener('click', function () { setDrawer(false); });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer && drawer.dataset.open === 'true') setDrawer(false);
  });

  /* ---------- reveal on scroll ---------- */
  var revealables = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---------- gallery lightbox ---------- */
  var lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    var lbImg = lightbox.querySelector('img');
    var triggers = Array.prototype.slice.call(document.querySelectorAll('.gallery button'));
    var index = 0;
    var lastFocus = null;

    function show(i) {
      if (!triggers.length) return;
      index = (i + triggers.length) % triggers.length;
      var trigger = triggers[index];
      var source = trigger.querySelector('img');
      if (!source) return;
      // the grid shows an 800px thumbnail; the dialog loads the full-size file
      lbImg.src = trigger.getAttribute('data-full') || source.currentSrc || source.src;
      lbImg.alt = source.alt || '';
    }

    function openLb(i) {
      lastFocus = document.activeElement;
      show(i);
      lightbox.dataset.open = 'true';
      document.body.style.overflow = 'hidden';
      // a visibility:hidden element cannot take focus, so force a style flush
      // after flipping the attribute before moving focus into the dialog
      var closeBtn = lightbox.querySelector('.lightbox-close');
      if (closeBtn) {
        getComputedStyle(closeBtn).visibility;
        closeBtn.focus();
      }
    }

    function closeLb() {
      lightbox.dataset.open = 'false';
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }

    triggers.forEach(function (btn, i) {
      btn.addEventListener('click', function () { openLb(i); });
    });

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLb();
    });

    var closeEl = lightbox.querySelector('.lightbox-close');
    var prevEl = lightbox.querySelector('.lightbox-nav.prev');
    var nextEl = lightbox.querySelector('.lightbox-nav.next');
    if (closeEl) closeEl.addEventListener('click', closeLb);
    if (prevEl) prevEl.addEventListener('click', function () { show(index - 1); });
    if (nextEl) nextEl.addEventListener('click', function () { show(index + 1); });

    document.addEventListener('keydown', function (e) {
      if (lightbox.dataset.open !== 'true') return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
  }
})();
