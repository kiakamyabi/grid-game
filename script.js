//Store terrain as object along with cell features
//Solve problem of multiple buildings. Maybe slots?
const gameGrid = document.getElementById('game-grid')
const table = document.createElement('table');
//Configs
const numRows = 5;
const numCols = 5;

const cellFeatures = {};

// const buildings = {
//     'Farm': 50,
//     'Mine': 100,
//     'Shop': 200
//   };

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

//Another version for event listener to trigger on cell click but not dynamic for expanding grid
//const cellTotal = document.querySelectorAll('.grid-cell');

// cellTotal.forEach(cell => {
//   cell.addEventListener('click', handleCellClick);
// });

// function handleCellClick(event){
//   const cellId = event.target.id;
//   console.log('Cell clicked:', cellId);
// }

gameGrid.addEventListener('click', handleCellClick);

function generateTerrain() {
  const terrainTypes = ['grass', 'water', 'mountain', 'forest'];
  const randomIndex = Math.floor(Math.random() * terrainTypes.length);
  return terrainTypes[randomIndex];
}

function handleCellClick(event) {
  const clickedElement = event.target;
  
  if (clickedElement.classList.contains('grid-cell')) {
    const cellId = clickedElement.id;
    console.log('Cell clicked:', cellId);
    console.log('Buildings:', cellFeatures[cellId].building)
    console.log('Terrain:', cellFeatures[cellId].terrainType)
  }
}
console.log(cellFeatures)



