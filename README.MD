This is a browser based custom game I am making using vanilla JS. <br/>
Currently the UI is bare bones and the game information is shown in the console.<br/>

Objective:
The current objective is to make a playable game with mildly indepth mechanics related to building an empire. This will be done in broad steps.

Step 1 - World Generation and Economy <br/>
    -Use perlin noise to generate a consistent and high quality world. <br/>
    -The capacity to use seeds so the player can customize the world before game start. <br/>
    -The world must have different terrain types and features on each 'cell' to differentiate between them. <br/>
    -Indepth interaction with cells. In the form of specific amount of Trees, Arable Land etc. for resources and  population. <br/>
    -Have different playstyles by introducing special mechanics depending on a 'build' path. e.g. Different races for population, different industry styles etc. <br/>
    -Expeditions. Player will need to explore cells which can have special features before they can colonize it. <br/>

Step 2 - Military
Step 3 - Ai

Current features:
World Generation>
    -Square based grid generated to represent a 'world map' that can dynamically be made smaller or bigger
    -Currently based on random gen, will use perlin noise when complete
    -Terrain types e.g Grassland, Forest etc
Content>
    -Buildings
    -Resource Generation
    -Resource Consumption
    -Storage capacity
    -Distinction between 'claimed' and 'unclaimed' cells
    -Turns

What can you actually do with the current version?
    -Currently the world is just generated on start up. 
    -Then you can claim any cell which represents you settling somewhere on game start.
    -Which terrain type you pick will determine what kind of building you can construct.
    -Once you claim a cell you can only claim adjacent cells which means you cannot claim two cells on the other side of the map. So you can only grow from your starting point, representing an actual colony growing.
    -Once a cell is claimed you can build on it. Buildings can generate, consume or provide storage for any resource. This represents making a production chain.
    Example: Lumber Mill, Generates 1 Lumber, Consumes 1 Tree Log, Increases storage capacity by 5 for Lumber. However it can only be built in the Forest terrain.
    -Advancing the turn will then trigger the end of turn effects such as resource generation/consumption. 
    Example: If in Cell 1-1 which you claimed you built a Logging Shack(+1 Tree Log, +5 Tree Log Storage) and a Lumber Mill(+1 Lumber, -1 Tree Log, +5 Lumber Storage), on turn end the storage of Lumber will increase by 1 and will continue to do so every turn until the limit is hit. This is tracked in cellFeatures which you can see in the console.

Configs:
TO CHANGE HOW BIG THE WORLD GRID IS
    const numRow = number of rows
    const numCols = number of columns
Example to make a 20 by 20 grid for the world map:
    const numRow = 20
    const numCol = 20

RENAMING CELL FEATURES
If for some reason you want to rename the features in cellFeatures you can do so by adjusting the key variables.
    const cellFeaturesBuildingsKey = Key name for the buildings array in cellFeatures;
Example to rename array that holds buildings of cell from buildings [] to renamedBuildings []:
    const cellFeaturesBuildingsKey = renamedBuildings

RENAME OR ADD MORE TERRAIN
Go to the generateTerrain function. In the function there is an array that holds the terrain types, adjust or add terrain
as you see fit.
Example to add new terrain type Marshmellow Hills:
   1 Locate const terrainTypes in the generateTerrain() function.
    Should look like this >  const terrainTypes = ['Grass', 'Water', 'Mountain', 'Forest'];
   2 Add Marshmellow Hills to the array.
    const terrainTypes = ['Grass', 'Water', 'Mountain', 'Forest', 'Marshmellow Hills'];
    Now in world gen it will add that terrain type to the map. However it will not colour the cell or let you build any buildings on that type of terrain.

CHANGE WHAT BUILDINGS CAN BE BUILT ON WHAT TERRAIN
    Go to the const terrainBuildings object. Inside that object is each terrain shown by an array, in that array are the buildings that can be built in that type of terrain.
Example:
    const terrainBuildings = {
    Grass: ['Example Building']
    }
This will result in Example Building being the only building that can be constructed in Grass type terrain.
If you wanted to adjust the type of buildings that can be constructed in a terrain type you created...
Example:
    const terrainBuildings = {
    Grass: ['Example Building'],
    Marshmellow Hills: ['Example Building']
    }
This will allow Example Building to be built in both Grass and Marshmellow Hills type terrain.

CHANGE COLOUR OF CELLS WITH DIFFERENT TERRAIN TYPES
If you want to change the colour of cells with specific terrain types you must go to the stylesheet.css and change it there.
Example:
    [data-terrain="Grass"] {
    background-color: #8bc34a; 
    }
[data-terrain="Grass"] represents the cells with the appropriate terrain. It tracks it based on the data attribute on each cell. The background-color represents the colour of the cells with that terrain type. So if you wanted to change the colour of the Grass terrain to red...
Example:
    [data-terrain="Grass"] {
    background-color: red; 
    }
This will change all cells with the Grass terrain to have a red colour. If you want to add a new terrain you have made and give it a yellow colour, e.g Marshmellow Hills
Example:
    [data-terrain="Marshmellow Hills"] {
    background-color: yellow; 
    }

ADD A NEW RESOURCE OR CHANGE AN OLD ONE
Go to the object const resourceTypes. This is where all the Resource Type data is. 
If you wanted to rename Tree Logs to Wooden Logs...
Example:
    const resourceTypes {
        'Tree Logs': {
        name: 'Tree Logs',
        categoryEconomicSector: 'Primary',
        categoryGrouping: ['Wood', 'Construction Material'],
        categoryTier: '1',
        amount: 0,
        capacity: 0,
        },
    }
Rename Tree Logs in the name and the tag for the object like this
    const resourceTypes {
        'Wood Logs': {
        name: 'Wood Logs',
        categoryEconomicSector: 'Primary',
        categoryGrouping: ['Wood', 'Construction Material'],
        categoryTier: '1',
        amount: 0,
        capacity: 0,
        },
    }
Now you have basically made a new resource and will need to update over the old one where it was used in buildingData.
Here is an example for adding the Marshmellow Resource
     const resourceTypes {
        'Marshmellows': {
        name: 'Marshmellows',
        categoryEconomicSector: 'Secondary',
        categoryGrouping: ['Food'],
        categoryTier: '2',
        amount: 0,
        capacity: 0,
        },
    }

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
