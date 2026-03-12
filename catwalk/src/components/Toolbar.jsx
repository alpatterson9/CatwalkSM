/**
 * Toolbar Component
 *
 * This component renders a toolbar container that can hold child elements.
 *
 * Props:
 * - children: The content inside the toolbar.
 *
 * @returns The rendered toolbar component.
 */
const Toolbar = ({ children }) => {
  return <div className="toolbar-container">{children}
  </div>;
};

export default Toolbar;
