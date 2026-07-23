const adjectives = [
  '행복한',
  '용감한',
  '반짝이는',
  '졸린',
  '배고픈',
  '엉뚱한',
  '도도한',
  '게으른',
  '수줍은',
  '까칠한',
  '신난',
  '느긋한',
  '폭신한',
  '깜찍한',
  '명랑한',
  '심술궂은',
  '수상한',
  '전설의',
  '우주최강',
  '빵터진',
  '잠많은',
  '천재적인',
];

const animals = [
  '고양이',
  '수달',
  '너구리',
  '호랑이',
  '판다',
  '펭귄',
  '다람쥐',
  '햄스터',
  '알파카',
  '코알라',
  '두더지',
  '고슴도치',
  '카피바라',
  '나무늘보',
  '토끼',
  '부엉이',
  '문어',
  '거북이',
  '미어캣',
  '오리너구리',
];

export function generateRandomNickname() {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];

  const animal = animals[Math.floor(Math.random() * animals.length)];
  const id = crypto.randomUUID().slice(0, 8);

  return `${adjective}${animal}_${id}`;
}
