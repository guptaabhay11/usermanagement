import React, { useState, useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import UserList from './UserList';
import UserDetails from './UserDetails';

const UsersView = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  // Handle outside click to close UserDetails
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (detailsRef.current && !detailsRef.current.contains(event.target as Node)) {
        setSelectedUserId(null);
      }
    };

    if (selectedUserId) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedUserId]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2,
        p: 2
      }}
    >
      {/* UserList - wider when no user is selected */}
      <Box
        sx={{
          flex: selectedUserId ? 1 : 1.5,
          transition: 'flex 0.3s ease'
        }}
      >
        <UserList onUserSelect={setSelectedUserId} />
      </Box>

      {/* UserDetails - visible when a user is selected */}
      {selectedUserId && (
        <Box
          ref={detailsRef}
          sx={{
            flex: 1,
            minWidth: { xs: '100%', md: '400px' },
            maxWidth: { md: '500px' }
          }}
        >
          <UserDetails userId={selectedUserId} />
        </Box>
      )}
    </Box>
  );
};

export default UsersView;
