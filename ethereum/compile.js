const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');

// Delete build dir
const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath); //removes folder and everything inside

// Read campaign.sol from contracts dir
const campaignPath = path.resolve(__dirname, 'contracts', 'Campaign.sol');
const source = fs.readFileSync(campaignPath, 'utf8'); //read contents of file

// Compile both contracts with solidity compiler
const output = solc.compile(source, 1).contracts; //compile contract


// Write output to build dir
fs.ensureDirSync(buildPath); //make sure build directory exists or create it

console.log(output);

for (let contract in output) {
  // write json file to some path
  fs.outputJsonSync(
    path.resolve(buildPath, contract.replace(':','') + '.json'),
    output[contract]
  );
}