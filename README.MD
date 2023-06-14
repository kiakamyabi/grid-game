# Kia's Grid Game 
This is a browser based custom game I am making using vanilla JS.
Currently the UI is bare bones and the game information is shown in the console.

# Objective:
The current objective is to make a playable game with mildly indepth mechanics related to building an empire. This will be done in broad steps.

## Step 1 - World Generation and Economy 
- Use perlin noise to generate a consistent and high quality world.
- Use seeds so the player can customize the world before game start. 
- The world must have different terrain types and features on each 'cell' to differentiate between them. 
- Indepth interaction with cells. In the form of specific amount of Trees, Arable Land etc. for resources and  population. 
- Have different playstyles by introducing special mechanics depending on a 'build' path. e.g. Different races for population, different industry styles etc. 
- Expeditions. Player will need to explore cells which can have special features before they can colonize it. 

### Step 2 - Military 
### Step 3 - Ai

# Current features: 
## World Generation 
- Square based grid generated to represent a 'world map' that can dynamically be made smaller or bigger 
- Currently based on random gen, will use perlin noise when complete 
- Terrain types e.g Grassland, Forest etc 

## Content 
- Buildings  
- Resource Generation 
- Resource Consumption 
- Storage capacity 
- Distinction between 'claimed' and 'unclaimed' cells
- Turns

# What can you actually do with the current version?
1. Currently the world is generated on start up.
2. You can claim any cell which represents you settling somewhere on game start.
3. Which terrain type you pick will determine what kind of building you can construct.
4. Once you claim a cell you can only claim adjacent cells which means you cannot claim two cells on the other side of the map. You can only grow from your starting point, representing an actual colony growing.
5. Once a cell is claimed you can build on it. Buildings can generate, consume or provide storage for any resource. This represents making a production chain.
Example: Lumber Mill, Generates 1 Lumber, Consumes 1 Tree Log, Increases storage capacity by 5 for Lumber. However it can only be built in the Forest terrain.
6. Advancing the turn will then trigger the end of turn effects such as resource generation/consumption.
Example: If in Cell 1-1 which you claimed you built a Logging Shack(+1 Tree Log, +5 Tree Log Storage) and a Lumber Mill(+1 Lumber, -1 Tree Log, +5 Lumber Storage), on turn end the storage of Lumber will increase by 1 and will continue to do so every turn until the limit is hit. This is tracked in cellFeatures which you can see in the console.

## Configs:
### How to change the world grid size
Locate const numRow and const numCols in the script. Change the number of rows/columns are you see fit.
>const numRow = number of rows
>const numCols = number of columns
Example to make a 20 by 20 grid for the world map:
>const numRow = 20 
>const numCol = 20 

### Renaming Cell Features
If for some reason you want to rename the features in cellFeatures you can do so by adjusting the key variables. <br/>
    const cellFeaturesBuildingsKey = Key name for the buildings array in cellFeatures; <br/>
Example to rename array that holds buildings of cell from buildings [] to renamedBuildings []: <br/>
    const cellFeaturesBuildingsKey = renamedBuildings <br/>

### RENAME OR ADD MORE TERRAIN <br/>
Go to the generateTerrain function. In the function there is an array that holds the terrain types, adjust or add terrain
as you see fit. <br/>
Example to add new terrain type Marshmellow Hills: <br/>
   1 Locate const terrainTypes in the generateTerrain() function. <br/>
    Should look like this >  const terrainTypes = ['Grass', 'Water', 'Mountain', 'Forest']; <br/>
   2 Add Marshmellow Hills to the array. <br/>
    const terrainTypes = ['Grass', 'Water', 'Mountain', 'Forest', 'Marshmellow Hills']; <br/>
    Now in world gen it will add that terrain type to the map. However it will not colour the cell or let you build any buildings on that type of terrain. <br/>

CHANGE WHAT BUILDINGS CAN BE BUILT ON WHAT TERRAIN <br/>
    Go to the const terrainBuildings object. Inside that object is each terrain shown by an array, in that array are the buildings that can be built in that type of terrain. <br/>
Example: <br/>
    const terrainBuildings = {
    Grass: ['Example Building']
    } <br/>
This will result in Example Building being the only building that can be constructed in Grass type terrain. <br/>
If you wanted to adjust the type of buildings that can be constructed in a terrain type you created... <br/>
Example: <br/>
    const terrainBuildings = {
    Grass: ['Example Building'],
    Marshmellow Hills: ['Example Building']
    } <br/>
This will allow Example Building to be built in both Grass and Marshmellow Hills type terrain. <br/>

CHANGE COLOUR OF CELLS WITH DIFFERENT TERRAIN TYPES <br/>
If you want to change the colour of cells with specific terrain types you must go to the stylesheet.css and change it there. <br/>
Example:<br/>
    [data-terrain="Grass"] {
    background-color: #8bc34a; 
    } <br/>
[data-terrain="Grass"] represents the cells with the appropriate terrain. It tracks it based on the data attribute on each cell. The background-color represents the colour of the cells with that terrain type. So if you wanted to change the colour of the Grass terrain to red... <br/>
Example: <br/>
    [data-terrain="Grass"] {
    background-color: red; 
    } <br/>
This will change all cells with the Grass terrain to have a red colour. If you want to add a new terrain you have made and give it a yellow colour, e.g Marshmellow Hills <br/>
Example: <br/>
    [data-terrain="Marshmellow Hills"] {
    background-color: yellow; 
    } <br/>

ADD A NEW RESOURCE OR CHANGE AN OLD ONE <br/>
Go to the object const resourceTypes. This is where all the Resource Type data is.  <br/>
If you wanted to rename Tree Logs to Wooden Logs... <br/>
Example: <br/>
    const resourceTypes {
        'Tree Logs': {
        name: 'Tree Logs',
        categoryEconomicSector: 'Primary',
        categoryGrouping: ['Wood', 'Construction Material'],
        categoryTier: '1',
        amount: 0,
        capacity: 0,
        },
    } <br/>
Rename Tree Logs in the name and the tag for the object like this <br/>
    const resourceTypes {
        'Wood Logs': {
        name: 'Wood Logs',
        categoryEconomicSector: 'Primary',
        categoryGrouping: ['Wood', 'Construction Material'],
        categoryTier: '1',
        amount: 0,
        capacity: 0,
        },
    } <br/>
Now you have basically made a new resource and will need to update over the old one where it was used in buildingData.<br/>
Here is an example for adding the Marshmellow Resource <br/>
     const resourceTypes {
        'Marshmellows': {
        name: 'Marshmellows',
        categoryEconomicSector: 'Secondary',
        categoryGrouping: ['Food'],
        categoryTier: '2',
        amount: 0,
        capacity: 0,
        },
    } <br/>

ADD OR CHANGE BUILDINGS
If you want to adjust or add new buildings you must go to the buildingData object where all the data is.
If you wanted to add a new building...
Give the building a name and match it to the name of the object. Pick the right category. Add what it will generate based on a resource type in resourceTypes. Add any resource that is confused. Add any resource that has its capacity increased.
    const buildingData = {
    'Marshmellow Kitchen': {
        name: 'Marshmellow Kitchen',
        category: 'Production',
        resourcesGenerated: {'Marshmellows': 1,},
        resourcesConsumed: {},
        capacityIncrease: {
        'Marshmellows': 5,
        },
        },
    }
With this it will generate 1 Marshmellows per turn and increase the Marshmellows Capacity by 5.
