import React, { useEffect, useState } from 'react';
import { Graph } from './Graph';
import { fetchCryptoList } from '../helpers/CriptoFetch';
import { fetchSearch } from '../helpers/fetchSearch';
import RenderSearch from './search';
import '../styles/CriptoList.css';
import '../styles/grap.css';

const CryptoList = () => {
  const [cryptoList, setCryptoList] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [selectedCoinId, setSelectedCoinId] = useState(null);
  const [searchResult, setSearchResult] = useState([]);

  const handleFetchCryptoList = async () => {
    try {
      const data = await fetchCryptoList();
      setCryptoList(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    handleFetchCryptoList();
  }, []);


  const handleFetchSearch = async () => {
    try {
      const data = await fetchSearch(searchInput);
      setSearchResult(data.coins);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (searchInput !== '') {
      handleFetchSearch();
    } else {
      setSearchResult([]);
    }
  }, [searchInput]);


  const handleSearch = (e) => {
    setSearchInput(e.target.value);
  };

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
          onChange={handleSearch}
        />
      </div>
      <h2 className="sub">Crypto currencies</h2>
      <div className="crypto-list">
        <RenderSearch
          cryptoList={cryptoList}
          searchResult={searchResult}
          searchInput={searchInput}
          handleCoinClick={handleCoinClick}
        />
      </div>
      <div className="grap_container_bar">
        {selectedCoinId !== null ? (
          <Graph selectedCoinId={selectedCoinId} />
        ) : (
          <Graph selectedCoinId={cryptoList.length > 0 ? cryptoList[0].id : null} />
        )}
      </div>
    </div>
  );
};

export default CryptoList;
