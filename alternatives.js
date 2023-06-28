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
