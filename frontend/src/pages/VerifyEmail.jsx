import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const VerifyEmail = () => {
  const { verifyEmailToken } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const triggerVerification = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing.');
        return;
      }

      const res = await verifyEmailToken(token);
      if (res.success) {
        setStatus('success');
        setMessage(res.message);
      } else {
        setStatus('error');
        setMessage(res.message);
      }
    };

    triggerVerification();
  }, [token]);

  return (
    <div className="min-h-[60vh] bg-gray-50 dark:bg-gray-950 flex flex-col justify-center items-center py-12 px-4 transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-150 dark:border-gray-700 text-center space-y-6">
        
        {status === 'loading' && (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-16 w-16 text-sky-500 animate-spin" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-white font-display">Verifying Email Address...</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Please wait while we validate your activation token.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle className="h-16 w-16 text-emerald-500" />
            <h3 className="text-xl font-bold text-gray-850 dark:text-white font-display">Email Verified!</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
            <div className="pt-4">
              <Link
                to="/login?verified=true"
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-colors block text-sm"
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center space-y-4">
            <XCircle className="h-16 w-16 text-rose-500" />
            <h3 className="text-xl font-bold text-gray-850 dark:text-white font-display">Verification Failed</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
            <div className="pt-4">
              <Link
                to="/register"
                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-750 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold px-6 py-3 rounded-xl transition-colors block text-sm"
              >
                Sign Up Again
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyEmail;
