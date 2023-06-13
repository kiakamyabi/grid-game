//Add construction build times
//Change generation to be procedural instead of random (perlin noise with seeds?)
//Decide on buildings limit
//Put configs and stuff in another file at some point
//Make special menu for when the player is claiming the first cell, like settling turn 1 for Civ

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
//Keys
const cellFeaturesBuildingsKey = 'buildings';
const cellFeaturesCapacityKey = 'storageCapacity';
const cellFeaturesResourceGenerationKey = 'resourceGeneration'; 
const cellFeaturesResourceConsumptionKey = 'resourceConsumption';
//Configs
const numRows = 15;
const numCols = 15;

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
  'Warehouse': {
    name: 'Warehouse',
    category: 'Other',
    resourcesGenerated: {},
    resourcesConsumed: {},
    capacityIncrease: {
      'Tree Logs': 5,
      'Lumber': 5
    },
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
  'Lumber Mill': {
    name: 'Lumber Mill',
    category: 'Industry',
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
  'Logging Shack': {
    name: 'Logging Shack',
    category: 'Industry',
    resourcesGenerated: {
      'Tree Logs': 1
    },
    resourcesConsumed: {},
    capacityIncrease: {
      'Tree Logs': 5,
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
const resourceTypes = {
//categoryEconomicSector based on https://en.wikipedia.org/wiki/Economic_sector.
//categoryGrouping = Grouping certain resources together for easy filtering e.g Wooden Chair in the Furniture category and Wood category.
//categoryTier = Each level above 1 represents how far down a production chain a resource is e.g Lumber made from Tree Logs = T2.
  'Tree Logs': {
    name: 'Tree Logs',
    categoryEconomicSector: 'Primary',
    categoryGrouping: ['Wood', 'Construction Material'],
    categoryTier: '1',
    amount: 0,
    capacity: 0,
  },

  'Lumber': {
    name: 'Lumber',
    categoryEconomicSector: 'Secondary',
    categoryGrouping: ['Wood', 'Construction Material'],
    categoryTier: '2',
    amount: 0,
    capacity: 0,
  },

  'Wooden Chair': {
    name: 'Wooden Chair',
    categoryEconomicSector: 'Secondary',
    categoryGrouping: ['Wood'],
    categoryTier: '3',
    amount: 0,
    capacity: 0,
  },
};

//World Map Generation
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
        [cellFeaturesBuildingsKey]: [],
        [cellFeaturesCapacityKey]: JSON.parse(JSON.stringify(resourceTypes)),
        [cellFeaturesResourceGenerationKey]: {},
        [cellFeaturesResourceConsumptionKey]: {},
        
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
        `Cell: ${cellId}, Resource: ${resource}, Capacity Increased By: ${increaseAmount} (From ${previousCapacity} To ${newCapacity})`);
      }
    }
  }
}

function resourceChangePerTurn() {
  //Loop through all cells
  for (const cellId in cellFeatures) {
    const cell = cellFeatures[cellId];
    const buildings = cell[cellFeaturesBuildingsKey];
    const totalResourceGeneration = {};
    const totalResourceConsumption = {};

    //Loop through buildings in all cells
    for (const building of buildings) {
      const buildingInfo = buildingData[building];
      //console.log(`Building constructed ${building}`)

      //Handle resource generation
      for (const resource in buildingInfo.resourcesGenerated) {
        const amount = buildingInfo.resourcesGenerated[resource];

        //Tracks resource generation by putting it in a placeholder to be put in cellFeatures
        if (totalResourceGeneration[resource]) {
          totalResourceGeneration[resource] += amount;
        } else {
          totalResourceGeneration[resource] = amount;
        }

        //Checks for resource capacity
        if (cell[cellFeaturesCapacityKey][resource]) {
          const currentAmount = cell[cellFeaturesCapacityKey][resource].amount;
          const storageCapacity = cell[cellFeaturesCapacityKey][resource].capacity;

          if (currentAmount < storageCapacity) {
            const remainingCapacity = storageCapacity - currentAmount;
            const generatedAmount = Math.min(amount, remainingCapacity);
            cell[cellFeaturesCapacityKey][resource].amount += generatedAmount;
          }
        }
      }

      //Handle resource consumption (need to have 'else statement' for if resource isn't available)
      for (const resource in buildingInfo.resourcesConsumed) {
        const amount = buildingInfo.resourcesConsumed[resource];

         //Tracks resource consumption by putting it in a placeholder to be put in cellFeatures
         if (totalResourceConsumption[resource]) {
          totalResourceConsumption[resource] += amount;
        } else {
          totalResourceConsumption[resource] = amount;
        }
        
        if (cell[cellFeaturesCapacityKey][resource]) {
          if (cell[cellFeaturesCapacityKey][resource].amount >= amount) {
            cell[cellFeaturesCapacityKey][resource].amount -= amount;
          } 
        }
      }

      //Updates cellFeature for resource generation & consumption, using placeholders.
      cell[cellFeaturesResourceGenerationKey] = totalResourceGeneration;
      cell[cellFeaturesResourceConsumptionKey] = totalResourceConsumption;

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

function generateBuildingLists(terrainType) {
  let buildingListContent = '';
  for (const category in buildingCategories) {
    const buildings = Object.values(buildingData)
      .filter((building) => building.category === category && terrainBuildings[terrainType].includes(building.name));

    if (buildings.length > 0) {
      buildingListContent += `<div class="building-tab" data-category="${category}">`;
      for (const building of buildings) {
        buildingListContent += `<button class="building-btn" data-building="${building.name}">${building.name}</button>`;
      }
      buildingListContent += `</div>`;
    }
  }
  return buildingListContent;
}

function generateClaimedCellMenuContent(terrainType) {
  const menuContent = 
  `<div id="building-category-tab-container">
    ${generateBuildingCategoryTabs()}
    </div>

  <div id="building-tab-container">
    ${generateBuildingLists(terrainType)}
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
  //Show building buttons
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

//Tracks adjacent cells into an array
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
    firstClaimedCell = selectedCellId;
  }
  playerClaimedCells.push(cellId);

  //Update the cell's class
  const cellElement = document.getElementById(cellId);
  cellElement.classList.add('claimed');

  //Disable the claim button for the claimed cell
  const claimButton = clickedElement;
  claimButton.disabled = true;

  console.log(`Cell: ${cellId} claimed.`);
  console.log(playerClaimedCells)
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

      if (selectedCellId) {
        const cell = cellFeatures[selectedCellId];
        //Add building to cellFeatures
        cell[cellFeaturesBuildingsKey].push(buildingName);
        console.log(`Building: ${buildingName} added to ${selectedCellId}`);

        //Handle capacity of resources increased from the newly added building
        const buildingInfo = buildingData[buildingName];
        handleStorageCapacityIncrease(selectedCellId, buildingInfo);
      }

  } else if (clickedElement.classList.contains('claim-cell-btn')) {
      //Handle claim button 
      claimCell(selectedCellId, clickedElement);
    }

}

//Advance the turn and trigger end of turn changes
function advanceTurn() {
  currentTurn++;
  resourceChangePerTurn()
  console.log(`Turn: ${currentTurn}`);
  console.log(cellFeatures);
}

//Need to make button for game start
worldGeneration()

gameWorld.addEventListener('click', handleCellClick);
buildingMenu.addEventListener('click', handleCellClick);
unclaimedCellMenu.addEventListener('click', handleCellClick);