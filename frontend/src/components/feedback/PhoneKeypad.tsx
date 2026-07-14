export interface PhoneKeypadProps {
  onPress: (digit: string) => void;
  onBackspace: () => void;
}

export function PhoneKeypad({ onPress, onBackspace }: PhoneKeypadProps) {
  const keys = ['1', '2 ABC', '3 DEF', '4 GHI', '5 JKL', '6 MNO', '7 PQRS', '8 TUV', '9 WXYZ', '', '0', 'back'];
  return (
    <div className="grid grid-cols-3 gap-2">
      {keys.map((key, index) => {
        if (!key) {
          return <span key={index} />;
        }
        if (key === 'back') {
          return (
            <button
              key={key}
              type="button"
              className="surface-gradient grid min-h-[46px] place-items-center rounded-lg text-text transition hover:bg-surface2 active:scale-95"
              onClick={onBackspace}
            >
              x
            </button>
          );
        }
        const [digit, label] = key.split(' ');
        return (
          <button
            key={key}
            type="button"
            className="surface-gradient grid min-h-[46px] place-items-center rounded-lg font-display text-xl text-text transition hover:bg-surface2 active:scale-95"
            onClick={() => onPress(digit)}
          >
            <span>{digit}</span>
            {label ? <span className="-mt-1 text-[9px] font-bold text-text">{label}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
