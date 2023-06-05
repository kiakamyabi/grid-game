//Solve problem of player building anywhere.
//Add turns
//Get buildings into different tabs with better UI
//Change generation to be procedural instead of random (perlin noise with seeds?)
//Position menu properly so its always visible

//Data
const gameGrid = document.getElementById('game-grid')
const table = document.createElement('table');
let selectedCellId = null;
const cellFeatures = {};
//Configs
const numRows = 10;
const numCols = 10;

const terrainBuildings = {
  grass: ['Cabin', 'Farm', 'Hunting Lodge'],
  water: ['Cabin', 'Saltworks', 'Fishing Dock'],
  mountain: ['Cabin', 'Mine'],
  forest: ['Cabin', 'Lumber Mill','Hunting Lodge']
};

const buildingCategories = {
  production: {
    name: 'Production'
    // buildings:
  },
  industry: {
    name: 'Industry'
    // buildings: 
  },
  other: {
    name: 'Other'
    // buildings: 
  }
};

const buildingData = {
  Cabin: {
    name: 'Cabin',
    category: 'other',
  },

  Farm: {
    name: 'Farm',
    category: 'production',
  },

  HuntingLodge: {
    name: 'Hunting Lodge',
    category: 'other',
  },

  Saltworks: {
    name: 'Saltworks',
    category: 'production',
  },

  LumberMill: {
    name: 'Lumber Mill',
    category: 'industry',
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
  TreeLogs: {
    name: 'Tree Logs',
    categoryEconomicSector: 'Primary',
    categoryGrouping: 'Wood',
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
        building: [],
        storage: { ...resourceTypes }

      };

      individualCell.setAttribute('data-terrain', terrainType);
    }
    table.appendChild(newRow);
  }
  gameGrid.appendChild(table);
}
//Need to make button for game start
worldGeneration()

gameGrid.addEventListener('click', handleCellClick);

//Generates terrain randomly
function generateTerrain() {
  const terrainTypes = ['grass', 'water', 'mountain', 'forest'];
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

//Utility. Used in generateMenuContent.
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
    console.log('Cell clicked:', cellId);
    console.log('Buildings:', cellFeatures[cellId].building)
    console.log('Terrain:', cellFeatures[cellId].terrainType)
    console.log('In storage:', cellFeatures[cellId].storage)
    console.log('Current Cell:', selectedCellId)

    openCellMenu(selectedCellId);
  }
}
console.log(cellFeatures)







