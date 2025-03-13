import './App.css'
import { auth } from './firebase-config';
import {  onAuthStateChanged } from 'firebase/auth';
import { TextEditor } from './components/text-editor';
import  { useEffect, useState } from 'react';
import { Auth } from './components/auth';

function App() {

  const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });

        return () => unsubscribe();
    }, []);

  return (
    <>
      <div className="App">
        {user ? <TextEditor /> : <Auth />}
      </div>
    </>
  );
}

export default App
