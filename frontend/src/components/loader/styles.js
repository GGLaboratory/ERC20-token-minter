import styled from "styled-components";

export const Container = styled.div`
  background: white;
  display: flex;
  flex-direction: column;
  align-items: space-between;
  width: 10%;
  position: fixed;
  top: 30%;
  left: 20%;
`;

// export const Image = styled.img`
//   height: 160px;
//   width: 120%;
// `;

export const Image = styled.div`
  height: 100px;
  width: 100%;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-image: url(${(props) => props.src});
`;

export const Content = styled.div`
  padding: 10px;
  text-align: center;
`;

export const Title = styled.div`
  color: ${(props) => props.theme.primary};
  font-size: 32px;
  font-family: "Bebas Neue", sans-serif;
`;
