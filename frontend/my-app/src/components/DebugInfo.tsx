import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
// import { sampleDataService } from '../services/sampleDataService';

const DebugInfo: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [systemInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const testAPICalls = async () => {
    console.log('=== Testing API Calls ===');
    
    // Test token
    const token = localStorage.getItem('token');
    console.log('Token:', token ? 'Present' : 'Missing');
    
    // Test get patients by doctor
    try {
      const patientsResponse = await api.get('/pacientes/mis-pacientes');
      console.log('Patients response:', patientsResponse.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
    
    // Test get available doctors
    try {
      const doctorsResponse = await api.get('/perfil-medico/doctores-disponibles');
      console.log('Doctors response:', doctorsResponse.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
    
    // Test user info endpoint
    try {
      const userResponse = await api.get('/auth/me');
      console.log('User info response:', userResponse.data);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };
  
  const getSystemInfo = async () => {
    try {
      setLoading(true);
      // const info = await sampleDataService.getSystemInfo();
      // setSystemInfo(info);
      console.log('System info function disabled temporarily');
    } catch (error) {
      console.error('Error getting system info:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const createSampleUsers = async () => {
    try {
      setLoading(true);
      // const result = await sampleDataService.createSampleUsers();
      console.log('Sample users creation function disabled temporarily');
      alert('Sample users creation function disabled temporarily');
    } catch (error) {
      console.error('Error creating sample users:', error);
      alert('Error creating sample users. Check console for details.');
    } finally {
      setLoading(false);
    }
  };
  
  const createSampleDoctors = async () => {
    try {
      setLoading(true);
      // const result = await sampleDataService.createSampleDoctors();
      console.log('Sample doctors creation function disabled temporarily');
      alert('Sample doctors creation function disabled temporarily');
    } catch (error) {
      console.error('Error creating sample doctors:', error);
      alert('Error creating sample doctors. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Debug Information</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">Authentication Status:</h3>
          <p>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
        </div>
        
        <div>
          <h3 className="font-semibold text-lg">User Information:</h3>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {user ? JSON.stringify(user, null, 2) : 'No user data'}
          </pre>
        </div>
        
        <div>
          <h3 className="font-semibold text-lg">LocalStorage Data:</h3>
          <div className="bg-gray-100 p-3 rounded text-sm">
            <p><strong>Token:</strong> {localStorage.getItem('token') ? 'Present' : 'Missing'}</p>
            <p><strong>User:</strong></p>
            <pre className="text-xs overflow-auto mt-1">
              {localStorage.getItem('user') || 'No user data'}
            </pre>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={testAPICalls}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Test API Calls
          </button>
          
          <button
            onClick={getSystemInfo}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            Get System Info
          </button>
          
          {user?.rol === 'admin' && (
            <>
              <button
                onClick={createSampleUsers}
                disabled={loading}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50"
              >
                Create Sample Users
              </button>
              
              <button
                onClick={createSampleDoctors}
                disabled={loading}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
              >
                Create Sample Doctors
              </button>
            </>
          )}
        </div>
        
        {loading && (
          <div className="text-center py-4">
            <div className="text-blue-600">Loading...</div>
          </div>
        )}
        
        {systemInfo && (
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-2">System Information:</h3>
            <div className="bg-gray-100 p-4 rounded text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>Total Users:</strong> {systemInfo.users?.length || 0}</p>
                  <p><strong>Available Doctors:</strong> {systemInfo.availableDoctors?.length || 0}</p>
                  <p><strong>All Doctors:</strong> {systemInfo.allDoctors?.length || 0}</p>
                  <p><strong>Patients:</strong> {systemInfo.patients?.length || 0}</p>
                </div>
                <div>
                  <p><strong>Errors:</strong> {systemInfo.errors?.length || 0}</p>
                  {systemInfo.errors?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-red-600">Errors found:</p>
                      {systemInfo.errors.map((error: any, index: number) => (
                        <p key={index} className="text-xs text-red-500">• {error.error?.message || 'Unknown error'}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <details className="mt-4">
                <summary className="cursor-pointer font-medium">View Raw Data</summary>
                <pre className="mt-2 text-xs overflow-auto bg-white p-2 rounded border max-h-64">
                  {JSON.stringify(systemInfo, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugInfo;
