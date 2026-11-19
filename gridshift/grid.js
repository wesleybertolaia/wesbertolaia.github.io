const pt = new URLSearchParams(location.search).get('lang') === 'pt-BR';
const locale = pt ? 'pt-BR' : 'en-US';
document.documentElement.lang = pt ? 'pt-BR' : 'en';
const toggle = document.querySelector('#language');
if (pt) {
  toggle.href = '?lang=en';
  toggle.lang = 'en';
  toggle.textContent = 'English';
  document.title = 'Gridshift | Planejamento energético';
}

const copy = {
  eyebrow: 'Mesmo orçamento. Diferentes resultados.',
  title: 'Orçamento energético do bairro',
  intro: 'Monte um plano para 100 casas com US$ 100 mil. Compare a economia, as emissões e a demanda no horário de pico.',
  plan: 'Seu plano',
  reset: 'Zerar',
  remaining: 'Orçamento restante',
  impact: 'Impacto estimado',
  pin: 'Fixar este plano',
  method: 'Como funciona o modelo',
  assumptions: 'Este cenário é fictício. Cada pacote tem um custo fixo e um benefício ilustrativo. As estimativas são somadas e não consideram interações, tarifas locais ou desgaste das baterias. Os valores estão em dólares americanos.',
};

if (pt) {
  for (const item of document.querySelectorAll('[data-text]')) item.textContent = copy[item.dataset.text];
  document.querySelector('.planner').setAttribute('aria-label', 'Plano energético');
}

const projects = [
  { name: ['Rooftop solar','Energia solar'], description: ['Generates electricity during the day.','Gera energia durante o dia.'], cost: 20000, saving: 2600, carbon: 4, peak: 1 },
  { name: ['Battery storage','Baterias'], description: ['Shifts demand away from peak hours.','Desloca parte da demanda do horário de pico.'], cost: 25000, saving: 1600, carbon: 1, peak: 8 },
  { name: ['Home insulation','Isolamento térmico'], description: ['Reduces heating and cooling demand.','Reduz a demanda de aquecimento e resfriamento.'], cost: 15000, saving: 2100, carbon: 3, peak: 3 },
];
const metrics = [
  { key: 'saving', label: ['Annual savings','Economia anual'], baseline: 14000, format: money },
  { key: 'carbon', label: ['CO₂ avoided per year','CO₂ evitado por ano'], baseline: 25, format: value => value + ' t' },
  { key: 'peak', label: ['Peak demand reduction','Redução na demanda de pico'], baseline: 32, format: value => value + ' kW' },
];
const budget = 100000;
const quantity = projects.map(() => 0);
const choices = document.querySelector('#choices');
const results = document.querySelector('#results');
let pinned = null;
const sum = key => projects.reduce((total, project, index) => total + project[key] * quantity[index], 0);

function money(value) {
  return new Intl.NumberFormat(locale, {style:'currency',currency:'USD',maximumFractionDigits:0}).format(value);
}

function local([en, br]) { return pt ? br : en; }

const rows = projects.map((project, index) => {
  const row = document.createElement('article');
  const name = local(project.name);
  row.className = 'choice';
  row.innerHTML = `<div><h3>${name}</h3><p>${local(project.description)}</p><small>${money(project.cost)}</small></div>
    <div class="stepper"><button type="button">−</button><output>0</output><button type="button">+</button></div>`;
  const [minus, plus] = row.querySelectorAll('button');
  minus.setAttribute('aria-label', (pt ? 'Remover pacote de ' : 'Remove package of ') + name);
  plus.setAttribute('aria-label', (pt ? 'Adicionar pacote de ' : 'Add package of ') + name);
  minus.addEventListener('click', () => { quantity[index]--; update(); });
  plus.addEventListener('click', () => { quantity[index]++; update(); });
  choices.append(row);
  return { minus, plus, output: row.querySelector('output') };
});

function update() {
  const remaining = budget - sum('cost');
  rows.forEach(({minus,plus,output},index) => {
    minus.disabled = !quantity[index];
    plus.disabled = projects[index].cost > remaining;
    output.value = quantity[index];
  });
  document.querySelector('#remaining').textContent = money(remaining);
  const cards = metrics.map(metric => {
    const value = sum(metric.key);
    const delta = pinned ? value - pinned[metric.key] : 0;
    const comparison = pinned
      ? `<p class="comparison">${local(['Pinned plan', 'Plano fixado'])}: ${metric.format(pinned[metric.key])} · ${delta > 0 ? '+' : delta < 0 ? '−' : ''}${metric.format(Math.abs(delta))}</p>`
      : '';
    return `<div class="metric"><dt>${local(metric.label)}</dt><dd>${metric.format(value)}</dd>
      <meter aria-label="${local(metric.label)}" min="0" max="${metric.baseline}" value="${value}"></meter>${comparison}</div>`;
  });
  results.innerHTML = cards.join('');
  document.querySelector('#takeaway').textContent = remaining === budget
    ? local(['Choose a package to see its effect.','Escolha um pacote para ver seu efeito.'])
    : local(['Try spending the same amount on a different mix. Watch which outcome changes most.','Experimente gastar o mesmo valor com outra combinação e observe qual resultado mais muda.']);
}

document.querySelector('#pin').addEventListener('click', () => {
  pinned = Object.fromEntries(metrics.map(metric => [metric.key, sum(metric.key)]));
  update();
});

document.querySelector('#reset').addEventListener('click', () => { quantity.fill(0); update(); });
update();
