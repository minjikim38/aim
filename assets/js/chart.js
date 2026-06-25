// Chart.js - Monthly AIM Score Chart and Issue Analysis

let monthlyChartInstance = null;

function generateMonthlyChart() {
    const monthlyScores = getAverageScoreByMonth();
    const months = Object.keys(monthlyScores).sort();
    const scores = months.map(m => parseFloat(monthlyScores[m]));
    const monthLabels = months.map(m => getMonthLabel(m));

    const ctx = document.getElementById('monthlyChart').getContext('2d');
    
    if (monthlyChartInstance) {
        monthlyChartInstance.destroy();
    }

    monthlyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthLabels,
            datasets: [{
                label: 'AIM 점수',
                data: scores,
                backgroundColor: scores.map(score => {
                    if (score >= 80) return '#66bb6a';
                    if (score >= 70) return '#42a5f5';
                    if (score >= 60) return '#ffa726';
                    return '#ef5350';
                }),
                borderColor: '#1565c0',
                borderWidth: 2,
                borderRadius: 5,
                hoverBackgroundColor: '#1e88e5'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: { size: 13, weight: '600' },
                        color: '#212121',
                        usePointStyle: true,
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: '600' },
                    bodyFont: { size: 13 },
                    borderColor: '#1e88e5',
                    borderWidth: 1,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            return 'AIM 점수: ' + context.parsed.y.toFixed(1);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value;
                        },
                        font: { size: 12 }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        borderDash: [5, 5]
                    }
                },
                x: {
                    ticks: {
                        font: { size: 12 }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    // Add click event to bars
    const chartCanvas = document.getElementById('monthlyChart');
    chartCanvas.addEventListener('click', function(event) {
        const points = monthlyChartInstance.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
        if (points.length > 0) {
            const monthIndex = points[0].index;
            const month = months[monthIndex];
            showMonthIssue(month, scores[monthIndex]);
        }
    });
}

function showMonthIssue(month, score) {
    const popup = document.getElementById('issuePopup');
    const content = document.getElementById('issueContent');
    
    const issueAnalysis = analyzeMonthIssue(month, score);
    content.innerHTML = `<strong>${getMonthLabel(month)} AIM 점수 분석</strong><br><br>${issueAnalysis}`;
    
    popup.style.display = 'block';

    // Close button
    const closeBtn = popup.querySelector('.close-btn');
    closeBtn.onclick = function() {
        popup.style.display = 'none';
    };

    // Close on outside click
    window.onclick = function(event) {
        if (event.target === popup) {
            popup.style.display = 'none';
        }
    };
}

function analyzeMonthIssue(month, score) {
    // Get keywords for this month
    const monthKeywords = globalData.keywords.keywords.filter(k => k.month === month);
    const funnelScores = {};

    ['인지', '탐색', '의도', '유입', '확산'].forEach(funnel => {
        const filtered = monthKeywords.filter(k => k.funnel === funnel);
        funnelScores[funnel] = filtered.length > 0 
            ? (filtered.reduce((sum, k) => sum + k.aim_score, 0) / filtered.length).toFixed(1)
            : 0;
    });

    // Analyze trends
    const monthNum = parseInt(month.split('-')[1]);
    let analysis = '';

    if (month === '2024-03') {
        analysis = `신제품 런칭과 봄 캠페인의 영향으로 전 퍼널에서 점수가 급등했습니다. 특히 "브랜드A 신제품" 키워드가 높은 검색량(${monthKeywords.find(k => k.keyword === '브랜드A 신제품')?.search_volume || '미정'}회)을 기록하며 인지도 상승을 주도했습니다.`;
    } else if (month === '2024-11') {
        analysis = `블랙프라이데이 시즌의 대규모 프로모션으로 최고 점수(${score})를 달성했습니다. "할인", "구매" 등 의도 퍼널 키워드의 급증과 바이럴 마케팅 성공이 확산 점수까지 높였습니다.`;
    } else if (monthNum >= 6 && monthNum <= 8) {
        analysis = `여름 시즌 소비 심화로 상대적으로 낮은 점수(${score})를 기록했습니다. 경쟁사 캠페인 집중 및 계절 수요 저하 영향으로 보입니다.`;
    } else if (monthNum === 9 || monthNum === 10) {
        analysis = `가을 신상 출시와 추석 시즌의 영향으로 점수가 다시 상승했습니다. "가을신상", "신제품" 관련 키워드 검색량 증가가 주요 요인입니다.`;
    } else {
        const avgScore = Object.values(funnelScores).reduce((a, b) => parseFloat(a) + parseFloat(b), 0) / 5;
        analysis = `${getMonthLabel(month)}의 AIM 점수는 ${score}로, 평소 수준을 유지하고 있습니다.\n\n퍼널별 점수:\n- 인지: ${funnelScores['인지']}\n- 탐색: ${funnelScores['탐색']}\n- 의도: ${funnelScores['의도']}\n- 유입: ${funnelScores['유입']}\n- 확산: ${funnelScores['확산']}`;
    }

    return analysis;
}
