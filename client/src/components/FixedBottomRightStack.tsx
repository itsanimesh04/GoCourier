import FloatingCartButton from './FloatingCartButton';
import StickyCampusBatch from './StickyCampusBatch';

/** Stacks view-cart above tonight's batch on the bottom-right. */
const FixedBottomRightStack = () => {
  return (
    <div className="fixed bottom-4 right-4 z-30 flex w-[min(100vw-2rem,17rem)] flex-col gap-2">
      <FloatingCartButton />
      <StickyCampusBatch />
    </div>
  );
};

export default FixedBottomRightStack;
