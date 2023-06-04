//Store terrain as object along with cell features
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
  grass: [
    { name: 'Farm', category: 'production' },
    { name: 'Lumber Mill', category: 'production' },
    { name: 'Hunting Lodge', category: 'production' }
  ],
  water: [
    { name: 'Boat Dock', category: 'industry' },
    { name: 'Fishing Hut', category: 'other' }
  ],
  mountain: [
    { name: 'Mine', category: 'industry' },
    { name: 'Cabin', category: 'other' }
  ],
  forest: [
    { name: 'Lumber Mill', category: 'production' },
    { name: 'Hunting Lodge', category: 'production' }
  ]
};

const buildingCategories = {
  production: {
    name: 'Production',
    buildings: ['Farm', 'Lumber Mill', 'Hunting Lodge']
  },
  industry: {
    name: 'Industry',
    buildings: ['Mine', 'Boat Dock']
  },
  other: {
    name: 'Other',
    buildings: ['Fishing Hut', 'Cabin']
  }
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
      cellFeatures[individualCell.id] = {terrainType, building: [] };

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

//Used in generateMenuContent
function generateBuildingLists(terrainType) {
  let buildingListContent = '';
  for (const category in buildingCategories) {
    const buildings = terrainBuildings[terrainType]
      .filter((building) => building.category === category)
      .map((building) => building.name);
    if (buildings.length > 0) {
      buildingListContent += `<div class="building-list" data-category="${category}">`;
      for (const building of buildings) {
        buildingListContent += `<button class="building-btn" data-building="${building}">${building}</button>`;
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

  <div id="building-tab-container">
    ${generateBuildingLists(terrainType)}
  </div>`;

  return menuContent;
}

function showBuildingList(category) {
  //Show Building Buttons
  const buildingTabContainerId = document.getElementById('building-tab-container');
  buildingTabContainerId.style.display = 'block';

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
  const buildingTabContainerId = document.getElementById('building-tab-container');
  buildingTabContainerId.style.display = 'none';

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
    console.log('Current Cell:', selectedCellId)

    openCellMenu(selectedCellId);
  }
}
console.log(cellFeatures)







