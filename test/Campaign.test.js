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

  // console.log(factory);
  // console.log("-------------------------------------------------------------");
  // console.log(campaign);
});


describe('Campaigns', () => {

  it('deploys a factory and campaign', () => {
    assert.ok(factory.options.address);
    assert.ok(campaign.options.address);
  });

  it('assigns a manager', async () => {
    const manager = await campaign.methods.manager().call()
    assert.equal(accounts[0], manager);
  });

  it('allows people to contribute and marks them as contributors', async () => {
    await campaign.methods.contribute().send({
      from: accounts[1],
      value: '200'
    });

    const contributorsCount = await campaign.methods.contributorsCount().call();
    const contributor = await campaign.methods.contributors(accounts[1]).call();

    assert.equal(contributorsCount, 1);
    assert.equal(contributor, true);
  });

  it('doesn\'t allow people to contribute twice', async (done) => {
    await campaign.methods.contribute().send({
      from: accounts[1],
      value: '200'
    });

    let contributorsCount = await campaign.methods.contributorsCount().call();
    const contributor = await campaign.methods.contributors(accounts[1]).call();


    // Can't contribute twice
    try {
      await campaign.methods.contribute().send({
        from: accounts[1],
        value: '200'
      });
      // done('failed');
      }
    catch(err) {
      console.log('in catch');
      console.log(err.message);
      // assert(err);
      done();
      // contributorsCount = await campaign.methods.contributorsCount().call();
      // console.log(contributorsCount);

    }
  });

  it('requires a minimum contribution', async () => {
    try {
      await campaign.methods.contribute().send({
        from: accounts[1],
        value: '1'
      });

      assert(false);
    }
    catch (err) {
      assert(err);
    }
  }); 

  it('allows a manager to create a payment request', async () => {
    await campaign.methods
    .createRequest('description', '100', accounts[1])
    .send({
      from: accounts[0],
      gas: '1000000'
    });

    const request = await campaign.methods.requests(0).call();

    assert.equal(request.description, 'description')
  });


  it('processes requests', async () => {

    // Initial balance of account we will send to
    let initialBalance = await web3.eth.getBalance(accounts[2]);
    initialBalance = web3.utils.fromWei(initialBalance, 'ether');
    initialBalance = parseFloat(initialBalance);

    // Add a contributor
    await campaign.methods.contribute().send({
      from: accounts[1],
      value: web3.utils.toWei('10', 'ether')
    }); 

    // Make a request
    await campaign.methods
    .createRequest('description', web3.utils.toWei('5', 'ether'), accounts[2])
    .send({
      from: accounts[0],
      gas: '1000000'
    });


    // Try to finalize request with insufficient approvals
    try {
      await campaign.methods.finalizeRequest(0).send({
        from: accounts[0],
        gas: '1000000'
      });

      assert(false);
    }
    catch(err) {
      assert(err);
    }

    let request = await campaign.methods.requests(0).call();
    assert.equal(request.complete, false);


    // Approve request
    await campaign.methods.approveRequest(0).send({
      from: accounts[1],
      gas: '1000000'
    });


    request = await campaign.methods.requests(0).call();
    assert.equal(request.approvalCount, 1);

    // Non-manager tries to finalize request
    try {
      await campaign.methods.finalizeRequest(0).send({
        from: accounts[1],
        gas: '1000000'
      });

      assert(false);
    } 
    catch(err) {
      assert(err);
    }

    request = await campaign.methods.requests(0).call();
    assert.equal(request.complete, false);    


    // Try to finalize request with sufficient approvals
    await campaign.methods.finalizeRequest(0).send({
      from: accounts[0],
      gas: '1000000'
    });

    request = await campaign.methods.requests(0).call();
    assert.equal(request.complete, true);

    // Confirm money has been transfered 
    let finalBalance = await web3.eth.getBalance(accounts[2]);
    finalBalance = web3.utils.fromWei(finalBalance, 'ether');
    finalBalance = parseFloat(finalBalance);

    assert(finalBalance > initialBalance);

  });
})