// Este servicio contiene la lógica de negocio para las cajas
const getWinningSkin = (possibleSkins) => {
    const randomNumber = Math.random();
    let cumulativeChance = 0;

    for (const item of possibleSkins) {
        cumulativeChance += item.dropChance;
        if (randomNumber <= cumulativeChance) {
            return item.skin;
        }
    }
    // Fallback por si hay errores de redondeo con las probabilidades
    return possibleSkins[possibleSkins.length - 1].skin;
};

module.exports = { getWinningSkin };