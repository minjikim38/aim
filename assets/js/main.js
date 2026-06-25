// Global data storage
let globalData = {
    keywords: null,
    campaign: null,
    creative: null,
    competitor: null
};

let currentChart = null;

// Initialize report on load
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('generateReport').addEventListener('click', generateReport);
    document.getElementById('includeCreative').addEventListener('change', handleCheckboxChange);
    document.getElementById('includeCampaign').addEventListener('change', handleCheckboxChange);
    document.getElementById('includeCompetitor').addEventListener('change', handleCheckboxChange);
}

function handleCheckboxChange() {
    updateReportSections();
}

function updateReportSections() {
    const includeCreative = document.getElementById('includeCreative').checked;
    const includeCampaign = document.getElementById('includeCampaign').checked;
    const includeCompetitor = document.getElementById('includeCompetitor').checked;

    document.getElementById('creativeSection').style.display = includeCreative ? 'block' : 'none';
    document.getElementById('campaignSection').style.display = includeCampaign ? 'block' : 'none';
    document.getElementById('competitorSection').style.display = includeCompetitor ? 'block' : 'none';

    generateReport();
}

// Load data from JSON files
function loadData() {
    Promise.all([
        fetch('data/sample_keywords.json').then(r => r.json()),
        fetch('data/sample_campaign.json').then(r => r.json()),
        fetch('data/sample_creative.json').then(r => r.json()),
        fetch('data/sample_competitor.json').then(r => r.json())
    ]).then(([keywords, campaign, creative, competitor]) => {
        globalData.keywords = keywords;
        globalData.campaign = campaign;
        globalData.creative = creative;
        globalData.competitor = competitor;
        generateReport();
    }).catch(err => {
        console.error('Error loading data:', err);
        showErrorMessage('데이터 로딩 실패: ' + err.message);
    });
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'color: #EF4444; padding: 20px; text-align: center; font-weight: bold; background-color: #FEE2E2; border-radius: 8px; margin-bottom: 20px;';
    errorDiv.textContent = message;
    document.querySelector('.report-content').insertBefore(errorDiv, document.querySelector('.report-content').firstChild);
}

// Main report generation
function generateReport() {
    if (!globalData.keywords) return;

    const includeCreative = document.getElementById('includeCreative').checked;
    const includeCampaign = document.getElementById('includeCampaign').checked;
    const includeCompetitor = document.getElementById('includeCompetitor').checked;

    try {
        // Generate each section
        generateScoreSummary();
        generateMonthlyChart();
        generateFunnelTable();
        generateKeywordClouds();
        
        if (includeCreative && globalData.creative) {
            generateCreativeAnalysis();
        }
        
        if (includeCampaign && globalData.campaign) {
            generateCampaignAnalysis();
        }
        
        if (includeCompetitor && globalData.competitor) {
            generateCompetitorAnalysis();
        }
        
        generateInsights();
        generateActionPlan();
    } catch (err) {
        console.error('Error generating report:', err);
        showErrorMessage('리포트 생성 중 오류 발생: ' + err.message);
    }
}

// Calculate average AIM score for each funnel
function getAverageScoreByFunnel() {
    const funnels = ['인지', '탐색', '의도', '유입', '확산'];
    const scores = {};

    funnels.forEach(funnel => {
        const filtered = globalData.keywords.keywords.filter(k => k.funnel === funnel);
        const avg = filtered.length > 0 
            ? (filtered.reduce((sum, k) => sum + k.aim_score, 0) / filtered.length).toFixed(1)
            : 0;
        scores[funnel] = avg;
    });

    return scores;
}

// Get average AIM score by month
function getAverageScoreByMonth() {
    const months = [];
    const monthData = {};

    globalData.keywords.keywords.forEach(keyword => {
        if (!months.includes(keyword.month)) {
            months.push(keyword.month);
        }
        if (!monthData[keyword.month]) {
            monthData[keyword.month] = [];
        }
        monthData[keyword.month].push(keyword.aim_score);
    });

    const result = {};
    months.sort().forEach(month => {
        const avgScore = (monthData[month].reduce((a, b) => a + b, 0) / monthData[month].length).toFixed(1);
        result[month] = avgScore;
    });

    return result;
}

// Get keywords for cloud by funnel
function getKeywordsByFunnel(funnel) {
    const keywords = globalData.keywords.keywords
        .filter(k => k.funnel === funnel)
        .sort((a, b) => b.aim_score - a.aim_score)
        .slice(0, 15);

    return keywords.map(k => ({
        text: k.keyword,
        weight: Math.min(100, Math.max(10, k.aim_score / 100 * 50))
    }));
}

// Helper: Get month label
function getMonthLabel(monthStr) {
    const [year, month] = monthStr.split('-');
    return month + '월';
}

// Placeholder functions for extended sections (will be implemented separately)
function generateCreativeAnalysis() {
    const container = document.getElementById('creativeAnalysis');
    let html = '<div class="creative-grid">';
    
    if (globalData.creative && globalData.creative.creatives) {
        globalData.creative.creatives.forEach(creative => {
            html += `<div class="creative-card">
                <h4>${creative.title}</h4>
                <p>타입: ${creative.type}</p>
                <div><span class="creative-badge">CTR: ${creative.ctr}%</span><span class="creative-badge">전환율: ${creative.conversion_rate}%</span></div>
                <p style="font-size: 12px; color: #64748B; margin-top: 8px;">노출: ${creative.impressions.toLocaleString()} | 클릭: ${creative.clicks.toLocaleString()}</p>
            </div>`;
        });
    }
    html += '</div>';
    container.innerHTML = html;
}

function generateCampaignAnalysis() {
    const container = document.getElementById('campaignAnalysis');
    let html = '<div class="campaign-metrics">';
    
    if (globalData.campaign && globalData.campaign.campaigns) {
        globalData.campaign.campaigns.forEach(campaign => {
            const roi = ((campaign.revenue - campaign.budget) / campaign.budget * 100).toFixed(1);
            html += `<div class="metric-card">
                <h4>${campaign.name}</h4>
                <div class="value">${(campaign.revenue / 1000000).toFixed(1)}<span class="unit">M</span></div>
                <p style="font-size: 12px; color: #CBD5E1; margin-top: 12px;">ROI: ${roi}% | 전환: ${campaign.conversions.toLocaleString()}</p>
            </div>`;
        });
    }
    html += '</div>';
    container.innerHTML = html;
}

function generateCompetitorAnalysis() {
    const container = document.getElementById('competitorAnalysis');
    let html = '<div class="funnel-table-wrapper"><table class="comparison-table"><thead><tr><th>경쟁사</th><th>시장점유율</th><th>AIM 점수</th><th>캠페인 수</th><th>콘텐츠 품질</th></tr></thead><tbody>';
    
    if (globalData.competitor && globalData.competitor.competitors) {
        globalData.competitor.competitors.forEach(comp => {
            const scoreClass = comp.aim_score >= 80 ? 'score-higher' : 'score-lower';
            html += `<tr><td style="font-weight: 600;">${comp.name}</td><td>${comp.market_share}%</td><td class="${scoreClass}">${comp.aim_score}</td><td>${comp.campaigns_count}</td><td>${comp.content_quality}</td></tr>`;
        });
    }
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function generateInsights() {
    const container = document.getElementById('insights');
    const insights = [
        '현재 마케팅 캠페인의 성과가 지속적으로 증가하고 있습니다.',
        '의도 단계의 키워드 성과가 특히 우수합니다.',
        '경쟁사 대비 시장 점유율이 높아지는 추세입니다.',
        '콘텐츠 마케팅 효율이 개선되었습니다.'
    ];
    
    let html = '<div class="insights-container">';
    insights.forEach(insight => {
        html += `<div class="insight-item"><h4>📊 인사이트</h4><p>${insight}</p></div>`;
    });
    html += '</div>';
    container.innerHTML = html;
}

function generateActionPlan() {
    const container = document.getElementById('actionPlan');
    const actions = [
        {
            title: '1단계: 키워드 최적화',
            desc: '상위 성과 키워드에 집중 투자하기'
        },
        {
            title: '2단계: 콘텐츠 강화',
            desc: '의도 단계 타겟 콘텐츠 개발'
        },
        {
            title: '3단계: 채널 확대',
            desc: '신규 채널 테스트 및 성과 모니터링'
        }
    ];
    
    let html = '<div class="action-plan-container">';
    actions.forEach(action => {
        html += `<div class="action-item"><h4>${action.title}</h4><p>${action.desc}</p></div>`;
    });
    html += '</div>';
    container.innerHTML = html;
}

// Export functions for use in other modules
window.globalData = globalData;
window.getAverageScoreByFunnel = getAverageScoreByFunnel;
window.getAverageScoreByMonth = getAverageScoreByMonth;
window.getKeywordsByFunnel = getKeywordsByFunnel;
window.getMonthLabel = getMonthLabel;
window.generateReport = generateReport;