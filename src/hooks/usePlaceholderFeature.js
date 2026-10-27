import { useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import { getNavItem } from '../config/navigation';

// Temporary interaction for features that don't have a screen yet.
export default function usePlaceholderFeature() {
  const { showToast } = useToast();
  return useCallback((id) => {
    const label = getNavItem(id)?.label || 'This feature';
    showToast(`${label} is coming soon. It doesn't have its own screen yet.`);
  }, [showToast]);
}
