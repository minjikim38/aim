// Funnel.js - Funnel Analysis and Keyword Clouds

function generateScoreSummary() {
    const scores = getAverageScoreByFunnel();
    const cards = document.querySelectorAll('.funnel-score-card');
    
    cards.forEach((card, index) => {
        const funnelNames = ['인지', '탐색', '의도', '유입', '확산'];
        const score = scores[funnelNames[index]];
        card.querySelector('.score-value').textContent = parseFloat(score).toFixed(1);
    });
}

function generateFunnelTable() {
    const tbody = document.getElementById('funnelTableBody');
    tbody.innerHTML = '';

    const months = [...new Set(globalData.keywords.keywords.map(k => k.month))].sort();
    const funnels = ['인지', '탐색', '의도', '유입', '확산'];

    months.forEach(month => {
        const row = document.createElement('tr');
        row.innerHTML = `<td><strong>${getMonthLabel(month)}</strong></td>`;

        funnels.forEach(funnel => {
            const filtered = globalData.keywords.keywords.filter(k => k.month === month && k.funnel === funnel);
            const avg = filtered.length > 0 
                ? (filtered.reduce((sum, k) => sum + k.aim_score, 0) / filtered.length).toFixed(1)
                : 0;
            
            const cellClass = avg >= 80 ? 'score-high' : avg >= 60 ? 'score-mid' : 'score-low';
            row.innerHTML += `<td class="${cellClass}">${avg}</td>`;
        });

        tbody.appendChild(row);
    });

    // Add CSS classes if not already in style.css
    addFunnelTableStyles();
}

function addFunnelTableStyles() {
    if (!document.getElementById('funnelTableStyles')) {
        const style = document.createElement('style');
        style.id = 'funnelTableStyles';
        style.textContent = `
            .score-high {
                background-color: #c8e6c9 !important;
                color: #1b5e20;
                font-weight: 600;
            }
            .score-mid {
                background-color: #fff9c4 !important;
                color: #f57f17;
                font-weight: 600;
            }
            .score-low {
                background-color: #ffccbc !important;
                color: #bf360c;
                font-weight: 600;
            }
        `;
        document.head.appendChild(style);
    }
}

function generateKeywordClouds() {
    const funnels = ['인지', '탐색', '의도', '유입', '확산'];
    const cloudIds = ['awareness', 'exploration', 'intention', 'traffic', 'spread'];
    const colors = ['#64b5f6', '#81c784', '#ffb74d', '#e57373', '#ba68c8'];

    funnels.forEach((funnel, index) => {
        const canvasId = `cloud-${cloudIds[index]}`;
        const canvas = document.getElementById(canvasId);
        
        if (!canvas) return;

        const keywords = getKeywordsByFunnel(funnel);
        
        // Use WordCloud2.js if available, otherwise fallback to simple list
        if (window.WordCloud) {
            generateWordCloud(canvasId, keywords, colors[index]);
        } else {
            generateKeywordList(canvasId, keywords, colors[index]);
        }
    });
}

function generateWordCloud(canvasId, keywords, color) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    
    // Simple word cloud visualization
    const size = 100;
    const maxSize = 40;
    const minSize = 10;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${minSize}px Pretendard`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const itemsToShow = Math.min(10, keywords.length);
    keywords.slice(0, itemsToShow).forEach((keyword, index) => {
        const fontSize = minSize + (keyword.weight / 100) * (maxSize - minSize);
        ctx.font = `bold ${fontSize}px Pretendard`;
        ctx.fillStyle = color;
        
        const x = (index % 2 === 0) ? canvas.width * 0.3 : canvas.width * 0.7;
        const y = (index * 30) % canvas.height + 50;
        
        ctx.fillText(keyword.text, x, y);
    });
}

function generateKeywordList(canvasId, keywords, color) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '13px Pretendard';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const itemsToShow = Math.min(8, keywords.length);
    keywords.slice(0, itemsToShow).forEach((keyword, index) => {
        const y = 20 + index * 25;
        
        // Draw background
        ctx.fillStyle = color + '20';
        ctx.fillRect(10, y - 5, canvas.width - 20, 20);
        
        // Draw text
        ctx.fillStyle = '#212121';
        ctx.fillText(keyword.text, 15, y);
        
        // Draw weight indicator
        ctx.fillStyle = color;
        ctx.fillRect(canvas.width - 50, y, keyword.weight / 2, 8);
    });
}
