const getWinningSkin = (possibleSkins) => {
  const randomNumber = Math.random();
  let cumulativeChance = 0;

  for (const item of possibleSkins) {
    cumulativeChance += item.dropChance;
    if (randomNumber <= cumulativeChance) {
      return item.skin;
    }
  }
  return possibleSkins[possibleSkins.length - 1].skin;
};

module.exports = { getWinningSkin };