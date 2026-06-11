// ─── Score labels ────────────────────────────────────────────────────────────
const SCORE_LABELS = [
    ['💀'],
    ['⭐️'],
    ['⭐️', '⭐️'],
    ['⭐️', '⭐️', '⭐️'],
    ['⭐️', '⭐️', '⭐️', '⭐️'],
    ['⭐️', '⭐️', '⭐️', '⭐️', '⭐️'],
];

// ─── Palette ────────────────────────────────────────────────────────────────
const GOLD   = '#d4a054';
// [r,g,b] tuples for easy alpha manipulation
const COLORS = [
    [212, 160,  84],  // gold   – Archer
    [126, 184, 247],  // blue   – Dylan
    [168, 230, 163],  // green  – Rachel
    [244, 160, 160],  // red    – Trent
];

function rgb(c, a = 1)  { return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }

const BASE_OPTS = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: {} },
};

// ─── CSV parser ─────────────────────────────────────────────────────────────
function parseCSV(text) {
    const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
    const headers = parseCSVRow(lines[0]);
    return lines.slice(1).map(line => {
        const vals = parseCSVRow(line);
        const row = {};
        headers.forEach((h, i) => row[h] = vals[i] ?? '');
        return row;
    });
}

function parseCSVRow(line) {
    const out = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') { inQ = !inQ; continue; }
        if (c === ',' && !inQ) { out.push(cur.trim()); cur = ''; continue; }
        cur += c;
    }
    out.push(cur.trim());
    return out;
}

// ─── Stats helpers ───────────────────────────────────────────────────────────
function mean(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stdDev(arr) {
    if (arr.length < 2) return 0;
    const m = mean(arr);
    return Math.sqrt(arr.reduce((s, x) => s + (x - m) ** 2, 0) / arr.length);
}

function median(arr) {
    const s = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

// Chart.js plugin: draws colored quadrant backgrounds behind data points
function makeQuadrantPlugin(medX, medY) {
    // Quadrant colors (low opacity fills)
    // TL = high avg, low std  → green  (consensus faves)
    // TR = high avg, high std → amber  (divisive bangers)
    // BL = low avg,  low std  → blue   (consensus skips)
    // BR = low avg,  high std → red    (chaotic bad)
    const fills = {
        TL: 'rgba(100, 200, 120, 0.07)',
        TR: 'rgba(212, 160,  84, 0.07)',
        BL: 'rgba(100, 140, 220, 0.07)',
        BR: 'rgba(220,  90,  90, 0.07)',
    };
    return {
        id: 'quadrantBg',
        beforeDatasetsDraw(chart) {
            const { ctx, chartArea: { left, right, top, bottom }, scales: { x, y } } = chart;
            const mx = x.getPixelForValue(medX);
            const my = y.getPixelForValue(medY);
            ctx.save();
            // TL
            ctx.fillStyle = fills.TL;
            ctx.fillRect(left, top, mx - left, my - top);
            // TR
            ctx.fillStyle = fills.TR;
            ctx.fillRect(mx, top, right - mx, my - top);
            // BL
            ctx.fillStyle = fills.BL;
            ctx.fillRect(left, my, mx - left, bottom - my);
            // BR
            ctx.fillStyle = fills.BR;
            ctx.fillRect(mx, my, right - mx, bottom - my);
            // Median lines
            ctx.strokeStyle = 'rgba(255,255,255,0.12)';
            ctx.setLineDash([4, 4]);
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(mx, top);    ctx.lineTo(mx, bottom); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(left, my);   ctx.lineTo(right, my);  ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        }
    };
}

// ─── Main ────────────────────────────────────────────────────────────────────
fetch('data.csv')
    .then(r => r.arrayBuffer())
    .then(buf => new TextDecoder('utf-8').decode(buf))
    .then(text => {
        const rows = parseCSV(text);
        if (!rows.length) return;

        // Person columns = non-Z score columns (exclude album, artist, and any col ending in " Z" or named "Average Z"/"Stdev Z")
        const SKIP = new Set(['album', 'artist', 'Average Z', 'Stdev Z']);
        const people = Object.keys(rows[0]).filter(k => !SKIP.has(k) && !k.endsWith(' Z'));

        // Build album objects
        const albums = rows.map(row => {
            const scores = {};
            people.forEach(p => {
                const v = row[p];
                if (v !== '' && v !== null && v !== undefined) {
                    const n = parseFloat(v);
                    if (!isNaN(n)) scores[p] = n;
                }
            });
            const vals = Object.values(scores);
            return {
                album:   row['album'],
                artist:  row['artist'],
                scores,
                vals,
                avg:     vals.length ? mean(vals) : null,
                std:     vals.length >= 2 ? stdDev(vals) : null,
                n:       vals.length,
                avgZ:    row['Average Z'] !== '' ? parseFloat(row['Average Z']) : null,
                stdZ:    row['Stdev Z']   !== '' ? parseFloat(row['Stdev Z'])   : null,
            };
        }).filter(a => a.n > 0);

        buildScatter(albums);
        buildCombined(albums, people);
        buildGrouped(albums, people);
        buildIndividual(albums, people);
        buildTable(albums, people);
    });

// ─── 1. Scatter: z-scores from CSV ──────────────────────────────────────────
function buildScatter(albums) {
    const rated2plus = albums.filter(a => a.avgZ !== null && a.stdZ !== null);

    const data = rated2plus.map(a => ({
        x: a.stdZ,
        y: a.avgZ,
        label: a.album,
        artist: a.artist,
        rawAvg: a.avgZ,
        rawStd: a.stdZ,
        n: a.n,
    }));

    const medX = median(rated2plus.map(a => a.stdZ));
    const medY = median(rated2plus.map(a => a.avgZ));

    new Chart(document.getElementById('chart-scatter'), {
        type: 'scatter',
        plugins: [makeQuadrantPlugin(medX, medY)],
        data: {
            datasets: [{
                data,
                backgroundColor: 'rgba(212, 160, 84, 0.6)',
                borderColor:     'rgba(212, 160, 84, 0.9)',
                borderWidth: 1,
                pointRadius: 6,
                pointHoverRadius: 9,
            }]
        },
        options: {
            ...BASE_OPTS,
            interaction: { mode: 'nearest', intersect: true },
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: false,
                    external({ chart, tooltip }) {
                        let el = document.getElementById('scatter-tooltip');
                        if (!el) {
                            el = document.createElement('div');
                            el.id = 'scatter-tooltip';
                            document.body.appendChild(el);
                        }
                        if (tooltip.opacity === 0) { el.style.opacity = '0'; return; }
                        const first = tooltip.dataPoints[0].raw;
                        const statsLine = `<span class="stt-stats">z̄ ${first.rawAvg.toFixed(2)} &nbsp;·&nbsp; σz ${first.rawStd.toFixed(2)}</span>`;
                        const albumLines = tooltip.dataPoints.map(p => {
                            const d = p.raw;
                            return `<div class="stt-item"><span class="stt-album">${d.label}</span><span class="stt-meta">${d.artist} &nbsp;(${d.n})</span></div>`;
                        }).join('');
                        el.innerHTML = albumLines + statsLine;
                        const rect = chart.canvas.getBoundingClientRect();
                        el.style.opacity = '1';
                        el.style.left = rect.left + window.scrollX + tooltip.caretX + 12 + 'px';
                        el.style.top  = rect.top  + window.scrollY + tooltip.caretY - 10 + 'px';
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Disagreement (z-score of σ) →', color: '#666', font: { size: 12 } },
                    ticks: { color: '#555' },
                    grid:  { color: 'rgba(255,255,255,0.05)' },
                },
                y: {
                    title: { display: true, text: '↑ Score (z-score of avg)', color: '#666', font: { size: 12 } },
                    ticks: { color: '#555' },
                    grid:  { color: 'rgba(255,255,255,0.05)' },
                }
            }
        }
    });

    // Quadrant labels overlay (positioned after chart renders so axes are known)
    const wrap = document.querySelector('.chart-wrap--scatter');
    const ql = document.createElement('div');
    ql.className = 'quadrant-labels';
    ql.innerHTML = `
        <span class="ql ql-tl">Consensus faves<br><small>high score · low spread</small></span>
        <span class="ql ql-tr">Divisive bangers<br><small>high score · contested</small></span>
        <span class="ql ql-bl">Consensus skips<br><small>low score · low spread</small></span>
        <span class="ql ql-br">Chaotic bad<br><small>low score · contested</small></span>
    `;
    wrap.appendChild(ql);
}

// ─── 2. Combined histogram ───────────────────────────────────────────────────
function buildCombined(albums, people) {
    const counts = new Array(6).fill(0);
    albums.forEach(a => Object.values(a.scores).forEach(s => counts[s]++));

    new Chart(document.getElementById('chart-combined'), {
        type: 'bar',
        data: {
            labels: SCORE_LABELS,
            datasets: [{
                data: counts,
                backgroundColor: [0,1,2,3,4,5].map(b => `rgba(212, 160, 84, ${0.25 + b * 0.14})`),
                borderColor:     GOLD,
                borderWidth: 1,
                borderRadius: 4,
            }]
        },
        options: {
            ...BASE_OPTS,
            scales: {
                x: {
                    title: { display: true, text: 'Score', color: '#666', font: { size: 12 } },
                    ticks: { color: '#888' },
                    grid:  { display: false },
                },
                y: {
                    title: { display: true, text: 'Number of ratings', color: '#666', font: { size: 12 } },
                    ticks: { color: '#555', stepSize: 1 },
                    grid:  { color: 'rgba(255,255,255,0.05)' },
                    beginAtZero: true,
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: { title: ctx => ctx[0].label, label: ctx => `${ctx.raw} ratings` },
                    backgroundColor: 'rgba(20,20,20,0.92)',
                    borderColor: 'rgba(255,255,255,0.08)',
                    borderWidth: 1,
                    titleColor: '#f0f0f0',
                    bodyColor: '#aaa',
                }
            }
        }
    });
}

// ─── 3. Grouped multi-person bar ─────────────────────────────────────────────
function buildGrouped(albums, people) {
    const datasets = people.map((person, pi) => {
        const counts = new Array(6).fill(0);
        albums.forEach(a => {
            if (a.scores[person] !== undefined) counts[a.scores[person]]++;
        });
        const color = COLORS[pi % COLORS.length];
        return {
            label: person,
            data: counts,
            backgroundColor: rgb(color, 0.55),
            borderColor:     rgb(color, 1),
            borderWidth: 1,
            borderRadius: 3,
        };
    });

    new Chart(document.getElementById('chart-grouped'), {
        type: 'bar',
        data: { labels: SCORE_LABELS, datasets },
        options: {
            ...BASE_OPTS,
            scales: {
                x: {
                    ticks: { color: '#888' },
                    grid:  { display: false },
                },
                y: {
                    title: { display: true, text: 'Number of ratings', color: '#666', font: { size: 12 } },
                    ticks: { color: '#555', stepSize: 1 },
                    grid:  { color: 'rgba(255,255,255,0.05)' },
                    beginAtZero: true,
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: { color: '#aaa', font: { size: 12 }, boxWidth: 12, padding: 16 }
                },
                tooltip: {
                    callbacks: { title: ctx => ctx[0].label, label: ctx => `${ctx.dataset.label}: ${ctx.raw}` },
                    backgroundColor: 'rgba(20,20,20,0.92)',
                    borderColor: 'rgba(255,255,255,0.08)',
                    borderWidth: 1,
                    titleColor: '#f0f0f0',
                    bodyColor: '#aaa',
                }
            }
        }
    });
}

// ─── 3. Per-person histograms ────────────────────────────────────────────────
function buildIndividual(albums, people) {
    const container = document.getElementById('individual-charts');

    people.forEach((person, pi) => {
        const counts = new Array(6).fill(0);
        let total = 0;
        albums.forEach(a => {
            if (a.scores[person] !== undefined) {
                counts[a.scores[person]]++;
                total++;
            }
        });

        const avg = total
            ? (albums.reduce((s, a) => s + (a.scores[person] !== undefined ? a.scores[person] : 0), 0) / total).toFixed(2)
            : '—';

        const block = document.createElement('div');
        block.className = 'person-block';
        block.innerHTML = `
            <div class="person-name">${person}</div>
            <div class="person-meta">${total} albums rated · avg ${avg}</div>
            <div class="chart-wrap chart-wrap--small"><canvas id="chart-person-${pi}"></canvas></div>
        `;
        container.appendChild(block);

        const color = COLORS[pi % COLORS.length];

        new Chart(document.getElementById(`chart-person-${pi}`), {
            type: 'bar',
            data: {
                labels: SCORE_LABELS,
                datasets: [{
                    data: counts,
                    backgroundColor: rgb(color, 0.45),
                    borderColor: rgb(color, 1),
                    borderWidth: 1,
                    borderRadius: 3,
                }]
            },
            options: {
                ...BASE_OPTS,
                scales: {
                    x: { ticks: { color: '#666', font: { size: 11 } }, grid: { display: false } },
                    y: { ticks: { color: '#555', font: { size: 11 }, stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: { title: ctx => ctx[0].label, label: ctx => `${ctx.raw} ratings` },
                        backgroundColor: 'rgba(20,20,20,0.92)',
                        borderColor: 'rgba(255,255,255,0.08)',
                        borderWidth: 1,
                        titleColor: '#f0f0f0',
                        bodyColor: '#aaa',
                    }
                }
            }
        });
    });
}

// ─── 4. Sortable table ───────────────────────────────────────────────────────
function buildTable(albums) {
    let sortCol = 'avg';
    let sortDir = 'desc';

    const tbody = document.querySelector('#album-table tbody');

    function render() {
        const sorted = [...albums].sort((a, b) => {
            let va = a[sortCol] ?? (sortDir === 'desc' ? -Infinity : Infinity);
            let vb = b[sortCol] ?? (sortDir === 'desc' ? -Infinity : Infinity);
            if (typeof va === 'string') va = va.toLowerCase();
            if (typeof vb === 'string') vb = vb.toLowerCase();
            if (va < vb) return sortDir === 'asc' ? -1 : 1;
            if (va > vb) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });

        tbody.innerHTML = sorted.map(a => {
            const avg = a.avg !== null ? a.avg.toFixed(2) : '—';
            const std = a.std !== null ? a.std.toFixed(2) : '—';
            return `<tr>
                <td>${a.album}</td>
                <td style="color:#666">${a.artist}</td>
                <td class="avg-cell">${avg}</td>
                <td>${std}</td>
                <td style="color:#555">${a.n}</td>
            </tr>`;
        }).join('');
    }

    document.querySelectorAll('#album-table thead th').forEach(th => {
        th.addEventListener('click', () => {
            const col = th.dataset.col;
            if (sortCol === col) {
                sortDir = sortDir === 'asc' ? 'desc' : 'asc';
            } else {
                sortCol = col;
                sortDir = col === 'album' || col === 'artist' ? 'asc' : 'desc';
            }
            document.querySelectorAll('#album-table thead th').forEach(t => {
                t.classList.remove('sorted-asc', 'sorted-desc');
            });
            th.classList.add(sortDir === 'asc' ? 'sorted-asc' : 'sorted-desc');
            render();
        });
    });

    render();
}
