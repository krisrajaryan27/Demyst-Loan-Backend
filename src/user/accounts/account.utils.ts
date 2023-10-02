export const generateRandomBalanceSheet = (user) => {
  const balanceSheet = [];
  const currentYear = new Date().getFullYear();
  const { establishYear } = user;

  for (let year = currentYear - 1; year >= parseInt(establishYear); year--) {
    for (let month = 1; month <= 12; month++) {
      const profitOrLoss = Math.floor(Math.random() * 100000) - 15000;
      const assetsValue = Math.floor(Math.random() * 10000000);
      balanceSheet.push({
        year,
        month,
        profitOrLoss,
        assetsValue,
      });
    }
  }
  return balanceSheet;
};

export const calculateProfitOrLossSummary = (balanceSheet: any) => {
  const summary: any = {};
  for (const entry of balanceSheet) {
    const { year, profitOrLoss } = entry;

    if (!summary.hasOwnProperty(year)) {
      summary[year] = profitOrLoss;
    } else {
      summary[year] += profitOrLoss;
    }
  }
  return summary;
};

export const calculatePreAssessment = (
  balanceSheet: any,
  loanAmount: number,
  summary: any,
) => {
  const currentYear = new Date().getFullYear();
  if (summary[currentYear - 1] > 0) {
    const averageAssetValue =
      balanceSheet.reduce(
        (total: any, entry: any) => total + entry.assetsValue,
        0,
      ) / 12;
    return averageAssetValue > loanAmount ? 100 : 60;
  } else {
    return 20;
  }
};

export const getLoanApplicationDecision = (applicationBody) => {
  const { loanAmount } = applicationBody.businessDetails;
  const { preAssessment } = applicationBody;
  if (preAssessment === 100) {
    return {
      data:
        'Congratulations! You are eligible for 100% loan approval on your requested amount of Rs.' +
        loanAmount +
        '/- only. Contact us for more details.',
      type: 'success',
    };
  } else if (preAssessment === 60) {
    return {
      data:
        'Congratulations! You are eligible for 60% of the requested loan amount that is Rs.' +
        loanAmount * 0.6 +
        '/- only. Contact us for more details.',
      type: 'success',
    };
  } else {
    return {
      data:
        'Sorry! You are not eligible for any loan approval on your requested amount of Rs.' +
        loanAmount +
        '/- only. Contact us for more details.',
      type: 'error',
    };
  }
};
