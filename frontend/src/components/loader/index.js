// Relative Imports
import { Container, Title, Image, Content } from "./styles";

const Loader = ({ name, img }) => {
  return (
    <Container>
      <Image src={img} />
      <Content>
        <Title>{name}</Title>
      </Content>
    </Container>
  );
};

export default Loader;
