(function () {
  var menuBtn = document.getElementById('menuBtn');
  var nav = document.querySelector('.primary-nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  var header = document.getElementById('siteHeader');
  if (header) {
    var lastY = 0;
    window.addEventListener('scroll', function () {
      var y = window.scrollY || window.pageYOffset;
      if (y > 8) {
        header.style.boxShadow = '0 4px 18px rgba(15,37,64,0.08)';
      } else {
        header.style.boxShadow = '0 1px 0 rgba(15,37,64,0.04)';
      }
      lastY = y;
    }, { passive: true });
  }
})();
