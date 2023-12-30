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

//Old square grid world gen
function worldGeneration(){
  for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const individualCell = document.createElement('div');
        individualCell.classList.add('grid-cell');
        //Plus one to the id because otherwise the count starts at zero
        rowPlus = row + 1;
        colPlus = col + 1;
        individualCell.id = `cell-${rowPlus}-${colPlus}`;
  
        const terrainType = generateTerrain();
        cellFeatures[individualCell.id] = {
          terrainType,
        };
  
        individualCell.setAttribute('data-terrain', terrainType);
        gameWorld.appendChild(individualCell);
      }
    }
    root.style.setProperty('--num-rows', numRows);
    root.style.setProperty('--num-cols', numCols);
  };

  [data-terrain="Grass"],[data-terrain="Water"],[data-terrain="Mountain"], [data-terrain="Forest"]{
    background-color: black;
  }
  
  //CSS used to make a black border. Uses pseudo element of hexagon to be inside main hexagon to create a border effect.
  [data-terrain="Grass"]::before, [data-terrain="Water"]::before, [data-terrain="Mountain"]::before, [data-terrain="Forest"]::before{
    position: absolute;
    content: '';
    top: 2px;  
    left: 2px;  
    height: calc(100% - 4px);  
    width: calc(100% - 4px);  
    clip-path: polygon(50% 0%, 0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%);
  }
  [data-terrain="Grass"]::before {
    background-color: #8bc34a;
  }
  
  [data-terrain="Water"]::before {
      background-color: #2196f3;
  }
    
  [data-terrain="Mountain"]::before {
      background-color: #9e9e9e; 
  }
    
  [data-terrain="Forest"]::before {
      background-color: #4caf50;
  }