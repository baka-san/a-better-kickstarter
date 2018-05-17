import web3 from './web3';
import CampaignFactory from './build/CampaignFactory.json';

const instance = new web3.eth.Contract(
  JSON.parse(CampaignFactory.interface),
  '0xd5aB917Af719C57F095b876D071Ca4882410D351'
);

export default instance;