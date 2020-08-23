import React, { useState, useEffect } from 'react';
import kelvinToFahrenheit from 'kelvin-to-fahrenheit';
import convertTime from 'convert-time';
import './weather.css';

const Forecast = () => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState({});
  const [weather, setWeather] = useState([]);

  const key = process.env.WEATHER_API;
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${query}&appid=${key}`;

  const searchForecast = (evt) => {
    if (evt.key === 'Enter') {
      fetch(url)
        .then((res) => res.json())
        .then((result) => {
          setStatus(result.city);
          setWeather(result.list);
          setQuery(query);
        });
    }
  };

  return (
    <div>
      <h1>Weekly Forecast</h1>
      <main>
        <div className="search-box">
          <input
            type="text"
            className="search-bar"
            placeholder="Enter City..."
            onChange={(e) => setQuery(e.target.value)}
            value={query}
            onKeyPress={searchForecast}
          />
        </div>
        {(weather.length > 0) ? (
          <div>
            <div className="location-box">
              <div className="location">{status.name}, {status.country}</div>
            </div>
            {
              weather.map((day, i) => (
                <div
                  index={i}
                  date={new Date(day.dt * 1000)}
                  days={['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat']}
                  dayblock={document.createElement('div')}
                  style={{
                    float: 'left',
                    paddingTop: '50px',
                    paddingRight: '30px',
                    paddingBottom: '50px',
                    paddingLeft: '80px',
                    textAlign: 'center'
                  }}
                >
                  {/* <div><h3>Weather Forecast: {query}</h3></div> */}
                  <div className="location-box">
                    <div className="date"> {day.dt_txt.substring(0, 10)}</div>
                  </div>
                  <div className="time-box">
                    <div className="time"> {convertTime(day.dt_txt.substring(11))}</div>
                  </div>
                  <div className="day-box">
                    <div
                      className="temp"
                      style={{
                        fontSize: '40px',
                        textAlign: 'center',
                      }}
                    >
                      {Math.round(kelvinToFahrenheit(day.main.temp))}°f
                    </div>
                    <div
                      className="day"
                      style={{
                        fontSize: '40px',
                        textAlign: 'center',
                      }}
                    >{day.weather[0].main}
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        ) : ('')}
      </main>
    </div>
  );
};

export default Forecast;
