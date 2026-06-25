// Campaign.js - Campaign Performance Analysis

function generateCampaignAnalysis() {
    if (!globalData.campaign || !globalData.campaign.campaigns) {
        document.getElementById('campaignAnalysis').innerHTML = '<p>캠페인 데이터가 없습니다.</p>';
        return;
    }

    const campaigns = globalData.campaign.campaigns;
    
    // Calculate metrics
    let html = '<div class="campaign-metrics">';

    // Total metrics
    const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
    const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
    const avgCTR = (totalClicks / totalImpressions * 100).toFixed(2);
    const avgCVR = (totalConversions / totalClicks * 100).toFixed(2);

    const metrics = [
        { label: '총 노출', value: (totalImpressions / 1000000).toFixed(1), unit: 'M' },
        { label: '총 클릭', value: (totalClicks / 1000).toFixed(0), unit: 'K' },
        { label: '평균 CTR', value: avgCTR, unit: '%' },
        { label: '총 전환', value: totalConversions.toLocaleString(), unit: '건' },
        { label: '평균 CVR', value: avgCVR, unit: '%' },
        { label: '평균 ROAS', value: (campaigns.reduce((sum, c) => sum + c.roas, 0) / campaigns.length).toFixed(0), unit: '배' }
    ];

    metrics.forEach(metric => {
        html += `
            <div class="metric-card">
                <h4>${metric.label}</h4>
                <div class="value">${metric.value}</div>
                <div class="unit">${metric.unit}</div>
            </div>
        `;
    });

    html += '</div>';

    // Campaign type performance
    const performanceData = campaigns.map(c => ({
        month: getMonthLabel(c.month),
        type: c.type === 'performance' ? '성과' : '인지',
        ctr: c.ctr.toFixed(2),
        cvr: c.cvr.toFixed(2),
        roas: c.roas
    }));

    html += `
        <h3 style="color: #1e88e5; font-size: 18px; margin: 30px 0 15px 0; border-bottom: 2px solid #1e88e5; padding-bottom: 10px;">월별 캠페인 성과</h3>
        <div style="overflow-x: auto;">
            <table class="comparison-table" style="font-size: 13px;">
                <thead>
                    <tr>
                        <th>월</th>
                        <th>캠페인 유형</th>
                        <th>CTR (%)</th>
                        <th>CVR (%)</th>
                        <th>ROAS (배)</th>
                    </tr>
                </thead>
                <tbody>
    `;

    performanceData.forEach(data => {
        html += `
            <tr>
                <td><strong>${data.month}</strong></td>
                <td>${data.type}</td>
                <td>${data.ctr}</td>
                <td>${data.cvr}</td>
                <td><strong>${data.roas}</strong></td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    // Performance insights
    const perfCampaigns = campaigns.filter(c => c.type === 'performance');
    const awarenessCampaigns = campaigns.filter(c => c.type === 'awareness');
    
    const perfAvgROAS = (perfCampaigns.reduce((sum, c) => sum + c.roas, 0) / perfCampaigns.length).toFixed(0);
    const awareAvgCTR = (awarenessCampaigns.length > 0 
        ? awarenessCampaigns.reduce((sum, c) => sum + c.ctr, 0) / awarenessCampaigns.length 
        : 0).toFixed(2);

    html += `
        <div style="background-color: #f5f5f5; border-left: 5px solid #43a047; padding: 20px; border-radius: 4px; margin-top: 20px;">
            <h4 style="color: #43a047; margin-bottom: 10px;">📈 캠페인 성과 분석</h4>
            <p>성과 캠페인(Performance)의 평균 ROAS는 <strong>${perfAvgROAS}배</strong>로, 투자 대비 수익이 우수합니다.</p>
            ${awarenessCampaigns.length > 0 ? `<p>인지 캠페인(Awareness)의 평균 CTR은 <strong>${awareAvgCTR}%</strong>로, 클릭 유도 효율이 양호합니다.</p>` : ''}
            <p>특히 <strong>${getMonthLabel(campaigns.reduce((a, b) => a.roas > b.roas ? a : b).month)}</strong> 캠페인이 ROAS ${campaigns.reduce((a, b) => a.roas > b.roas ? a : b).roas}배로 최고 성과를 기록했습니다.</p>
        </div>
    `;

    document.getElementById('campaignAnalysis').innerHTML = html;
}
