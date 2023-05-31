//Store terrain as object along with cell features
//Solve problem of player building anywhere.
//Add turns
const gameGrid = document.getElementById('game-grid')
const table = document.createElement('table');
let selectedCellId = null;
//Configs
const numRows = 5;
const numCols = 5;

const cellFeatures = {};

const terrainBuildings = {
  grass: ['Farm'],
  water: ['Boat Dock', 'Fishing Hut'],
  mountain: ['Mine', 'Cabin'],
  forest: ['Lumber Mill', 'Hunting Lodge']
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

function generateTerrain() {
  const terrainTypes = ['grass', 'water', 'mountain', 'forest'];
  const randomIndex = Math.floor(Math.random() * terrainTypes.length);
  return terrainTypes[randomIndex];
}

////////////
// Generate the menu content based on the available buildings for the selected terrain
function generateMenuContent(terrainType) {
  const availableBuildings = terrainBuildings[terrainType];
  let menuContent = '';

  for (const building of availableBuildings) {
    menuContent += `<button class="building-btn" data-building="${building}">${building}</button>`;
  }

    menuContent += `</div>`;
    return menuContent;
  }

// Function to open the menu for the selected cell
function openCellMenu(cellId) {
  const selectedCell = cellFeatures[cellId];
  const terrainType = selectedCell.terrainType;
  const menuContent = generateMenuContent(terrainType);

  // Update the menu content
  const menuContentContainer = document.getElementById('building-menu');
  menuContentContainer.innerHTML = menuContent;

  // Display the menu
  menuContentContainer.style.display = 'block';
}
///////////

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







