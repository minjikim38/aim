// Insight.js - AI Insights and Analysis

function generateInsights() {
    const insightsContainer = document.getElementById('insights');
    const insights = analyzeData();
    
    let html = '';
    insights.forEach((insight, index) => {
        html += `
            <div class="insight-item">
                <h4>🔍 인사이트 ${index + 1}</h4>
                <p>${insight}</p>
            </div>
        `;
    });

    insightsContainer.innerHTML = html;
}

function generateActionPlan() {
    const actionPlanContainer = document.getElementById('actionPlan');
    const actions = generateActions();
    
    let html = '';
    actions.forEach(action => {
        let bulletPoints = '';
        if (action.details && Array.isArray(action.details)) {
            bulletPoints = action.details.map(d => `<li>${d}</li>`).join('');
        }

        html += `
            <div class="action-item">
                <h4>→ ${action.funnel}: ${action.title}</h4>
                <p>${action.description}</p>
                ${bulletPoints ? `<ul>${bulletPoints}</ul>` : ''}
            </div>
        `;
    });

    actionPlanContainer.innerHTML = html;
}

function analyzeData() {
    const insights = [];
    const scores = getAverageScoreByFunnel();
    const monthlyScores = getAverageScoreByMonth();
    const keywords = globalData.keywords.keywords;

    // Insight 1: Overall trend
    const months = Object.keys(monthlyScores).sort();
    const firstMonthScore = parseFloat(monthlyScores[months[0]]);
    const lastMonthScore = parseFloat(monthlyScores[months[months.length - 1]]);
    const trend = lastMonthScore > firstMonthScore ? '상승' : '하락';
    const trendPercent = ((lastMonthScore - firstMonthScore) / firstMonthScore * 100).toFixed(1);
    
    insights.push(`📈 연간 추이: AIM 점수가 ${firstMonthScore}에서 ${lastMonthScore}로 ${trend}했습니다 (${Math.abs(trendPercent)}% 변화). 이는 브랜드 검색 수요의 ${trend === '상승' ? '증가' : '감소'} 추세를 의미합니다.`);

    // Insight 2: Strongest and weakest funnel
    const funnelScores = Object.entries(scores).map(([k, v]) => ({ funnel: k, score: parseFloat(v) }));
    const strongest = funnelScores.sort((a, b) => b.score - a.score)[0];
    const weakest = funnelScores.sort((a, b) => a.score - b.score)[0];
    
    insights.push(`🎯 퍼널 분석: ${strongest.funnel} 단계가 가장 강력(${strongest.score})하며, ${weakest.funnel} 단계가 가장 취약(${weakest.score})합니다. ${weakest.funnel} 단계 강화가 필요합니다.`);

    // Insight 3: Peak and trough month
    const monthScores = Object.entries(monthlyScores).map(([k, v]) => ({ month: k, score: parseFloat(v) }));
    const peakMonth = monthScores.sort((a, b) => b.score - a.score)[0];
    const troughMonth = monthScores.sort((a, b) => a.score - b.score)[0];
    
    insights.push(`📊 계절성: ${getMonthLabel(peakMonth.month)}(${peakMonth.score})에 최고점을 기록했고, ${getMonthLabel(troughMonth.month)}(${troughMonth.score})에 최저점을 기록했습니다. 블랙프라이데이 등 특정 이벤트의 영향이 분명합니다.`);

    // Insight 4: Search volume trends
    const highVolumeKeywords = keywords
        .sort((a, b) => b.search_volume - a.search_volume)
        .slice(0, 5);
    const avgVolume = keywords.reduce((sum, k) => sum + k.search_volume, 0) / keywords.length;
    
    insights.push(`🔍 검색 수요: 월평균 검색량은 ${Math.round(avgVolume).toLocaleString()}건입니다. 상위 키워드는 "${highVolumeKeywords[0].keyword}" 등으로, 브랜드명과 비교/추천 관련 키워드가 높은 수요를 보입니다.`);

    // Insight 5: Conversion readiness
    const conversionKeywords = keywords.filter(k => k.funnel === '의도');
    const conversionScore = conversionKeywords.length > 0 
        ? (conversionKeywords.reduce((sum, k) => sum + k.aim_score, 0) / conversionKeywords.length).toFixed(1)
        : 0;
    
    insights.push(`💰 전환 준비도: 의도 퍼널 점수가 ${conversionScore}로, 구매 의향이 있는 사용자 집단이 충분히 형성되어 있습니다. 이들을 대상으로 한 타겟 캠페인이 효과적일 것으로 예상됩니다.`);

    return insights;
}

function generateActions() {
    const scores = getAverageScoreByFunnel();
    const funnels = ['인지', '탐색', '의도', '유입', '확산'];
    const actions = [];

    funnels.forEach(funnel => {
        const score = parseFloat(scores[funnel]);
        let action = {};

        if (funnel === '인지') {
            action = {
                funnel: '인지',
                title: '브랜드 인지도 확대',
                description: `현재 인지도 점수는 ${score}입니다. 더 넓은 오디언스에 도달하기 위해 아래 전략을 추진하세요.`,
                details: [
                    '카테고리 일반어(스킨케어 추천 등) 타겟 디스플레이 광고 확대',
                    '브랜드 신제품/이벤트 중심의 소셜미디어 캠페인 강화',
                    '인플루언서 협업을 통한 자연스러운 노출 확대'
                ]
            };
        } else if (funnel === '탐색') {
            action = {
                funnel: '탐색',
                title: '고객 비교 검토 지원',
                description: `탐색도 점수는 ${score}입니다. 경쟁사와의 비교 단계에서 차별화를 강조하세요.`,
                details: [
                    '비교 키워드(vs 경쟁사) 대상 유료검색 광고 강화',
                    '상세한 제품 비교 페이지 및 콘텐츠 제작',
                    '고객 리뷰 및 평점 최적화'
                ]
            };
        } else if (funnel === '의도') {
            action = {
                funnel: '의도',
                title: '구매 전환 최적화',
                description: `구매 의도 점수는 ${score}입니다. 전환율 극대화에 집중하세요.`,
                details: [
                    '구매, 할인, 가격 관련 키워드 검색광고 강화',
                    '프로모션 및 할인 이벤트 타이밍 최적화',
                    '장바구니 이탈율 감소 및 체크아웃 프로세스 개선'
                ]
            };
        } else if (funnel === '유입') {
            action = {
                funnel: '유입',
                title: '공식채널 유입 확대',
                description: `유입 점수는 ${score}입니다. 공식 채널로의 직접 유입을 더욱 강화하세요.`,
                details: [
                    '공식몰/공식사이트 키워드 SEO 최적화',
                    '브래디드 검색광고 예산 증대',
                    '원터치 다운로드 및 앱 설치 유도'
                ]
            };
        } else if (funnel === '확산') {
            action = {
                funnel: '확산',
                title: '고객 후기 및 바이럴 확대',
                description: `확산도 점수는 ${score}입니다. 사용자 생성 콘텐츠를 더욱 장려하세요.`,
                details: [
                    '사용자 후기/인증샷 UGC 캠페인 강화',
                    '포인트/리워드 시스템을 통한 리뷰 유도',
                    '소셜 플랫폼에서의 바이럴 마케팅 강화'
                ]
            };
        }

        if (action.funnel) {
            actions.push(action);
        }
    });

    return actions;
}
