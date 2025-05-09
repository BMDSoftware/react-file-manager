import "./Button.scss";

const Button = ({ onClick, onKeyDown, type = "primary", padding = "0.4rem 0.8rem", children, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={`fm-button fm-button-${type}`}
      style={{ padding: padding }}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
