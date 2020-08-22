import React, { useEffect, useState } from 'react';
import isEmpty from 'lodash.isempty';
import { Link } from 'react-router-dom';
import MarkerClusterer from '@google/markerclusterer';
import axios from 'axios';
import Marker from './Marker.jsx';
import InfoWindow from './InfoWindow.jsx';
import GoogleMap from './GoogleMap.jsx';
import SearchBox from './SearchBox.jsx';
import transparentMarker from '../../assets/imgs/transparentMarker.png';
import * as trailData from '../data/trail-data.json';
// import * as restaurantData from '../data/restaurant-data.json';
// import * as barData from '../data/bar-data.json';

/**
 * MapWithASearchBox is an Google Map with an auto-completing search bar that searches
 * suggested locations from Google Maps API. After a certain range
 * @param {Array} photos an array of photo information
 * @param {Number} currentPhoto a number representing the location of the current photo
 * @param {Function} changeCurrentPhoto a function that changes the current photo
 */

const MapWithASearchBox = React.memo(() => {
  const [mapApiLoaded, setMapApiLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [mapApi, setMapApi] = useState(null);
  const [places, setPlaces] = useState(trailData.data);
  const [userLocation, setUserLocation] = useState({
    lat: 30.0766974,
    lng: -89.8788793,
  });
  const [selectedTrail, setSelectedTrail] = useState(null);
  const [selectedTrailIndex, setSelectedTrailIndex] = useState(null);

  // *** LZ - begin
  const [restaurants, setRestaurants] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [displayRestaurants, setDisplayRestaurants] = useState(false);
  // const [restaurantsToken, setRestaurantsToken] = useState(null);
  // const [bars, setBars] = useState(null);
  // const [barsToken, setBarsToken] = useState(null);
  // const [nearbyTypesSelected, setNearbyTypesSelected] = useState([]);
  // const [establishments, setEstablishments] = useState(null);
  // *** LZ - end

  const addPlace = (place) => {
    setPlaces(place);
  };

  const clearSelectedTrail = () => {
    setSelectedTrail(null);
    setSelectedTrailIndex(null);
  };

  const updateTrails = (radius, lat, lng) => {
    const strungRadius = radius.toString();
    const strungLat = lat.toString();
    const strungLng = lng.toString();
    axios
      .get('/api/trails', {
        params: {
          radius: strungRadius,
          lat: strungLat,
          lon: strungLng,
        },
      })
      .then(({ data }) => {
        if (places) {
          setPlaces(data);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    console.log('*** Display Restaurant Update ***', displayRestaurants);
  }, [displayRestaurants]);

  useEffect(() => {
    console.log('*** Selected Restaurant Update ***', selectedRestaurant);
  }, [selectedRestaurant]);

  useEffect(() => {
    console.log('*** Restaurant Update Results ***', restaurants);
  }, [restaurants]);

  const updateRestaurants = (lat, lng) => {
    debugger;
    console.log("***Update", lat, lng);
    const latStr = lat.toString();
    const lngStr = lng.toString();
    // const params = {
    //   lat: latStr,
    //   long: lngStr,
    // };
    // if (token !== null) {
    //   params.token = token;
    // }
    axios
      .get('/api/restaurants', {
        params: {
          lat: latStr,
          lon: lngStr,
        },
      })
      .then(({ data }) => {
        setRestaurants(data);
        // if (data.next_page_token) {
        //   setRestaurantsToken(data.next_page_token);
        // } else {
        //   setRestaurantsToken(null);
        // }
      })
      // .then(() => {
      //   combineEstablishments();
      //   console.log('Combined in Restaurants:', establishments);
      // })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    updateTrails(100, userLocation.lat, userLocation.lng);
    const script = document.createElement('script');
    script.src =
      'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js';
    script.async = true;
    document.body.appendChild(script);

    const listener = (e) => {
      if (e.key === 'Escape') {
        clearSelectedTrail();
      }
    };
    window.addEventListener('keydown', listener);

    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setUserLocation({ lat: latitude, lng: longitude });
    });

    return () => {
      window.removeEventListener('keydown', listener);
      document.body.removeChild(script);
    };
  }, []);

  /**
   * setGoogleMapRef creates listeners on the current map, so that when the bounds
   * of the map are moved far enough away from the last search call, it creates
   * new search call based on the map's new current center. Also, prepares sets up
   * MarkerClusterer given the last trails retrieved from the last search call.
   */
  const setGoogleMapRef = (map, maps) => {
    if (map && maps) {
      let lastSearchedCenter = lastSearchedCenter || userLocation;
      map.addListener('bounds_changed', () => {
        const currentBounds = map.getBounds();
        const currentCenter = {
          lat: (currentBounds.Za.i + currentBounds.Za.j) / 2,
          lng: (currentBounds.Va.i + currentBounds.Va.j) / 2,
        };
        const range = 1.2; // lat/lon degrees needed to change in order to search again
        const radius = 100; // search radius in miles
        if (
          Math.abs(+currentCenter.lat - +lastSearchedCenter.lat) > range ||
          Math.abs(+currentCenter.lng - +lastSearchedCenter.lng) > range
        ) {
          lastSearchedCenter = currentCenter;
          updateTrails(radius, currentCenter.lat, currentCenter.lng);
        }
        const establishmentsRange = 0.1; // Change needed in lat/long degrees to refresh search
        if (
          Math.abs(+currentCenter.lat - +lastSearchedCenter.lat) > establishmentsRange ||
          Math.abs(+currentCenter.lng - +lastSearchedCenter.lng) > establishmentsRange
        ) {
          console.log("***Move", currentCenter.lat, currentCenter.lng);
          updateRestaurants(currentCenter.lat, currentCenter.lng);
          // updateBars(currentCenter.lat, currentCenter.lng);
        }
      });
      setMapInstance(map);
      setMapApi(maps);
      setMapApiLoaded(true);
      const googleRef = maps;
      /**
       * Uses @google/markerclusterer. We use current locations of trails
       * with lat/lng instead of lat/lon and create Marker Clusters.
       */
      if (places) {
        const locations = places.reduce((coordinates, currentTrail) => {
          coordinates.push({ lat: +currentTrail.lat, lng: +currentTrail.lon });
          return coordinates;
        }, []);
        const markers =
          locations &&
          locations.map((location) => {
            return new googleRef.Marker({
              position: location,
              icon: transparentMarker,
            });
          });
        new MarkerClusterer(map, markers, {
          imagePath:
            'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
          gridSize: 15,
          minimumClusterSize: 2,
        });
      }
    }
  };

  useEffect(() => {
    setGoogleMapRef(mapInstance, mapApi);
  }, [places]);

  // const combineEstablishments = () => {
  //   debugger;
  //   let combined;
  //   if (nearbyTypesSelected.length === 2) {
  //     combined = [...restaurants];
  //     for (let i = 0; i < bars.length; i++) {
  //       const currentBar = bars[i];
  //       if (restaurants.indexOf(currentBar) === -1) {
  //         combined.push(currentBar);
  //       }
  //     }
  //     setEstablishments(combined);
  //   } else if (nearbyTypesSelected.includes(restaurants)) {
  //     setEstablishments(restaurants);
  //   } else if (nearbyTypesSelected.includes(bars)) {
  //     setEstablishments(bars);
  //   } else {
  //     setEstablishments(null);
  //   }
  // };

  // useEffect(() => {
  //   console.log('*** Bars Data Results ***', bars);
  // }, [bars]);

  // const updateBars = (lat, lng) => {
  //   const latStr = lat.toString();
  //   const lngStr = lng.toString();
  //   // const params = {
  //   //   lat: latStr,
  //   //   lon: lngStr,
  //   // };
  //   // if (token !== null) {
  //   //   params.token = token;
  //   // }
  //   axios
  //     .get('/api/bars', {
  //       params: {
  //         lat: latStr,
  //         lon: lngStr,
  //       },
  //     })
  //     .then(({ data }) => {
  //       debugger;
  //       if (data && bars) {
  //         setBars(data.results);
  //         console.log('*** Bars Data Token ***', data.next_page_token);
  //         console.log('*** Bars Data Results ***', data.results);
  //         if (data.next_page_token) {
  //           setBarsToken(data.next_page_token);
  //         } else {
  //           setBarsToken(null);
  //         }
  //       }
  //     })
  //     .then(() => {
  //       combineEstablishments();
  //       console.log('Combined in Bars:', establishments);
  //     })
  //     .catch((err) => {
  //       console.error(err);
  //     });
  // };

  // useEffect(() => {
  //   if (restaurantsToken) {
  //     let restaurantsCopy = [...restaurants];
  //     let count = 0;
  //     console.log('UseEffect Token:', restaurantsToken);
  //     // while
  //     updateRestaurants(userLocation.lat, userLocation.lng, restaurantsToken);
  //     //   count++;
  //     // }
  //     // if (restaurants.length > 0 && restaurants !== restaurantsCopy) {
  //     //   setRestaurants([...restaurantsCopy, ...restaurants]);
  //     // }
  //   }
  //   console.log('UseEffect Restaurants:', restaurants);
  // }, [restaurantsToken]);

  // useEffect(() => {
  //   updateEstablishments(userLocation.lat, userLocation.lng);
  //   console.log('UseEffect Restaurants:', restaurants);
  // }, [nearbyTypesSelected]);

  // const updateEstablishments = (lat, lng) => {
  //   debugger;
  //   if (nearbyTypesSelected.indexOf('restaurants') > -1) {
  //     updateRestaurants(lat, lng);
  //   } else {
  //     setRestaurants(null);
  //   }
  //   if (nearbyTypesSelected.indexOf('bars') > -1) {
  //     updateBars(lat, lng);
  //   } else {
  //     setBars(null);
  //   }
  //   combineEstablishments();
  // };

  const handleCheckboxChange = (event) => {
    const { checked, id } = event.target;
    if (checked && id === 'restaurants') {
      console.log(userLocation.lat, userLocation.lng);
      updateRestaurants(userLocation.lat, userLocation.lng);
      setDisplayRestaurants(true);
    } else if (!checked && id === 'restaurants') {
      setRestaurants(null);
      setDisplayRestaurants(false);
    }
    setSelectedRestaurant(null);
    // if (nearbyTypesSelected.length > 0) {
    //   selectedTypes = [...nearbyTypesSelected];
    // }
    // const index = selectedTypes.indexOf(id);
    // if (checked && index === -1) {
    //   selectedTypes.push(id);
    // } else if (!checked && index > -1) {
    //   selectedTypes.splice(index, 1);
    // }
    // setNearbyTypesSelected(selectedTypes);
  };

  return (
    <>
      {mapApiLoaded && (
        <SearchBox
          map={mapInstance}
          mapApi={mapApi}
          places={places}
          addplace={addPlace}
        />
      )}

      <div>
        <form>
          <div className="checkboxes">
            <div>
              <label htmlFor="restaurants">
                <input type="checkbox" id="restaurants" onChange={handleCheckboxChange} />
                Nearby Restaurants
              </label>
            </div>
            {/* <div>
              <label htmlFor="bars">
                <input type="checkbox" id="bars" onChange={handleChange} />
                Nearby Bars
              </label>
            </div> */}
          </div>
        </form>
      </div>

      <GoogleMap
        defaultZoom={10}
        defaultCenter={{
          lat: 30.0648498,
          lng: -89.8788793,
        }}
        center={userLocation}
        bootstrapURLKeys={{
          key: process.env.GOOGLE_MAPS_API_KEY,
          libraries: ['places', 'geometry'],
        }}
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded={({ map, maps }) => setGoogleMapRef(map, maps)}
        options={{ streetViewControl: false }}
      >
        {!isEmpty(places) &&
          places.map((place, i) => (
            <Marker
              color={i === selectedTrailIndex ? 'green' : 'blue'}
              key={place.id}
              text={place.name}
              size={28}
              lat={place.lat || place.geometry.location.lat()}
              lng={place.lon || place.geometry.location.lng()}
              clickHandler={() => {
                if (selectedTrailIndex === i) {
                  clearSelectedTrail();
                } else {
                  setSelectedTrail(place);
                  setSelectedTrailIndex(i);
                }
              }}
            />
          ))}
        {selectedTrail && (
          <InfoWindow
            selectedTrail={selectedTrail}
            onCloseClick={() => {
              clearSelectedTrail();
            }}
            position={{
              lat: +selectedTrail.lat,
              lng: +selectedTrail.lon,
            }}
          >
            <div>
              <Link to={`/trail/${selectedTrail.id}`} activeclassname="active">
                <h2>{selectedTrail.name}</h2>
              </Link>
              <p>{selectedTrail.length} miles</p>
              <p>{selectedTrail.description}</p>
            </div>
          </InfoWindow>
        )}
        {!isEmpty(restaurants) && displayRestaurants &&
          restaurants.map((restaurant) => (
            <Marker
              color={'food'}
              key={restaurant.id}
              text={restaurant.name}
              size={28}
              lat={restaurant.lat}
              lng={restaurant.lng}
              clickHandler={() => {
                if (selectedRestaurant && selectedRestaurant.id === restaurant.id) {
                  console.log("***ID matches so cleared selected");
                  setSelectedRestaurant(null);
                } else {
                  console.log("***ID doesn't matches so set selected");
                  setSelectedRestaurant(restaurant);
                }
              }}
            />
          ))}
      </GoogleMap>
    </>
  );
});

export default MapWithASearchBox;
