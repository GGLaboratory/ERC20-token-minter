import { useWeb3React } from '@web3-react/core';
import { Contract, ethers, Signer } from 'ethers';
import {
  MouseEvent,
  ReactElement,
  SetStateAction,
  useEffect,
  useState
} from 'react';
import Input from '../input';
import styled from 'styled-components';
import MinterArtifact from '../../artifacts/contracts/Game7Token.sol/Game7Token.json';
import { Provider } from '../../utils/provider';
import { SectionDivider } from '../SectionDivider';
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

const StyledButton = styled.button`
  width: 150px;
  height: 2rem;
  border-radius: 1rem;
  border-color: blue;
  cursor: pointer;
`;

export function ERC721Minter(): ReactElement {
  const context = useWeb3React<Provider>();
  const {library, active} = context;

  const [signer, setSigner] = useState<Signer>();
  const [showMintTokens, setShowMintTokens] = useState<boolean>(true);
  const [showCreateContract, setShowCreateContract] = useState<boolean>(true);
  const [showTransferContract, setShowTransferContract] = useState<boolean>(true);

  const [loader, setLoader] = useState<boolean>(false);
  const [greeterContract, setGreeterContract] = useState<Contract>();
  const [greeterContractAddr, setGreeterContractAddr] = useState<string>('');
  const [walletBalance, setWalletBalance] = useState<string>('');
  const [transferWalletBalance, setTransferWalletBalance] = useState<string>('');
  const [tokenResult, setTokenResult] = useState({
    public_address: "",
    tokenName: "",
    tokenSymbol: "",
    tokenMint: "",
    tokenCap: "",
    sendTokensQty: "",
    sendTokensAddress: "",
    transferAddress: "",
  });

  useEffect((): void => {
    if (!library) {
      setSigner(undefined);
      return;
    }

    setSigner(library.getSigner());
  }, [library]);

  async function getWalletBalance(address: string): Promise<void> {

    // Read-Write; By connecting to a Signer, allows:
    // - Everything from Read-Only (except as Signer, not anonymous)
    // - Sending transactions for non-constant functions
    // @ts-ignore
    const balanceOf = await greeterContract.functions.balanceOf(address);
    const _b = ethers.utils.formatEther(balanceOf[0])

    setWalletBalance(`${_b}`)
  }

  async function getTransferWalletBalance(address: string): Promise<void> {

    // Read-Write; By connecting to a Signer, allows:
    // - Everything from Read-Only (except as Signer, not anonymous)
    // - Sending transactions for non-constant functions
    // @ts-ignore
    const balanceOf = await greeterContract.functions.balanceOf(address);
    const _b = ethers.utils.formatEther(balanceOf[0])

    setTransferWalletBalance(`${_b}`)
  }

  async function getContractOwner(): Promise<void> {

    // Read-Write; By connecting to a Signer, allows:
    // - Everything from Read-Only (except as Signer, not anonymous)
    // - Sending transactions for non-constant functions
    // @ts-ignore
    const ownerOf = await greeterContract.functions.owner();
    //const _o = ethers.utils.formatEther(ownerOf[0])

    window.alert(ownerOf)
    //setWalletBalance(`${_b}`)
  }

  async function submitTokenMint(): Promise<void> {
      try {
        // @ts-ignore
        const setGreetingTxn = await greeterContract.functions.mint(
            tokenResult.sendTokensAddress,
            tokenResult.sendTokensQty
        );

        await setGreetingTxn.wait();
        setLoader(false);

        window.alert(`Success!\n\nTokens Minted Successfully`);
        getWalletBalance(tokenResult.sendTokensAddress);

      } catch (error: any) {
        setLoader(false);
        window.alert(
            'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
  }

  async function transferOwnership(): Promise<void> {
      try {
        // @ts-ignore
        const setGreetingTxn = await greeterContract.functions.transferOwnership(
            tokenResult.transferAddress
        );

        await setGreetingTxn.wait();
        setLoader(false);

        window.alert(`Success!\n\nOwnership was Successfully Transferred`);
        getTransferWalletBalance(tokenResult.transferAddress);

      } catch (error: any) {
        setLoader(false);
        window.alert(
            'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
  }

  async function deployManualContract(signer: Signer, contract: string): Promise<void> {
    const abi = [
        // Read-Only Functions
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)",

        "function mint(address account, uint amount) payable",

        "function owner() view returns (address)",

        "function transferOwnership(address newOwner)",

        // Authenticated Functions
        "function transfer(address to, uint amount) returns (bool)",

        // Events
        "event Transfer(address indexed from, address indexed to, uint amount)"
    ];

    // owner() public view virtual returns (address)

    // Read-Write; By connecting to a Signer, allows:
    // - Everything from Read-Only (except as Signer, not anonymous)
    // - Sending transactions for non-constant functions
    const erc20Contract = new ethers.Contract(contract, abi, signer);
    setGreeterContract(erc20Contract);
    getContractOwner()
  }

  async function deployMainContract(signer: Signer): Promise<void> {
      const Mintr = new ethers.ContractFactory(
          MinterArtifact.abi,
          MinterArtifact.bytecode,
          signer
      );

      try {
        const greeterContract = await Mintr.deploy(
            tokenResult.public_address,
            tokenResult.tokenName,
            tokenResult.tokenSymbol,
            tokenResult.tokenMint,
            tokenResult.tokenCap,
        );
        await greeterContract.deployed();
        setGreeterContract(greeterContract);
        setGreeterContractAddr(greeterContract.address);
        setLoader(false);

        window.alert(`Greeter deployed to: ${greeterContract.address}`);
      } catch (error: any) {
        setLoader(false);
        window.alert(
            'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }

  function handleDeployContract(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    // only deploy the Greeter contract one time, when a signer is defined
    if (greeterContract || !signer) {
      return;
    }

    if (isEmpty(tokenResult.public_address) || isEmpty(tokenResult.tokenName) || isEmpty(tokenResult.tokenSymbol)) {
      setLoader(false);
      window.alert(
          'Error! Missing Information'
      );
    }

    setLoader(true)
    deployMainContract(signer);
  }

  function handleManualContract(event: { target: { value: React.SetStateAction<string> } }): void {
    // This can be an address or an ENS name
    const address = event.target.value;
    if (typeof address === "string" && signer !== undefined) {

        setGreeterContractAddr(address);
        deployManualContract(signer, address);

    } else {
        setLoader(false);
        window.alert('Bad contract address');
    }
  }

  function handleMintWalletAddress(event: { target: { value: React.SetStateAction<string> } }): void {
        // This can be an address or an ENS name
    const address = event.target.value;

    if (typeof address === "string" && greeterContract !== undefined) {

        setTokenResult((prevState) => {
          return {...prevState, sendTokensAddress: address};
        });

        getWalletBalance(address);
    }
  }

  function handleTransferWalletAddress(event: { target: { value: React.SetStateAction<string> } }): void {
        // This can be an address or an ENS name
    const address = event.target.value;

    if (typeof address === "string" && greeterContract !== undefined) {

        setTokenResult((prevState) => {
          return {...prevState, transferAddress: address};
        });

        getTransferWalletBalance(address);
    }
  }

  function handleMintSubmit(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();

    if (!greeterContract) {
      setLoader(false);
      window.alert('Undefined Contract');
      return;
    }

    if (isEmpty(tokenResult.sendTokensQty) || isEmpty(tokenResult.sendTokensAddress)) {
      setLoader(false);
      window.alert('Missing required Information');
      return;
    }
    setLoader(true);
    submitTokenMint();
  }

  function handleTransferSubmit(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();

    if (!greeterContract) {
      setLoader(false);
      window.alert('Undefined Contract');
      return;
    }

    if (isEmpty(tokenResult.transferAddress)) {
      setLoader(false);
      window.alert('Missing required Information');
      return;
    }
    setLoader(true);
    transferOwnership();
  }

  const renderLoader = () => {
    if (loader) {
      return <Loader key="loaderImage" name="minting.." img={loaderImage} />;
    }
  };

  const renderCreateContract = () => {
    if (active && showCreateContract) {
      return (
        <>
          <StyledTitleDiv>
            <h2>Create ERC721 Contract</h2>
          </StyledTitleDiv>
          <StyledGreetingDiv>
            <StyledLabel htmlFor="greetingInput">Wallet Address</StyledLabel>
            <Input
              label="wallet address that will receive initial tokens"
              placeholder="<Wallet Address>"
              onChange={(e: { target: { value: any; }; }) => {
                setTokenResult((prevState) => {
                  return {...prevState, public_address: e.target.value};
                });
              }}
            />
            <br/>
            <StyledLabel htmlFor="greetingInput">Token Name</StyledLabel>
            <Input
              label=""
              placeholder="<Token Name>"
              onChange={(e: { target: { value: any; }; }) => {
                setTokenResult((prevState) => {
                  return {...prevState, tokenName: e.target.value};
                });
              }}
              />
              <br/>
              <StyledLabel htmlFor="greetingInput">Token Symbol</StyledLabel>
              <Input
                  label=""
                  placeholder="<Token Symbol>"
                  onChange={(e: { target: { value: any; }; }) => {
                    setTokenResult((prevState) => {
                      return {...prevState, tokenSymbol: e.target.value};
                    });
                  }}
              />
              <br/>
              <StyledLabel htmlFor="greetingInput">Initial Supply</StyledLabel>
              <Input
                label=""
                placeholder="<Initial Token Supply>"
                onChange={(e: { target: { value: any; }; }) => {
                  setTokenResult((prevState) => {
                    return {...prevState, tokenMint: e.target.value};
                  });
                }}
              />
              <br/>
              <StyledLabel htmlFor="greetingInput">Total Supply</StyledLabel>
              <Input
                label=""
                placeholder="<Total Token Supply>"
                onChange={(e: { target: { value: any; }; }) => {
                  setTokenResult((prevState) => {
                    return {...prevState, tokenCap: e.target.value};
                  });
                }}
              />
          </StyledGreetingDiv>
          <StyledDeployContractButton
            disabled={!!(!active || greeterContract)}
            style={{
              cursor: !active || greeterContract ? 'not-allowed' : 'pointer',
              borderColor: !active || greeterContract ? 'unset' : 'blue'
            }}
            onClick={handleDeployContract}
            >
              Deploy a NEW Contract
          </StyledDeployContractButton>
          <StyledTitleDiv>
              <em>the wallet address added above is owner of this contract</em>
          </StyledTitleDiv>
          <SectionDivider />
        </>
      )
    }
  };

  const renderMintTokens = () => {
    if (active && showMintTokens) {
      return (
        <>
          <StyledTitleDiv>
            <h2>Mint New Tokens</h2>
          </StyledTitleDiv>
          <StyledGreetingDiv>
            <StyledLabel>Contract Addr</StyledLabel>
            <div>
                {greeterContractAddr ? (
                    greeterContractAddr
                ) : (
                <>
                  <Input
                    label=""
                    placeholder="<Contract Address>"
                    onChange={(e: { target: { value: SetStateAction<string>; }; }) => {handleManualContract(e)}}
                    />
                </>
              )}
            </div>
            {/* empty placeholder div below to provide empty first row, 3rd col div for a 2x3 grid */}
            <div></div>
            <StyledLabel htmlFor="greetingInput">Wallet Address</StyledLabel>
            <Input
              label={walletBalance? (`b: ${walletBalance}`) : (`b: 0`)}
              placeholder="<Send to Wallet Address>"
              onChange={(e: { target: { value: SetStateAction<string>; }; }) => {handleMintWalletAddress(e)}}
            />
            <br />
            <StyledLabel htmlFor="greetingInput">Number of Tokens</StyledLabel>
            <Input
              label=""
              placeholder="<Number of Tokens>"
              onChange={(e: { target: { value: any; }; }) => {
                setTokenResult((prevState) => {
                  return { ...prevState, sendTokensQty: e.target.value };
                });
              }}
            />
            <br />
            <StyledLabel htmlFor=""></StyledLabel>
            <StyledButton
              disabled={!tokenResult.sendTokensQty || !tokenResult.sendTokensAddress || !greeterContractAddr}
              style={{
                cursor: !tokenResult.sendTokensAddress || !greeterContractAddr ? 'not-allowed' : 'pointer',
                borderColor: !tokenResult.sendTokensAddress || !greeterContractAddr ? 'unset' : 'blue'
              }}
              onClick={handleMintSubmit}
            >
              Submit
            </StyledButton>
          </StyledGreetingDiv>
          <StyledTitleDiv>
              <em>the connected wallet must be owner of contract to mint new tokens</em>
          </StyledTitleDiv>
          <SectionDivider />
        </>
      )
    }
    };

  const renderTransferContract = () => {
    if (active && showTransferContract) {
      return (
        <>
          <StyledTitleDiv>
            <h2>Transfer Contract Ownership</h2>
          </StyledTitleDiv>
          <StyledGreetingDiv>
            <StyledLabel>Contract addr</StyledLabel>
            <div>
                {greeterContractAddr ? (
                    greeterContractAddr
                ) : (
                <>
                  <Input
                    label=""
                    placeholder="<Contract Address>"
                    onChange={(e: { target: { value: SetStateAction<string>; }; }) => {handleManualContract(e)}}
                    />
                </>
              )}
            </div>
            {/* empty placeholder div below to provide empty first row, 3rd col div for a 2x3 grid */}
            <div></div>
            <StyledLabel htmlFor="greetingInput">Wallet Address</StyledLabel>
            <Input
              label={transferWalletBalance? (`b: ${transferWalletBalance}`) : (`b: 0`)}
              placeholder="<Send to Wallet Address>"
              onChange={(e: { target: { value: SetStateAction<string>; }; }) => {handleTransferWalletAddress(e)}}
            />
            <br />
            <StyledLabel htmlFor=""></StyledLabel>
            <StyledButton
              disabled={!tokenResult.transferAddress || !greeterContractAddr}
              style={{
                cursor: !tokenResult.transferAddress || !greeterContractAddr ? 'not-allowed' : 'pointer',
                borderColor: !tokenResult.transferAddress || !greeterContractAddr ? 'unset' : 'blue'
              }}
              onClick={handleTransferSubmit}
            >
              Submit
            </StyledButton>
          </StyledGreetingDiv>
          <StyledTitleDiv>
              <em>the connected wallet must be owner to transfer contract</em>
          </StyledTitleDiv>
        </>
      )
    }
    };

  return (
    <>
      { renderLoader() }
      { renderCreateContract() }
      { renderMintTokens() }
      { renderTransferContract() }
    </>
  );
}
