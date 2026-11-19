(() => {
  const messages = {
    "Patients may hesitate to start when they don’t know what happens next.": "Pacientes podem hesitar em começar quando não sabem o que acontece depois.",
    "Intake completion per visit: guided entry vs. direct entry.": "Formulários concluídos por visita: entrada guiada versus direta.",
    "Patients are asked for details before they know if an appointment time works for them.": "Pacientes precisam informar seus dados antes de saber se há um horário que funciona para eles.",
    "Booking requests per visit: show available times first vs. lead with the request.": "Solicitações de agendamento por visita: mostrar horários primeiro versus começar pela solicitação.",
    "New employees can get stuck logging their first shift, especially when entering breaks.": "Novos funcionários podem ter dificuldades no primeiro registro de jornada, especialmente ao informar intervalos.",
    "Valid first shifts per new user: editable example vs. blank form.": "Primeiros registros válidos por novo usuário: exemplo editável versus formulário em branco.",
    "Problem tackled": "Problema abordado",

    "About": "Sobre",
    "About me": "Sobre mim",
    "Full-stack": "Desenvolvedor",
    "developer.": "full stack.",
    "I’m based in São Paulo, Brazil. I have 3+ years of experience building web applications, from Java APIs to Angular interfaces.": "Moro em São Paulo, Brasil, e tenho mais de três anos de experiência em aplicações web, de APIs em Java a interfaces em Angular.",
    "Experience": "Experiência",
    "Software Developer · Porto client": "Desenvolvedor de Software · Cliente Porto",
    "Full Stack Developer": "Desenvolvedor Full Stack",
    "Software Development Intern": "Estagiário de Desenvolvimento de Software",
    "Oct 2026 – Present": "Out 2026 – Atual",
    "Sep 2024 – Oct 2026": "Set 2024 – Out 2026",
    "May 2023 – Sep 2024": "Mai 2023 – Set 2024",
    "Jan 2023 – May 2023": "Jan 2023 – Mai 2023",
    "Tech stack": "Tecnologias",
    "Data": "Dados",
    "Delivery": "Entrega",
    "Language": "Idioma",
    "Portfolio": "Portfólio",
    "Main navigation": "Navegação principal",
    "Case studies": "Estudos de caso",
    "Case study": "Estudo de caso",
    "Projects": "Projetos",
    "Source": "Código-fonte",
    "Source code": "Código-fonte",
    "Sample data and changes are stored in this browser.": "Os dados de exemplo e as alterações ficam salvos neste navegador.",
    "Back": "Voltar",
    "Date": "Data",
    "Time": "Horário",
    "Patient": "Paciente",
    "Consultation": "Consulta",
    "Cleaning": "Limpeza",
    "Changes could not be saved in this browser.": "Não foi possível salvar as alterações neste navegador.",
    "Open full site": "Abrir site completo",
    "Wesley Bertolaia | Web Design & Frontend": "Wesley Bertolaia | Design web e front-end",
    "Wesley Bertolaia’s web design portfolio. Three shipped prototypes in consultation acquisition, patient booking, and employee onboarding.": "Portfólio de design web de Wesley Bertolaia. Três protótipos publicados sobre consultas, agendamento de pacientes e registro de jornada.",
    "Case Studies | Wesley Bertolaia": "Estudos de caso | Wesley Bertolaia",
    "Three case studies by Wesley Bertolaia in consultation acquisition, patient booking, and employee onboarding.": "Três estudos de caso de Wesley Bertolaia sobre consultas, agendamento de pacientes e registro de jornada.",
    "Live project demos": "Demonstrações interativas dos projetos",
    "Online consultation funnel": "Fluxo de consulta online",
    "Patient booking · Angular": "Agendamento de pacientes · Angular",
    "Employee onboarding · React": "Primeiro registro de jornada · React",
    "CarePath live demo": "Demo interativa do CarePath",
    "DentalDesk live demo": "Demo interativa do DentalDesk",
    "ShiftLedger live demo": "Demo interativa do ShiftLedger",
    "Healthcare acquisition": "Captação em saúde",
    "Friction": "Ponto de atrito",
    "What I built": "O que implementei",
    "What I’d measure": "O que eu mediria",
    "Try the demo": "Testar a demo",
    "Direct variant": "Versão direta",
    "Offer variant": "Variação da oferta",
    "Visitors may want to know who reviews their request or what happens before taking the first step.": "Antes de começar, a pessoa pode querer saber quem analisa a solicitação e o que acontece em seguida.",
    "One variant starts at intake. The other lets visitors pick a question first. Both reach the same intake preview and log the same start event.": "Uma versão abre o formulário direto. Na outra, a pessoa escolhe uma dúvida primeiro. As duas chegam à mesma prévia e registram o mesmo evento de início.",
    "Intake starts per eligible landing session. Track guided-step drop-off and completed intakes to see whether the guidance helps.": "Inícios de formulário por sessão elegível. Mediria desistências nas etapas guiadas e formulários concluídos para avaliar se a orientação ajuda.",
    "Patients may hesitate to share details before seeing available times and knowing when the clinic will confirm.": "Pacientes podem hesitar em fornecer dados antes de ver os horários e saber quando a clínica confirma a consulta.",
    "A guided request that shows sample times before review. I tested that the visit type and time are kept when a visitor goes back.": "Uma solicitação guiada que mostra horários de exemplo antes da revisão. Testei se o tipo de atendimento e o horário são preservados ao voltar.",
    "Submitted requests per eligible session for a request-first offer versus a time-first offer. Check confirmed visits as a follow-up.": "Solicitações enviadas por sessão elegível, comparando uma oferta que destaca o pedido com outra que destaca os horários. Depois, compararia as consultas confirmadas.",
    "New employees may be unsure how to log breaks. Managers need a clear view of recorded time.": "Quem está começando pode ter dúvidas sobre como registrar intervalos. Gestores precisam acompanhar as horas registradas.",
    "A first-shift form with editable examples and validation. In a browser test, saving the example moved the manager total from 24h 30m to 26h.": "Um formulário de primeiro registro com exemplos editáveis e validação. No teste no navegador, salvar o exemplo elevou o total do gestor de 24h30 para 26h.",
    "Valid first saves per new employee session. Check time to save, errors, and accidental acceptance of the example.": "Primeiros registros válidos por sessão de um novo funcionário. Mediria o tempo até salvar, os erros e a aceitação acidental do exemplo.",
    "These prototypes use sample data. Conversion tests are proposed.": "Os protótipos usam dados fictícios. Os testes de conversão são propostas."
  };
  const key = 'wesley-portfolio-language';
  const supported = value => {
    const base = value?.toLowerCase().split('-')[0];
    if (base === 'pt') return 'pt-BR';
    if (base === 'en') return 'en';
  };
  let saved;
  try { saved = supported(localStorage.getItem(key)); } catch { /* Storage can be disabled. */ }
  const requested = supported(new URLSearchParams(location.search).get('lang'));
  const language = requested || saved || (navigator.languages || []).map(supported).find(Boolean)
    || supported(navigator.language) || 'en';
  if (requested) {
    try { localStorage.setItem(key, language); } catch { /* The URL still keeps the preference. */ }
  }
  document.documentElement.lang = language;

  const t = text => language === 'pt-BR' && Object.hasOwn(messages, text) ? messages[text] : text;
  const date = value => language === 'pt-BR' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? value.split('-').reverse().join('/') : value;

  function url(href) {
    const link = new URL(href, location.href);
    if (link.origin === location.origin && ['http:', 'https:'].includes(link.protocol)) {
      if (language === 'pt-BR' || requested) link.searchParams.set('lang', language);
    }
    return link.href;
  }

  function textNode(text) {
    const plain = text.trim();
    return plain ? text.replace(plain, t(plain)) : text;
  }

  function apply(root) {
    if (language === 'pt-BR') {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: node => node.parentElement?.closest('script, style')
          ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
      });
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const translated = textNode(node.data);
        if (node.data === translated) continue;
        if (node.parentElement?.matches('option:not([value])')) node.parentElement.value = node.data.trim();
        node.data = translated;
      }
      for (const item of root.querySelectorAll('[aria-label], [title], [placeholder], meta[name="description"]')) {
        for (const attribute of ['aria-label', 'title', 'placeholder', 'content']) {
          if (item.hasAttribute(attribute)) item.setAttribute(attribute, t(item.getAttribute(attribute)));
        }
      }
    }
    for (const link of root.querySelectorAll('a[href]')) {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('#')) link.href = url(href);
    }
  }

  // Translate literal template labels before Angular compiles the template.
  function template(markup) {
    if (language !== 'pt-BR') return markup;
    return markup.replace(/>([^<>]+)(?=<)/g, (_, text) => '>' + textNode(text))
      .replace(/(aria-label|placeholder|title)="([^"]+)"/g, (_, key, value) => key + '="' + t(value) + '"');
  }

  function initialize() {
    apply(document);
    const mount = document.querySelector('[data-language-menu]');
    if (!mount || window.self !== window.top) return;
    const select = document.createElement('select');
    select.className = 'language-picker';
    select.setAttribute('aria-label', t('Language'));
    select.add(new Option('EN', 'en'));
    select.add(new Option('PT-BR', 'pt-BR'));
    select.value = language;
    select.addEventListener('change', () => {
      const next = new URL(location.href);
      next.searchParams.set('lang', select.value);
      const project = document.querySelector('.project-card[aria-pressed="true"]')?.dataset.project;
      if (project) next.searchParams.set('demo', project);
      try { localStorage.setItem(key, select.value); } catch { /* The URL carries the choice. */ }
      location.assign(next);
    });
    mount.replaceChildren(select);
  }

  window.siteLocale = { language, t, date, url, apply, template };
  document.addEventListener('DOMContentLoaded', initialize, { once: true });
})();
