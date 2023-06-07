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
//Keys
const cellFeaturesBuildingsKey = 'buildings';
const cellFeaturesStorageKey = 'storage';
//Configs
const numRows = 10;
const numCols = 10;

const terrainBuildings = {
  Grass: ['Cabin', 'Farm', 'Hunting Lodge'],
  Water: ['Cabin', 'Saltworks', 'Fishing Dock'],
  Mountain: ['Cabin', 'Mine'],
  Forest: ['Cabin', 'Lumber Mill', 'Hunting Lodge', 'Logging Shack']
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
  },
  'Logging Shack': {
    name: 'Logging Shack',
    category: 'Industry',
    resourcesGenerated: {
      'Tree Logs': 1
    },
    resourcesConsumed: {},
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
    categoryGrouping: ['Wood'],
    categoryTier: '1',
    amount: 0,
  },

  'Lumber': {
    name: 'Lumber',
    categoryEconomicSector: 'Secondary',
    categoryGrouping: ['Wood'],
    categoryTier: '2',
    amount: 0,
  },

  'Wooden Chair': {
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
        [cellFeaturesStorageKey]: JSON.parse(JSON.stringify(resourceTypes))

      };

      individualCell.setAttribute('data-terrain', terrainType);
    }
    table.appendChild(newRow);
  }
  gameWorld.appendChild(table);
}

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

function resourceChangePerTurn() {
  //Loop through all cells
  for (const cellId in cellFeatures) {
    const cell = cellFeatures[cellId];
    const buildings = cell[cellFeaturesBuildingsKey];

    //Loop through buildings in all cells
    for (const building of buildings) {
      const buildingInfo = buildingData[building];

      //Handle resource generation
      for (const resource in buildingInfo.resourcesGenerated) {
        const amount = buildingInfo.resourcesGenerated[resource];
        cell[cellFeaturesStorageKey][resource].amount += amount; 
      }

      //Handle resource consumption
      for (const resource in buildingInfo.resourcesConsumed) {
        const amount = buildingInfo.resourcesConsumed[resource];
        cell[cellFeaturesStorageKey][resource].amount -= amount;
      }
    }
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







