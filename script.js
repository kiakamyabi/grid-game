//Add construction build times
//Change generation to be procedural instead of random (perlin noise with seeds?)
//Decide on buildings limit
//Put configs and stuff in another file at some point
//Make special menu for when the player is claiming the first cell, like settling turn 1 for Civ
//Add a way for players to interact with the building priority system.
/*Decide on final building system principle. Will it be based on individual buildings or generalised concepts like industries that can be expanded.
Maybe both?*/

//Data
const gameWorld = document.getElementById('game-grid')
const buildingMenu = document.getElementById('building-menu')
const unclaimedCellMenu = document.getElementById('unclaimed-cell-menu')
const table = document.createElement('table');
const cellFeatures = {};
let selectedCellId = null;
let currentTurn = 0;
let playerClaimedCells = [];
let firstClaimedCell = null; 
let uniqueBuildingIdIteration = 1;
const populationTotalTemplate = {
  totalPopulation: 0,
  maxPopulation: 0,
  totalWorkforce: 0,
  availableWorkforce: 0,
  usedWorkforce: 0,
  populationGrowthLastTurn:0,
}
//Keys
const cellFeaturesBuildingsKey = 'buildings';
const cellFeaturesCapacityKey = 'storageCapacity';
const cellFeaturesResourceGenerationKey = 'resourceGenerationLastTurn'; 
const cellFeaturesResourceConsumptionKey = 'resourceConsumptionLastTurn';
const cellFeaturesPopulationKey = 'population';
const cellFeaturesIndividualPopulationKey = 'individualPopulation';
//Configs
const numRows = 15;
const numCols = 15;

const raceData = {
  'Human':{
    nameSingular: 'Human',
    namePlural: 'Humans',
    populationGrowth: 0.01,
    workforceProportion: 0.75,
    defaultWorkerBaseOutput: 1,
    defaultWorkerOutputModifier: 1,
    workerOutputBaseRates:{
      'Logging Shack': 1,
    },
    workerOutputRateModifiers:{
      'Logging Shack': 1,
    }
  },
  'Wooden Automaton':{
    nameSingular: 'Wooden Automaton',
    namePlural: 'Wooden Automatons',
    populationGrowth: 0,
    workforceProportion: 1,
    defaultWorkerBaseOutput: 2,
    defaultWorkerOutputModifier: 1,
    workerOutputBaseRates:{
      'Logging Shack': 2,
    },
    workerOutputRateModifiers:{
      'Logging Shack': 1,
    }
  }
}

const terrainBuildings = {
  Grass: ['Cabin', 'Farm', 'Hunting Lodge', 'Warehouse'],
  Water: ['Cabin', 'Saltworks', 'Fishing Dock', 'Warehouse'],
  Mountain: ['Cabin', 'Mine', 'Warehouse'],
  Forest: ['Cabin', 'Lumber Mill', 'Hunting Lodge', 'Logging Shack', 'Warehouse']
};
const buildingCategories = {
  Production: {
    name: 'Production'
  },
  Industry: {
    name: 'Industry'
  },
  Other: {
    name: 'Other'
  }
};
const buildingData = {
  //resourcesGenerated = The resources that the building will generate per turn, meant to broadly represent output.
  //resourcesConsumed = The resources that the building will consume per turn, meant to broadly represent input.
  /*turnPriority = The priority a building will have in the end of turn calculations. Lower number = higher priority. For resource generation
  and consumption, issues can arise if buildings are not in the correct order of priority. For example a Lumber Mill will need 1 Tree Log as
  an input to generate Lumber. If there is no Tree Logs in storage the Lumber Mill cannot function. If there is a Logging Shack to generate
  1 Tree Log but it comes later in priority it means at the end of turn the Lumber Mill will check for Tree Logs in storage and find nothing.
  THEN the Logging Shack will produce the Tree Log, putting it into storage for next turn. Therefore the Logging Shack must have higher priority
  for the Lumber Mill to operate on the same turn.*/
  //capacityIncrease = Storage capacity is increasing for a resource.
  //resourcesRequired = The cost to construct a building.
  'Warehouse': {
    name: 'Warehouse',
    category: 'Other',
    resourcesGenerated: {},
    resourcesConsumed: {},
    capacityIncrease: {
      'Tree Logs': 5,
      'Lumber': 5
    },
    resourcesRequired: {
      'Lumber': 1
    }
  },
  'Cabin': {
    name: 'Cabin',
    category: 'Other',
    resourcesGenerated: {},
    resourcesConsumed: {},
  },
  'Farm': {
    name: 'Farm',
    category: 'Production',
    resourcesGenerated: {},
    resourcesConsumed: {},
  },
  'Hunting Lodge': {
    name: 'Hunting Lodge',
    category: 'Other',
    resourcesGenerated: {},
    resourcesConsumed: {},
  },
  'Saltworks': {
    name: 'Saltworks',
    category: 'Production',
    resourcesGenerated: {},
    resourcesConsumed: {},
  },
  'Logging Shack': {
    name: 'Logging Shack',
    category: 'Industry',
    turnPriority: 1,
    constructionTime: 2,
    resourcesGenerated: {
      'Tree Logs': 1
    },
    resourcesConsumed: {},
    capacityIncrease: {
      'Tree Logs': 5,
    },
  },
  'Lumber Mill': {
    name: 'Lumber Mill',
    category: 'Industry',
    turnPriority: 2,
    constructionTime: 2,
    resourcesGenerated: {
      'Lumber': 1
    },
    resourcesConsumed: {
      'Tree Logs': 1,
    },
    capacityIncrease: {
      'Lumber': 5,
    },
  },
  'Fishing Dock': {
    name: 'Fishing Dock',
    category: 'Production',
    resourcesGenerated: {},
    resourcesConsumed: {},
  },
  'Mine': {
    name: 'Mine',
    category: 'Production',
    resourcesGenerated: {},
    resourcesConsumed: {},
  },
};
const resourceData = {
//categoryEconomicSector based on https://en.wikipedia.org/wiki/Economic_sector.
//categoryGrouping = Grouping certain resources together for easy filtering e.g Wooden Chair in the Furniture category and Wood category.
//categoryTier = Each level above 1 represents how far down a production chain a resource is e.g Lumber made from Tree Logs = T2.
  'Tree Logs': {
    name: 'Tree Logs',
    categoryEconomicSector: 'Primary',
    categoryGrouping: ['Wood', 'Construction Material'],
    categoryTier: '1'
  },

  'Lumber': {
    name: 'Lumber',
    categoryEconomicSector: 'Secondary',
    categoryGrouping: ['Wood', 'Construction Material'],
    categoryTier: '2'
  },

  'Wooden Chair': {
    name: 'Wooden Chair',
    categoryEconomicSector: 'Secondary',
    categoryGrouping: ['Wood'],
    categoryTier: '3'
  },
};

function worldGeneration(){
for (let row = 0; row < numRows; row++) {
    const newRow = document.createElement('tr');
    for (let col = 0; col < numCols; col++) {
      const individualCell = document.createElement('td');
      individualCell.classList.add('grid-cell');
      //Plus one to the id because the count starts at zero
      rowPlus = row + 1;
      colPlus = col + 1;
      individualCell.id = `cell-${rowPlus}-${colPlus}`;
      newRow.appendChild(individualCell);

      const terrainType = generateTerrain();
      cellFeatures[individualCell.id] = {
        terrainType,
      };

      individualCell.setAttribute('data-terrain', terrainType);
    }
    table.appendChild(newRow);
  }
  gameWorld.appendChild(table);
}

function generateTerrain() {
  const terrainTypes = ['Grass', 'Water', 'Mountain', 'Forest'];
  //Generates terrain randomly
  const randomIndex = Math.floor(Math.random() * terrainTypes.length);
  return terrainTypes[randomIndex];
}

function handleStorageCapacityIncrease(cellId, buildingInfo) {
  const cell = cellFeatures[cellId];

  //Handle resource capacity increase
  for (const resource in buildingInfo.capacityIncrease) {
    const increaseAmount = buildingInfo.capacityIncrease[resource];

    if (cell[cellFeaturesCapacityKey][resource]) {
      const previousCapacity = cell[cellFeaturesCapacityKey][resource].capacity;
      cell[cellFeaturesCapacityKey][resource].capacity += increaseAmount;
      const newCapacity = cell[cellFeaturesCapacityKey][resource].capacity;

      if (previousCapacity !== newCapacity) {
        console.log(
        `Cell: ${cellId}. Resource: ${resource}. Capacity Increased By: ${increaseAmount} (${previousCapacity} To ${newCapacity})`);
      }
    }
  }
}

function resourceChangePerTurn() {
  //Loop through all cells
  for (const cellId of playerClaimedCells) {
    console.log(cellId)
    const cell = cellFeatures[cellId];
    const buildings = cell[cellFeaturesBuildingsKey];
    const totalResourceGenerationLastTurn = {};
    const totalResourceConsumptionLastTurn = {};

    //Sort buildings based on priority. Lower = higher priority.
    buildings.sort((a, b) => {
      return buildingData[a.name].turnPriority - buildingData[b.name].turnPriority;
    });


    //Loop through buildings in the cell
    for (const building of buildings) {
      const buildingInfo = buildingData[building.name]

      //Check if building is under construction and reduce construction timer
      if (building.constructionTime > 0) {
        building.constructionTime--;
        console.log(`${building.name}. Construction timer: ${building.constructionTime}`)

        //Skip resource generation/consumption for buildings under construction
        continue;
      }

      //Check if building has required resources to be consumed in storage
      let resourcesToBeConsumedAvailable = true;

      for (const resource in buildingInfo.resourcesConsumed) {
        const requiredAmount = buildingInfo.resourcesConsumed[resource];

        if (cell[cellFeaturesCapacityKey][resource]) {
          const currentAmount = cell[cellFeaturesCapacityKey][resource].amount;

          if (currentAmount < requiredAmount) {
            resourcesToBeConsumedAvailable = false;
            break; 
          }
        } else {
          resourcesToBeConsumedAvailable = false;
          break; 
        }
      }

      if (resourcesToBeConsumedAvailable) {
        //Resource consumption
        for (const resource in buildingInfo.resourcesConsumed) {
          const consumedAmount = buildingInfo.resourcesConsumed[resource];
          cell[cellFeaturesCapacityKey][resource].amount -= consumedAmount;

          //Tracks resource consumption by putting it in a placeholder to be put in cellFeatures
          if (totalResourceConsumptionLastTurn[resource]) {
            totalResourceConsumptionLastTurn[resource] += consumedAmount;
          } else {
            totalResourceConsumptionLastTurn[resource] = consumedAmount;
          }
        }

        //Resource generation
        for (const resource in buildingInfo.resourcesGenerated) {
          const generatedAmount = buildingInfo.resourcesGenerated[resource];

         //Checks for resource capacity
         if (cell[cellFeaturesCapacityKey][resource]) {
          const currentAmount = cell[cellFeaturesCapacityKey][resource].amount;
          const storageCapacity = cell[cellFeaturesCapacityKey][resource].capacity;
          //Uses Math.min to not go over the storage limit
          if (currentAmount < storageCapacity) {
            const remainingCapacity = storageCapacity - currentAmount;
            const generatedAmountFinal = Math.min(generatedAmount, remainingCapacity);
            cell[cellFeaturesCapacityKey][resource].amount += generatedAmountFinal;
          }
        }

          //Tracks resource generation by putting it in a placeholder to be put in cellFeatures
          if (totalResourceGenerationLastTurn[resource]) {
            totalResourceGenerationLastTurn[resource] += generatedAmount;
          } else {
            totalResourceGenerationLastTurn[resource] = generatedAmount;
          }
        }

      }
    }
    //Updates cellFeature for resource generation & consumption, using placeholders.
    cell[cellFeaturesResourceGenerationKey] = totalResourceGenerationLastTurn;
    cell[cellFeaturesResourceConsumptionKey] = totalResourceConsumptionLastTurn;
  }
}

function populationChangePerTurn() {
  for (const cellId of playerClaimedCells){
    const cell = cellFeatures[cellId];
    const populationTotalInCell = cell[cellFeaturesPopulationKey];
    const individualPopsInCell = cell[cellFeaturesIndividualPopulationKey];

    for (const key in individualPopsInCell){
      individualPop = individualPopsInCell[key]
      individualPop.populationGrowthLastTurn = Math.floor(individualPop.populationGrowth * individualPop.totalPopulation);
      individualPop.totalPopulation += individualPop.populationGrowthLastTurn;
      individualPop.totalWorkforce = Math.floor(individualPop.totalPopulation * individualPop.workforceProportion);
      individualPop.availableWorkforce = individualPop.totalWorkforce - individualPop.usedWorkforce;

      populationTotalInCell.populationGrowthLastTurn += individualPop.populationGrowthLastTurn;
      populationTotalInCell.totalPopulation += individualPop.totalPopulation;
      populationTotalInCell.totalWorkforce += individualPop.totalWorkforce;
      populationTotalInCell.availableWorkforce += individualPop.availableWorkforce;
      populationTotalInCell.usedWorkforce += individualPop.usedWorkforce;
      //Max pop based on buildings and certain terrain features
      //populationCellTotal.maxPopulation = ;
    }

  }
}

function generateBuildingCategoryTabs() {
  let tabContent = '';
  for (const category in buildingCategories) {
    const categoryName = buildingCategories[category].name;
    tabContent += `<button class="building-category-tab" data-category="${category}">${categoryName}</button>`;
  }
  return tabContent;
}

function generateBuildingMenu(terrainType) {
  let buildingMenuContent = '';
  for (const category in buildingCategories) {
    const buildings = Object.values(buildingData)
      .filter((building) => building.category === category && terrainBuildings[terrainType].includes(building.name));

    if (buildings.length > 0) {
      buildingMenuContent += `<div class="building-tab" data-category="${category}">`;
      for (const building of buildings) {
        buildingMenuContent += `<button class="building-btn" data-building="${building.name}">${building.name}</button>`;
      }
      buildingMenuContent += `</div>`;
    }
  }
  return buildingMenuContent;
}

function generateClaimedCellMenuContent(terrainType) {
  const menuContent = 
  `<div id="building-category-tab-container">
    ${generateBuildingCategoryTabs()}
    </div>

  <div id="building-tab-container">
    ${generateBuildingMenu(terrainType)}
  </div>`;

  return menuContent;
}

function generateUnclaimedCellMenuContent() {
  if (firstClaimedCell === null){
    const menuContent = 
    `<button class="claim-cell-btn">Claim</button>`;
    return menuContent;
    
  }
  else {
    const isAdjacentCellClaimed = checkForAdjacentClaimedCell(selectedCellId);
    const disabledAttribute = isAdjacentCellClaimed ? '' : 'disabled';
    const menuContent = `
      <button class="claim-cell-btn" ${disabledAttribute}>Claim</button>`;
    return menuContent;
  }

  
}

function showBuildingTabs(category) {
  const buildingTabContainerId = document.getElementById('building-tab-container');
  buildingTabContainerId.style.display = 'block';

  const buildingTabs = document.querySelectorAll('.building-tab');
  buildingTabs.forEach((tab) => {
    const buildingTabCategory = tab.getAttribute('data-category');
    if (buildingTabCategory === category) {
      tab.style.display = 'flex';
    } else {
      tab.style.display = 'none';
    }
  });
}

function openClaimedCellMenu(cellId) {
  const selectedCell = cellFeatures[cellId];
  const terrainType = selectedCell.terrainType;
  const menuContent = generateClaimedCellMenuContent(terrainType);
  //Update menu
  const menuContentContainer = document.getElementById('building-menu');
  menuContentContainer.innerHTML = menuContent;
  //Show menu
  menuContentContainer.style.display = 'block';
  //Hide building buttons to show later
  const buildingTabContainerId = document.getElementById('building-tab-container');
  buildingTabContainerId.style.display = 'none';

  //Event listener for tabs.
  const tabContainer = document.getElementById('building-category-tab-container');
  tabContainer.addEventListener('click', (event) => {
    const target = event.target;
    if (target.classList.contains('building-category-tab')) {
      const category = target.getAttribute('data-category');
      showBuildingTabs(category);
    }
  });
}

function openUnclaimedCellMenu(){
  const menuContent = generateUnclaimedCellMenuContent();
  //Update menu
  const menuContentContainer = document.getElementById('unclaimed-cell-menu');
  menuContentContainer.innerHTML = menuContent;
  //Show menu
  menuContentContainer.style.display = 'flex';
}

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

function checkForAdjacentClaimedCell(cellId) {
  const adjacentCells = getAdjacentCells(cellId);
  for (const adjacentCellId of adjacentCells) {
    if (playerClaimedCells.includes(adjacentCellId)) {
      return true;
    }
  }
  return false;
}

function claimCell(cellId, clickedElement) {
  if (firstClaimedCell === null) {
    firstClaimedCell = cellId;
  }
  playerClaimedCells.push(cellId);

  //Update the cell's class
  const cellElement = document.getElementById(cellId);
  cellElement.classList.add('claimed');

  //Disable the claim button for the claimed cell
  const claimButton = clickedElement;
  claimButton.disabled = true;

  cellFeatures[cellId][cellFeaturesCapacityKey] = JSON.parse(JSON.stringify(resourceData));
  //Adds amount and capacity properties to track resource storage
  for (const resource in cellFeatures[cellId][cellFeaturesCapacityKey]) {
    if (cellFeatures[cellId][cellFeaturesCapacityKey].hasOwnProperty(resource)) {
      cellFeatures[cellId][cellFeaturesCapacityKey][resource].amount = 0;
      cellFeatures[cellId][cellFeaturesCapacityKey][resource].capacity = 0;
    }
  }
  cellFeatures[cellId][cellFeaturesIndividualPopulationKey] = JSON.parse(JSON.stringify(raceData));
  //Adds properties to track population and workforce
  for (const key in cellFeatures[cellId][cellFeaturesIndividualPopulationKey]) {
    if (cellFeatures[cellId][cellFeaturesIndividualPopulationKey].hasOwnProperty(key)) {
      cellFeatures[cellId][cellFeaturesIndividualPopulationKey][key].totalPopulation = 1000;
      cellFeatures[cellId][cellFeaturesIndividualPopulationKey][key].totalWorkforce = 0;
      cellFeatures[cellId][cellFeaturesIndividualPopulationKey][key].availableWorkforce = 0;
      cellFeatures[cellId][cellFeaturesIndividualPopulationKey][key].usedWorkforce = 0;
      cellFeatures[cellId][cellFeaturesIndividualPopulationKey][key].populationGrowthLastTurn = 0;
    }
  }

  cellFeatures[cellId][cellFeaturesResourceGenerationKey] = {};
  cellFeatures[cellId][cellFeaturesResourceConsumptionKey] = {};
  cellFeatures[cellId][cellFeaturesBuildingsKey] = [];
  cellFeatures[cellId][cellFeaturesPopulationKey] = JSON.parse(JSON.stringify(populationTotalTemplate));

  console.log(`Cell: ${cellId} claimed.`);
  console.log(playerClaimedCells)
}

function constructBuilding(cellId, buildingName) {
  const cell = cellFeatures[cellId];
  const buildingInfo = buildingData[buildingName];

  //Check if required resources are available
  for (const resource in buildingInfo.resourcesRequired) {
    const requiredAmount = buildingInfo.resourcesRequired[resource];
    
    if (cell[cellFeaturesCapacityKey][resource].amount < requiredAmount) {
      console.log(`Insufficient ${resource} to construct ${buildingName}`);
      return;
    }
  
  //Use required resources for construction
    else {
      const requiredAmount = buildingInfo.resourcesRequired[resource];
      cell[cellFeaturesCapacityKey][resource].amount -= requiredAmount;
    }
  }
  //The template of the building being added to cellFeatures.
  const buildingTemplate =
    {
    name: `${buildingName}`,
    constructionTime: `${buildingInfo.constructionTime}`,
    uniqueId: uniqueBuildingIdIteration
    };

  cell[cellFeaturesBuildingsKey].push(buildingTemplate);
  uniqueBuildingIdIteration++

  handleStorageCapacityIncrease(cellId, buildingInfo);

  console.log(`Building constructed: ${buildingName}`);
}

function handleCellClick(event) {
  const clickedElement = event.target;
  
  if (clickedElement.classList.contains('grid-cell')) {
    const cellId = clickedElement.id;
    selectedCellId = cellId;
    //Hides menus to stop overlap
    unclaimedCellMenu.style.display = 'none';
    buildingMenu.style.display = 'none';

    if (playerClaimedCells.includes(cellId) ) {
      openClaimedCellMenu(cellId);
      //Console logs for testing
      console.log('Cell clicked:', cellId);
      console.log('Buildings:', cellFeatures[cellId][cellFeaturesBuildingsKey]);
      console.log('Terrain:', cellFeatures[cellId].terrainType);
      console.log('In storage:', cellFeatures[cellId][cellFeaturesCapacityKey]);
      console.log('Current Cell:', selectedCellId);
    }
    else if (firstClaimedCell === null) {
      //Placeholder for when special menu for first cell to be claimed
      openUnclaimedCellMenu();
    }
    else if (!playerClaimedCells.includes(cellId)) {
      openUnclaimedCellMenu();
    }
    else{
      throw new Error('You have selected a cell that isn\'t meant to exist.');
    }

    
  } else if (clickedElement.classList.contains('building-btn')) {
    const buildingName = clickedElement.getAttribute('data-building');

    constructBuilding(selectedCellId, buildingName)

  } else if (clickedElement.classList.contains('claim-cell-btn')) {
      //Handle claim button 
      claimCell(selectedCellId, clickedElement);
    }

}

function advanceTurn() {
  if (firstClaimedCell === null){
    console.log('Can\'t advance turn without claiming a cell.')
    return;
  }
  currentTurn++;
  resourceChangePerTurn()
  populationChangePerTurn()
  console.log(`Turn: ${currentTurn}`);
  console.log(cellFeatures);
}

//Need to make button and menu for game start
worldGeneration()

gameWorld.addEventListener('click', handleCellClick);
buildingMenu.addEventListener('click', handleCellClick);
unclaimedCellMenu.addEventListener('click', handleCellClick);