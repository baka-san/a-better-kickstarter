import Web3 from 'web3';

let web3;


if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
  // In browser and user has metamask
  web3 = new Web3(window.web3.currentProvider);
}
else {
  // On nextjs server or user isn't running metamask
  const provider = new Web3.providers.HttpProvider('https://rinkeby.infura.io/VuqbBoj333HKYBddndAw');

  web3 = new Web3(provider);
}

export default web3;