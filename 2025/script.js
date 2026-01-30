const labels = ['Production', 'Lyrics', 'Vocals', 'Replay Value', 'Cohesion', 'Originality'];

const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
        legend: { display: false }
    },
    scales: {
        r: {
            min: 0,
            max: 10,
            ticks: {
                stepSize: 2,
                color: '#555',
                backdropColor: 'transparent',
                font: { size: 9, family: 'Inter' }
            },
            grid: {
                color: 'rgba(255, 255, 255, 0.06)'
            },
            angleLines: {
                color: 'rgba(255, 255, 255, 0.06)'
            },
            pointLabels: {
                color: '#888',
                font: { size: 10, family: 'Inter', weight: '400' }
            }
        }
    }
};

function createChart(canvasId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: 'rgba(212, 160, 84, 0.12)',
                borderColor: 'rgba(212, 160, 84, 0.5)',
                borderWidth: 1.5,
                pointBackgroundColor: 'rgba(212, 160, 84, 0.7)',
                pointBorderColor: 'transparent',
                pointRadius: 3
            }]
        },
        options: chartOptions
    });
}

// [Production, Lyrics, Vocals, Replay Value, Cohesion, Originality]
const ratings = {
    1:  [10, 10, 10, 10, 10, 10], // Let God Sort Em Out
    2:  [9,  9,  7,  10, 10, 8],  // I Love My Computer
    3:  [8,  8,  10, 9,  8,  10], // LUX
    4:  [8,  7,  9,  9,  8,  8],  // Princess Of Power
    5:  [9,  10, 8,  8,  7,  8],  // God Does Like Ugly
    6:  [7,  9,  8,  8,  7,  7],  // Where Is My Head
    7:  [9,  6,  8,  8,  9,  9],  // Vie
    8:  [9,  8,  10, 7,  7,  6],  // A Matter of Time
    9:  [6,  9,  8,  5,  6,  7],  // Lotus
    10: [8,  8,  8,  9,  6,  6],  // MAYHEM
};

for (const [rank, data] of Object.entries(ratings)) {
    createChart(`chart-${rank}`, data);
}
