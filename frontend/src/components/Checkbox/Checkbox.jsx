import "./Checkbox.scss";

const Checkbox = ({ name, id, checked, onClick, onChange, className = "", labelClassName = "", title, disabled = false }) => {
  return (
    <label htmlFor={id} aria-label={`${name} checkbox`} onClick={onClick} className={labelClassName}>
      <input
        className={`fm-checkbox ${className}`}
        type="checkbox"
        name={name}
        id={id}
        checked={checked}
        onChange={onChange}
        title={title}
        disabled={disabled}
      />
    </label>
  );
};

export default Checkbox;
