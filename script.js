const board = document.getElementById("game-grid")
const numRows = 5;
const numCols = 5;
const table = document.createElement('table');

const buildings = {
    'Farm': 50,
    'Mine': 100,
    'Shop': 200
  };

//World Map
for (let row = 0; row < numRows; row++) {
    const newRow = document.createElement('tr');
    for (let col = 0; col < numCols; col++) {
      const individualCell = document.createElement('td');
      individualCell.classList.add('grid-cell');
      rowPlusOne = row + 1;
      colPlusOne = col + 1;
      individualCell.id = `cell-${rowPlusOne}-${colPlusOne}`;
      newRow.appendChild(individualCell);
    }
    table.appendChild(newRow);
  }
  board.appendChild(table);

  const cellTotal = document.querySelectorAll('.grid-cell');

//Event Listener
cellTotal.forEach(individualCell => {
  individualCell.addEventListener('click', handleCellClick);
});

function handleCellClick(event){
  const cellId = event.target.id;
  console.log('Cell clicked:', cellId);
}



