import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock } from 'lucide-react';

interface PasswordGateProps {
  onSuccess: () => void;
}

const PASSWORD = '1903test';

export const PasswordGate = ({ onSuccess }: PasswordGateProps) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === PASSWORD) {
      sessionStorage.setItem('1903-authenticated', 'true');
      onSuccess();
    } else {
      setError(true);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50">
      <div 
        className={`bg-card p-8 rounded-lg shadow-2xl border border-border max-w-md w-full mx-4 transition-transform ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground">Access Required</h2>
          <p className="text-muted-foreground text-center mt-2">
            Enter the password to access the calculator
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className={`text-center text-lg ${error ? 'border-destructive' : ''}`}
              autoFocus
            />
            {error && (
              <p className="text-destructive text-sm mt-2 text-center">
                Incorrect password. Please try again.
              </p>
            )}
          </div>
          
          <Button type="submit" className="w-full" size="lg">
            Access Calculator
          </Button>
        </form>
      </div>
    </div>
  );
};
