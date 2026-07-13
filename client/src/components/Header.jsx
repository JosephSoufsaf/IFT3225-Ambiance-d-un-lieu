import Button from './Button.jsx'
export default function Header() {

    return <header className="flex justify-between p-4 border-2">
        <a href="/" className='font-bold text-2xl'>Ambiance</a>

        <div className="flex gap-4">
            <Button href={"/inscription"} text={"Inscription"} />
            <Button href={"/connection"} text={"Connection"}/>
        </div>
    </header>
}