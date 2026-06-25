// Funnel.js - 세련된 퍼널 분석 및 워드클라우드

function generateScoreSummary() {
    const scores = getAverageScoreByFunnel();
    const cards = document.querySelectorAll('.funnel-score-card');
    
    cards.forEach((card, index) => {
        const funnelNames = ['인지', '탐색', '의도', '유입', '확산'];
        const score = scores[funnelNames[index]] || 0;
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
        row.innerHTML = `<td style="font-weight: 600; color: #475569;">${getMonthLabel(month)}</td>`;

        funnels.forEach(funnel => {
            const filtered = globalData.keywords.keywords.filter(k => k.month === month && k.funnel === funnel);
            const avg = filtered.length > 0 
                ? (filtered.reduce((sum, k) => sum + k.aim_score, 0) / filtered.length).toFixed(1)
                : 0;
            
            // 색상 등급별 처리를 CSS 클래스 대신 스타일로 더 세련되게 적용
            let bgColor = 'transparent';
            if (avg >= 80) bgColor = '#dcfce7'; // 세련된 연한 그린
            else if (avg >= 60) bgColor = '#fef9c3'; // 세련된 연한 옐로우
            else if (avg > 0) bgColor = '#fee2e2'; // 세련된 연한 레드
            
            row.innerHTML += `<td style="background-color: ${bgColor}; border-radius: 6px;">${avg}</td>`;
        });
        tbody.appendChild(row);
    });
}

function generateKeywordClouds() {
    const funnels = ['인지', '탐색', '의도', '유입', '확산'];
    const cloudIds = ['awareness', 'exploration', 'intention', 'traffic', 'spread'];
    
    // 세련된 파스텔톤 컬러 팔레트
    const colors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];

    funnels.forEach((funnel, index) => {
        const canvasId = `cloud-${cloudIds[index]}`;
        const keywords = getKeywordsByFunnel(funnel);
        
        if (keywords.length === 0) return;

        // WordCloud2.js 적용
        WordCloud(document.getElementById(canvasId), {
            list: keywords.map(k => [k.text, k.weight]),
            fontFamily: 'Paperlogy, sans-serif',
            color: colors[index],
            weightFactor: 0.8,
            gridSize: 10,
            rotationSteps: 2,
            rotateRatio: 0.2,
            backgroundColor: 'transparent',
            shuffle: true,
            minRotation: -Math.PI / 8,
            maxRotation: Math.PI / 8,
            shape: 'circle',
            ellipticity: 0.65
        });
    });
}
