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
        showErrorMessage('데이터 로딩 실패');
    });
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'color: red; padding: 20px; text-align: center; font-weight: bold;';
    errorDiv.textContent = message;
    document.querySelector('.report-content').insertBefore(errorDiv, document.querySelector('.report-content').firstChild);
}

// Main report generation
function generateReport() {
    if (!globalData.keywords) return;

    const includeCreative = document.getElementById('includeCreative').checked;
    const includeCampaign = document.getElementById('includeCampaign').checked;
    const includeCompetitor = document.getElementById('includeCompetitor').checked;

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

// Export functions for use in other modules
window.globalData = globalData;
window.getAverageScoreByFunnel = getAverageScoreByFunnel;
window.getAverageScoreByMonth = getAverageScoreByMonth;
window.getKeywordsByFunnel = getKeywordsByFunnel;
window.getMonthLabel = getMonthLabel;
