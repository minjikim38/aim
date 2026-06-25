// Competitor.js - Competitor Analysis

function generateCompetitorAnalysis() {
    if (!globalData.competitor || !globalData.competitor.competitors) {
        document.getElementById('competitorAnalysis').innerHTML = '<p>경쟁사 데이터가 없습니다.</p>';
        return;
    }

    const competitors = globalData.competitor.competitors;
    const myScores = getAverageScoreByFunnel();
    const funnels = ['인지', '탐색', '의도', '유입', '확산'];

    let html = '<h3 style="color: #1e88e5; font-size: 18px; margin: 20px 0 15px 0; border-bottom: 2px solid #1e88e5; padding-bottom: 10px;">퍼널별 경쟁사 비교</h3>';

    // Comparison table by funnel
    html += '<div style="overflow-x: auto; margin: 20px 0;">';
    html += `
        <table class="comparison-table">
            <thead>
                <tr>
                    <th>퍼널</th>
                    <th>우리 (브랜드A)</th>
    `;

    competitors.forEach(comp => {
        html += `<th>${comp.brand}</th>`;
    });

    html += `
                </tr>
            </thead>
            <tbody>
    `;

    funnels.forEach(funnel => {
        html += `<tr><td><strong>${funnel}</strong></td>`;
        
        // Our score
        const ourScore = parseFloat(myScores[funnel]);
        html += `<td><strong style="color: #1e88e5;">${ourScore.toFixed(1)}</strong></td>`;

        // Competitor scores
        competitors.forEach(competitor => {
            const compKeywords = competitor.keywords.filter(k => k.funnel === funnel);
            const compScore = compKeywords.length > 0 
                ? (compKeywords.reduce((sum, k) => sum + k.aim_score, 0) / compKeywords.length).toFixed(1)
                : '데이터 없음';
            
            const numScore = parseFloat(compScore);
            let className = '';
            if (!isNaN(numScore)) {
                className = numScore > ourScore ? 'score-lower' : 'score-higher';
            }

            html += `<td class="${className}">${compScore}</td>`;
        });

        html += '</tr>';
    });

    html += `
            </tbody>
        </table>
    </div>
    `;

    // Overall comparison
    const myAvgScore = Object.values(myScores).reduce((a, b) => parseFloat(a) + parseFloat(b), 0) / 5;
    const compAvgScores = competitors.map(comp => {
        const avgScore = Object.values(myScores).reduce((sum, key, idx) => {
            const funnelName = funnels[idx];
            const compKeywords = comp.keywords.filter(k => k.funnel === funnelName);
            const score = compKeywords.length > 0 
                ? compKeywords.reduce((s, k) => s + k.aim_score, 0) / compKeywords.length
                : 0;
            return sum + score;
        }, 0) / 5;
        return { brand: comp.brand, score: avgScore };
    });

    const ranking = [
        { brand: '브랜드A (우리)', score: myAvgScore, rank: 1 },
        ...compAvgScores.sort((a, b) => b.score - a.score).map((comp, idx) => ({ ...comp, rank: idx + 2 }))
    ].sort((a, b) => a.score - b.score);

    html += `
        <h3 style="color: #1e88e5; font-size: 18px; margin: 30px 0 15px 0; border-bottom: 2px solid #1e88e5; padding-bottom: 10px;">전체 순위</h3>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
    `;

    ranking.reverse().forEach((item, idx) => {
        const isOurs = item.brand === '브랜드A (우리)';
        const medal = ['🥇', '🥈', '🥉', ''][idx] || '';
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid #ddd; ${isOurs ? 'background-color: #e3f2fd; font-weight: 600;' : ''}">
                <span>${medal} ${item.rank}위 ${item.brand}</span>
                <span style="color: #1e88e5; font-size: 24px; font-weight: 700;">${item.score.toFixed(1)}</span>
            </div>
        `;
    });

    html += '</div>';

    // Opportunity analysis
    html += `
        <h3 style="color: #1e88e5; font-size: 18px; margin: 30px 0 15px 0; border-bottom: 2px solid #1e88e5; padding-bottom: 10px;">우위/열위 분석</h3>
    `;

    funnels.forEach(funnel => {
        const ourScore = parseFloat(myScores[funnel]);
        const bestCompScore = Math.max(...competitors.map(c => {
            const keywords = c.keywords.filter(k => k.funnel === funnel);
            return keywords.length > 0 
                ? keywords.reduce((sum, k) => sum + k.aim_score, 0) / keywords.length
                : 0;
        }));

        const advantage = ourScore >= bestCompScore ? '우위' : '열위';
        const diff = Math.abs(ourScore - bestCompScore).toFixed(1);
        const color = advantage === '우위' ? '#43a047' : '#e53935';

        html += `
            <div style="background-color: #f5f5f5; border-left: 5px solid ${color}; padding: 15px; border-radius: 4px; margin: 10px 0;">
                <strong style="color: ${color};">${funnel}: ${advantage} (${diff}점)</strong>
                <p style="margin: 5px 0; font-size: 13px; color: #666;">
                    우리 점수 ${ourScore.toFixed(1)} vs 최강 경쟁사 ${bestCompScore.toFixed(1)}
                </p>
            </div>
        `;
    });

    document.getElementById('competitorAnalysis').innerHTML = html;
}
