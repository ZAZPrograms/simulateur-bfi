const data = [
  { name: "LVA ou LVB", coef: 6, cc: true, trimestres: [1, 2, 3] },
  { name: "Histoire-Géo ou Ens. Scientifique", coef: 6, cc: true, trimestres: [1, 2, 3] },
  { name: "EMC", coef: 2, cc: true, trimestres: [1, 2, 3] },
  { name: "EPS", coef: 6, cc: true, trimestres: [4, 5, 6] },
  { name: "Spécialité 3", coef: 8, cc: true, trimestres: [1, 2, 3] },
  { name: "Français écrit", coef: 5, cc: false },
  { name: "Français oral", coef: 5, cc: false },
  { name: "Philosophie", coef: 8, cc: false },
  { name: "Spécialité 1", coef: 16, cc: false },
  { name: "Spécialité 2", coef: 16, cc: false },
  { name: "Grand Oral", coef: 10, cc: false },
  { name: "ACLL", coef: 20, cc: false },
  { name: "CDM", coef: 20, cc: false },
  { name: "DNL obligatoire", coef: 20, cc: false },
];

const tableau = document.getElementById("tableauNotes");
const mode = document.getElementById("modeSaisie");

function createRow(matiere) {
  const row = document.createElement("div");
  row.className = "flex flex-wrap items-center mb-2";

  const label = document.createElement("label");
  label.className = "w-full sm:w-1/3 font-medium mb-1";
  label.textContent = `${matiere.name} (coef ${matiere.coef})`;

  const inputContainer = document.createElement("div");
  inputContainer.className = "w-full sm:w-2/3 flex gap-2";

  const inputs = [];
  if (mode.value === "trimestre" && matiere.cc) {
    matiere.trimestres.forEach((t) => {
      const input = document.createElement("input");
      input.type = "number";
      input.min = 0;
      input.max = 20;
      input.step = 0.01;
      input.placeholder = `T${t}`;
      input.className = "w-full p-1 border rounded";
      input.dataset.trimestre = t;
      inputContainer.appendChild(input);
      inputs.push(input);
    });
  } else {
    const input = document.createElement("input");
    input.type = "number";
    input.min = 0;
    input.max = 20;
    input.step = 0.01;
    input.placeholder = "Note /20";
    input.className = "w-full p-1 border rounded";
    inputs.push(input);
    inputContainer.appendChild(input);
  }

  inputs.forEach((inp) => inp.addEventListener("input", calculer));

  row.appendChild(label);
  row.appendChild(inputContainer);
  tableau.appendChild(row);

  return { matiere, inputs };
}

let lignes = [];

function renderInputs() {
  tableau.innerHTML = "";
  lignes = data.map(createRow);
  calculer();
}

mode.addEventListener("change", renderInputs);

function moyenneMatiere(ligne) {
  const vals = ligne.inputs.map(inp => parseFloat(inp.value)).filter(v => !isNaN(v));
  if (vals.length === 0) return null;
  const somme = vals.reduce((a, b) => a + b, 0);
  return somme / vals.length;
}

function calculer() {
  let total = 0;
  let coefTotal = 0;

  lignes.forEach(ligne => {
    const note = moyenneMatiere(ligne);
    if (note !== null) {
      total += note * ligne.matiere.coef;
      coefTotal += ligne.matiere.coef;
    }
  });

  const moyenne = coefTotal ? total / coefTotal : null;
  document.getElementById("moyenneFinale").textContent = moyenne?.toFixed(2) ?? "-";

  const mention = document.getElementById("mention");
  const bar = document.getElementById("progressionBar");
  const pointsRestants = document.getElementById("pointsRestants");

  if (moyenne === null) {
    mention.textContent = "-";
    pointsRestants.textContent = "-";
    bar.style.width = "0%";
    bar.style.backgroundColor = "var(--mention-rouge)";
    return;
  }

  const mentions = [
    { seuil: 18, label: "Félicitations du Jury", color: "var(--mention-violet)" },
    { seuil: 16, label: "Très Bien", color: "var(--mention-bleu)" },
    { seuil: 14, label: "Bien", color: "var(--mention-vert)" },
    { seuil: 12, label: "Assez Bien", color: "var(--mention-jaune)" },
    { seuil: 10, label: "Passable", color: "var(--mention-orange)" },
    { seuil: 0,  label: "Ajourné", color: "var(--mention-rouge)" },
  ];

  const next = mentions.find(m => moyenne < m.seuil);
  const current = mentions.find(m => moyenne >= m.seuil);
  mention.textContent = current.label;

  const points = next ? (next.seuil - moyenne).toFixed(2) : "0";
  pointsRestants.textContent = points;

  const percent = Math.min(100, (moyenne / 20) * 100);
  bar.style.width = `${percent}%";
  bar.style.backgroundColor = current.color;
}

renderInputs();