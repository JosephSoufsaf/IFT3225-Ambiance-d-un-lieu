import Button from '../components/Button'

export default function Home() {
    return <div className="flex justify-center items-center-safe p-4 gap-4">

        <Button href="/map" text="Map"/>
        <Button href="/lieux" text="Lieux"/>

    </div>
}