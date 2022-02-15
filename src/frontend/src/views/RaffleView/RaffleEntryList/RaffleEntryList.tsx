interface RaffleEntryListProps {
  raffleEntries: string[];
}

export default function RaffleEntryList({
  raffleEntries,
}: RaffleEntryListProps) {
  return (
    <>
      <h3>Raffle entry list</h3>
      {raffleEntries.length === 0 && <p>No entries!</p>}
      {raffleEntries.length > 0 && (
        <ul>
          {raffleEntries.map((entry) => (
            <li>{entry}</li>
          ))}
        </ul>
      )}
    </>
  );
}
