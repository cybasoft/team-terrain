
import React, { useState } from 'react';
import { Lock, AlertCircle, Mail } from 'lucide-react';
import { User as UserType } from '../types/User';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { authenticateUser, validateUserCredentials } from '../lib/authentication';

interface LoginFormProps {
  users: UserType[];
  onLogin: (user: UserType) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ users, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Try API authentication first
      const authResult = await authenticateUser({ 
        email: email.trim(), 
        password: password.trim() 
      });
      
      if (authResult.success && authResult.user) {
        onLogin(authResult.user);
      } else {
        // Fallback to local validation if API fails
        const localUser = validateUserCredentials(users, email.trim(), password.trim());
        
        if (localUser) {
          onLogin(localUser);
        } else {
          setError(authResult.message || 'Invalid email or password. Please check your credentials and try again.');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      // Fallback to local validation on network error
      const localUser = validateUserCredentials(users, email.trim(), password.trim());
      
      if (localUser) {
        onLogin(localUser);
      } else {
        setError('Authentication failed. Please check your credentials and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle>Employees Map</CardTitle>
          <CardDescription>
            Enter your email and password to access the map
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className={error ? 'border-red-300' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center space-x-2">
                <Lock className="h-4 w-4" />
                <span>Password</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className={error ? 'border-red-300' : ''}
              />
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !email.trim() || !password.trim()}
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-2">Authentication:</p>
              <p className="text-blue-700">
                Enter your email and assigned password to access the location tracker. 
                Contact your administrator if you need access credentials.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
