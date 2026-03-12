import { useState, useEffect } from "react";
import '../index.css'
import SearchBarItem from "./SearchBarItem";

export default function SearchBar() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }
        //controller lets us cancel fetch requests so we can update live as the user types
        const controller = new AbortController();

        //encodeURIComponent means the search won't break with special characters, spaces etc.
        fetch(`http://localhost:3000/users/search?q=${encodeURIComponent(query)}`, {
            signal: controller.signal
        })
            .then(res => res.json())
            .then(data => {setResults(data);  console.log(`data: ${data}`);})
            .catch(() => {});

        return () => controller.abort();
    }, [query]);

    useEffect(() => {
        
    }, [results]);

    return (
        <div className="search-wrapper">
            <div className="search-box">
                <input
                    type="text"
                    placeholder="Search users..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                />
            </div>
            <div className="results-container">
                {results.map((u) => (
                    <SearchBarItem key={u.id} user={u} />
                    ))}
            </div>
        </div>
    );
}
