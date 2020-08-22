import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';
import { OverlayTrigger, Popover, Button, Image } from 'react-bootstrap';
import styled from 'styled-components';
// import { addTrail } from '../helpers';

const LinkDiv = styled.div`
  :hover {
    color: blue
  }
`;

/**
 * PlaceInfoWindow is small pop-up window that displays a clickable title of the currently selected
 * establishment.
 * @param {Object} selectedPlace an object with general information to the currently selected Google Place (restaurant/bar)
 * @param {Function} onCloseClick a function that changes the current photo
 */

const PlaceInfoWindow = React.memo(({ selectedPlace, onCloseClick }) => {
  const { id } = selectedPlace;
  const [redirect, setRedirect] = useState(false);
  const [placeDetail, setPlaceDetail] = useState(null);
  const place = selectedPlace;
  const infoWindowStyle = {
    position: 'relative',
    bottom: 150,
    left: 0,
    width: 220,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    boxShadow: '0 0px 0px 0px rgba(0, 0, 0, 0)',
    padding: 0,
    fontSize: 14,
    zIndex: 0,
  };

  /**
   * Calls the api to get a place's detail data
   * @param {Number} placeId a place's id number based on general place info
   */
  const getPlaceDetail = (placeId) => {
    axios({
      method: 'get',
      url: `/api/place/${placeId}`,
    })
      .then(({ data }) => {
        setPlaceDetail(data);
      })
      .catch((err) => {
        console.error("ERROR GETTING PLACE:", err);
        reject(err);
      });
  };
  
  useEffect(() => {
    console.log("*** Update place", placeDetail);
  }, [placeDetail]);

  useEffect(() => {
    getPlaceDetail(id);
  }, []);

  const clickHandler = () => {
    console.log("Clicked");
    // const PlaceDetail = {
    //   ...place,
    //   api_id: place.id,
    //   latitude: +place.lat,
    //   longitude: +place.lng,
    // };
    // // addPlace(placeDetail)
    // //   .then((response) => {
    //     console.log("Redirect to bar/restaurant");
    //     setRedirect(`/place/${response.id}`);
    //   // })
    //   // .catch((err) => {
    //   //   setRedirect('/404');
    //   // });
  };

  return (
    <div style={infoWindowStyle}>
      <>
        {!redirect ? null : <Redirect to={redirect} />}
        {['top'].map((placement) => (
          <OverlayTrigger
            trigger="click"
            key={placement}
            placement={placement}
            style={{ width: '400px' }}
            overlay={<Popover id={`popover-positioned-${placement}`} />}
          >
            <Button variant="secondary">
              <div
                style={{
                  fontSize: 12,
                  position: 'relative',
                  left: '50%',
                  color: 'white',
                }}
                onClick={onCloseClick}
              >
                X
              </div>
              {/* <div>
                <LinkDiv onClick={clickHandler}><h4>{place.name}</h4></LinkDiv>
              </div> */}
              {/* <div>
                <Image
                  src={thumbnail}
                  thumbnail
                  rounded
                  style={{ width: '130px' }}
                />
              </div> */}
              <div style={{ fontSize: 14, color: 'white' }}>
                {place.name}
                <br />
                {place.vicinity}
                <br />
                {place.rating}
                <br />
                {place.open_now ? 'Currently Open' : 'Currently Closed'}
              </div>
              {/* <div
                className="text-truncate"
                style={{ fontSize: 14, color: 'white', width: '14rem' }}
              >
                {place.description}
                <br />
              </div> */}
            </Button>
          </OverlayTrigger>
        ))}
      </>
    </div>
  );
});

export default PlaceInfoWindow;

PlaceInfoWindow.propTypes = {
  onCloseClick: PropTypes.func.isRequired,
  selectedPlace: PropTypes.shape({
    id: PropTypes.string,
  }).isRequired,
};
