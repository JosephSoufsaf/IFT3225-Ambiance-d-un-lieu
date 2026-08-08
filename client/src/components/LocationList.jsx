import LocationButton from './LocationButton';

export default function LocationList({ items, selectedName, onSelect }) {
    return (
        <div className="lieux-list">
            {items.map((item) => (
                <LocationButton
                    key={item.key}
                    label={item.name}
                    active={selectedName === item.name}
                    onClick={() => onSelect(item.name)}
                />
            ))}
        </div>
    );
}