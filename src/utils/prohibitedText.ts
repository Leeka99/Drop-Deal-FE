const prohibitedWords = [
  "관리자",
  "운영자",
  "admin",
  "administrator",
  "씨발",
  "시발",
  "병신",
  "개새끼",
  "좆",
];

const normalize = (value: string) =>
  value.normalize("NFKC").toLocaleLowerCase().replace(/[\s\W_]+/g, "");

export function findProhibitedWord(values: string[]) {
  const normalizedValues = values.map(normalize);
  return prohibitedWords.find((word) => {
    const normalizedWord = normalize(word);
    return normalizedValues.some((value) => value.includes(normalizedWord));
  });
}
