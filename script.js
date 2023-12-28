//Add construction build times
//Change generation to be procedural instead of random (perlin noise with seeds?)
//Decide on district limit
//Put configs and stuff in another file at some point
//Make special menu for when the player is claiming the first cell, like settling turn 1 for Civ
//Add a way for players to interact with the district priority system.

//UI id/class
const districtMenuId = 'district-menu';
const districtCategoryScrollbarId = 'district-menu__category-scrollbar';
const districtCategoryBtnCls = 'district-menu__category-btn';
const districtSelectorContainerId = 'district-menu__selector-container';
const districtSelectorId = 'district-menu__selector';
const districtBtnCls = 'district-menu__district-btn';



//Data
const districtMenu = document.getElementById(districtMenuId);
const unclaimedCellMenu = document.getElementById('unclaimed-cell-menu');
const gameWorld = document.getElementById('game-grid');
const root = document.documentElement;
let selectedCellId = null;
let currentTurn = 0;
let playerClaimedCells = [];
let firstClaimedCell = null; 
let uniqueDistrictIdIteration = 1;
//Templates
const populationTotalTemplate = {
  totalPopulation: 0,
  maxPopulation: 0,
  totalWorkforce: 0,
  availableWorkforce: 0,
  usedWorkforce: 0,
  populationGrowthLastTurn: 0,
  populationMortalityLastTurn: 0,
};
const cellFeatures = {};
//Keys
const cellFeaturesDistrictsKey = 'districts';
const cellFeaturesCapacityKey = 'storageCapacity';
const cellFeaturesResourceGenerationKey = 'resourceGenerationLastTurn'; 
const cellFeaturesResourceConsumptionKey = 'resourceConsumptionLastTurn';
const cellFeaturesPopulationKey = 'population';
const cellFeaturesIndividualPopulationKey = 'individualPopulation';
//Configs
const numRows = 25;
const numCols = 25;
const cellSize = 59;

const raceData = {
  //defaultWorkerBaseOutput =
  //workerOutputRateModifiers =
  //workerOutputBaseRates = 
  //workerOutputRateModifiers =

  'Human':{
    nameSingular: 'Human',
    namePlural: 'Humans',
    populationGrowth: 0.02,
    populationMortality:0.01,
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
    populationMortality: 0,
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
};
const districtCategoriesData = {
  'Extraction': {
    name: 'Extraction'
  },
  'Production': {
    name: 'Production'
  },
  'Other': {
    name: 'Other'
  },
  'Placeholder1': {
    name: 'Placeholder1'
  },
  'Placeholder2': {
    name: 'Placeholder2'
  },
  'Placeholder3': {
    name: 'Placeholder3'
  },
  'Placeholder4': {
    name: 'Placeholder4'
  },
  'Placeholder5': {
    name: 'Placeholder5'
  },
  'Placeholder6': {
    name: 'Placeholder6'
  },
};
const districtData = {
  //resourcesGenerated = The resources that the district will generate per turn, meant to broadly represent output.
  //resourcesConsumed = The resources that the district will consume per turn, meant to broadly represent input.
  //unlockStatus = If the district is available to construct.
  /*turnPriority = The priority a district will have in the end of turn calculations. Lower number = higher priority. For resource generation
  and consumption, issues can arise if districts are not in the correct order of priority. For example a Lumber Mill will need 1 Tree Log as
  an input to generate Lumber. If there is no Tree Logs in storage the Lumber Mill cannot function. If there is a Logging Shack to generate
  1 Tree Log but it comes later in priority it means at the end of turn the Lumber Mill will check for Tree Logs in storage and find nothing.
  THEN the Logging Shack will produce the Tree Log, putting it into storage for next turn. Therefore the Logging Shack must have higher priority
  for the Lumber Mill to operate on the same turn.*/
  //capacityIncrease = Storage capacity increase for a resource.
  //workforceDefault = The workforce maximum by default.
  //upgradesAvailable = Object that holds data of district upgrades.
  /*productionRateTarget = The amount of production rate that is it takes to generate/consume resources. Example..

  'Example District': {
    name: 'Example District',
    productionRateTarget: 100,
    resourcesGenerated: {
      'Resource1':100,
      'Resource2':77,
    },
    resourcesConsumed: {
      'Resource3':200,
      'Resource4':73,
    },
  }
  Production Rate Produced / Production Rate Target. Result rounded down if generating resource, rounded up if consuming resource.
  Assuming 250 Production Rate is produced.
  250 (Production Rate Produced) / 100 (Production Rate Target) = 2.5 (Multiplier)
  Resources Generated:
    Resource1: 250
      100 (Resource1) x 2.5 (Multiplier) = 250
    Resource2: 192
      77 (Resource2) x 2.5 (Multiplier) = 192.5. Rounded down to 192.
  Resources Consumed:
    Resource3: 500
      200 (Resource3) x 2.5 (Multiplier) = 500
    Resource4: 183
      73 (Resource4) x 2.5 (Multiplier) = 182.5. Rounded up to 183.
  */

  'Warehouse': {
    name: 'Warehouse',
    category: 'Other',
    unlockStatus: false,
    buildableOnTerrain:['Grass', 'Water', 'Mountain', 'Forest'],
    resourcesGenerated: {},
    resourcesConsumed: {},
    workforceDefault: 0,
    capacityIncrease: {
      'Tree Logs': 500,
      'Lumber': 500
    },
  },

  'Placeholder District 1': {
    name: 'Placeholder District 1',
    category: 'Production',
    buildableOnTerrain:['Forest'],
  },
  'Placeholder District 2': {
    name: 'Placeholder District 2',
    category: 'Production',
    buildableOnTerrain:['Forest'],
  },
  'Placeholder District 3': {
    name: 'Placeholder District 3',
    category: 'Production',
    buildableOnTerrain:['Forest'],
  },
  'Placeholder District 4': {
    name: 'Placeholder District 4',
    category: 'Production',
    buildableOnTerrain:['Forest'],
  },
  'Placeholder District 5': {
    name: 'Placeholder District 5',
    category: 'Production',
    buildableOnTerrain:['Forest'],
  },
  'Placeholder District 7': {
    name: 'Placeholder District 7',
    category: 'Production',
    buildableOnTerrain:['Forest'],
  },
  'Placeholder District 6': {
    name: 'Placeholder District 6',
    category: 'Production',
    buildableOnTerrain:['Forest'],
  },
  'Placeholder District 8': {
    name: 'Placeholder District 8',
    category: 'Production',
    buildableOnTerrain:['Forest'],
  },
  'Placeholder District 9': {
    name: 'Placeholder District 9',
    category: 'Production',
    buildableOnTerrain:['Forest'],
  },
  'Placeholder District 10': {
    name: 'Placeholder District 10',
    category: 'Production',
    buildableOnTerrain:['Forest'],
  },
  'Placeholder District 11': {
    name: 'Placeholder District 11',
    category: 'Production',
    buildableOnTerrain:['Forest'],
  },
  'Placeholder District 12': {
    name: 'Placeholder District 12',
    category: 'Production',
    buildableOnTerrain:['Forest'],
  },


  'Logging District': {
    name: 'Logging District',
    category: 'Extraction',
    unlockStatus: false,
    professionName:'Lumberjack',
    professionNamePlural:'Lumberjacks',
    turnPriority: 1,
    workforceDefault: 100,
    buildableOnTerrain:['Forest'],
    productionRateTarget: 100,
    resourcesGenerated: {
      'Tree Logs':50,
    },
    resourcesConsumed: {},
    capacityIncrease: {
      'Tree Logs': 50,
    },
    constructionCost: {
      constructionTimer: 1,
      'Stone': 1
    },
    upgradesAvailable:{
      'Toolsheds':{
        name:'Toolsheds',
        unlockStatus: false,
        baseProductionRateMultiplier: 1,
        upgradeProductionRateMultiplier: 1,
        workersUpgraded: 100,
        resourcesGeneratedFromUpgrade:{
        },
        resourcesConsumedFromUpgrade:{
        }
      },
      'Heavy Machines':{
        name:'Heavy Machines',
        unlocked: false,
        baseProductionRateMultiplier: 2,
        upgradeProductionRateMultiplier: 1,
        workersUpgraded: 100,
        resourcesGeneratedFromUpgrade:{
        },
        resourcesConsumedFromUpgrade:{
        }
      },
      'Bark Extract':{
        name:'Bark Extract',
        unlocked: false,
        baseProductionRateMultiplier: 0,
        upgradeProductionRateMultiplier: 1,
        workersUpgraded: 100,
        resourcesGeneratedFromUpgrade:{
          'Bark': 50,
        },
        resourcesConsumedFromUpgrade:{
        }
      },

    }
  },

  'Lumber District': {
    name: 'Lumber District',
    category: 'Production',
    professionName:'Woodworker',
    professionNamePlural:'Woodworkers',
    turnPriority: 2,
    workforceDefault: 50,
    buildableOnTerrain:['Grass', 'Water', 'Mountain', 'Forest'],
    productionRateTarget: 100,
    resourcesGenerated: {
      'Lumber': 100,
      'Sawdust': 200,
    },
    resourcesConsumed: {
      'Tree Logs': 100,
    },
    capacityIncrease: {
      'Lumber': 100,
      'Sawdust': 200,
    },
  },

  'Carpentry District': {
    name: 'Carpentry District',
    category: 'Production',
    professionName:'Carpenter',
    professionNamePlural:'Carpenters',
    turnPriority: 3,
    workforceDefault:20,
    buildableOnTerrain:['Grass', 'Water', 'Mountain', 'Forest'],
    productionRateTarget: 100,
    resourcesGenerated: {
      'Wooden Furniture': 10,
    },
    resourcesConsumed: {
      'Lumber': 20,
    },
    capacityIncrease: {
      'Wooden Furniture': 10,
    },
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
  'Wooden Furniture': {
    name: 'Wooden Furniture',
    categoryEconomicSector: 'Secondary',
    categoryGrouping: ['Wood'],
    categoryTier: '3'
  },
  'Sawdust': {
    name: 'Sawdust',
    categoryEconomicSector: 'Secondary',
    categoryGrouping: ['Wood'],
    categoryTier: '2'
  },
  'Bark': {
    name: 'Bark',
    categoryEconomicSector: 'Primary',
    categoryGrouping: ['Wood'],
    categoryTier: '1'
  },
  'Stone': {
    name: 'Stone',
    categoryEconomicSector: 'Primary',
    categoryGrouping: ['Stone'],
    categoryTier: '1'
  },
};

function worldGeneration(rows, cols){
for (let q = 0; q < rows; q++) {
    for (let r = 0; r < cols; r++) {
      //Creates individual cell as a div
      const individualCell = document.createElement('div');
      //Adds class to each cell
      individualCell.classList.add('grid-cell');
      //Adds id to each cell
      individualCell.id = `cell-${q}-${r}`;

      //Calculate hexagon cell position based on q (row) and r (column) coordinates
      const y = q * 1.5 * cellSize;
      const x =
      r * (Math.sqrt(3) * cellSize) + (q % 2) * (Math.sqrt(3) / 2) * cellSize;

      //Set hexagon cell position using CSS
      individualCell.style.left = `${x}px`;
      individualCell.style.top = `${y}px`;

      //Generates terrain and adds default cell features
      const terrainType = generateTerrain();
      cellFeatures[individualCell.id] = {
        terrainType,
      };

      //Adds attribute for terrain to each cell, used in CSS for colouring
      individualCell.setAttribute('data-terrain', terrainType);
      //Adds cell to grid
      gameWorld.appendChild(individualCell);
    }
  }
  root.style.setProperty('--num-rows', rows);
  root.style.setProperty('--num-cols', cols);
};

function generateTerrain() {
  const terrainTypes = ['Grass', 'Water', 'Mountain', 'Forest'];
  //Generates terrain randomly
  const randomIndex = Math.floor(Math.random() * terrainTypes.length);
  return terrainTypes[randomIndex];
};

function handleStorageCapacityIncrease(cellId, districtInfo) {
  const cell = cellFeatures[cellId];

  //Handle resource capacity increase
  for (const resource in districtInfo.capacityIncrease) {
    const increaseAmount = districtInfo.capacityIncrease[resource];

    if (cell[cellFeaturesCapacityKey][resource]) {
      const previousCapacity = cell[cellFeaturesCapacityKey][resource].capacity;
      cell[cellFeaturesCapacityKey][resource].capacity += increaseAmount;
      const newCapacity = cell[cellFeaturesCapacityKey][resource].capacity;

      if (previousCapacity !== newCapacity) {
        console.log(
        `(Capacity) Cell: ${cellId}. Resource: ${resource}. Capacity increased by: ${increaseAmount} (${previousCapacity} To ${newCapacity})`);
      }
    }
  }
};

function resourceChangePerTurn() {
  //Loop through all cells
  for (const cellId of playerClaimedCells) {
    const cell = cellFeatures[cellId];
    const districts = cell[cellFeaturesDistrictsKey];
    const totalResourceGenerationLastTurn = {};
    const totalResourceConsumptionLastTurn = {};

    //Sort districts based on priority. Lower = higher priority.
    districts.sort((a, b) => {
      return districtData[a.name].turnPriority - districtData[b.name].turnPriority;
    });


    //Loop through districts in the cell
    for (const district of districts) {
      const districtInfo = districtData[district.name]

      //Check if district has required resources to be consumed in storage
      let resourcesToBeConsumedAvailable = true;

      for (const resource in districtInfo.resourcesConsumed) {
        const requiredAmount = districtInfo.resourcesConsumed[resource];

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
        for (const resource in districtInfo.resourcesConsumed) {
          const consumedAmount = districtInfo.resourcesConsumed[resource];
          cell[cellFeaturesCapacityKey][resource].amount -= consumedAmount;

          //Tracks resource consumption by putting it in a placeholder to be put in cellFeatures
          if (totalResourceConsumptionLastTurn[resource]) {
            totalResourceConsumptionLastTurn[resource] += consumedAmount;
          } else {
            totalResourceConsumptionLastTurn[resource] = consumedAmount;
          }
        }

        //Resource generation
        for (const resource in districtInfo.resourcesGenerated) {
          const generatedAmount = districtInfo.resourcesGenerated[resource];

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
};

function populationChangePerTurn() {
  for (const cellId of playerClaimedCells){
    const cell = cellFeatures[cellId];
    const populationTotalInCell = cell[cellFeaturesPopulationKey];
    const individualPopsInCell = cell[cellFeaturesIndividualPopulationKey];
    //Sets keys to zero to keep key calculations correct & consistent.
    populationTotalInCell.totalPopulation = 0;
    populationTotalInCell.usedWorkforce = 0;
    populationTotalInCell.availableWorkforce = 0;
    populationTotalInCell.totalWorkforce = 0;
    populationTotalInCell.populationGrowthLastTurn = 0;
    populationTotalInCell.populationMortalityLastTurn = 0;

    for (const pop in individualPopsInCell){
      individualPop = individualPopsInCell[pop]
      individualPop.populationGrowthLastTurn = Math.ceil(individualPop.populationGrowth * individualPop.totalPopulation);
      individualPop.populationMortalityLastTurn = Math.ceil(individualPop.populationMortality * individualPop.totalPopulation);
      individualPop.totalPopulation += individualPop.populationGrowthLastTurn - individualPop.populationMortalityLastTurn;
      individualPop.totalWorkforce = Math.floor(individualPop.totalPopulation * individualPop.workforceProportion);
      individualPop.availableWorkforce = individualPop.totalWorkforce - individualPop.usedWorkforce;

      populationTotalInCell.populationGrowthLastTurn += individualPop.populationGrowthLastTurn;
      populationTotalInCell.populationMortalityLastTurn += individualPop.populationMortalityLastTurn;
      populationTotalInCell.totalPopulation += individualPop.totalPopulation;
      populationTotalInCell.totalWorkforce += individualPop.totalWorkforce;
      populationTotalInCell.availableWorkforce += individualPop.availableWorkforce;
      populationTotalInCell.usedWorkforce += individualPop.usedWorkforce;
      //Max pop based on districts and certain terrain features
      //populationCellTotal.maxPopulation = ;
    }
  }
};

function generateDistrictCategoryTabs() {
  let tabContent = '';
  for (const category in districtCategoriesData) {
    const categoryName = districtCategoriesData[category].name;
    tabContent += `<button class="${districtCategoryBtnCls}" data-category="${category}">${categoryName}</button>`;
  }
  return tabContent;
}

function generateDistrictMenu(terrainType) {
  let districtMenuContent = '';
  for (const category in districtCategoriesData) {
    const districts = Object.values(districtData)
      .filter((district) => district.category === category && district.buildableOnTerrain.includes(terrainType));

    if (districts.length > 0) {
      districtMenuContent += `<div class="${districtSelectorId}" data-category="${category}">`;
      for (const district of districts) {
        districtMenuContent += `<button class="${districtBtnCls}" data-district="${district.name}">${district.name}</button>`;
      }
      districtMenuContent += `</div>`;
    }
  }
  return districtMenuContent;
}

function generateClaimedCellMenuContent(terrainType) {
  const menuContent = 
  `<div id="${districtCategoryScrollbarId}">
    ${generateDistrictCategoryTabs()}
    </div>

  <div id="${districtSelectorContainerId}">
    ${generateDistrictMenu(terrainType)}
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

function showDistrictTabs(category) {
  const districtTabContainerId = document.getElementById(districtSelectorContainerId);
  districtTabContainerId.style.display = 'flex';

  const districtTabs = document.querySelectorAll(`.${districtSelectorId}`);
  districtTabs.forEach((tab) => {
    const districtTabCategory = tab.getAttribute('data-category');
    if (districtTabCategory === category) {
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
  districtMenu.innerHTML = menuContent;
  //Show menu
  districtMenu.style.display = 'block';
  //Hide district buttons to show later
  const districtTabContainerId = document.getElementById(districtSelectorContainerId);
  districtTabContainerId.style.display = 'none';

  //Event listener for tabs.
  const tabContainer = document.getElementById(districtCategoryScrollbarId);
  tabContainer.addEventListener('click', (event) => {
    const target = event.target;
    if (target.classList.contains(districtCategoryBtnCls)) {
      const category = target.getAttribute('data-category');
      showDistrictTabs(category);
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
  //Add newly claimed cell to array
  playerClaimedCells.push(cellId);

  //Update the cell's class
  const cellElement = document.getElementById(cellId);
  cellElement.classList.add('claimed');

  //Disable the claim button for the claimed cell
  clickedElement.disabled = true;

  //Uses config data of resources as a template to be implemented into object for individual cells, to be used as resource storage.
  cellFeatures[cellId][cellFeaturesCapacityKey] = JSON.parse(JSON.stringify(resourceData));
  //Adds amount and capacity properties to track resource storage
  for (const resource in cellFeatures[cellId][cellFeaturesCapacityKey]) {
    if (cellFeatures[cellId][cellFeaturesCapacityKey].hasOwnProperty(resource)) {
      cellFeatures[cellId][cellFeaturesCapacityKey][resource].amount = 0;
      cellFeatures[cellId][cellFeaturesCapacityKey][resource].capacity = 0;
    }
  }

  //Uses config data of resources as a template to be implemented into object for individual cells, to be used as resource storage.
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
  cellFeatures[cellId][cellFeaturesDistrictsKey] = [];
  cellFeatures[cellId][cellFeaturesPopulationKey] = JSON.parse(JSON.stringify(populationTotalTemplate));

  console.log(`Cell: ${cellId} claimed.`);
  console.log(playerClaimedCells)
}

function constructDistrict(cellId, districtName) {
  const cell = cellFeatures[cellId];
  const districtInfo = districtData[districtName];

  //Check if required resources are available
  for (const resource in districtInfo.resourcesRequired) {
    const requiredAmount = districtInfo.resourcesRequired[resource];
    
    if (cell[cellFeaturesCapacityKey][resource].amount < requiredAmount) {
      console.log(`Insufficient ${resource} to construct ${districtName}`);
      return;
    }
  
  //Use required resources for construction
    else {
      const requiredAmount = districtInfo.resourcesRequired[resource];
      cell[cellFeaturesCapacityKey][resource].amount -= requiredAmount;
    }
  }
  console.log(`District constructed: ${districtName}`);

  //The template of the district being added to cellFeatures.
  const districtTemplate =
  {
  name: districtName,
  uniqueId: uniqueDistrictIdIteration,
  currentWorkforce:0,
  maximumWorkforce:0,
  resourcesGenerated:{},
  resourcesConsumed:{},
  capacityIncrease:{},
  workforceCapacityUpgrades:0,
  };

  //Adding all the default properties of an initially constructed district
  for (const resource in districtInfo.resourcesGenerated){
    const generatedAmount = districtInfo.resourcesGenerated[resource];
    districtTemplate.resourcesGenerated[resource] = generatedAmount;
    console.log(`(Generation) Cell: ${cellId}. Resource: ${resource}. Resource generation increased by ${generatedAmount}.`);
  }
  for (const resource in districtInfo.resourcesConsumed){
    const consumedAmount = districtInfo.resourcesConsumed[resource];
    districtTemplate.resourcesConsumed[resource] = consumedAmount;
    console.log(`(Consumption) Cell: ${cellId}. Resource: ${resource}. Resource consumption increased by ${consumedAmount}.`);
  }
  for (const resource in districtInfo.capacityIncrease){
    const capacityAmount = districtInfo.capacityIncrease[resource];
    districtTemplate.capacityIncrease[resource] = capacityAmount;
    console.log(`(Capacity) Cell: ${cellId}. Resource: ${resource}. Resource capacity increased by ${capacityAmount}.`);
  }
 
  const workforceAmount = districtInfo.workforceDefault;
  const workforcePluralName = districtInfo.professionNamePlural;
  districtTemplate.maximumWorkforce = workforceAmount;
  console.log(`(Workforce) Cell: ${cellId}. Workforce maximum increased by ${workforceAmount} ${workforcePluralName}.`);





  cell[cellFeaturesDistrictsKey].push(districtTemplate);
  uniqueDistrictIdIteration++

  handleStorageCapacityIncrease(cellId, districtInfo);
}

function handleCellClick(event) {
  const clickedElement = event.target;
  
  if (clickedElement.classList.contains('grid-cell')) {
    const cellId = clickedElement.id;
    selectedCellId = cellId;
    //Hides menus to stop overlap
    unclaimedCellMenu.style.display = 'none';
    districtMenu.style.display = 'none';
    console.log('Current Cell:', selectedCellId);

    if (playerClaimedCells.includes(cellId) ) {
      openClaimedCellMenu(cellId);
      //Console logs for testing
      console.log('Cell clicked:', cellId);
      console.log('Districts:', cellFeatures[cellId][cellFeaturesDistrictsKey]);
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

    
  } else if (clickedElement.classList.contains(`${districtBtnCls}`)) {
    const districtName = clickedElement.getAttribute('data-district');

    constructDistrict(selectedCellId, districtName)

  } else if (clickedElement.classList.contains('claim-cell-btn')) {
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

//Initialized on load temporary until game start screen is made
worldGeneration(numRows, numCols)

gameWorld.addEventListener('click', handleCellClick);
districtMenu.addEventListener('click', handleCellClick);
unclaimedCellMenu.addEventListener('click', handleCellClick);
