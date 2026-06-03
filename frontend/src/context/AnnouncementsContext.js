import React, { createContext, useContext } from 'react';

const AnnouncementsContext = createContext([]);

export const AnnouncementsProvider = ({ children, announcements = [] }) => {
  return (
    <AnnouncementsContext.Provider value={announcements}>
      {children}
    </AnnouncementsContext.Provider>
  );
};

export const useAnnouncements = () => useContext(AnnouncementsContext);
