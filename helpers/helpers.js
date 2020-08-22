const util = require('util');
const gc = require('../config/google-cloud-storage');
const { now } = require('jquery');

const bucket = gc.bucket(process.env.GCLOUD_BUCKET_NAME); // should be your bucket name

/**
 *
 * @param { File } object file object that will be uploaded
 * @description - This function does the following
 * - It uploads a file to the image bucket on Google Cloud
 * - It accepts an object as an argument with the
 *   "originalname" and "buffer" as keys
 */

const uploadImage = (file) => new Promise((resolve, reject) => {
  const { originalname, buffer } = file;

  const blob = bucket.file(originalname.replace(/ /g, '_'));
  const blobStream = blob.createWriteStream({
    resumable: false,
  });

  blobStream.on('finish', () => {
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    resolve(publicUrl);
  })
    .on('error', (error) => {
      console.log(error);
      reject(error, 'Unable to upload image, something went wrong');
    })
    .end(buffer);
});

/**
 * Checks to see if a user is logged in to protect api routes
 * @param {Object} user req.user
 */
const authChecker = (user) => !!user;

/**
 * Clean up Google Places API response.results for general info of multiple restaurants/bars
 * @param {Array} Google Places array
 */
const cleanPlacesData = (placesArray) => {
  return placesArray.map(place => {
    const cleanPlace = {};
    // Check if needed data exists
    // If so, add to clean data object
    if (place.place_id) {
      cleanPlace.id = place.place_id;
    }
    if (place.name) {
      cleanPlace.name = place.name;
    }
    if (place.vicinity) {
      cleanPlace.vicinity = place.vicinity;
    }
    if (place.opening_hours && place.opening_hours.open_now) {
      cleanPlace.openNow = place.opening_hours.open_now;
    }
    if (place.geometry.location.lat) {
      cleanPlace.lat = place.geometry.location.lat;
    }
    if (place.geometry.location.lng) {
      cleanPlace.lng = place.geometry.location.lng;
    }
    if (place.types) {
      cleanPlace.types = place.types;
    }
    if (place.rating) {
      cleanPlace.rating = place.rating;
    }
    if (place.icon) {
      cleanPlace.icon = place.icon;
    }
    // Return clean data for Google Place
    return cleanPlace;
  });
};

/**
 * Clean up Google Places API response.results for detailed info of a restaurant/bar
 * @param {Object} Google Place object
 */
const cleanPlaceDetailData = (placeObj) => {
  const place = placeObj;
  const cleanPlace = {};
  // Check if needed data exists
  // If so, add to clean data object
  if (place.place_id) {
    cleanPlace.id = place.place_id;
  }
  if (place.name) {
    cleanPlace.name = place.name;
  }
  if (place.formatted_address) {
    cleanPlace.address = place.formatted_address;
  }
  if (place.formatted_phone_number) {
    cleanPlace.phoneNumber = place.formatted_phone_number;
  }
  if (place.vicinity) {
    cleanPlace.vicinity = place.vicinity;
  }
  if (place.opening_hours && place.opening_hours.open_now) {
    cleanPlace.openNow = place.opening_hours.open_now;
  }
  if (place.opening_hours && place.opening_hours.weekday_text) {
    cleanPlace.weekdayText = place.opening_hours.weekday_text;
  }
  if (place.geometry.location.lat) {
    cleanPlace.lat = place.geometry.location.lat;
  }
  if (place.geometry.location.lng) {
    cleanPlace.lng = place.geometry.location.lng;
  }
  if (place.types) {
    cleanPlace.types = place.types;
  }
  if (place.rating) {
    cleanPlace.rating = place.rating;
  }
  if (place.icon) {
    cleanPlace.icon = place.icon;
  }
  if (place.photos) {
    cleanPlace.photos = place.photos;
  }
  if (place.website) {
    cleanPlace.icon = place.website;
  }
  // Return clean data for Google Place
  return cleanPlace;
};

module.exports = {
  uploadImage,
  authChecker,
  cleanPlacesData,
  cleanPlaceDetailData,
};
