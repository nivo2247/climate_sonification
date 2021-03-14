const cities = [
	{'city': 'Denver', 'latitude': 40, 'longitude': -105},
	{'city': 'San Francisco', 'latitude': 38, 'longitude': -122},
	
	{'city': 'Tokyo', 'latitude': 36, 'longitude': 140},
	{'city': 'Bengaluru', 'latitude': 13, 'longitude': 78},
	{'city': 'Hong Kong', 'latitude': 22, 'longitude': 114},
	
	{'city': 'Sydney', 'latitude': -34, 'longitude': 151},
	
	{'city': 'Sao Paulo', 'latitude': -23, 'longitude': -47},
	
	{'city': 'Cape Town', 'latitude': -34, 'longitude': 18},
	
	{'city': 'London', 'latitude': 52, 'longitude': 0},
	{'city': 'Berlin', 'latitude': 53, 'longitude': 13},
	{'city': 'Paris', 'latitude': 49, 'longitude': 2},
	{'city': 'Rome', 'latitude': 42, 'longitude': 12}
]

export function getClosestCity(lat, lon){
	var closestdist = 10000000;
	var thislat, thislon, dist, xdiff, ydiff, closestcity, lon1, lon2;
    	for(var i = 0; i < cities.length; i++){
    		thislat = cities[i].latitude;
    		thislon = cities[i].longitude;
    		if(lon > 0 && thislon < 0){
    			lon1 = thislon;
    			lon2 = thislon + 360;
    			if(Math.abs(lon1 - lon) > Math.abs(lon2 - lon)){
    				thislon += 360;
    			}
    		}
    		if(lon < 0 && thislon > 0){
    			lon1 = thislon;
    			lon2 = thislon + 360;
    			if(Math.abs(lon1 - lon) > Math.abs(lon2 - lon)){
    				lon += 360;
    			}
    		}
    		xdiff = Math.abs(thislat - lat);
    		ydiff = Math.abs(thislon - lon);
    		dist = Math.sqrt(Math.pow(xdiff, 2) + Math.pow(ydiff, 2))
    		if(dist < closestdist){
    			closestdist = dist;
    			closestcity = cities[i].city;
    		}
    	}
    	console.log(closestcity);
    	return closestcity;
}

export function getInfo(city){
    	for(var i = 0; i < cities.length; i++){
    		if(cities[i].city === city){
    			return (cities[i]);
    		}	
    	}
}
