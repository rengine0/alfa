(function () {
  var MAX_PROVEDORES = 5;

  var form = document.getElementById('form-contato');
  var confirmacao = document.getElementById('confirmacao');
  var btnEnviar = document.getElementById('btn-enviar');
  var erroEnvio = document.getElementById('erro-envio');
  var listaProv = document.getElementById('lista-provedores');
  var btnAddProv = document.getElementById('add-provedor');
  var blocoLibera = document.getElementById('bloco-libera');
  var chkLibera = document.getElementById('libera-provedores');
  var btnWhatsapp = document.getElementById('btn-whatsapp');
  var WHATSAPP_ALFA = '5564992474135';

  var campos = {
    empresa: document.getElementById('empresa'),
    cnpj: document.getElementById('cnpj'),
    responsavel: document.getElementById('responsavel'),
    whatsapp: document.getElementById('whatsapp')
  };

  function digitos(v) { return v.replace(/\D/g, ''); }

  function mascaraCnpj(v) {
    var d = digitos(v).slice(0, 14);
    return d
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }

  function mascaraTelefone(v) {
    var d = digitos(v).slice(0, 11);
    if (d.length <= 2) return d.length ? '(' + d : '';
    if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  }

  function cnpjValido(valor) {
    var c = digitos(valor);
    if (c.length !== 14 || /^(\d)\1+$/.test(c)) return false;
    function dv(base) {
      var pesos = base.length === 12 ? [5,4,3,2,9,8,7,6,5,4,3,2] : [6,5,4,3,2,9,8,7,6,5,4,3,2];
      var soma = 0;
      for (var i = 0; i < base.length; i++) soma += Number(base[i]) * pesos[i];
      var r = soma % 11;
      return r < 2 ? 0 : 11 - r;
    }
    var d1 = dv(c.slice(0, 12));
    var d2 = dv(c.slice(0, 12) + d1);
    return c.slice(12) === String(d1) + String(d2);
  }

  function mostrarErro(id, campo, msg) {
    var el = document.getElementById('erro-' + id);
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    if (campo) campo.setAttribute('aria-invalid', 'true');
  }

  function limparErro(id, campo) {
    var el = document.getElementById('erro-' + id);
    if (el) { el.hidden = true; el.textContent = ''; }
    if (campo) campo.removeAttribute('aria-invalid');
  }

  campos.cnpj.addEventListener('input', function () { campos.cnpj.value = mascaraCnpj(campos.cnpj.value); });
  campos.whatsapp.addEventListener('input', function () { campos.whatsapp.value = mascaraTelefone(campos.whatsapp.value); });

  Object.keys(campos).forEach(function (id) {
    campos[id].addEventListener('input', function () { limparErro(id, campos[id]); });
  });
  form.addEventListener('change', function (e) {
    if (e.target.name === 'motivo') limparErro('motivo', null);
  });

  /* ---------- Provedores ---------- */

  function linhasProvedores() {
    return Array.prototype.slice.call(listaProv.querySelectorAll('.linha-provedor'));
  }

  function lerProvedor(linha) {
    return {
      nome: linha.querySelector('[data-campo="nome"]').value.trim(),
      telefone: linha.querySelector('[data-campo="telefone"]').value
    };
  }

  function algumProvedorPreenchido() {
    return linhasProvedores().some(function (l) {
      var p = lerProvedor(l);
      return p.nome || digitos(p.telefone);
    });
  }

  // A caixa de autorização só aparece quando há algum provedor preenchido.
  function atualizarAutorizacao() {
    var mostrar = algumProvedorPreenchido();
    blocoLibera.hidden = !mostrar;
    if (!mostrar) { chkLibera.checked = false; limparErro('libera', null); }
  }

  function atualizarBotoes() {
    var linhas = linhasProvedores();
    btnAddProv.hidden = linhas.length >= MAX_PROVEDORES;
    linhas.forEach(function (l) {
      l.querySelector('.rem-provedor').hidden = linhas.length === 1;
    });
  }

  function novaLinhaProvedor() {
    var n = linhasProvedores().length + 1;
    var linha = document.createElement('div');
    linha.className = 'linha-provedor';

    var cNome = document.createElement('div');
    cNome.className = 'campo';
    var lNome = document.createElement('label');
    lNome.textContent = 'Provedor ' + n;
    var iNome = document.createElement('input');
    iNome.type = 'text';
    iNome.maxLength = 80;
    iNome.setAttribute('data-campo', 'nome');
    iNome.placeholder = 'Nome do provedor';
    iNome.id = 'prov-nome-' + Date.now() + '-' + n;
    lNome.htmlFor = iNome.id;
    cNome.appendChild(lNome);
    cNome.appendChild(iNome);

    var cTel = document.createElement('div');
    cTel.className = 'campo';
    var lTel = document.createElement('label');
    lTel.textContent = 'Telefone';
    var iTel = document.createElement('input');
    iTel.type = 'tel';
    iTel.inputMode = 'tel';
    iTel.maxLength = 15;
    iTel.setAttribute('data-campo', 'telefone');
    iTel.placeholder = '(00) 90000-0000';
    iTel.id = 'prov-tel-' + Date.now() + '-' + n;
    lTel.htmlFor = iTel.id;
    cTel.appendChild(lTel);
    cTel.appendChild(iTel);

    var rem = document.createElement('button');
    rem.type = 'button';
    rem.className = 'rem-provedor';
    rem.setAttribute('aria-label', 'Remover provedor');
    rem.textContent = 'Remover';
    rem.addEventListener('click', function () {
      linha.remove();
      atualizarBotoes();
      atualizarAutorizacao();
      limparErro('provedores', null);
    });

    iTel.addEventListener('input', function () { iTel.value = mascaraTelefone(iTel.value); });
    [iNome, iTel].forEach(function (i) {
      i.addEventListener('input', function () {
        limparErro('provedores', null);
        i.removeAttribute('aria-invalid');
        atualizarAutorizacao();
      });
    });

    linha.appendChild(cNome);
    linha.appendChild(cTel);
    linha.appendChild(rem);
    listaProv.appendChild(linha);
    atualizarBotoes();
  }

  btnAddProv.addEventListener('click', function () {
    novaLinhaProvedor();
    var linhas = linhasProvedores();
    linhas[linhas.length - 1].querySelector('input').focus();
  });
  chkLibera.addEventListener('change', function () { limparErro('libera', null); });

  novaLinhaProvedor();

  /* ---------- Validação ---------- */

  function validar() {
    var primeiro = null;
    function falha(id, campo, msg) {
      mostrarErro(id, campo, msg);
      if (!primeiro) primeiro = campo || form.querySelector('input[name="motivo"]');
    }

    if (!campos.empresa.value.trim()) falha('empresa', campos.empresa, 'Informe o nome da empresa.');
    if (!cnpjValido(campos.cnpj.value)) falha('cnpj', campos.cnpj, 'Informe um CNPJ válido, com 14 números.');
    if (!campos.responsavel.value.trim()) falha('responsavel', campos.responsavel, 'Informe o seu nome.');
    if (!form.querySelector('input[name="motivo"]:checked')) falha('motivo', null, 'Marque pelo menos um motivo.');

    // Provedores: nome e telefone completos e autorização marcada.
    linhasProvedores().forEach(function (linha) {
      var p = lerProvedor(linha);
      var tel = digitos(p.telefone);
      if (!p.nome && !tel) return;
      var iNome = linha.querySelector('[data-campo="nome"]');
      var iTel = linha.querySelector('[data-campo="telefone"]');
      if (!p.nome) {
        iNome.setAttribute('aria-invalid', 'true');
        falha('provedores', iNome, 'Informe o nome de cada provedor.');
      } else if (tel.length < 10) {
        iTel.setAttribute('aria-invalid', 'true');
        falha('provedores', iTel, 'Informe o telefone de cada provedor com DDD.');
      }
    });
    if (algumProvedorPreenchido() && !chkLibera.checked) {
      falha('libera', chkLibera, 'Para informar provedores, libere o acesso da ALFA aos números.');
    }

    if (digitos(campos.whatsapp.value).length < 10) falha('whatsapp', campos.whatsapp, 'Informe o WhatsApp com DDD.');

    if (primeiro) primeiro.focus();
    return !primeiro;
  }

  /* ---------- Envio ---------- */

  function montarPayload() {
    var provedores = linhasProvedores().map(lerProvedor).filter(function (p) {
      return p.nome || digitos(p.telefone);
    });
    return {
      empresa: campos.empresa.value.trim(),
      cnpj: campos.cnpj.value,
      responsavel: campos.responsavel.value.trim(),
      motivos: Array.prototype.map.call(
        form.querySelectorAll('input[name="motivo"]:checked'),
        function (c) { return c.value; }
      ),
      detalhes: document.getElementById('detalhes').value.trim(),
      provedores: provedores,
      liberaProvedores: provedores.length > 0 && chkLibera.checked,
      whatsapp: campos.whatsapp.value,
      site: document.getElementById('site').value // armadilha para robôs
    };
  }

  // Link wa.me com mensagem pronta: nome da pessoa, protocolo e nome da ALFA.
  function montarLinkWhatsapp(nome, protocolo) {
    var texto = 'Olá! Meu nome é ' + nome + '.' +
      (protocolo ? ' Meu protocolo é ' + protocolo + '.' : '') +
      ' Acabei de enviar o formulário no site da Projeto ALFA e gostaria de conversar.';
    return 'https://wa.me/' + WHATSAPP_ALFA + '?text=' + encodeURIComponent(texto);
  }

  function mostrarErroEnvio(msg) {
    erroEnvio.textContent = msg;
    erroEnvio.hidden = false;
  }

  function aplicarErrosServidor(erros) {
    var mapa = { empresa: campos.empresa, cnpj: campos.cnpj, responsavel: campos.responsavel, whatsapp: campos.whatsapp };
    Object.keys(erros).forEach(function (k) { mostrarErro(k, mapa[k] || null, erros[k]); });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    erroEnvio.hidden = true;
    if (!validar()) return;

    var textoOriginal = btnEnviar.textContent;
    btnEnviar.disabled = true;
    btnEnviar.textContent = 'Enviando e analisando…';

    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, 90000);

    fetch('/api/contato', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(montarPayload()),
      signal: ctrl.signal
    })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) { return { status: r.status, corpo: j }; });
      })
      .then(function (res) {
        if (res.status === 200 && res.corpo.ok) {
          var protocolo = res.corpo.protocolo ? '#' + res.corpo.protocolo : '';
          document.getElementById('protocolo').textContent = protocolo || '—';
          btnWhatsapp.href = montarLinkWhatsapp(campos.responsavel.value.trim(), protocolo);
          form.hidden = true;
          confirmacao.hidden = false;
          confirmacao.focus();
          return;
        }
        if (res.status === 422 && res.corpo.erros) {
          aplicarErrosServidor(res.corpo.erros);
          mostrarErroEnvio('Confira os campos destacados e tente de novo.');
        } else {
          mostrarErroEnvio(res.corpo.mensagem || 'Não conseguimos enviar agora. Tente novamente em instantes.');
        }
      })
      .catch(function () {
        mostrarErroEnvio('Não foi possível conectar. Verifique sua internet e tente de novo.');
      })
      .then(function () {
        clearTimeout(timer);
        btnEnviar.disabled = false;
        btnEnviar.textContent = textoOriginal;
      });
  });
})();
