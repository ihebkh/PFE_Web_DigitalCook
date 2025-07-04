// Input.jsx
// Composant champ de saisie stylisé réutilisable
import styled from 'styled-components';

// Styles pour le wrapper, label, champ et message d'erreur
const Wrapper = styled.div`
  margin-bottom: 18px;
`;
const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
`;
const Field = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
`;
const Error = styled.div`
  color: red;
  font-size: 0.9rem;
  margin-top: 4px;
`;

/**
 * Composant champ de saisie stylisé réutilisable.
 */
const Input = ({ label, error, ...props }) => (
  <Wrapper>
    <Label>{label}</Label>
    <Field {...props} />
    {error && <Error>{error}</Error>}
  </Wrapper>
);

export default Input;