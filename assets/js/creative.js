// Creative.js - Creative Analysis

function generateCreativeAnalysis() {
    if (!globalData.creative || !globalData.creative.creatives) {
        document.getElementById('creativeAnalysis').innerHTML = '<p>소재 데이터가 없습니다.</p>';
        return;
    }

    const creatives = globalData.creative.creatives;
    
    // Group by funnel
    const funnelGroups = {
        '인지': [],
        '탐색': [],
        '의도': [],
        '유입': [],
        '확산': []
    };

    creatives.forEach(creative => {
        if (funnelGroups[creative.funnel_target]) {
            funnelGroups[creative.funnel_target].push(creative);
        }
    });

    let html = '<div style="margin-bottom: 30px;">';

    Object.keys(funnelGroups).forEach(funnel => {
        if (funnelGroups[funnel].length > 0) {
            html += `<h3 style="color: #1e88e5; font-size: 18px; margin: 20px 0 15px 0; border-bottom: 2px solid #1e88e5; padding-bottom: 10px;">${funnel} 단계 소재</h3>`;
            html += '<div class="creative-grid">';

            funnelGroups[funnel].forEach(creative => {
                const ctr = (creative.ctr || 0).toFixed(2);
                const typeLabel = {
                    'image': '이미지',
                    'video': '영상',
                    'banner': '배너'
                }[creative.type] || creative.type;

                html += `
                    <div class="creative-card">
                        <h4>${creative.name}</h4>
                        <p><strong>유형:</strong> ${typeLabel}</p>
                        <p><strong>월:</strong> ${getMonthLabel(creative.month)}</p>
                        <p><strong>노출:</strong> ${(creative.impressions / 1000000).toFixed(1)}M</p>
                        <p><strong>클릭:</strong> ${(creative.clicks / 1000).toFixed(0)}K</p>
                        <p><strong>CTR:</strong> ${ctr}%</p>
                        <div>
                            <span class="creative-badge">${typeLabel}</span>
                            <span class="creative-badge">${funnel}</span>
                        </div>
                        <div style="margin-top: 10px; font-size: 12px; color: #666;">
                            <strong>포함 키워드:</strong><br/>
                            ${creative.keywords_included.slice(0, 3).join(', ')}
                        </div>
                    </div>
                `;
            });

            html += '</div>';
        }
    });

    html += '</div>';

    // Add summary
    const topCreative = creatives.sort((a, b) => b.ctr - a.ctr)[0];
    html += `
        <div style="background-color: #f5f5f5; border-left: 5px solid #fb8c00; padding: 20px; border-radius: 4px; margin-top: 20px;">
            <h4 style="color: #fb8c00; margin-bottom: 10px;">📊 소재 성과 요약</h4>
            <p>최고 성과 소재는 <strong>"${topCreative.name}"</strong>로 CTR ${topCreative.ctr.toFixed(2)}%를 기록했습니다.</p>
            <p>전체 소재 ${creatives.length}개 중 <strong>${creatives.filter(c => c.ctr >= 4).length}개</strong>가 CTR 4% 이상의 우수 성과를 보였습니다.</p>
        </div>
    `;

    document.getElementById('creativeAnalysis').innerHTML = html;
}
