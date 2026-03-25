import { db, collection, onSnapshot } from './firebase-config.js';

let chartDaily = null;
let chartRatio = null;
let chartBins = null;

const generateMockHistory = () => {
  const dates = [];
  const amounts = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
    amounts.push(Math.floor(Math.random() * 200) + 100);
  }
  return { dates, amounts };
};

const initAnalytics = () => {
  onSnapshot(collection(db, 'bins'), (snapshot) => {
    const bins = [];
    snapshot.forEach(doc => bins.push({ id: doc.id, ...doc.data() }));
    processChartData(bins);
  });
};

const processChartData = (bins) => {
  if (!bins || bins.length === 0) return;

  let wetCount = 0;
  let dryCount = 0;
  
  const binNames = [];
  const binFills = [];

  bins.sort((a,b) => b.fillLevel - a.fillLevel).forEach(bin => {
    if (bin.type === 'Wet') wetCount++;
    else dryCount++;
    
    if (binNames.length < 5) {
      binNames.push(bin.location.substring(0, 15)); // Shorten names
      binFills.push(Math.round(bin.fillLevel));
    }
  });

  renderPieChart(wetCount, dryCount);
  renderBarChart(binNames, binFills);
  
  if (!chartDaily) {
    const mockData = generateMockHistory();
    renderLineChart(mockData.dates, mockData.amounts);
  }

  updateInsights(wetCount, dryCount, bins);
};

const updateInsights = (wetCount, dryCount, bins) => {
  const total = wetCount + dryCount;
  const dryPercent = total > 0 ? Math.round((dryCount/total)*100) : 0;
  
  const insight1 = document.getElementById('insight-text-1');
  const insight2 = document.getElementById('insight-text-2');
  
  if(insight1) insight1.textContent = `Dry waste makes up ${dryPercent}% of total bins tracked.`;
  
  let maxBin = bins[0]; 
  bins.forEach(b => { if(b.fillLevel > maxBin.fillLevel) maxBin = b; });
  
  if(insight2) {
    if(maxBin && maxBin.fillLevel > 50) {
      insight2.textContent = `Most active area: ${maxBin.location} is at ${Math.round(maxBin.fillLevel)}% capacity.`;
    } else {
      insight2.textContent = `Waste levels are currently optimal across campus.`;
    }
  }
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: '#e2e8f0' } } },
  scales: {
    x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
  }
};

const renderLineChart = (labels, data) => {
  const ctx = document.getElementById('chart-daily');
  if(!ctx) return;
  if(chartDaily) chartDaily.destroy();
  chartDaily = new Chart(ctx.getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Total Collected (kg)',
        data,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    },
    options: chartOptions
  });
};

const renderPieChart = (wet, dry) => {
  const ctx = document.getElementById('chart-ratio');
  if(!ctx) return;
  if(chartRatio) chartRatio.destroy();
  chartRatio = new Chart(ctx.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: ['Wet Waste', 'Dry Waste'],
      datasets: [{
        data: [wet, dry],
        backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)'],
        borderColor: ['#3b82f6', '#10b981'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { color: '#e2e8f0', padding: 20 } } },
      cutout: '70%'
    }
  });
};

const renderBarChart = (labels, data) => {
  const ctx = document.getElementById('chart-bins');
  if(!ctx) return;
  if(chartBins) chartBins.destroy();
  chartBins = new Chart(ctx.getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Current Fill Level (%)',
        data,
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: '#f59e0b',
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: chartOptions
  });
};

document.addEventListener('DOMContentLoaded', initAnalytics);
