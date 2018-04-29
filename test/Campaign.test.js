const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const provider = ganache.provider();
const web3 = new Web3(provider);

const compiledFactory = require('../ethereum/build/CampaignFactory.json');
const compiledCampaign = require('../ethereum/build/Campaign.json');

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  // Deploy CampaignFactory
  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({data: compiledFactory.bytecode})
    .send({from: accounts[0], gas: '1000000'});

  // Make instance of a Campaign
  await factory.methods.createCampaign('100').send({
    from: accounts[0],
    gas: '1000000'
  });

  // es6 sugar to grab first element from array
  [campaignAddress] = await factory.methods.getDeployedCampaigns().call();

  campaign = await new web3.eth.Contract(
    JSON.parse(compiledCampaign.interface),
    campaignAddress
  );  

  console.log(factory);
  console.log("-------------------------------------------------------------");
  console.log(campaign);
});


describe('Campaigns', () => {

  it('deploys a factory and campaign', () => {
    assert.ok(factory.options.address);
    assert.ok(campaign.options.address);
  })

  it('assigns a manager', async () => {
    const manager = await campaign.methods.manager().call()
    assert.equal(accounts[0], manager);
  });

  it('allows people to contribute and marks them as contributors', async () => {
    await campaign.methods.contribute().send({
      from: 
    })
  })
})