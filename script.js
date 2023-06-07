//Solve problem of player building anywhere. 
//Add construction build times
//Get buildings into different tabs with better UI
//Change generation to be procedural instead of random (perlin noise with seeds?)
//Position menu properly so its always visible
//Decide on buildings limit

//Data
const gameWorld = document.getElementById('game-grid')
const buildingMenu = document.getElementById('building-menu')
const table = document.createElement('table');
let selectedCellId = null;
const cellFeatures = {};
let currentTurn = 0;

//Configs
const numRows = 10;
const numCols = 10;
//Keys
const cellFeaturesBuildingsKey = 'buildings';
const cellFeaturesStorageKey = 'storage';

const terrainBuildings = {
  Grass: ['Cabin', 'Farm', 'Hunting Lodge'],
  Water: ['Cabin', 'Saltworks', 'Fishing Dock'],
  Mountain: ['Cabin', 'Mine'],
  Forest: ['Cabin', 'Lumber Mill','Hunting Lodge']
};

const buildingCategories = {
  production: {
    name: 'Production'
  },
  industry: {
    name: 'Industry'
  },
  other: {
    name: 'Other'
  }
};

const buildingData = {
  Cabin: {
    name: 'Cabin',
    category: 'other',
    resourceGeneration:{

    },
    resourcesConsumed: {

    },
  },

  Farm: {
    name: 'Farm',
    category: 'production',
    resourceGeneration:{

    },
    resourcesConsumed: {

    },
  },

  HuntingLodge: {
    name: 'Hunting Lodge',
    category: 'other',
    resourceGeneration:{

    },
    resourcesConsumed: {

    },
  },

  Saltworks: {
    name: 'Saltworks',
    category: 'production',
    resourceGeneration:{

    },
    resourcesConsumed: {

    },
  },

  LumberMill: {
    name: 'Lumber Mill',
    category: 'industry',
    resourceGeneration:{
      'Lumber': 1
    },
    resourcesConsumed: {
      'Tree Logs': 1,
    },
  },

  LoggingShack: {
    name: 'Logging Shack',
    category: 'industry',
    resourceGeneration:{
      'Tree Logs': 1
    },
  },
  
  FishingDock: {
    name: 'Fishing Dock',
    category: 'production',
  },

  Mine: {
    name: 'Mine',
    category: 'production',
  },

};

const resourceTypes = {
//categoryEconomicSector based on https://en.wikipedia.org/wiki/Economic_sector.
//categoryGrouping = Grouping certain resources together for easy filtering e.g Wooden Chair in the Furniture category and Wood category.
//categoryTier = Each level above 1 represents how far down a production chain a resource is e.g Lumber made from Tree Logs = T2.
  TreeLogs: {
    name: 'Tree Logs',
    categoryEconomicSector: 'Primary',
    categoryGrouping: ['Wood'],
    categoryTier: '1',
    amount: 0,
  },
  Lumber: {
    name: 'Lumber',
    categoryEconomicSector: 'Secondary',
    categoryGrouping: ['Wood'],
    categoryTier: '2',
    amount: 0,
  },
  WoodenChair: {
    name: 'Wooden Chair',
    categoryEconomicSector: 'Secondary',
    categoryGrouping: ['Wood'],
    categoryTier: '3',
    amount: 0,
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
        [cellFeaturesStorageKey]: { ...resourceTypes }

      };

      individualCell.setAttribute('data-terrain', terrainType);
    }
    table.appendChild(newRow);
  }
  gameWorld.appendChild(table);
}
//Need to make button for game start
worldGeneration()

gameWorld.addEventListener('click', handleCellClick);
buildingMenu.addEventListener('click', handleCellClick);

//Generates terrain randomly
function generateTerrain() {
  const terrainTypes = ['Grass', 'Water', 'Mountain', 'Forest'];
  const randomIndex = Math.floor(Math.random() * terrainTypes.length);
  return terrainTypes[randomIndex];
}

//Generates the tabs for the building categories
function generateTabs() {
  let tabContent = '';
  for (const category in buildingCategories) {
    const categoryName = buildingCategories[category].name;
    tabContent += `<button class="tab" data-category="${category}">${categoryName}</button>`;
  }
  return tabContent;
}

//Used in generateMenuContent.
function generateBuildingLists(terrainType) {
  let buildingListContent = '';
  for (const category in buildingCategories) {
    const buildings = Object.values(buildingData)
      .filter((building) => building.category === category && terrainBuildings[terrainType].includes(building.name));

    if (buildings.length > 0) {
      buildingListContent += `<div class="building-list" data-category="${category}">`;
      for (const building of buildings) {
        buildingListContent += `<button class="building-btn" data-building="${building.name}">${building.name}</button>`;
      }
      buildingListContent += `</div>`;
    }
  }
  return buildingListContent;
}

//Makes the actual 'menu'
//terrainType = The terrain type associated with specific cell based on id, stored in cellFeatures.
function generateMenuContent(terrainType) {
  const menuContent = 
  `<div id="tab-container">
    ${generateTabs()}
    </div>

  <div id="buildings-tab-container">
    ${generateBuildingLists(terrainType)}
  </div>`;

  return menuContent;
}

function showBuildingList(category) {
  //Show building buttons
  const buildingsTabContainerId = document.getElementById('buildings-tab-container');
  buildingsTabContainerId.style.display = 'block';

  const buildingLists = document.querySelectorAll('.building-list');
  buildingLists.forEach((list) => {
    const listCategory = list.getAttribute('data-category');
    if (listCategory === category) {
      list.style.display = 'block';
    } else {
      list.style.display = 'none';
    }
  });
}

//
function resourceChangePerTurn() {
  for (const cellId in cellFeatures) {
    const cell = cellFeatures[cellId];
    const buildingsInCell = cell.buildings;

    for (const building of buildingsInCell) {
      const resourcesGenerated = buildingData[building].resourcesGenerated;
      const resourcesConsumed = buildingData[building].resourcesConsumed;

      //Generate resources
      for (const resource in resourcesGenerated) {
        cell[cellFeaturesStorageKey][resource].amount += resourcesGenerated[resource];
      }

      //Consume resources
      for (const resource in resourcesConsumed) {
        const requiredAmount = resourcesConsumed[resource];
        if (cell[cellFeaturesStorageKey][resource].amount >= requiredAmount) {
          cell[cellFeaturesStorageKey][resource].amount -= requiredAmount;
        } else {
          //Handle no resources
        }
      }
    }
  }
}
//

//Open the menu for selected cell
function openCellMenu(cellId) {
  const selectedCell = cellFeatures[cellId];
  const terrainType = selectedCell.terrainType;
  const menuContent = generateMenuContent(terrainType);
//Update menu
  const menuContentContainer = document.getElementById('building-menu');
  menuContentContainer.innerHTML = menuContent;
//Show menu
  menuContentContainer.style.display = 'block';
 //Hide building buttons to show later
  const buildingsTabContainerId = document.getElementById('buildings-tab-container');
  buildingsTabContainerId.style.display = 'none';

//Event listener for tabs. (Can put as separate function maybe)
  const tabContainer = document.getElementById('tab-container');
  tabContainer.addEventListener('click', (event) => {
    const target = event.target;
    if (target.classList.contains('tab')) {
      const category = target.getAttribute('data-category');
      showBuildingList(category);
    }
  });
}

function handleCellClick(event) {
  const clickedElement = event.target;
  
  if (clickedElement.classList.contains('grid-cell')) {
    const cellId = clickedElement.id;
    selectedCellId = cellId;

    openCellMenu(selectedCellId);

    //Console logs for testing
    console.log('Cell clicked:', cellId);
    console.log('Buildings:', cellFeatures[cellId][cellFeaturesBuildingsKey])
    console.log('Terrain:', cellFeatures[cellId].terrainType)
    console.log('In storage:', cellFeatures[cellId][cellFeaturesStorageKey])
    console.log('Current Cell:', selectedCellId)
    
  }  else if (clickedElement.classList.contains('building-btn')) {
    const buildingName = clickedElement.getAttribute('data-building');

    if (selectedCellId) {
      const cell = cellFeatures[selectedCellId];
      //Add building to cellFeatures
      cell[cellFeaturesBuildingsKey].push(buildingName);
      //Console log to confirm the building is added to the cell
      console.log(`Building ${buildingName} added to ${selectedCellId}`);
      console.log('Buildings:', cell[cellFeaturesBuildingsKey]);
    }
  }
}

//
//Advance the turn and trigger end of turn changes
function advanceTurn() {
  turn++;
  resourceChangePerTurn()
  console.log(`Turn: ${currentTurn}`);
  console.log(cellFeatures);
}
//







