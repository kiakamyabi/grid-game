//Uses reduce to avoid having to set totals to 0 manually. Less efficient because needs to turn object into an array to use reduce.
function populationChangePerTurn() {
    for (const cellId of playerClaimedCells){
      const cell = cellFeatures[cellId];
      const populationTotalInCell = cell[cellFeaturesPopulationKey];
      const individualPopsInCell = cell[cellFeaturesIndividualPopulationKey];
  
      for (const pop in individualPopsInCell){
        individualPop = individualPopsInCell[pop]
        individualPop.populationGrowthLastTurn = Math.floor(individualPop.populationGrowth * individualPop.totalPopulation);
        individualPop.totalPopulation += individualPop.populationGrowthLastTurn;
        individualPop.totalWorkforce = Math.floor(individualPop.totalPopulation * individualPop.workforceProportion);
        individualPop.availableWorkforce = individualPop.totalWorkforce - individualPop.usedWorkforce;
      }
  
      populationTotalInCell.populationGrowthLastTurn = Object.values(individualPopsInCell).reduce((sum, individualPop ) => sum + individualPop.populationGrowthLastTurn, 0);
      populationTotalInCell.totalPopulation = Object.values(individualPopsInCell).reduce((sum, individualPop) => sum + individualPop.totalPopulation, 0);
      populationTotalInCell.totalWorkforce = Object.values(individualPopsInCell).reduce((sum, individualPop) => sum + individualPop.totalWorkforce, 0);
      populationTotalInCell.availableWorkforce = Object.values(individualPopsInCell).reduce((sum, individualPop) => sum + individualPop.availableWorkforce, 0);
      populationTotalInCell.usedWorkforce = Object.values(individualPopsInCell).reduce((sum, individualPop) => sum + individualPop.usedWorkforce, 0);
    }
}

//in populationChangePerTurn() can use this instead but it is basically the same peformance.
individualPop.populationMortalityLastTurn = Math.floor(individualPop.populationMortality * individualPop.totalPopulation) || 1;

//For old square grid
function getAdjacentCells(cellId) {
  const cellIdParts = cellId.split('-');
  const row = parseInt(cellIdParts[1]);
  const col = parseInt(cellIdParts[2]);
  const adjacentCells = [];

  for (let i = row - 1; i <= row + 1; i++) {
    for (let j = col - 1; j <= col + 1; j++) {
      const adjacentCellId = `cell-${i}-${j}`;
      if (i >= 0 && i < numRows && j >= 0 && j < numCols && adjacentCellId !== cellId) {
        adjacentCells.push(adjacentCellId);
      }
    }
  }
  return adjacentCells;
}