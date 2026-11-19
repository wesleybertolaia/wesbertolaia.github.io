const campaigns = {
  night: {
    name: 'Night Shift', tag: 'Independent print fair · São Paulo',
    title: 'Night Shift Print Fair',
    intro: 'Browse local print editions, join a two-colour workshop, or drop in for the artist Q&A.',
    action: 'See the programme',
    info: 'Saturday · 16:00–22:00',
    details: [['16:00 · Doors open', 'Browse artist tables and limited-run editions.'], ['18:00 · Print workshop', 'Make and take home a two-colour print.'], ['20:00 · Artist Q&A', 'Hear how local studios get their work into the world.']],
    faq: 'Can I drop in?', answer: 'Yes. The fair is drop-in. Workshops have limited space.',
  },
  canopy: {
    name: 'Common Canopy', tag: 'Neighbourhood tree care · São Paulo',
    title: 'Saturday Tree Care',
    intro: 'Spend a morning watering and mulching young street trees. The team supplies tools, gloves and a short briefing.',
    action: 'See the volunteer plan',
    info: 'Saturday · 09:00–12:00',
    details: [['09:00 · Meet the team', 'Pick up gloves and meet your group.'], ['09:30 · Care for the trees', 'Water young trees and replenish mulch.'], ['11:30 · Pack up together', 'Share what you noticed and help reset the site.']],
    faq: 'Do I need experience?', answer: 'No. A team lead will show you how to get started.',
  },
};
const portuguese = {
  night: {
    tag: 'Feira de impressão independente · São Paulo',
    title: 'Feira Gráfica Night Shift',
    intro: 'Conheça artistas gráficos locais, participe de uma oficina e leve para casa uma edição que você não encontra em nenhum outro lugar.',
    action: 'Confira a programação completa', info: 'Sábado · das 16h às 22h',
    details: [['16h · Abertura da feira', 'Visite as mesas dos artistas e conheça as edições limitadas.'], ['18h · Oficina de impressão', 'Produza uma estampa de duas cores e leve sua criação para casa.'], ['20h · Conversa com os artistas', 'Descubra como os estúdios locais divulgam seus trabalhos.']],
    faq: 'Posso chegar a qualquer hora?', answer: 'Sim. A entrada na feira é livre. As oficinas têm vagas limitadas.',
  },
  canopy: {
    tag: 'Cuidado com as árvores do bairro · São Paulo',
    title: 'Mutirão de Cuidado com as Árvores',
    intro: 'Dedique uma manhã de sábado às árvores que refrescam o bairro. A equipe fornece as ferramentas e acompanha quem está começando.',
    action: 'Veja a programação para voluntários', info: 'Sábado · das 9h às 12h',
    details: [['9h · Encontro com a equipe', 'Pegue as luvas e conheça seu grupo.'], ['9h30 · Cuidados com as árvores', 'Regue as mudas e reponha a cobertura do solo.'], ['11h30 · Encerramento coletivo', 'Compartilhe o que observou e ajude a organizar o espaço.']],
    faq: 'Preciso ter experiência?', answer: 'Não. Uma pessoa da equipe vai orientar você em cada etapa.',
  },
};
const defaultOrder = ['hero', 'details', 'faq'];
const names = { hero: 'Headline', details: 'Programme', faq: 'FAQ' };
const params = new URLSearchParams(location.search);
const app = document.querySelector('#app');
let brand = Object.hasOwn(campaigns, params.get('brand')) ? params.get('brand') : 'night';
let order = [...defaultOrder];
let language = params.get('lang') === 'pt-BR' ? 'pt-BR' : 'en';
const incoming = (params.get('sections') || '').split(',');
if (incoming.length === 3 && new Set(incoming).size === 3 && incoming.every(item => defaultOrder.includes(item))) {
  order = incoming;
}

function campaignMarkup(model, blocks) {
  const content = {
    hero: `<section class="campaign-hero"><div><p class="tag">${model.tag}</p><h1>${model.title}</h1>
      <p>${model.intro}</p><a class="cta" href="#programme">${model.action} ↓</a></div>
      <div class="cover-art" aria-hidden="true"><i></i><i></i><i></i></div></section>`,
    details: `<section class="programme" id="programme"><div><p class="tag">${model.name}</p><h2>${model.info}</h2></div>
      <ol>${model.details.map(([time, description]) => `<li><strong>${time}</strong><span>${description}</span></li>`).join('')}</ol></section>`,
    faq: `<section class="programme"><details><summary>${model.faq}</summary><p>${model.answer}</p></details></section>`,
  };
  return blocks.map(block => content[block]).join('') + '<footer class="campaign-foot">' + (language === 'pt-BR' ? 'Campanha fictícia' : 'Fictional campaign') + ' · Campaign Studio</footer>';
}

function campaignUrl() {
  return './?view=campaign&brand=' + brand + '&sections=' + order.join(',') + '&lang=' + language;
}

if (params.get('view') === 'campaign') {
  document.title = campaigns[brand].name + ' | Campaign Studio';
  app.className = 'campaign ' + brand;
  document.documentElement.lang = language;
  const model = language === 'pt-BR' ? { ...campaigns[brand], ...portuguese[brand] } : campaigns[brand];
  app.innerHTML = campaignMarkup(model, order);
} else {
  app.innerHTML = `<section class="studio-intro"><div><p class="tag">${language === "pt-BR" ? "Um layout, muitas marcas." : "One layout, many brands."}</p><h1>Campaign Studio</h1>
    <p>${language === "pt-BR" ? "Escolha uma marca, organize as seções e confira a página antes de compartilhar." : "Choose a brand, arrange the sections, and preview the page before sharing it."}</p></div><img src="./header-visual.jpg" alt="" width="1200" height="800"></section>
    <div class="workspace"><aside><h2>Build a page</h2>
      <label>Brand<select id="brand" aria-label="Brand"><option value="night">Night Shift</option><option value="canopy">Common Canopy</option></select></label>
      <label>Campaign language<select id="campaign-language" aria-label="Campaign language"><option value="en">English</option><option value="pt-BR">Português do Brasil</option></select></label>
      <label>Preview width<select id="device" aria-label="Preview width"><option value="wide">Wide</option><option value="phone">Phone</option></select></label>
      <fieldset><legend>Section order</legend><ol id="blocks"></ol></fieldset>
      <a class="open" id="open" target="_blank" rel="noopener">Open live campaign ↗</a>
      <p class="example-links"><a href="./?view=campaign&brand=night">Night Shift example</a><br><a href="./?view=campaign&brand=canopy">Common Canopy example</a></p>
    </aside><div class="preview-zone"><iframe title="Campaign preview" id="preview"></iframe></div></div>`;
  const brandField = document.querySelector('#brand');
  const blocks = document.querySelector('#blocks');
  const frame = document.querySelector('#preview');
  const open = document.querySelector('#open');
  brandField.value = brand;
  const languageField = document.querySelector('#campaign-language');
  languageField.value = language;
  languageField.addEventListener('change', () => { language = languageField.value; render(); });

  function render() {
    blocks.replaceChildren(...order.map((block, index) => {
      const row = document.createElement('li');
      const label = document.createElement('span');
      label.textContent = names[block];
      row.append(label);
      for (const [direction, symbol, offset] of [['up', '↑', -1], ['down', '↓', 1]]) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = symbol;
        button.setAttribute('aria-label', 'Move ' + names[block] + ' ' + direction);
        const next = index + offset;
        button.disabled = next < 0 || next >= order.length;
        button.addEventListener('click', () => {
          [order[index], order[next]] = [order[next], order[index]];
          render();
          const movedRow = blocks.children[next];
          (movedRow.querySelector('button:not(:disabled)') || movedRow).focus();
        });
        row.append(button);
      }
      return row;
    }));
    open.href = campaignUrl();
    frame.src = open.href;
  }

  brandField.addEventListener('change', () => { brand = brandField.value; render(); });
  document.querySelector('#device').addEventListener('change', event => {
    frame.classList.toggle('phone', event.target.value === 'phone');
  });
  render();
}
