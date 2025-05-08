import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from 'payload/components/utilities';
import { useConfig } from 'payload/dist/admin/components/utilities/Config';

// Define the User interface
interface User {
  id: string;
  email: string;
  name?: string;
  projectId?: string;
}

const UserSelector: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useAuth();
  const config = useConfig();
  const hasFetchedRef = useRef(false);
  
  // Fetch users only once on component mount
  useEffect(() => {
    // Skip if we've already fetched or if user isn't admin
    if (!currentUser || currentUser.role !== 'admin' || hasFetchedRef.current) {
      return;
    }
    
    // Set a flag to prevent multiple fetches
    hasFetchedRef.current = true;
    
    // Delay initial fetch to avoid race conditions with other components
    const fetchTimer = setTimeout(() => {
      fetchUsers();
    }, 2000);
    
    return () => {
      clearTimeout(fetchTimer);
    };
  }, [currentUser]);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simple fetch approach - just get the users directly with their email/name
      // We'll avoid the additional API calls to fetch site data for now
      const response = await fetch('/api/users?limit=100');
      
      if (!response.ok) {
        if (response.status === 429) {
          setError('Rate limited. Please wait a moment before trying again.');
          return;
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.docs) {
        // Map users with minimal data to avoid extra API calls
        const mappedUsers = result.docs.map((user: any) => ({
          id: user.id,
          email: user.email,
          name: user.name || user.email.split('@')[0],
          projectId: user.projectId || 'Unknown',
        }));
        
        // Sort users alphabetically by email
        const sortedUsers = mappedUsers.sort((a, b) => {
          return a.email.toLowerCase().localeCompare(b.email.toLowerCase());
        });
        
        setUsers(sortedUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle user selection
  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = event.target.value;
    if (userId) {
      // Navigate to the selected user's edit page
      window.location.href = `${config.routes.admin}/collections/users/${userId}`;
    }
  };
  
  // Don't render anything for non-admin users
  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }
  
  // Show a minimal version of the selector if we're having API issues
  return (
    <div style={{
      padding: '10px 20px',
      margin: '10px 0',
      background: '#f5f5f5',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      flexWrap: 'wrap',
      gap: '10px'
    }}>
      <label htmlFor="user-selector" style={{ fontWeight: 'bold', marginRight: '8px' }}>
        Jump to User:
      </label>
      
      <select 
        id="user-selector"
        onChange={handleUserChange}
        value=""
        style={{
          padding: '8px 12px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          minWidth: '300px',
          cursor: 'pointer'
        }}
      >
        <option value="">Select a user...</option>
        {loading ? (
          <option disabled>Loading users...</option>
        ) : error ? (
          <option disabled>{error}</option>
        ) : (
          users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))
        )}
      </select>
      
      <a 
        href={`${config.routes.admin}/collections/users`}
        style={{
          color: '#0070f3',
          textDecoration: 'none',
          marginLeft: 'auto'
        }}
      >
        View All Users
      </a>
    </div>
  );
};

export default UserSelector;
