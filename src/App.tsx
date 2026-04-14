import React, { Suspense, lazy } from 'react';

// Code-splitting using React.lazy for all screens
const HomeScreen = lazy(() => import('./screens/HomeScreen'));
const AboutScreen = lazy(() => import('./screens/AboutScreen'));
const ContactScreen = lazy(() => import('./screens/ContactScreen'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeScreen />
      <AboutScreen />
      <ContactScreen />
    </Suspense>
  );
}

export default App;
