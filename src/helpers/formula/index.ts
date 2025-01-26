export const triviaBonus = (seconds: number) => {
  if (seconds <= 5) return 20;
  if (seconds <= 10) return 10;
  return 0;
};

export const timeBonus = (
  seconds: number,
  total: number,
  maxPoint: number = 1e3
) => {
  return Math.round(maxPoint * (1 - seconds / total));
};

const formula = { triviaBonus, timeBonus } as const;

export default formula;
