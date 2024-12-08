import logo from './logo.svg';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import sunnyPhoto from './sun.png';
import React, { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";


function App() {

  const apiKey = "ab9fc55442e6e5d7eb181f6dd5445bfa"; // API key
  
  const [inputText, setInputText] = useState("");  // input text for the search
  const [country, setCountry] = useState(""); // current country for weatehr look up
  const [weatherData, setWeatherData] = useState(null); // weather data fetched from API
  const [loading, setLoading] = useState(false); // loading state of the API call
  const [error, setError] = useState(""); // error messages
  const [searchHistory, setSearchHistory] = useState([]); // history of searched countries
  const [notFound, setNotFound] = useState(false); // not found state for invalid locations

  // handles changes to the country search input
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formattedText = capitalizeFirstLetter(e.target.value);
    setInputText(formattedText);
  };

  // handles the search button click
  const handleSearch = () => {
    if(inputText.trim()) {
      const formattedText = capitalizeFirstLetter(inputText.trim());
      setCountry(formattedText);
      setInputText("");
    }
  };

  // fetches weather data when the country changes
  useEffect(() => {
    if(!country) {
      // setWeatherData(null);
      return;
    }

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${country}&appid=${apiKey}&units=metric`;

    const fetchWeatherDate = async () => {
      setLoading(true);
      try {
        const response = await axios.get(apiUrl);
        setWeatherData(response.data);
        setError("");
        setNotFound(false);

        // prevent duplicate entries in the search history
        const exists = searchHistory.some(
          (item) => item.location.toLowerCase() === country.toLowerCase()
        );

        if(!exists) {
          setSearchHistory((prevHistory) => [...prevHistory, { location: country, shortForm: response.data.sys.country, time: new Date().toLocaleString() },    
          ]);
        }
        
      } catch (err) {
        setError("Error fetching weather data. Please try again.");
        // setWeatherData(null);
        setNotFound(true);
      }
      setLoading(false)
    };

    fetchWeatherDate();
  }, [country]);

  // format unix timestamps to date strings
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return date.toLocaleDateString('en-US', options);
  };

  //handles click on a search history item
  const handleHistoryClick = (location) => {
    setCountry(location);
  };

  // handles the deletion of a search history item
  const handleHistoryRemove = (location) => {
    // setSearchHistory(searchHistory.filter(item => item.location !== location));
    setSearchHistory((prevHistory) => {
      const updatedHistory = prevHistory.filter(item => item.location !== location);
  

    if(country === location) {
      if(updatedHistory.length > 0) {
        setCountry(updatedHistory[0].location);
      }
      else {
        setCountry("");
        setWeatherData(null);
        setNotFound(false);
        setError("");
      }
    }
    return updatedHistory;
  }); 
  };

  // Capitalizes the first letter of each word in the input
  const capitalizeFirstLetter = (text) => {
    return text.toLowerCase().split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  
  return (
    <div className="app">
      <div className="top">
          <input
          type="text"
          name="Country"
          className="search-input"
          placeholder="Country"
          value={inputText}
          onChange={handleChange}>
          </input>
        <button className="search-button" onClick={handleSearch}>
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </button>
      </div>
      {notFound && (
        <div className="not-found-messages">
          <p className="error-msg">Not Found</p>
        </div>
      )}
      
      <div className="middle">
        <div className="current-image">
          <div className="image">
            <img src={sunnyPhoto} width={300} height={300} alt="sunnyPhoto"/>
          </div>
        </div>
        
      </div>
      
      <div className="bottom">
        <div className="current-weather">
          <h3>Today's Weather</h3>
          <div className="weather-details">
            <div className="temperature">
              <span className="temp">{weatherData ? `${weatherData.main.temp}°` : "N/A"}</span>
              <p className="details">
              {weatherData ? `H: ${weatherData.main.temp_max}° | L: ${weatherData.main.temp_min}°`  : "High: N/A | Low: N/A"}
              </p>
            </div>
            <div className="extra-details">
              <p className="location">{weatherData ? `${weatherData.name}, ${weatherData.sys.country}` : "Location: N/A"}</p>
              <p className="date">{weatherData ? formatDate(weatherData.dt) : "Date: N/A"}</p>
              <p className="humidity">{weatherData ? `Humidity: ${weatherData.main.humidity}%` : "Humidity: N/A"}</p>
              <p className="condition">{weatherData ? capitalizeFirstLetter(`${weatherData.weather[0].description}`) : "Condition: N/A"}</p>
            </div>
          </div>
          <div className="history">
            <h3 className="searchHistory">Search history</h3>
            <div className="history-container">
              {searchHistory.length > 0 ? (searchHistory.map((item, index) => (
              <div key={index} className="history-list">
                <span className="location">{item.location}, {item.shortForm}</span>
                <div className="date-icon-group">
                  <span className="dateTime">{item.time}</span>
                  <button className="history-button" onClick={() => handleHistoryClick(item.location)} title="Search"><FontAwesomeIcon icon={faMagnifyingGlass} /></button>
                  <button className="history-button" onClick={() => handleHistoryRemove(item.location)} title="Delete"><FontAwesomeIcon icon={faTrash} /></button>
                </div>
              </div>
              ))
            ) : (
              <p>No History Available</p>
            )}
            </div>
          </div>
          </div>
          
      </div>
    </div>
  );
}

export default App;
