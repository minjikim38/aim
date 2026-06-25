// Chart.js - 세련된 디자인 및 범용적 분석 로직
let monthlyChartInstance = null;

function generateMonthlyChart() {
    const monthlyScores = getAverageScoreByMonth();
    const months = Object.keys(monthlyScores).sort();
    const scores = months.map(m => parseFloat(monthlyScores[m]));
    const monthLabels = months.map(m => getMonthLabel(m));

    const ctx = document.getElementById('monthlyChart').getContext('2d');
    
    if (monthlyChartInstance) monthlyChartInstance.destroy();

    // 현대적인 파스텔톤 컬러 팔레트 적용
    const colors = scores.map(s => s >= 80 ? '#4338CA' : s >= 60 ? '#6366F1' : '#94A3B8');

    monthlyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthLabels,
            datasets: [{
                label: 'AIM 종합 점수',
                data: scores,
                backgroundColor: colors,
                borderRadius: 8,
                barThickness: 30
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { 
                    backgroundColor: '#1E293B',
                    padding: 12,
                    cornerRadius: 8 
                }
            },
            scales: {
                y: { beginAtZero: true, max: 100, grid: { color: '#F1F5F9' } },
                x: { grid: { display: false } }
            }
        }
    });

    // 클릭 이벤트
    document.getElementById('monthlyChart').onclick = (e) => {
        const points = monthlyChartInstance.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
        if (points.length) showMonthIssue(months[points[0].index], scores[points[0].index]);
    };
}

// 범용적 AI 분석 로직 (하드코딩 제거)
function analyzeMonthIssue(month, score) {
    const monthKeywords = globalData.keywords.keywords.filter(k => k.month === month);
    const topKeyword = monthKeywords.sort((a, b) => b.search_volume - a.search_volume)[0];
    
    // 데이터 기반의 동적 분석
    let analysis = `<strong>${getMonthLabel(month)} 성과 요약</strong><br><br>`;
    analysis += `이 달의 AIM 점수는 <strong>${score}점</strong>입니다. <br>`;
    analysis += topKeyword ? `가장 주목받은 키워드는 <strong>'${topKeyword.keyword}'</strong>이며, ` : `관련 데이터 분석 결과, `;
    
    if (score >= 80) analysis += `매우 높은 성과를 보이고 있습니다. 현재 마케팅 전략이 시장 수요와 완벽하게 일치합니다.`;
    else if (score >= 60) analysis += `안정적인 흐름을 유지하고 있습니다. 특정 퍼널의 효율을 높이면 더 큰 성장이 가능합니다.`;
    else analysis += `시장 반응이 다소 낮습니다. 소재 변화나 프로모션 전략 수정이 필요한 시점입니다.`;
    
    return analysis;
}

function showMonthIssue(month, score) {
    const popup = document.getElementById('issuePopup');
    const content = document.getElementById('issueContent');
    content.innerHTML = analyzeMonthIssue(month, score);
    popup.style.display = 'block';
    
    popup.querySelector('.close-btn').onclick = () => popup.style.display = 'none';
}
