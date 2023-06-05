import React from 'react';
import '../styles/CriptoCards.css'; 

const CryptoCard = ({ image, name, symbol, price, onClick }) => {
    return (
        <div className="crypto-card" onClick={onClick}>
            <img src={image} alt={name} className="crypto-icon" />
            <div className="crypto-info">
                <div className="crypto-heading">
                    <h2>{name}</h2>
                    <p className='symbol'>{symbol}</p> 
                    <h3 className="crypto-price">${price} USD</h3>
                </div>
            </div>
        </div>
    );
};

export default CryptoCard;

