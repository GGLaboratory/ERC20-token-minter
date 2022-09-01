import { useWeb3React } from '@web3-react/core';
import { MouseEvent, ReactElement } from 'react';
import styled from 'styled-components';
import { Provider } from '../../utils/provider';

const StyledButton = styled.button`
  width: 150px;
  height: 2rem;
  border-radius: 1rem;
  border-color: blue;
  cursor: pointer;
  place-self: center;  
`;

// @ts-ignore
export function Selector({ changeState }): ReactElement {
  const context = useWeb3React<Provider>();
  const { active } = context;

  return (
   <>
     <div style={{display: 'inline-block', placeSelf: "center" }}>
      <StyledButton
        disabled={!active ? true : false}
        style={{
          cursor: !active ? 'not-allowed' : 'pointer',
          borderColor: !active ? 'unset' : 'blue'
        }}
        value="ERC20"
        onClick={changeState}
      >
        ERC20
      </StyledButton>
      <StyledButton
        disabled={!active ? true : false}
        style={{
          cursor: !active ? 'not-allowed' : 'pointer',
          borderColor: !active ? 'unset' : 'blue',
          marginLeft: '50px',
        }}
        value="ERC721"
        onClick={changeState}
      >
        ERC721
      </StyledButton>
     </div>
   </>

  );
}
