import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Input } from './Input'; // Assuming you have a styled Input component
import { Button } from './Button'; // Assuming you have a styled Button component
import { cn } from '../../lib/utils'; // For classname utility
import { X } from 'lucide-react';

const PromptDialog = ({
    isOpen,
    onOpenChange,
    title,
    message,
    inputLabel = 'Value:',
    defaultValue = '',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    placeholder = '',
}) => {
    const [inputValue, setInputValue] = React.useState(defaultValue);

    React.useEffect(() => {
        if (isOpen) {
            setInputValue(defaultValue);
        }
    }, [isOpen, defaultValue]);

    const handleConfirm = () => {
        onConfirm(inputValue);
        onOpenChange(false); // Close dialog on confirm
    };

    const handleCancel = () => {
        onOpenChange(false);
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <Dialog.Content
                    className={cn(
                        "fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border border-dark-300 bg-dark-100 p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg md:w-full"
                    )}
                >
                    <Dialog.Title className="text-lg font-semibold text-lightText">
                        {title}
                    </Dialog.Title>
                    {message && (
                        <Dialog.Description className="text-sm text-subtleText">
                            {message}
                        </Dialog.Description>
                    )}
                    <div className="grid gap-2">
                        <label htmlFor="prompt-input" className="text-sm font-medium text-subtleText">
                            {inputLabel}
                        </label>
                        <Input
                            id="prompt-input"
                            type="number" // Assuming numeric input for extending time
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={placeholder}
                            className="bg-dark-200 border-dark-300 focus:ring-cyanAccent focus:border-cyanAccent"
                        />
                    </div>
                    <div className="mt-4 flex justify-end space-x-2">
                        <Button variant="outline" onClick={handleCancel}>
                            {cancelText}
                        </Button>
                        <Button variant="buttonBlue" onClick={handleConfirm}>
                            {confirmText}
                        </Button>
                    </div>
                    <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export { PromptDialog }; 