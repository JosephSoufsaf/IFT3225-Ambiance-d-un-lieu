import { useContext } from 'react';
import './home.css';
import { UserLoginContext } from '../App';


export default function Home() {
    const loggedinState = useContext(UserLoginContext);
    
    return (
        <div className="home-page">
            <div className="home-content">
                <h1 className="home-title">Bienvenue sur l'application Ambiance</h1>
                <p className="home-description">
                    Sur cette application vous pouvez connaître l'ambiance d'un lieu en quasi temps réel et soumettre des observations sur un lieu!
                </p>

                <div className="home-cta">
                    <div className="home-cta-card">
                        <p>Visualisez à l'aide une carte pour trouver des lieux facilement!</p>
                        <a href="/map">Map</a>
                    </div>
                    <div className="home-cta-card">
                        <p>Consulter la liste des lieux enregistrés et apprenez-en plus!</p>
                        <a href="/lieux">Lieux</a>
                    </div>
                    <div className="home-cta-card">
                        <p>Ajoutez une localisation à suivre ou enregitrer!</p>
                        {loggedinState.loggedin ? <a href="/nouvellelocalisation">Nouvelle localisation</a> 
                                                : <p className='underline'>Veuillez vous connecter pour ajouter une localisation</p> }
                    </div>
                </div>
            </div>
        </div>
    );
}