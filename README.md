```shell
# compare your node version to package.json
node -v

# install yarn
npm install --global yarn

# clone the example code repo
git clone https://github.com/G7DAO/ERC20-token-minter.git .

# install the project's dependencies
yarn && cd frontend && yarn && cd ..

# compile the smart contracts
yarn hardhat compile

# start your local Ethereum blockchain
yarn hardhat node

npx hardhat run scripts/deploy.js --network localhost
```

The commands above will install the project dependencies, compile the sample contract and run a local Hardhat node on port `8545`, using chain id `31337`.

After running the above tasks checkout the frontend [README.md](https://github.com/G7DAO/ERC20-token-minter.git) to run a React Dapp using ethers.js that will interact with the sample contract on the local Hardhat node.

Some other hardhat tasks to try out are:

```shell
yarn hardhat accounts
yarn hardhat clean
yarn hardhat compile
yarn hardhat deploy
yarn hardhat help
yarn hardhat node
yarn hardhat test
```