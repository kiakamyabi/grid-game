//Store terrain as object along with cell features
//Solve problem of player building anywhere.
//Add turns
//Get buildings into different tabs with better UI
//Change generation to be procedural instead of random (perlin noise with seeds?)
const gameGrid = document.getElementById('game-grid')
const table = document.createElement('table');
let selectedCellId = null;
//Configs
const numRows = 10;
const numCols = 10;

const cellFeatures = {};

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
      rowPlusOne = row + 1;
      colPlusOne = col + 1;
      individualCell.id = `cell-${rowPlusOne}-${colPlusOne}`;
      newRow.appendChild(individualCell);

      const terrainType = generateTerrain();
      cellFeatures[individualCell.id] = {terrainType, building: [] };

      individualCell.setAttribute('data-terrain', terrainType);
    }
    table.appendChild(newRow);
  }
  gameGrid.appendChild(table);
}

worldGeneration()

gameGrid.addEventListener('click', handleCellClick);

//Generates terrain randomly
function generateTerrain() {
  const terrainTypes = ['grass', 'water', 'mountain', 'forest'];
  const randomIndex = Math.floor(Math.random() * terrainTypes.length);
  return terrainTypes[randomIndex];
}

////////////

function generateTabs() {
  let tabContent = '';
  for (const category in buildingCategories) {
    const categoryName = buildingCategories[category].name;
    tabContent += `<button class="tab" data-category="${category}">${categoryName}</button>`;
  }
  return tabContent;
}

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

  function generateMenuContent(terrainType) {
    const menuContent = `<div class="tab-container">
      ${generateTabs()}
      ${generateBuildingLists(terrainType)}
    </div>`;
  
    return menuContent;
  }

function showBuildingList(category) {
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

  const tabs = menuContentContainer.querySelectorAll('.tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const category = tab.getAttribute('data-category');
      showBuildingList(category);
    });
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







