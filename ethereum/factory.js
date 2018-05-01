import web3 from './web3';
import CampaignFactory from './build/CampaignFactory.json';

const instance = new web3.eth.Contract(
  JSON.parse(CampaignFactory.interface),
  '0x7d5059A8213A73dB7044A549DB18D98b8Af24Cc7'
);

export default instance;