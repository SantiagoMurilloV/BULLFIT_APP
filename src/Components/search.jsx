import React from 'react';
import CryptoCard from './CriptoCards';

const RenderSearch = ({ cryptoList, searchResult, searchInput, handleCoinClick }) => {
    if (searchInput !== '') {
        return searchResult.map((crypto) => {
            const matchingCrypto = cryptoList.find((coin) => coin.id === crypto.id);
            const price = matchingCrypto ? matchingCrypto.current_price : 0;
            return (
                <div className="card" key={crypto.id}>
                    <CryptoCard
                        name={crypto.name}
                        symbol={crypto.symbol}
                        image={crypto.large}
                        price={parseFloat(price)
                            .toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        onClick={() => handleCoinClick(crypto.id)}
                    />
                </div>
            );
        });
    } else {
        return cryptoList.map((crypto) => (
            <div className="card" key={crypto.id}>
                <CryptoCard
                    name={crypto.name}
                    symbol={crypto.symbol}
                    image={crypto.image}
                    price={parseFloat(crypto.current_price)
                        .toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    onClick={() => handleCoinClick(crypto.id)}
                />
            </div>
        ));
    }
};

export default RenderSearch;
