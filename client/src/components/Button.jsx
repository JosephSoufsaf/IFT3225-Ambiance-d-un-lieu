export default function Button({href, text}) {
    return <a href={href} className="px-2 py-1 border-2">
        {text}
    </a>
}