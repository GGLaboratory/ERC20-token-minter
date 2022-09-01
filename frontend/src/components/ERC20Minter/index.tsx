import { useWeb3React } from '@web3-react/core';
import { Contract, ethers, Signer } from 'ethers';
import {
  MouseEvent,
  ReactElement,
  useEffect,
  useState
} from 'react';

import styled from 'styled-components';
import MinterArtifact from '../../artifacts/contracts/Game7Token.sol/Game7Token.json';
import { Provider } from '../../utils/provider';
import { isEmpty } from '../../utils/utility';

import Loader from "../loader";
import loaderImage from "../../assets/images/circles-menu-6.gif";

const StyledDeployContractButton = styled.button`
  width: 180px;
  height: 2rem;
  border-radius: 1rem;
  border-color: blue;
  cursor: pointer;
  place-self: center;
`;

const StyledGreetingDiv = styled.div`
  display: grid;
  grid-template-rows: 1fr 1fr 1fr;
  grid-template-columns: 135px 2.7fr 1fr;
  grid-gap: 10px;
  place-self: center;
  align-items: center;
`;

const StyledTitleDiv = styled.div`
  place-self: center;
  align-items: center;
`;

const StyledLabel = styled.label`
  font-weight: bold;
`;

export function ERC20Minter(): ReactElement {
  const context = useWeb3React<Provider>();
  const {library, active} = context;

  const [signer, setSigner] = useState<Signer>();
  const [loader, setLoader] = useState<boolean>(false);
  const [greeterContract, setGreeterContract] = useState<Contract>();
  const [greeterContractAddr, setGreeterContractAddr] = useState<string>('');
  const [tokenResult, setTokenResult] = useState({
    public_address: "",
    tokenName: process.env.REACT_APP_TOKEN_NAME,
    tokenSymbol: process.env.REACT_APP_TOKEN_SYMBOL,
    tokenMint: process.env.REACT_APP_TOKEN_MINT,
    tokenCap: process.env.REACT_APP_TOKEN_CAP,
    transferAddress: process.env.REACT_APP_TRANSFER_ADDRESS,
  });

  useEffect((): void => {
    if (!library) {
      setSigner(undefined);
      return;
    }

    setSigner(library.getSigner());
  }, [library]);

  useEffect((): void => {
    if (!signer) {
      return;
    }

    async function test(): Promise<void> {
      // @ts-ignore
      const public_address = await signer.getAddress();
      setTokenResult((prevState) => {
        return {...prevState, public_address: public_address};
      });
    }

    test();
  }, [signer]);

  async function deployMainContract(signer: Signer): Promise<void> {
      const Mintr = new ethers.ContractFactory(
          MinterArtifact.abi,
          MinterArtifact.bytecode,
          signer
      );

      try {
        const greeterContract = await Mintr.deploy(
            tokenResult.transferAddress,
            tokenResult.tokenName,
            tokenResult.tokenSymbol,
            tokenResult.tokenMint,
            tokenResult.tokenCap,
        );
        await greeterContract.deployed();
        setGreeterContract(greeterContract);
        setGreeterContractAddr(greeterContract.address);
        setLoader(false);

        window.alert(`Contract deployed to: ${greeterContract.address}`);

        // Transfer Ownership of the Contract
        setTimeout(() => { manualTransferOwnership(greeterContract) }, 2000);

      } catch (error: any) {
        setLoader(false);
        window.alert(
            'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }

  async function handleDeployContract(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    // only deploy the Greeter contract one time, when a signer is defined
    if (greeterContract || !signer) {
      return;
    }

    if (isEmpty(tokenResult.public_address)) {
      setLoader(false);
      window.alert(
          'Error! You must Sign the transaction.\n' +
          'Click "SIGN MESSAGE"!'
      );
      return;
    }

    if (isEmpty(tokenResult.tokenName) || isEmpty(tokenResult.tokenSymbol)) {
      setLoader(false);
      window.alert(
          'Error! Missing Information!\n'+
          'contact admin'
      );
      return;
    }

    setLoader(true)
    await deployMainContract(signer);
  }

  function manualTransferOwnership(contract: Contract): void {
    window.alert(`Now, let's transfer ownership`);

    if (!contract) {
      setLoader(false);
      window.alert('Undefined Contract');
      return;
    }

    if (isEmpty(tokenResult.transferAddress)) {
        setLoader(false);
        window.alert('Missing Transfer Address');
        return;
      }
    setLoader(true);
    transferOwnership(contract);
  }

  async function transferOwnership(contract: Contract): Promise<void> {
      try {
        // @ts-ignore
        const setGreetingTxn = await contract.functions.transferOwnership(
            tokenResult.transferAddress
        );

        await setGreetingTxn.wait();
        setLoader(false);
        window.alert(`Success!\n\nOwnership was Successfully Transferred`);
        // getTransferWalletBalance(tokenResult.transferAddress);

      } catch (error: any) {
        setLoader(false);
        window.alert(
            'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
  }

  const renderLoader = () => {
    if (loader) {
      return <Loader key="loaderImage" name="minting.." img={loaderImage} />;
    }
  };

  const renderCreateContract = () => {
    if (active) {
      return (
        <>
          <StyledTitleDiv>
            <h2>Create ERC20 contract, mint tokens and transfer ownership</h2>
          </StyledTitleDiv>
          <StyledGreetingDiv>
            <></>
            <StyledLabel htmlFor="greetingInput">Minter Address</StyledLabel>
            {tokenResult.public_address}
            <br/>
            <div></div>
            <StyledLabel htmlFor="greetingInput">Owner Address</StyledLabel>
            {tokenResult.transferAddress}
            <br/>
            <div></div>
            <StyledLabel htmlFor="greetingInput">Token Name</StyledLabel>
            {tokenResult.tokenName}
            <br/>
            <div></div>
            <StyledLabel htmlFor="greetingInput">Token Symbol</StyledLabel>
            {tokenResult.tokenSymbol}
            <br/>
            <div></div>
            <StyledLabel htmlFor="greetingInput">Initial Supply</StyledLabel>
            {tokenResult.tokenMint}
            <br/>
            <div></div>
            <StyledLabel htmlFor="greetingInput">Total Supply</StyledLabel>
            {tokenResult.tokenCap}
            <br/>
            <div></div>
            <StyledLabel htmlFor="greetingInput">Contract Address</StyledLabel>
            {greeterContractAddr}
          </StyledGreetingDiv>
          <StyledDeployContractButton
            disabled={!!(!active || greeterContract)}
            style={{
              cursor: !active || greeterContract ? 'not-allowed' : 'pointer',
              borderColor: !active || greeterContract ? 'unset' : 'blue'
            }}
            onClick={handleDeployContract}
            >
              Deploy Contract
          </StyledDeployContractButton>
          <StyledTitleDiv>
              <em>the owner address above is owner of this contract and tokens</em>
          </StyledTitleDiv>
      </>
      )
    }
  };

  return (
    <>
      { renderLoader() }
      { renderCreateContract() }
    </>
  );
}
