export function calculatePercentageDifference({
    num1,
    num2,
  }: {
    num1: number;
    num2: number;
  }) {
    const percentageDiff = (num1 / num2) * 100;
    return percentageDiff;
  }