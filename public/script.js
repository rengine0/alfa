(function () {
  var html = document.documentElement;
  var botao = document.getElementById('tema-btn');

  function aplicar(tema) {
    html.setAttribute('data-tema', tema);
    botao.setAttribute('aria-checked', tema === 'escuro' ? 'true' : 'false');
  }

  aplicar(html.getAttribute('data-tema') || 'claro');

  botao.addEventListener('click', function () {
    var novo = html.getAttribute('data-tema') === 'escuro' ? 'claro' : 'escuro';
    aplicar(novo);
    try { localStorage.setItem('alfa-tema', novo); } catch (e) {}
  });
})();

/* Aba ativa no menu conforme a seção visível (somente na página inicial) */
(function () {
  var links = document.querySelectorAll('.topo nav a[href^="#"]');
  if (!links.length || !('IntersectionObserver' in window)) return;

  var porId = {};
  links.forEach(function (a) {
    var alvo = document.querySelector(a.getAttribute('href'));
    if (alvo) porId[alvo.id] = a;
  });

  var observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (!e.isIntersecting) return;
      links.forEach(function (a) { a.removeAttribute('aria-current'); });
      porId[e.target.id].setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-35% 0px -55% 0px' });

  Object.keys(porId).forEach(function (id) { observador.observe(document.getElementById(id)); });
})();
