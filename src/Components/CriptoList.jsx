import React, { useState } from 'react';
import CryptoCard from './CriptoCards';
import GraphTest from './grapTest';
import cryptoData from '../JSON/coin.json';
import '../styles/CriptoList.css';
import '../styles/grap.css';

const CryptoList = () => {
    // const [cryptoList, setCryptoList] = useState([]);
    const [cryptoList, setCryptoList] = useState(cryptoData);
    const [searchInput, setSearchInput] = useState('');
    const [selectedCoinId, setSelectedCoinId] = useState(null);

//     const fetchCryptoList = async () => {
//         try {
//             const response = await fetch(
//                 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=30d&locale=en&precision=3'
//             );
//             const data = await response.json();
//             setCryptoList(data);
//         } catch (error) {
//             console.error(error);
//         }
//     };

//    if (cryptoList.length === 0) {
        
//          fetchCryptoList();
//     }

    const filtered = searchInput
        ? cryptoList.filter(
            (coin) =>
                coin.name.toLowerCase().includes(searchInput.toLowerCase()) ||
                coin.symbol.toLowerCase().includes(searchInput.toLowerCase())
        )
        : cryptoList;

    const handleCoinClick = (coinId) => {
        setSelectedCoinId(coinId);
    };

    return (
        <div className="criptoContainer">
            <h1>Control panel</h1>
            <div className="search-container">
                <input
                    className="search-input"
                    type="text"
                    placeholder="Enter your search request"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                />
            </div>
            <h2 className="sub">Crypto currencies</h2>
            <div className="crypto-list">
                {filtered.map((crypto) => (
                    <div className="crypto-card" key={crypto.id}>
                        <CryptoCard
                            name={crypto.name}
                            symbol={crypto.symbol}
                            image={crypto.image}
                            price={crypto.current_price}
                            onClick={() => handleCoinClick(crypto.id)}
                        />
                    </div>
                ))}
            </div>
            <div className="grap_container_bar">
                {selectedCoinId !== null ? (
                    <GraphTest selectedCoinId={selectedCoinId} />
                ) : (
                    <GraphTest selectedCoinId={cryptoList.length > 0 ? cryptoList[0].id : null} />
                )}
            </div>
        </div>
    );
};

export default CryptoList;
