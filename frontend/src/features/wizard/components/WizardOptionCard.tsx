import type { WizardOption } from '../types';

type WizardOptionCardProps = {
  option: WizardOption;
  isSelected: boolean;
  onSelect: (value: string) => void;
};

export const WizardOptionCard = ({
  option,
  isSelected,
  onSelect,
}: WizardOptionCardProps) => {
  return (
    <button
      type="button"
      className={`wizard__option ${isSelected ? 'wizard__option--selected' : ''}`}
      onClick={() => onSelect(option.value)}
    >
      <span className="material-symbols-outlined wizard__option-icon">
        {option.icon}
      </span>
      <span className="wizard__option-label">{option.label}</span>
      {option.description && (
        <span className="wizard__option-description">{option.description}</span>
      )}
    </button>
  );
};
