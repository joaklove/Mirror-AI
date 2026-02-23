import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DisclaimerType,
  DISCLAIMER_CONTENT,
  PROFESSIONAL_HELP_RESOURCES,
  setDisclaimerAccepted,
  setPsychologicalDisclaimerAccepted,
} from '@/constants/disclaimer';
import { Phone, AlertTriangle } from 'lucide-react';

interface DisclaimerModalProps {
  type: DisclaimerType;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DisclaimerModal({ type, open, onConfirm, onCancel }: DisclaimerModalProps) {
  const [checked, setChecked] = useState(false);
  const content = DISCLAIMER_CONTENT[type];

  const handleConfirm = () => {
    if (content.requiresCheck && !checked) return;
    
    if (type === 'psychological') {
      setPsychologicalDisclaimerAccepted();
    } else {
      setDisclaimerAccepted(type);
    }
    
    setChecked(false);
    onConfirm();
  };

  const handleCancel = () => {
    setChecked(false);
    onCancel();
  };

  const getSeverityStyles = () => {
    switch (content.severity) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {content.severity === 'high' && <AlertTriangle className="w-5 h-5 text-red-500" />}
            {content.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="whitespace-pre-line text-gray-700 max-h-60 overflow-y-auto">
            {content.content}
          </div>

          {content.requiresCheck && (
            <div className="flex items-start space-x-2">
              <Checkbox
                id="consent"
                checked={checked}
                onCheckedChange={(v) => setChecked(v as boolean)}
              />
              <label htmlFor="consent" className="text-sm cursor-pointer">
                我已阅读并理解上述提示
              </label>
            </div>
          )}

          {content.professionalHelp && (
            <Alert className={getSeverityStyles()}>
              <AlertDescription>
                <p className="font-medium mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  如有需要，请联系：
                </p>
                <div className="space-y-1">
                  {PROFESSIONAL_HELP_RESOURCES.map((resource) => (
                    <p key={resource.phone} className="text-sm">
                      {resource.name}: <span className="font-mono">{resource.phone}</span> ({resource.available})
                    </p>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={content.requiresCheck && !checked}
            variant={content.severity === 'high' ? 'default' : 'default'}
            className={content.severity === 'high' ? 'bg-red-500 hover:bg-red-600' : ''}
          >
            {content.requiresCheck ? '确认查看' : '继续'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface UseDisclaimerResult {
  showDisclaimer: boolean;
  disclaimerType: DisclaimerType;
  handleProceed: () => void;
  handleCancel: () => void;
  needsDisclaimer: (type: DisclaimerType) => boolean;
}

export function useDisclaimer(): UseDisclaimerResult {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [disclaimerType, setDisclaimerType] = useState<DisclaimerType>('basic');
  const [proceedCallback, setProceedCallback] = useState<(() => void) | null>(null);

  const needsDisclaimer = (type: DisclaimerType): boolean => {
    if (type === 'psychological') {
      return localStorage.getItem('psychological_disclaimer_shown') !== 'true';
    }
    return localStorage.getItem(`disclaimer_accepted_${type}`) !== 'true';
  };

  const handleProceed = () => {
    if (proceedCallback) {
      proceedCallback();
    }
    setShowDisclaimer(false);
    setProceedCallback(null);
  };

  const handleCancel = () => {
    setShowDisclaimer(false);
    setProceedCallback(null);
  };

  return {
    showDisclaimer,
    disclaimerType,
    handleProceed,
    handleCancel,
    needsDisclaimer,
  };
}
