import { Routes, Route } from "react-router"
import Header from './components/Header.jsx'
import Lieux from "./pages/lieux.jsx";
import Map from "./pages/map.jsx";
import Auth from "./pages/auth.jsx";
import Inscription from "./pages/inscription.jsx";
import Connection from "./pages/connection.jsx";
import Home from "./pages/home.jsx"

export default function App() {
  return <>
    <Header></Header>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/lieux" element={<Lieux />} />
      <Route path="/map" element={<Map />}/>
      <Route element={<Auth/>}>
        <Route path="inscription" element={<Inscription />}/>
        <Route path="connection" element={<Connection/> }/>
      </Route>
    </Routes>

  </>;
}