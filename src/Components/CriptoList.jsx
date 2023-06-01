import React, { useState } from 'react';
import CryptoCard from './CriptoCards';
import GraphTest from './grapTest';
import cryptoData from '../JSON/coin.json';
import '../styles/CriptoList.css';
import '../styles/grap.css'

const CryptoList = () => {
    const [cryptoList, setCryptoList] = useState(cryptoData);
    const [searchInput, setSearchInput] = useState('');
    const [selectedCoinId, setSelectedCoinId] = useState(null);

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
            <p className="line">___________________________________________________</p>
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
            <div className='grap_container'>
                <GraphTest selectedCoinId={selectedCoinId} />
            </div>
        </div>
    );
};

export default CryptoList;
