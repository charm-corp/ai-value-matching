// 가치관 분석 테스트 - 4060세대 특화 질문들
const questions = [
  {
    id: 1,
    text: '인생에서 가장 중요하다고 생각하는 것은 무엇인가요?',
    description: '당신의 핵심 가치관을 알려주세요.',
    options: [
      {
        text: '가족과의 화목한 관계',
        description: '가족의 행복이 나의 행복입니다',
        values: { family: 3, stability: 2, tradition: 2 },
      },
      {
        text: '경제적 안정과 풍요',
        description: '물질적 여유로운 삶을 추구합니다',
        values: { stability: 3, practical: 2, independence: 1 },
      },
      {
        text: '개인의 성장과 자아실현',
        description: '끊임없는 자기계발과 도전을 중시합니다',
        values: { growth: 3, independence: 2, adventure: 1 },
      },
      {
        text: '건강하고 평온한 일상',
        description: '몸과 마음의 건강이 최우선입니다',
        values: { health: 3, stability: 2, simplicity: 1 },
      },
    ],
  },
  {
    id: 2,
    text: '이상적인 주말 보내는 방법은?',
    description: '휴식 시간에 대한 당신의 선호를 알려주세요.',
    options: [
      {
        text: '가족, 친구들과 함께 시간 보내기',
        description: '소중한 사람들과의 시간이 가장 소중해요',
        values: { family: 2, social: 3, tradition: 1 },
      },
      {
        text: '혼자만의 조용한 시간 갖기',
        description: '책 읽기, 명상, 취미 생활 등',
        values: { independence: 3, simplicity: 2, growth: 1 },
      },
      {
        text: '새로운 곳 여행하거나 체험하기',
        description: '새로운 경험과 모험을 즐겨요',
        values: { adventure: 3, growth: 2, curiosity: 1 },
      },
      {
        text: '집에서 편안하게 휴식하기',
        description: '편안한 집에서 재충전하는 시간',
        values: { stability: 3, simplicity: 2, health: 1 },
      },
    ],
  },
  {
    id: 3,
    text: '갈등 상황에서 당신의 대처 방식은?',
    description: '문제 해결에 대한 접근 방식을 알려주세요.',
    options: [
      {
        text: '차분하게 대화로 해결하려 노력',
        description: '소통과 이해를 통한 평화적 해결',
        values: { communication: 3, empathy: 2, wisdom: 1 },
      },
      {
        text: '시간을 두고 신중하게 판단',
        description: '급하게 결정하지 않고 숙고합니다',
        values: { wisdom: 3, stability: 2, practical: 1 },
      },
      {
        text: '직접적이고 솔직하게 표현',
        description: '명확한 의사표현으로 빠른 해결',
        values: { honesty: 3, independence: 2, practical: 1 },
      },
      {
        text: '주변의 조언을 구하고 상의',
        description: '신뢰하는 사람들의 지혜를 구해요',
        values: { social: 3, humility: 2, wisdom: 1 },
      },
    ],
  },
  {
    id: 4,
    text: '새로운 사람을 만날 때 가장 중요하게 보는 것은?',
    description: '첫인상에서 중요하게 생각하는 요소입니다.',
    options: [
      {
        text: '따뜻하고 진정성 있는 마음',
        description: '진심이 느껴지는 사람을 좋아해요',
        values: { empathy: 3, honesty: 2, warmth: 2 },
      },
      {
        text: '교양과 지적인 대화 능력',
        description: '깊이 있는 대화를 나눌 수 있는 분',
        values: { intelligence: 3, culture: 2, communication: 1 },
      },
      {
        text: '안정적이고 신뢰할 수 있는 인상',
        description: '믿음직하고 의지할 수 있는 사람',
        values: { stability: 3, trust: 2, practical: 1 },
      },
      {
        text: '유머와 긍정적인 에너지',
        description: '함께 있으면 즐겁고 활기찬 분',
        values: { humor: 3, positive: 2, social: 1 },
      },
    ],
  },
  {
    id: 5,
    text: '인생의 후반부에 가장 하고 싶은 일은?',
    description: '앞으로의 인생 계획에 대해 알려주세요.',
    options: [
      {
        text: '가족과 더 많은 시간 보내기',
        description: '자녀, 손자녀와의 소중한 시간',
        values: { family: 3, love: 2, tradition: 1 },
      },
      {
        text: '새로운 취미나 학습 시작하기',
        description: '늦었다고 생각하지 않고 도전해요',
        values: { growth: 3, curiosity: 2, adventure: 1 },
      },
      {
        text: '사회에 기여하는 봉사활동',
        description: '경험을 나누며 사회에 도움이 되고 싶어요',
        values: { service: 3, empathy: 2, wisdom: 1 },
      },
      {
        text: '건강 관리와 여유로운 생활',
        description: '몸과 마음의 건강을 챙기며 살아요',
        values: { health: 3, simplicity: 2, stability: 1 },
      },
    ],
  },
  {
    id: 6,
    text: '스트레스를 받을 때 주로 어떻게 해소하나요?',
    description: '스트레스 관리 방법에 대해 알려주세요.',
    options: [
      {
        text: '가족이나 친구와 대화하기',
        description: '마음을 나누며 위로받아요',
        values: { social: 3, communication: 2, empathy: 1 },
      },
      {
        text: '산책이나 운동하기',
        description: '몸을 움직이며 기분전환해요',
        values: { health: 3, simplicity: 2, nature: 1 },
      },
      {
        text: '독서나 음악감상하기',
        description: '혼자만의 시간으로 마음을 다스려요',
        values: { culture: 3, independence: 2, wisdom: 1 },
      },
      {
        text: '새로운 활동이나 여행하기',
        description: '변화와 자극으로 스트레스를 날려요',
        values: { adventure: 3, growth: 2, curiosity: 1 },
      },
    ],
  },
  {
    id: 7,
    text: '연인과의 관계에서 가장 중요하게 생각하는 것은?',
    description: '이상적인 연애관에 대해 알려주세요.',
    options: [
      {
        text: '서로에 대한 깊은 이해와 소통',
        description: '마음을 터놓고 나누는 관계',
        values: { communication: 3, empathy: 2, trust: 2 },
      },
      {
        text: '상호 존중과 개인 공간 인정',
        description: '각자의 독립성을 존중하는 관계',
        values: { respect: 3, independence: 2, maturity: 1 },
      },
      {
        text: '안정적이고 편안한 동반자 관계',
        description: '평생을 함께할 든든한 파트너',
        values: { stability: 3, trust: 2, loyalty: 2 },
      },
      {
        text: '함께 성장하고 발전하는 관계',
        description: '서로를 발전시키는 긍정적 영향',
        values: { growth: 3, support: 2, ambition: 1 },
      },
    ],
  },
  {
    id: 8,
    text: '생활 패턴에서 선호하는 스타일은?',
    description: '일상 생활에서의 선호도를 알려주세요.',
    options: [
      {
        text: '규칙적이고 계획적인 생활',
        description: '체계적인 일상이 편안해요',
        values: { organization: 3, stability: 2, practical: 1 },
      },
      {
        text: '자유롭고 융통성 있는 생활',
        description: '상황에 따라 유연하게 대응해요',
        values: { flexibility: 3, independence: 2, adventure: 1 },
      },
      {
        text: '단순하고 소박한 생활',
        description: '복잡하지 않은 간소한 삶을 추구해요',
        values: { simplicity: 3, contentment: 2, wisdom: 1 },
      },
      {
        text: '활기차고 다양한 활동이 있는 생활',
        description: '여러 가지 일들로 충실한 하루하루',
        values: { energy: 3, social: 2, growth: 1 },
      },
    ],
  },
  {
    id: 9,
    text: '미래에 대한 당신의 생각은?',
    description: '앞으로의 삶에 대한 관점을 알려주세요.',
    options: [
      {
        text: '차근차근 준비하며 안정적으로',
        description: '계획을 세우고 준비하는 것이 중요해요',
        values: { planning: 3, stability: 2, practical: 1 },
      },
      {
        text: '긍정적으로 생각하며 즐겁게',
        description: '좋은 일들이 있을 거라 믿어요',
        values: { optimism: 3, positive: 2, faith: 1 },
      },
      {
        text: '현실적으로 판단하며 신중하게',
        description: '현실을 바탕으로 합리적 판단을 해요',
        values: { realism: 3, wisdom: 2, practical: 2 },
      },
      {
        text: '열린 마음으로 새로운 가능성에',
        description: '무엇이든 시도해볼 수 있다고 생각해요',
        values: { openness: 3, curiosity: 2, growth: 1 },
      },
    ],
  },
  {
    id: 10,
    text: '사람들과의 모임에서 당신의 모습은?',
    description: '사회적 상황에서의 성향을 알려주세요.',
    options: [
      {
        text: '적극적으로 대화에 참여하고 분위기를 이끌어요',
        description: '사람들과 어울리는 것을 좋아해요',
        values: { social: 3, leadership: 2, energy: 1 },
      },
      {
        text: '차분히 듣고 필요할 때 의견을 말해요',
        description: '관찰하고 적절한 때 참여해요',
        values: { listening: 3, wisdom: 2, patience: 1 },
      },
      {
        text: '친한 사람들과 깊은 대화를 나눠요',
        description: '소수와의 의미 있는 대화를 선호해요',
        values: { intimacy: 3, communication: 2, selectivity: 1 },
      },
      {
        text: '분위기를 보며 자연스럽게 어울려요',
        description: '상황에 맞춰 유연하게 행동해요',
        values: { adaptability: 3, harmony: 2, social: 1 },
      },
    ],
  },
  {
    id: 11,
    text: '건강 관리에 대한 당신의 접근법은?',
    description: '건강에 대한 관심과 관리 방식을 알려주세요.',
    options: [
      {
        text: '규칙적인 운동과 식습관 관리',
        description: '체계적으로 건강을 관리해요',
        values: { health: 3, discipline: 2, practical: 1 },
      },
      {
        text: '스트레스 관리와 정신건강 중시',
        description: '마음의 평안이 건강의 시작이에요',
        values: { mental: 3, balance: 2, wisdom: 1 },
      },
      {
        text: '자연스럽고 무리하지 않게',
        description: '너무 강박적이지 않게 관리해요',
        values: { natural: 3, balance: 2, contentment: 1 },
      },
      {
        text: '새로운 건강법이나 정보를 찾아서',
        description: '건강에 대한 정보를 적극 수집해요',
        values: { curiosity: 3, growth: 2, proactive: 1 },
      },
    ],
  },
  {
    id: 12,
    text: '취미나 여가활동으로 선호하는 것은?',
    description: '개인 시간에 즐기는 활동을 알려주세요.',
    options: [
      {
        text: '독서, 영화감상, 음악듣기',
        description: '문화적인 활동을 즐겨요',
        values: { culture: 3, wisdom: 2, peace: 1 },
      },
      {
        text: '요리, 원예, 만들기 등 손으로 하는 활동',
        description: '직접 만들고 가꾸는 일을 좋아해요',
        values: { creativity: 3, practical: 2, nurturing: 1 },
      },
      {
        text: '등산, 산책, 운동 등 활동적인 것',
        description: '몸을 움직이는 활동을 선호해요',
        values: { health: 3, nature: 2, energy: 1 },
      },
      {
        text: '모임, 봉사, 종교활동 등 사람들과 함께',
        description: '다른 사람들과 어울리는 활동을 해요',
        values: { social: 3, service: 2, community: 1 },
      },
    ],
  },
  {
    id: 13,
    text: '금전 관리에 대한 당신의 철학은?',
    description: '돈에 대한 가치관을 알려주세요.',
    options: [
      {
        text: '미래를 위해 계획적으로 저축',
        description: '안정적인 미래를 위해 차곡차곡 모아요',
        values: { security: 3, planning: 2, practical: 1 },
      },
      {
        text: '가족과 사랑하는 사람들을 위해 사용',
        description: '소중한 사람들에게 투자하는 것이 가치 있어요',
        values: { family: 3, generosity: 2, love: 1 },
      },
      {
        text: '경험과 자기계발에 투자',
        description: '돈으로 살 수 없는 경험이 더 소중해요',
        values: { growth: 3, experience: 2, wisdom: 1 },
      },
      {
        text: '적당히 저축하고 적당히 즐기며',
        description: '현재와 미래의 균형을 맞춰요',
        values: { balance: 3, moderation: 2, contentment: 1 },
      },
    ],
  },
  {
    id: 14,
    text: '인생에서 받은 가장 소중한 교훈은?',
    description: '살아오면서 깨달은 중요한 가치를 나눠주세요.',
    options: [
      {
        text: '가족과 사랑하는 사람이 가장 소중하다',
        description: '관계가 인생의 가장 큰 재산이에요',
        values: { family: 3, love: 2, relationships: 2 },
      },
      {
        text: '건강이 있어야 모든 것이 가능하다',
        description: '건강을 잃으면 모든 것을 잃는다는 걸 깨달았어요',
        values: { health: 3, gratitude: 2, wisdom: 1 },
      },
      {
        text: '진정성과 정직함이 가장 중요하다',
        description: '거짓으로는 진정한 행복을 얻을 수 없어요',
        values: { honesty: 3, integrity: 2, authenticity: 1 },
      },
      {
        text: '항상 배우고 성장하는 자세가 필요하다',
        description: '나이와 상관없이 계속 배워나가야 해요',
        values: { growth: 3, humility: 2, curiosity: 1 },
      },
    ],
  },
  {
    id: 15,
    text: '이상적인 하루의 마무리는 어떤 모습일까요?',
    description: '하루를 마감하는 당신만의 방식을 알려주세요.',
    options: [
      {
        text: '가족과 함께 오늘 하루를 나누며',
        description: '소중한 사람들과 하루를 정리해요',
        values: { family: 3, sharing: 2, warmth: 1 },
      },
      {
        text: '조용히 혼자 하루를 되돌아보며',
        description: '차분한 성찰의 시간을 가져요',
        values: { reflection: 3, independence: 2, wisdom: 1 },
      },
      {
        text: '내일의 계획을 세우며',
        description: '다음 날을 준비하는 시간을 가져요',
        values: { planning: 3, responsibility: 2, practical: 1 },
      },
      {
        text: '감사한 마음으로 평안한 잠자리에',
        description: '하루에 감사하며 편안히 쉬어요',
        values: { gratitude: 3, contentment: 2, peace: 1 },
      },
    ],
  },
];

// 성격 유형 정의
const personalityTypes = {
  '따뜻한 동반자': {
    description:
      '💕 가족과 사랑을 중시하며, 따뜻한 마음으로 사람들과 깊은 관계를 맺는 분입니다. 진정성과 소통을 바탕으로 한 안정적인 관계를 추구하며, 상대방의 마음을 잘 이해하는 감성적인 성향을 가지고 있습니다.',
    traits: ['가족 중심', '따뜻한 감성', '깊은 소통', '안정 추구'],
    compatibility: {
      '지혜로운 멘토': 95,
      '안정적 실용주의자': 88,
      '성장하는 모험가': 75,
      '평온한 자연주의자': 82,
    },
  },
  '지혜로운 멘토': {
    description:
      '🧠 풍부한 경험과 지혜를 바탕으로 신중하게 판단하며, 다른 사람들에게 조언과 도움을 주는 것을 좋아합니다. 깊이 있는 대화와 문화적 활동을 즐기며, 평생학습을 통해 계속 성장하려 합니다.',
    traits: ['풍부한 지혜', '신중한 판단', '깊은 사고', '멘토링'],
    compatibility: {
      '따뜻한 동반자': 95,
      '성장하는 모험가': 85,
      '안정적 실용주의자': 80,
      '평온한 자연주의자': 78,
    },
  },
  '안정적 실용주의자': {
    description:
      '🏡 현실적이고 실용적인 접근으로 안정적인 삶을 추구합니다. 계획적이고 체계적인 생활을 선호하며, 가족의 안정과 경제적 여유를 중요하게 생각합니다. 신뢰할 수 있고 의지가 되는 성격입니다.',
    traits: ['실용적 사고', '계획적 생활', '안정 추구', '신뢰성'],
    compatibility: {
      '따뜻한 동반자': 88,
      '평온한 자연주의자': 85,
      '지혜로운 멘토': 80,
      '성장하는 모험가': 70,
    },
  },
  '성장하는 모험가': {
    description:
      '🌟 나이에 관계없이 새로운 도전과 경험을 추구하며, 끊임없는 자기계발을 통해 성장하려 합니다. 호기심이 많고 긍정적인 에너지로 주변 사람들에게도 영감을 주는 활동적인 성향입니다.',
    traits: ['도전 정신', '자기계발', '호기심', '긍정 에너지'],
    compatibility: {
      '지혜로운 멘토': 85,
      '따뜻한 동반자': 75,
      '평온한 자연주의자': 72,
      '안정적 실용주의자': 70,
    },
  },
  '평온한 자연주의자': {
    description:
      '🌿 단순하고 자연스러운 삶을 추구하며, 건강과 마음의 평안을 중요하게 생각합니다. 스트레스 없는 여유로운 일상을 좋아하고, 자연과 함께하는 시간을 통해 에너지를 얻습니다.',
    traits: ['자연 친화', '단순한 삶', '건강 중시', '평온함'],
    compatibility: {
      '안정적 실용주의자': 85,
      '따뜻한 동반자': 82,
      '지혜로운 멘토': 78,
      '성장하는 모험가': 72,
    },
  },
};

// 테스트 상태 관리
let currentQuestion = 0;
let answers = [];
let scores = {
  family: 0,
  stability: 0,
  growth: 0,
  health: 0,
  social: 0,
  independence: 0,
  communication: 0,
  wisdom: 0,
  practical: 0,
  adventure: 0,
  empathy: 0,
  honesty: 0,
  culture: 0,
};

function startTest() {
  document.getElementById('intro').style.display = 'none';
  document.getElementById('test').style.display = 'block';
  showQuestion(0);
}

function showQuestion(index) {
  const question = questions[index];
  const container = document.getElementById('questionContainer');

  container.innerHTML = `
        <div class="question-number">질문 ${index + 1}</div>
        <div class="question-text">${question.text}</div>
        <div class="question-description">${question.description}</div>
        <div class="options-container">
            ${question.options
              .map(
                (option, i) => `
                <div class="option" onclick="selectOption(${i})" data-option="${i}">
                    <div class="option-text">${option.text}</div>
                    <div class="option-description">${option.description}</div>
                </div>
            `
              )
              .join('')}
        </div>
    `;

  updateProgress();
  updateNavigation();
}

function selectOption(optionIndex) {
  // 이전 선택 제거
  document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));

  // 새 선택 추가
  document.querySelector(`[data-option="${optionIndex}"]`).classList.add('selected');

  // 답변 저장
  answers[currentQuestion] = optionIndex;

  // 다음 버튼 활성화
  document.getElementById('nextBtn').disabled = false;
}

function nextQuestion() {
  if (answers[currentQuestion] === undefined) return;

  // 마지막 질문인 경우 바로 결과 보기
  if (currentQuestion === questions.length - 1) {
    console.log('🎉 테스트 완료! 결과 보기 시작');

    // 점수 계산
    const question = questions[currentQuestion];
    const selectedOption = question.options[answers[currentQuestion]];

    Object.keys(selectedOption.values).forEach(key => {
      scores[key] = (scores[key] || 0) + selectedOption.values[key];
    });

    showResults();
    return;
  }

  // 일반적인 다음 질문 진행
  // 점수 계산
  const question = questions[currentQuestion];
  const selectedOption = question.options[answers[currentQuestion]];

  Object.keys(selectedOption.values).forEach(key => {
    scores[key] = (scores[key] || 0) + selectedOption.values[key];
  });

  currentQuestion++;
  showQuestion(currentQuestion);
}

function prevQuestion() {
  if (currentQuestion > 0) {
    currentQuestion--;
    showQuestion(currentQuestion);
  }
}

function updateProgress() {
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  document.getElementById('progressFill').style.width = `${progress}%`;
  document.getElementById('progressPercent').textContent = Math.round(progress);
  document.getElementById('currentQ').textContent = currentQuestion + 1;
  document.getElementById('totalQ').textContent = questions.length;
}

function updateNavigation() {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  prevBtn.style.display = currentQuestion > 0 ? 'block' : 'none';
  nextBtn.disabled = answers[currentQuestion] === undefined;

  if (currentQuestion === questions.length - 1) {
    nextBtn.textContent = '결과 보기';
  } else {
    nextBtn.textContent = '다음 질문';
  }
}

function calculatePersonalityType() {
  // 점수를 기반으로 성격 유형 결정
  const maxScores = {
    '따뜻한 동반자': scores.family * 2 + scores.empathy + scores.communication + scores.social,
    '지혜로운 멘토': scores.wisdom * 2 + scores.culture + scores.communication + scores.growth,
    '안정적 실용주의자':
      scores.stability * 2 + scores.practical + scores.health + scores.independence,
    '성장하는 모험가':
      scores.growth * 2 + scores.adventure + scores.independence + scores.curiosity,
    '평온한 자연주의자': scores.health * 2 + scores.simplicity + scores.nature + scores.contentment,
  };

  return Object.keys(maxScores).reduce((a, b) => (maxScores[a] > maxScores[b] ? a : b));
}

function showResults() {
  document.getElementById('test').style.display = 'none';
  document.getElementById('results').style.display = 'block';

  const personalityType = calculatePersonalityType();
  const typeData = personalityTypes[personalityType];

  document.getElementById('personalityType').textContent = personalityType;
  document.getElementById('resultsDescription').textContent = typeData.description;

  // 호환성 점수 표시
  const compatibilityContainer = document.getElementById('compatibilityScores');
  compatibilityContainer.innerHTML = Object.entries(typeData.compatibility)
    .map(
      ([type, score]) => `
            <div class="score-item">
                <div class="score-label">${type}</div>
                <div class="score-bar">
                    <div class="score-fill" style="width: ${score}%"></div>
                </div>
                <div class="score-value">${score}% 호환</div>
            </div>
        `
    )
    .join('');

  // 애니메이션 효과
  setTimeout(() => {
    document.querySelectorAll('.score-fill').forEach(fill => {
      fill.style.width = fill.style.width;
    });
  }, 500);

  // 결과를 로컬 스토리지에 저장
  localStorage.setItem(
    'valuesAssessmentResult',
    JSON.stringify({
      personalityType,
      scores,
      compatibility: typeData.compatibility,
      timestamp: new Date().toISOString(),
    })
  );
}

function proceedToSignup() {
  // 회원가입 페이지로 이동 (결과 데이터 포함)
  window.location.href = 'signup.html?from=assessment';
}

function retakeTest() {
  // 테스트 초기화
  currentQuestion = 0;
  answers = [];
  scores = {
    family: 0,
    stability: 0,
    growth: 0,
    health: 0,
    social: 0,
    independence: 0,
    communication: 0,
    wisdom: 0,
    practical: 0,
    adventure: 0,
    empathy: 0,
    honesty: 0,
    culture: 0,
  };

  document.getElementById('results').style.display = 'none';
  document.getElementById('intro').style.display = 'block';
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function () {
  // 이전 결과가 있으면 선택적으로 복원
  const savedResult = localStorage.getItem('valuesAssessmentResult');
  if (savedResult) {
    const result = JSON.parse(savedResult);
    const timeDiff = Date.now() - new Date(result.timestamp).getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    // 24시간 이내 결과가 있으면 알림
    if (hoursDiff < 24) {
      const showPrevious = confirm(
        '24시간 이내에 완료한 테스트 결과가 있습니다. 이전 결과를 보시겠습니까?'
      );
      if (showPrevious) {
        // 이전 결과 표시 로직
        return;
      }
    }
  }
});
