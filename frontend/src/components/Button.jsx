// Button.jsx
// Composant bouton stylisé réutilisable
import styled from 'styled-components';

// Bouton stylisé avec styled-components
const Btn = styled.button`
  width: 100%;
  padding: 14px 0;
  background: #f5b335;
  color: #fff;
  font-size: 1.2rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: background 0.2s;
  &:hover { background: #e0a42a; }
  &:disabled { background: #f5b33599; cursor: not-allowed; }
`;

/**
 * Composant bouton stylisé réutilisable.
 */
export default function Button({ children, ...props }) {
  return <Btn {...props}>{children}</Btn>;
}