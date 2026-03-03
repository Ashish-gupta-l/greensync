const AVG_PAGES_PER_SUBMISSION = 5;    // average pages per PDF assignment
const PAGES_PER_TREE           = 8000; // 1 tree = 8000 pages
const CO2_PER_PAGE_GRAMS       = 4.8;  // average CO2 saved per page not printed

/**
 * Calculate eco-impact from total submissions
 */
const calculateEcoImpact = (totalSubmissions) => {
  const pagesSaved  = totalSubmissions * AVG_PAGES_PER_SUBMISSION;
  const treesSaved  = pagesSaved / PAGES_PER_TREE;
  const co2SavedKg  = (pagesSaved * CO2_PER_PAGE_GRAMS) / 1000;
  const waterLitres = pagesSaved * 10; // ~10 litres of water per page production

  return {
    totalSubmissions,
    pagesSaved,
    treesSaved:   parseFloat(treesSaved.toFixed(3)),
    co2SavedKg:   parseFloat(co2SavedKg.toFixed(2)),
    waterLitres,
    message: treesSaved >= 1
      ? `You've helped save ${treesSaved.toFixed(1)} trees! 🌳`
      : `${pagesSaved} pages saved so far — keep going! 🌱`,
  };
};

module.exports = { calculateEcoImpact, AVG_PAGES_PER_SUBMISSION, PAGES_PER_TREE };
