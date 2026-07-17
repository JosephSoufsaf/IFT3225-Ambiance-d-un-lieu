export default function Home() {
    return <div className="flex flex-col justify-center items-center-safe text-center p-4 gap-4">
        <h1 className="text-2xl">Bienvenue sur l'application Ambiance</h1>
        <p>Sur cette application vous pouvez connaître l'ambiance d'un lieu en quasi temps réel et soumettre des observations sur un lieu!</p>

        <div className="CTA flex justify-center">
            <div className="flex flex-col items-center p-2 m-2 gap-4 border rounded-sm">
                <p>Visualisez à l'aide une carte pour trouver des lieux facilement!</p>
                <a href="/map">Map</a>
            </div>
            <div className="flex flex-col items-center p-2 m-2 gap-4 border rounded-sm">
                <p>Consulter la liste des lieux enregistrés et apprenez-en plus!</p>
                <a href="/lieux">Lieux</a>
            </div>
        </div>

    </div>
}