const { tokenAuth } = require("../middlewares/middleware");
const Location = require("../models/Location");
const express = require('express');
const router = new express.Router();


router.get('/locations', async (req, res) => {
    try {
        const locations = await Location.find({});
        return res.status(200).json({ success: true, data: locations });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});


router.get('/locations/:name', async (req, res) => {
    try {
        const location = await Location.findOne({ name: req.params.name });
        if (!location) {
            return res.status(404).json({ success: false, error: "Ce lieu n'existe pas" });
        }
        return res.status(200).json({ success: true, data: location });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});



router.post('/locations', async (req, res) => {
    try {
        const { name, latitude, longitude } = req.body;

        if (!name || latitude === undefined || longitude === undefined) {
            return res.status(400).json({ success: false, error: "Champ requis manquant" });
        }

        const existingLocation = await Location.exists({ name });
        if (existingLocation) {
            return res.status(409).json({ success: false, error: "Ce lieu existe déjà" });
        }

        const location = new Location({ name, latitude, longitude });
        await location.save();
        return res.status(201).json({ success: true, data: location });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

const findUserLocations = (locationName, locationCategory, locationId, userLocations) => {
  if (locationName && locationCategory) {
    const location = userLocations.find(
      (savedLocation) =>
        savedLocation.location.toString() === locationId.toString() &&
        savedLocation.category === locationCategory
    );
    return {
      data: location,
      message: location
        ? 'Location is in users saved location'
        : 'Location is not in users saved locations'
    };
  }

  if (locationName && !locationCategory) {
    const location = userLocations.find(
      (savedLocation) => savedLocation.location.toString() === locationId.toString()
    );
    return {
      data: location,
      message: location
        ? 'Location is in users saved locations'
        : 'Location is not in users saved locations'
    };
  }

  if (!locationName && locationCategory) {
    const locations = userLocations.filter(
      (savedLocation) => savedLocation.category === locationCategory
    );
    return {
      data: locations,
      message: `All of users saved locations for category : ${locationCategory}`
    };
  }

  // ni nom ni catégorie
  return {
    data: userLocations,
    message: 'All user locations'
  };
};

router.get('/userLocations', tokenAuth, async (req, res) => {
  try {
    const { locationName, locationCategory } = req.query;
    await req.user.populate('savedLocations.location');

    let locationId;
    if (locationName) {
      const locationObject = await Location.findOne({ name: locationName });
      if (!locationObject) {
        return res.status(404).json({ success: false, error: "Ce lieu n'existe pas" });
      }
      locationId = locationObject._id;
    }

    const { data, message } = findUserLocations(
      locationName,
      locationCategory,
      locationId,
      req.user.savedLocations
    );

    if (locationName && data === undefined) {
      return res.status(204).json({ success: true, message });
    }

    return res.status(200).json({ success: true, message, data });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

const isAlreadySaved = (userLocations, locationId, locationCategory) => {
    return userLocations.some((savedLocation) =>
        savedLocation.location.toString() == locationId &&
        savedLocation.category == locationCategory
    )
}

router.post('/userLocations', tokenAuth, async (req,res) => {
    try {
        const {locationName, locationCategory} = req.body;
        const locationObject = await Location.findOne({ name: locationName})
        console.log('location : ', locationObject._id.toString());

        if ( isAlreadySaved(req.user.savedLocations, locationObject._id.toString(), locationCategory) ) {

            return res.status(409).json({ success: false, error: "Ce lieu est déjà favori" });
        }

        req.user.savedLocations.push({
            location: locationObject,
            category: locationCategory
        });
        await req.user.save();
        return res.status(201).json({ success: true, data: req.user.savedLocations });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message })
    }
});

// Retourne les lieux qui ne match PAS le id et catégorie
const filterOutLocations = (savedLocations, locationId, locationCategory) => {

    return savedLocations.filter((savedLocation) =>
        // Garder dans la liste filtree si un des deux ne match pas
        savedLocation.location.toString() != locationId ||
        savedLocation.category != locationCategory
    )
}

router.delete('/userLocations', tokenAuth, async (req,res) => {
    try {
        
        console.log('User saved locations : ', req.user.savedLocations);

        const {locationName, locationCategory} = req.body;
        const locationObject = await Location.findOne({ name: locationName});
        console.log('location object : ' + locationObject);
        let userLocations = req.user.savedLocations;

        const filteredLocations = filterOutLocations(userLocations, locationObject._id.toString(), locationCategory);
        console.log('filtered locations : ', filteredLocations);

        if (userLocations == filteredLocations) {
            return res.status(204).json({success: true, message: "Le lieu n'est déja pas dans les favoris"});
        } else {
            req.user.savedLocations = filteredLocations;
        }
        
        console.log('new User favorite locations : ',userLocations);

        await req.user.save();

        return res.status(200).json({ success: true, data: filteredLocations});

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = { router, findUserLocations, isAlreadySaved, filterOutLocations };