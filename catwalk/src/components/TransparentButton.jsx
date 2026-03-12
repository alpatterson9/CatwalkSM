/**
 * TransparentButton Component
 *
 * This component renders a button that is transparent and centered vertically and horizontally
 * within a container.
 *
 * Props:
 * - children: The content inside the button.
 *
 * @returns The rendered transparent button component.
 */

const TransparentButton = ({ children, onClick, className }) => {
    return(<>
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    }}>
        <button className={className || "transparentButton"} onClick={onClick}>{children}</button>
    </div>
    </>)
}
export default TransparentButton