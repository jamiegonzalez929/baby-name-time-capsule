const sourceNote = document.querySelector("#source-note");
const sexSelect = document.querySelector("#sex-select");
const selectedYearInput = document.querySelector("#selected-year");
const comparisonYearInput = document.querySelector("#comparison-year");
const selectedYearOutput = document.querySelector("#selected-year-output");
const comparisonYearOutput = document.querySelector("#comparison-year-output");
const summaryGrid = document.querySelector("#summary-grid");
const topList = document.querySelector("#top-list");
const topListCaption = document.querySelector("#top-list-caption");
const movementChart = document.querySelector("#movement-chart");
const movementSummary = document.querySelector("#movement-summary");
const movementCaption = document.querySelector("#movement-caption");
const streakList = document.querySelector("#streak-list");

const state = {
  dataset: null,
  years: [],
  sex: "girl",
  selectedYear: 2008,
  comparisonYear: 1980,
};

function formatPercent(value) {
  return `${value.toFixed(2)}%`;
}

function clampComparisonYears() {
  if (state.selectedYear === state.comparisonYear) {
    const fallback = state.years.find((year) => year !== state.selectedYear) ?? state.selectedYear;
    state.comparisonYear = fallback;
  }
}

function getEntries(year, sex) {
  return state.dataset.top_by_year[String(year)][sex];
}

function getRankMap(entries) {
  return new Map(entries.map((entry) => [entry.name, entry]));
}

function computeComparison() {
  const focusEntries = getEntries(state.selectedYear, state.sex);
  const compareEntries = getEntries(state.comparisonYear, state.sex);
  const compareMap = getRankMap(compareEntries);

  const overlap = focusEntries.filter((entry) => compareMap.has(entry.name)).length;
  const top10Focus = focusEntries.slice(0, 10);
  const top10Compare = compareEntries.slice(0, 10);
  const top10CompareMap = getRankMap(top10Compare);
  const movers = top10Focus
    .filter((entry) => top10CompareMap.has(entry.name))
    .map((entry) => {
      const previous = top10CompareMap.get(entry.name);
      return {
        name: entry.name,
        currentRank: entry.rank,
        previousRank: previous.rank,
        delta: previous.rank - entry.rank,
      };
    })
    .sort((a, b) => b.delta - a.delta);

  const newcomers = top10Focus.filter((entry) => !top10CompareMap.has(entry.name));
  const departures = top10Compare.filter((entry) => !getRankMap(top10Focus).has(entry.name));

  return {
    focusEntries,
    compareEntries,
    overlap,
    newcomers,
    departures,
    movers,
    top10Share: top10Focus.reduce((sum, entry) => sum + entry.percent, 0),
  };
}

function renderSummary(comparison) {
  const leader = comparison.focusEntries[0];
  const strongestMover = comparison.movers[0];
  const cards = [
    {
      label: "Top name",
      value: leader.name,
      note: `${formatPercent(leader.percent)} of ${state.sex === "girl" ? "girls" : "boys"} in ${state.selectedYear}`,
    },
    {
      label: "Top 10 concentration",
      value: formatPercent(comparison.top10Share),
      note: `Share captured by the top 10 names in ${state.selectedYear}`,
    },
    {
      label: "Shared names",
      value: `${comparison.overlap}/25`,
      note: strongestMover
        ? `${strongestMover.name} climbed ${strongestMover.delta} places from ${state.comparisonYear}`
        : `No shared top-10 names between ${state.selectedYear} and ${state.comparisonYear}`,
    },
  ];

  summaryGrid.innerHTML = cards
    .map(
      (card) => `
        <article class="panel summary-card">
          <p>${card.label}</p>
          <strong>${card.value}</strong>
          <p>${card.note}</p>
        </article>
      `,
    )
    .join("");
}

function renderTopList(entries) {
  const maxPercent = entries[0].percent;
  topList.innerHTML = entries
    .slice(0, 15)
    .map(
      (entry) => `
        <div class="rank-row">
          <div class="rank-num">${entry.rank}</div>
          <div class="rank-meta">
            <strong>${entry.name}</strong>
            <div class="rank-bar" style="width:${(entry.percent / maxPercent) * 100}%"></div>
          </div>
          <div class="rank-share">${formatPercent(entry.percent)}</div>
        </div>
      `,
    )
    .join("");
}

function renderMovementChart(comparison) {
  const top10Focus = comparison.focusEntries.slice(0, 10);
  const top10Compare = comparison.compareEntries.slice(0, 10);
  const names = Array.from(new Set([...top10Compare, ...top10Focus].map((entry) => entry.name)));
  const focusMap = getRankMap(top10Focus);
  const compareMap = getRankMap(top10Compare);
  const width = 700;
  const height = 420;
  const leftX = 160;
  const rightX = 540;
  const topY = 55;
  const step = 32;

  const lineColor = (name) => {
    if (!compareMap.has(name) || !focusMap.has(name)) return "#d28a2d";
    const delta = compareMap.get(name).rank - focusMap.get(name).rank;
    return delta > 0 ? "#0f6d66" : delta < 0 ? "#a33b2f" : "#6b5a4f";
  };

  const circles = names
    .map((name) => {
      const leftRank = compareMap.get(name)?.rank ?? 11;
      const rightRank = focusMap.get(name)?.rank ?? 11;
      const leftY = topY + (leftRank - 1) * step;
      const rightY = topY + (rightRank - 1) * step;
      return `
        <path d="M ${leftX} ${leftY} C 280 ${leftY}, 420 ${rightY}, ${rightX} ${rightY}" fill="none" stroke="${lineColor(name)}" stroke-width="3" stroke-linecap="round" opacity="0.78"></path>
        <circle cx="${leftX}" cy="${leftY}" r="4.5" fill="${lineColor(name)}"></circle>
        <circle cx="${rightX}" cy="${rightY}" r="4.5" fill="${lineColor(name)}"></circle>
      `;
    })
    .join("");

  const labels = Array.from({ length: 10 }, (_, index) => {
    const rank = index + 1;
    const y = topY + index * step + 4;
    return `
      <text x="28" y="${y}" fill="#68574d" font-size="14">${rank}. ${top10Compare[index]?.name ?? "—"}</text>
      <text x="572" y="${y}" fill="#68574d" font-size="14">${rank}. ${top10Focus[index]?.name ?? "—"}</text>
    `;
  }).join("");

  movementChart.innerHTML = `
    <title id="movement-title">Top 10 rank movement between ${state.comparisonYear} and ${state.selectedYear}</title>
    <text x="28" y="24" fill="#201712" font-size="18" font-weight="700">${state.comparisonYear}</text>
    <text x="572" y="24" fill="#201712" font-size="18" font-weight="700">${state.selectedYear}</text>
    ${circles}
    ${labels}
  `;
}

function renderMovementSummary(comparison) {
  const chips = [];
  if (comparison.movers.length > 0) {
    const mover = comparison.movers[0];
    chips.push(`${mover.name} gained the most ground, climbing ${mover.delta} places.`);
  }
  if (comparison.newcomers.length > 0) {
    chips.push(`New to the top 10 in ${state.selectedYear}: ${comparison.newcomers.map((entry) => entry.name).join(", ")}.`);
  }
  if (comparison.departures.length > 0) {
    chips.push(`Dropped out of the top 10 since ${state.comparisonYear}: ${comparison.departures.map((entry) => entry.name).join(", ")}.`);
  }

  movementSummary.innerHTML = chips
    .map((chip) => `<div class="movement-chip">${chip}</div>`)
    .join("");
}

function renderStreaks() {
  streakList.innerHTML = state.dataset.streaks[state.sex]
    .map(
      (entry, index) => `
        <div class="streak-row">
          <div class="rank-num">${index + 1}</div>
          <div>
            <strong>${entry.name}</strong>
            <span>${entry.start_year} to ${entry.end_year}</span>
          </div>
          <div class="streak-years">${entry.years} years</div>
        </div>
      `,
    )
    .join("");
}

function syncControls() {
  selectedYearInput.value = String(state.selectedYear);
  comparisonYearInput.value = String(state.comparisonYear);
  selectedYearOutput.value = String(state.selectedYear);
  comparisonYearOutput.value = String(state.comparisonYear);
  topListCaption.textContent = `Top 15 ${state.sex === "girl" ? "girls'" : "boys'"} names in ${state.selectedYear}.`;
  movementCaption.textContent = `How the top 10 shifted between ${state.comparisonYear} and ${state.selectedYear}.`;
}

function render() {
  clampComparisonYears();
  syncControls();
  const comparison = computeComparison();
  renderSummary(comparison);
  renderTopList(comparison.focusEntries);
  renderMovementChart(comparison);
  renderMovementSummary(comparison);
  renderStreaks();
}

function setYearInputBounds(years) {
  const min = years[0];
  const max = years.at(-1);
  for (const input of [selectedYearInput, comparisonYearInput]) {
    input.min = String(min);
    input.max = String(max);
    input.step = "1";
  }
}

async function init() {
  const response = await fetch("./data/baby-name-time-capsule.json");
  state.dataset = await response.json();
  const { start, end } = state.dataset.year_range;
  state.years = Array.from({ length: end - start + 1 }, (_, index) => start + index);
  state.selectedYear = end;
  state.comparisonYear = Math.max(start, end - 40);
  setYearInputBounds(state.years);

  sourceNote.textContent = `Using ${state.dataset.source.name} (${start}–${end}). The site ships with a bundled JSON build, so it works locally and on GitHub Pages.`;

  sexSelect.addEventListener("change", (event) => {
    state.sex = event.target.value;
    render();
  });

  selectedYearInput.addEventListener("input", (event) => {
    state.selectedYear = Number(event.target.value);
    render();
  });

  comparisonYearInput.addEventListener("input", (event) => {
    state.comparisonYear = Number(event.target.value);
    render();
  });

  render();
}

init().catch((error) => {
  sourceNote.textContent = `Could not load dataset: ${error.message}`;
});
