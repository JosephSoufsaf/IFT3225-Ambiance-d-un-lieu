import { Routes, Route } from "react-router"
import { createContext, useState } from "react";
import Header from './components/Header.jsx'
import Lieux from "./pages/lieux.jsx";
import Map from "./pages/map.jsx";
import AddLocation from "./pages/addLocation.jsx";
import Auth from "./pages/auth.jsx";
import Inscription from "./pages/inscription.jsx";
import Connection from "./pages/connection.jsx";
import Home from "./pages/home.jsx"
import NouvelleObservation from "./pages/nouvelleObservation.jsx";


export const UserLoginContext = createContext();

export default function App() {
  const [loggedin, setLoggedin] = useState(() => {
    const token = localStorage.getItem('loginToken');
    if (token == null) {
      return false;
    } else {
      return true;
    }
  });

  return <>
    <UserLoginContext.Provider value={{loggedin, setLoggedin}}>
      <Header></Header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lieux" element={<Lieux />} />
        <Route path="/map" element={<Map />} />
        <Route path="/nouvelleLocalisation" element={<AddLocation />} />
        <Route path="/nouvelleObservation" element={<NouvelleObservation />} />
        <Route element={<Auth />}>
          <Route path="inscription" element={<Inscription />} />
          <Route path="connection" element={<Connection />} />
        </Route>
      </Routes>
    </UserLoginContext.Provider>
  </>;
}