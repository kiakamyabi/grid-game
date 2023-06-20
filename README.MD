# Kia's Grid Game 
This is a browser based custom game I am making using vanilla JS. <br>
Currently the UI is bare bones and the game information is shown in the console. <br>

# Objective:
The current objective is to make a playable game with mildly indepth mechanics related to building an empire, done in broad steps. <br>

## Step 1 - World Generation and Economy 
- Use perlin noise to generate a consistent and high quality world. <br>
- Use seeds so the player can customize the world before game start. 
- The world must have different terrain types and features on each 'cell' to differentiate between them. <br>
- Indepth interaction with cells. In the form of specific amount of Trees, Arable Land etc. for resources and  population.<br>
- Have different playstyles by introducing special mechanics depending on a 'build' path. e.g. Different races for population, different industry styles etc.  <br>
- Expeditions. Player will need to explore cells which can have special features before they can colonize it. <br>

### Buildings <br>
- [x] Be able to build on individual cells <br>
- [x] Building construction cost <br>
- [x] Building resource output <br>
- [x] Building resource input <br>
- [x] Building construction time <br>
- [x] Unique buildings for terrain types <br>
- [ ] Building UI with description <br>
- [x] Building storage capacity <br>
- [ ] Building slots or equivalent <br>
- [ ] Building maintenance system <br>

### Industry <br>
- [ ] Modifers to effect resource generation <br>
- [ ] Modifers to effect resource consumption <br>
- [ ] Modifers to effect resource construction time <br>
- [ ] Modifers to effect resource storage <br>

### Population <br>
- [ ] Add it! <br>
- [ ] Different population types <br>



# Current features <br>
## World Generation <br>
- Square based grid generated to represent a 'world map' that can dynamically be made smaller or bigger <br>
- Currently based on random gen, will use perlin noise when complete <br>
- Terrain types e.g Grassland, Forest etc <br>

## Content <br>
- Buildings  <br>
- Resource Generation <br>
- Resource Consumption <br>
- Storage capacity <br>
- Distinction between 'claimed' and 'unclaimed' cells <br>
- Turns <br>

# What can you actually do with the current version? <br>
1. Currently the world is generated on start up. <br>
2. You can claim any cell which represents you settling somewhere on game start. <br>
3. Which terrain type you pick will determine what kind of building you can construct. <br>
4. Once you claim a cell you can only claim adjacent cells which means you cannot claim two cells on the other side of the map. You can only grow from your starting point, representing an actual colony growing. <br>
5. Once a cell is claimed you can build on it. Buildings can generate, consume or provide storage for any resource. This represents making a production chain. <br>
Example: Lumber Mill, Generates 1 Lumber, Consumes 1 Tree Log, Increases storage capacity by 5 for Lumber. However it can only be built in the Forest terrain. <br>
6. Advancing the turn will then trigger the end of turn effects such as resource generation/consumption. <br>
Example: If in Cell 1-1 which you claimed you built a Logging Shack(+1 Tree Log, +5 Tree Log Storage) and a Lumber Mill(+1 Lumber, -1 Tree Log, +5 Lumber Storage), on turn end the storage of Lumber will increase by 1 and will continue to do so every turn until the limit is hit. This is tracked in cellFeatures which you can see in the console. <br>

## Configs <br>
### How to change the world grid size <br>
Locate const numRow and const numCols in the script.<br>
Change the number of rows/columns are you see fit.<br>

>const numRow = number of rows <br>
>const numCols = number of columns <br>

Example to make a 20 by 20 grid for the world map<br>

>const numRow = 20 <br>
>const numCol = 20 <br>

### Renaming cell features <br>
If for some reason you want to rename the name of the cell features you can do so by adjusting the key variables. <br>

>const cellFeaturesBuildingsKey = Key name for the buildings array in cellFeatures; <br>

Example to rename array that holds buildings of cell from buildings [] to renamedBuildings []: <br>

>const cellFeaturesBuildingsKey = renamedBuildings <br>

### Rename or add more terrain <br>
Go to the generateTerrain function. <br>
In the function there is an array that holds the terrain types, adjust or add terrain as you see fit. <br>

Example to add new terrain type Marshmellow Hills: <br>
1. Locate const terrainTypes in the generateTerrain() function. <br>

>const terrainTypes = ['Grass', 'Water', 'Mountain', 'Forest']; <br>

2. Add Marshmellow Hills to the array. <br>

>const terrainTypes = ['Grass', 'Water', 'Mountain', 'Forest', 'Marshmellow Hills']; <br>

Now in world gen it will add that terrain type to the map. However it will not colour the cell or let you build any buildings on that type of terrain. <br>

### Change buildings can be built on terrain types <br>
Go to the const terrainBuildings object. <br>
Inside that object is each terrain shown by an array, in that array are the buildings that can be built in that type of terrain. <br>

>const terrainBuildings = {Grass: ['Example Building']} 

This will result in Example Building being the only building that can be constructed in Grass type terrain. <br>
If you wanted to adjust the type of buildings that can be constructed in a terrain type you created<br>

>const terrainBuildings = {Grass:<['Example Building'],<br>
Marshmellow Hills: ['Example Building']} <br>

This will allow Example Building to be built in both Grass and Marshmellow Hills type terrain. <br>

### Change colour of cells with different terrain types <br/>
If you want to change the colour of cells with specific terrain types you must go to the stylesheet.css and change it there. <br>

>[data-terrain="Grass"] {background-color: #8bc34a;} <br>

[data-terrain="Grass"] represents the cells with the appropriate terrain. <br>
It tracks it based on the data attribute on each cell. <br>
The background-color represents the colour of the cells with that terrain type. <br>
So if you wanted to change the colour of the Grass terrain to red<br>

>[data-terrain="Grass"] {background-color: red; } <br>

This will change all cells with the Grass terrain to have a red colour. <br>
If you want to add a new terrain you have made and give it a yellow colour, e.g Marshmellow Hills. <br>

>[data-terrain="Marshmellow Hills"] {background-color: yellow; } <br>

### Add a new resource or change an old one <br/>
Go to the object const resourceTypes.<br>
This is where all the Resource Type data is.  <br>
If you wanted to rename Tree Logs to Wooden Logs <br>

>const resourceTypes {<br>
>'Tree Logs': { <br>
>name: 'Tree Logs', <br>
>categoryEconomicSector: 'Primary', <br>
>categoryGrouping: ['Wood', 'Construction Material'], <br>
>categoryTier: '1', <br>
>amount: 0, <br>
>capacity: 0, <br>
>}, <br>
>} <br>

Rename Tree Logs in the name and the tag for the object like this <br>

>const resourceTypes { <br>
>'Wood Logs': { <br>
>name: 'Wood Logs', <br>
>categoryEconomicSector: 'Primary', <br>
>categoryGrouping: ['Wood', 'Construction Material'], <br>
>categoryTier: '1', <br>
>amount: 0, <br>
>capacity: 0, <br>
>}, <br>
>} <br>

Now you have basically made a new resource and will need to update over the old one where it was used in buildingData.<br>
Here is an example for adding the Marshmellow Resource <br>

>const resourceTypes { <br>
>'Marshmellows': { <br>
>name: 'Marshmellows', <br>
>categoryEconomicSector: 'Secondary', <br>
>categoryGrouping: ['Food'], <br>
>categoryTier: '2', <br>
>amount: 0, <br>
>capacity: 0, <br>
>}, <br>
>} <br>

## Add or change building
If you want to adjust or add new buildings you must go to the buildingData object. <br>
If you wanted to add a new building <br>
Give the building a name and match it to the name of the object. <br>
Pick the right category. <br>
Add what it will generate based on a resource type in resourceTypes. <br>
Add any resource that is consumed as well. <br>
Add any resource that has its capacity increased. <br>

>const buildingData = { <br>
>'Marshmellow Kitchen': { <br>
>name: 'Marshmellow Kitchen', <br>
>category: 'Production', <br>
>resourcesGenerated: {'Marshmellows': 1,}, <br>
>resourcesConsumed: {}, <br>
>capacityIncrease: { <br>
>'Marshmellows': 5, <br>
>}, <br>
>}, <br>
>} <br>

With this it will generate 1 Marshmellows per turn and increase the Marshmellows Capacity by 5. <br>
