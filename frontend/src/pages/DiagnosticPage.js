import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

const DiagnosticPage = () => {
  const [checks, setChecks] = useState({
    tailwind: 'checking',
    api: 'checking',
    auth: 'checking',
    routing: 'checking'
  });

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    // Check Tailwind CSS
    setTimeout(() => {
      const element = document.createElement('div');
      element.className = 'bg-blue-500';
      document.body.appendChild(element);
      const styles = window.getComputedStyle(element);
      const tailwindWorks = styles.backgroundColor === 'rgb(59, 130, 246)';
      document.body.removeChild(element);
      
      setChecks(prev => ({ ...prev, tailwind: tailwindWorks ? 'pass' : 'fail' }));
    }, 100);

    // Check API
    try {
      const response = await fetch('http://localhost:8000/health');
      const data = await response.json();
      setChecks(prev => ({ ...prev, api: data.status === 'healthy' ? 'pass' : 'fail' }));
    } catch (error) {
      setChecks(prev => ({ ...prev, api: 'fail' }));
    }

    // Check Auth Context
    try {
      const token = localStorage.getItem('token');
      setChecks(prev => ({ ...prev, auth: token ? 'pass' : 'warn' }));
    } catch (error) {
      setChecks(prev => ({ ...prev, auth: 'fail' }));
    }

    // Check Routing
    setChecks(prev => ({ ...prev, routing: window.location.pathname.includes('/app') ? 'pass' : 'warn' }));
  };

  const getIcon = (status) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'fail':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'warn':
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
      default:
        return <RefreshCw className="h-6 w-6 text-gray-400 animate-spin" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pass':
        return 'Working';
      case 'fail':
        return 'Failed';
      case 'warn':
        return 'Warning';
      default:
        return 'Checking...';
    }
  };

  const diagnosticItems = [
    { key: 'tailwind', label: 'Tailwind CSS', description: 'Styling framework' },
    { key: 'api', label: 'Backend API', description: 'API connection' },
    { key: 'auth', label: 'Authentication', description: 'User session' },
    { key: 'routing', label: 'React Router', description: 'Navigation' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            System Diagnostics
          </h1>
          <p className="text-gray-600 mb-8">
            Checking all system components...
          </p>

          <div className="space-y-4">
            {diagnosticItems.map(item => (
              <div
                key={item.key}
                className="flex items-center justify-between p-6 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all"
              >
                <div className="flex items-center space-x-4">
                  {getIcon(checks[item.key])}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.label}
                    </h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${
                    checks[item.key] === 'pass' ? 'text-green-600' :
                    checks[item.key] === 'fail' ? 'text-red-600' :
                    checks[item.key] === 'warn' ? 'text-yellow-600' :
                    'text-gray-600'
                  }`}>
                    {getStatusText(checks[item.key])}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Quick Fixes
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• If Tailwind CSS fails: Rebuild frontend container</li>
              <li>• If API fails: Check backend is running on port 8000</li>
              <li>• If Auth warns: Login to create a session</li>
              <li>• If Routing warns: Navigate to /app/dashboard</li>
            </ul>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={runDiagnostics}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Run Diagnostics Again</span>
            </button>
          </div>

          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">System Info</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p>• User Agent: {navigator.userAgent}</p>
              <p>• Current URL: {window.location.href}</p>
              <p>• Screen Size: {window.innerWidth} x {window.innerHeight}</p>
              <p>• Local Storage: {localStorage.length} items</p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/app/dashboard"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticPage;
