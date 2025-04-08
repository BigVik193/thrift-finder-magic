
import React from 'react';
import { Navigate } from 'react-router-dom';

// Redirect to LikedItems as SavedItems is now deprecated
const SavedItems = () => {
  return <Navigate to="/liked" replace />;
};

export default SavedItems;
